import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { analyzeIncidentIntelligence, detectDuplicateIncident } from '../src/services/intelligenceEngine';
import { getInitialSeedIncidents, INITIAL_ACTIVITIES } from '../src/services/seedData';
import { Incident, IncidentActivity } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = await getDatabase();
    const incidentsCol = db.collection<Incident>('incidents');
    const activitiesCol = db.collection<IncidentActivity>('activities');

    // Auto-seed if empty
    const count = await incidentsCol.countDocuments();
    if (count === 0) {
      const initialIncidents = getInitialSeedIncidents();
      await incidentsCol.insertMany(initialIncidents as any);

      // Seed initial activities
      const allActs: IncidentActivity[] = [];
      for (const incId of Object.keys(INITIAL_ACTIVITIES)) {
        allActs.push(...INITIAL_ACTIVITIES[incId]);
      }
      if (allActs.length > 0) {
        await activitiesCol.insertMany(allActs as any);
      }
    }

    if (req.method === 'GET') {
      const { id, code } = req.query;

      if (id) {
        const item = await incidentsCol.findOne({ id: String(id) } as any);
        if (!item) return res.status(404).json({ error: 'Incident not found' });
        return res.status(200).json(item);
      }

      if (code) {
        const clean = String(code).trim().toUpperCase();
        const item = await incidentsCol.findOne({ incidentCode: clean } as any);
        if (!item) return res.status(404).json({ error: 'Incident not found' });
        return res.status(200).json(item);
      }

      const list = await incidentsCol.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const data = req.body;
      if (!data || !data.title || !data.category) {
        return res.status(400).json({ error: 'Missing required title or category' });
      }

      const existingIncidents = await incidentsCol.find({}).toArray();

      const intelligence = analyzeIncidentIntelligence({
        category: data.category,
        peopleAffected: data.peopleAffected || 0,
        title: data.title,
        description: data.description || '',
        location: data.location || '',
      });

      const duplicateCheck = detectDuplicateIncident(
        {
          category: data.category,
          title: data.title,
          description: data.description || '',
          location: data.location || '',
          latitude: data.latitude,
          longitude: data.longitude,
        },
        existingIncidents
      );

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const incidentCode = `STX-2026-${randomSuffix}`;
      const id = `inc-${Date.now()}-${randomSuffix}`;
      const now = new Date().toISOString();

      const newIncident: Incident = {
        id,
        incidentCode,
        title: data.title,
        description: data.description || '',
        category: data.category,
        location: data.location || '',
        landmark: data.landmark,
        latitude: data.latitude,
        longitude: data.longitude,
        peopleAffected: Number(data.peopleAffected) || 0,
        contactInformation: data.contactInformation,
        severity: intelligence.recommendedSeverity,
        recommendedSeverity: intelligence.recommendedSeverity,
        severityReasoning: intelligence.severityReasoning,
        severityOverridden: false,
        priorityScore: intelligence.priorityScore,
        priorityFactors: intelligence.priorityFactors,
        status: 'Reported',
        assignedUnit: data.assignedUnit,
        imageUrl: data.imageUrl,
        isDemo: Boolean(data.isDemo),
        createdAt: now,
        updatedAt: now,
        duplicateWarning: duplicateCheck,
      };

      await incidentsCol.insertOne(newIncident as any);

      // Log report activity
      const reportAct: IncidentActivity = {
        id: `act-${Date.now()}-1`,
        incidentId: id,
        action: 'REPORTED',
        actor: data.contactInformation?.name || 'Citizen Emergency Reporter',
        description: `Emergency incident registered at ${data.location || 'scene'}. Initial status: Reported.`,
        timestamp: now,
      };
      await activitiesCol.insertOne(reportAct as any);

      // Log intelligence assessment
      const intelAct: IncidentActivity = {
        id: `act-${Date.now()}-2`,
        incidentId: id,
        action: 'SEVERITY_ASSIGNED',
        actor: 'Sentinel AI Intelligence Engine',
        newValue: intelligence.recommendedSeverity,
        description: `Priority Score ${intelligence.priorityScore}/100. Reasoning: ${intelligence.severityReasoning.slice(0, 2).join('; ')}`,
        timestamp: now,
      };
      await activitiesCol.insertOne(intelAct as any);

      return res.status(201).json(newIncident);
    }

    if (req.method === 'PUT') {
      const { id, status, severity, assignedUnit, duplicateOf, dismissDuplicate, actor, notes } = req.body;
      if (!id) return res.status(400).json({ error: 'Incident ID is required' });

      const existing = await incidentsCol.findOne({ id } as any);
      if (!existing) return res.status(404).json({ error: 'Incident not found' });

      const updates: Partial<Incident> = { updatedAt: new Date().toISOString() };
      const now = new Date().toISOString();

      if (status && status !== existing.status) {
        updates.status = status;
        await activitiesCol.insertOne({
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          incidentId: id,
          action: 'STATUS_CHANGED',
          previousValue: existing.status,
          newValue: status,
          actor: actor || 'Commander Dispatch',
          description: notes || `Operational status transitioned from ${existing.status} to ${status}.`,
          timestamp: now,
        } as any);
      }

      if (severity && severity !== existing.severity) {
        updates.severity = severity;
        updates.severityOverridden = severity !== existing.recommendedSeverity;
        await activitiesCol.insertOne({
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          incidentId: id,
          action: 'SEVERITY_OVERRIDDEN',
          previousValue: existing.severity,
          newValue: severity,
          actor: actor || 'Command Center Chief',
          description: notes || `Commander manually adjusted severity classification to ${severity}.`,
          timestamp: now,
        } as any);
      }

      if (assignedUnit && assignedUnit !== existing.assignedUnit) {
        updates.assignedUnit = assignedUnit;
        if (existing.status === 'Reported') updates.status = 'In Progress';
        await activitiesCol.insertOne({
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          incidentId: id,
          action: 'UNIT_ASSIGNED',
          newValue: assignedUnit,
          actor: actor || 'Dispatch Operator',
          description: `Rapid Response Unit "${assignedUnit}" assigned to incident scene.`,
          timestamp: now,
        } as any);
      }

      if (dismissDuplicate) {
        updates.duplicateWarning = undefined;
        await activitiesCol.insertOne({
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          incidentId: id,
          action: 'DUPLICATE_DISMISSED',
          actor: actor || 'Incident Commander',
          description: 'Duplicate warning reviewed and dismissed. Confirmed as independent incident.',
          timestamp: now,
        } as any);
      }

      if (duplicateOf) {
        updates.duplicateOf = duplicateOf;
        updates.status = 'Resolved';
        await activitiesCol.insertOne({
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          incidentId: id,
          action: 'DUPLICATE_FLAGGED',
          actor: actor || 'Incident Commander',
          description: `Incident marked as duplicate of ${duplicateOf} and closed.`,
          timestamp: now,
        } as any);
      }

      await incidentsCol.updateOne({ id } as any, { $set: updates });
      const updated = await incidentsCol.findOne({ id } as any);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const targetId = String(id || req.body?.id);
      if (!targetId) return res.status(400).json({ error: 'Incident ID is required' });

      await incidentsCol.deleteOne({ id: targetId } as any);
      await activitiesCol.deleteMany({ incidentId: targetId } as any);

      return res.status(200).json({ success: true, deletedId: targetId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error in /api/incidents:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
