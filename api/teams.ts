import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { ResponseTeam } from '../src/types';

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
    const teamsCol = db.collection<ResponseTeam>('teams');

    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const team = await teamsCol.findOne({ id: String(id) } as any);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        return res.status(200).json(team);
      }

      const list = await teamsCol.find({}).sort({ name: 1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body) return res.status(400).json({ error: 'Request body required' });

      // Support batch upsert or single create
      if (Array.isArray(body.teams)) {
        for (const t of body.teams) {
          await teamsCol.updateOne({ id: t.id } as any, { $set: t }, { upsert: true });
        }
        return res.status(200).json({ success: true, count: body.teams.length });
      }

      const newTeam: ResponseTeam = {
        id: body.id || `TEAM-${String(body.category || 'GEN').replace(/[^A-Z]/g, '').slice(0, 4)}-${Math.floor(10 + Math.random() * 90)}`,
        name: body.name,
        category: body.category,
        latitude: Number(body.latitude) || 12.9716,
        longitude: Number(body.longitude) || 77.5946,
        locationName: body.locationName || 'Central Command',
        status: body.status || 'Available',
        membersCount: Number(body.membersCount) || 4,
        leaderName: body.leaderName || 'Officer in Charge',
        contactRadio: body.contactRadio || 'CH-EMERGENCY-01',
        vehicleType: body.vehicleType || 'Rapid Response Van',
        equipment: Array.isArray(body.equipment) ? body.equipment : [],
        updatedAt: new Date().toISOString(),
      };

      await teamsCol.insertOne(newTeam as any);
      return res.status(201).json(newTeam);
    }

    if (req.method === 'PUT') {
      const { id, status, assignedIncidentId, assignedIncidentCode, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Team ID required' });

      const setUpdates: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (status) {
        setUpdates.status = status;
        if (status === 'Available') {
          setUpdates.assignedIncidentId = null;
          setUpdates.assignedIncidentCode = null;
        } else {
          if (assignedIncidentId) setUpdates.assignedIncidentId = assignedIncidentId;
          if (assignedIncidentCode) setUpdates.assignedIncidentCode = assignedIncidentCode;
        }
      }

      await teamsCol.updateOne({ id } as any, { $set: setUpdates });
      const updated = await teamsCol.findOne({ id } as any);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const targetId = String(id || req.body?.id);
      if (!targetId) return res.status(400).json({ error: 'Team ID required' });

      await teamsCol.deleteOne({ id: targetId } as any);
      return res.status(200).json({ success: true, deletedId: targetId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error in /api/teams:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
