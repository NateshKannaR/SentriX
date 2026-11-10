import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { analyzeIncidentIntelligence, detectDuplicateIncident } from '../src/services/intelligenceEngine';
import { EmergencyCategory, Incident, IncidentActivity } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const incidentsCol = db.collection<Incident>('incidents');
    const activitiesCol = db.collection<IncidentActivity>('activities');

    const simulationPool = [
      {
        category: 'Fire Emergency' as const,
        title: 'Chemical Factory Boiler Room Fire & Heavy Smoke Plume',
        description: 'Overheated steam boiler exploded igniting adjacent solvent drums. Dense black chemical smoke billowing across industrial belt. 5 factory employees suffering from burn trauma and inhalation.',
        location: 'Plot 88, Peenya 2nd Stage Industrial Corridor',
        landmark: 'Opposite Substation Gate 3',
        lat: 13.0310 + (Math.random() - 0.5) * 0.02,
        lng: 77.5180 + (Math.random() - 0.5) * 0.02,
        casualties: Math.floor(2 + Math.random() * 8),
      },
      {
        category: 'Road Accident' as const,
        title: 'Inter-City Highway Sleeper Bus Rollover with Trapped Passengers',
        description: 'Night bus lost control taking highway bend at high speed, overturned across median barrier. Multiple passengers pinned under wreckage and shattered windows.',
        location: 'NH-44 Bangalore-Hosur Elevated Highway Mile 18',
        landmark: 'Near Electronics City Tollway Bridge',
        lat: 12.8450 + (Math.random() - 0.5) * 0.02,
        lng: 77.6600 + (Math.random() - 0.5) * 0.02,
        casualties: Math.floor(6 + Math.random() * 12),
      },
      {
        category: 'Medical Emergency' as const,
        title: 'Severe Anaphylactic Shock & Respiratory Collapse at School Cafeteria',
        description: 'Two elementary students collapsed with sudden acute allergic anaphylaxis after lunch. Epipens administered on-site, severe wheezing and cyanosis present. Immediate pediatrician paramedic needed.',
        location: 'Greenwood International High School, Sarjapur Road',
        landmark: 'Main Academic Block Reception',
        lat: 12.8980 + (Math.random() - 0.5) * 0.02,
        lng: 77.7210 + (Math.random() - 0.5) * 0.02,
        casualties: 2,
      },
      {
        category: 'Flood' as const,
        title: 'Canal Embankment Breach Flooding Low-Lying Slum Settlements',
        description: 'Stormwater drainage canal wall collapsed following torrential rain. Muddy floodwaters entering 60+ tin-roof dwellings. 15 vulnerable residents stranded on rooftops.',
        location: 'Ejipura Canal Slum Settlement, Koramangala Border',
        landmark: 'Near Intermediate Ring Road culvert',
        lat: 12.9410 + (Math.random() - 0.5) * 0.02,
        lng: 77.6320 + (Math.random() - 0.5) * 0.02,
        casualties: Math.floor(10 + Math.random() * 15),
      },
      {
        category: 'Building Collapse' as const,
        title: 'Old Commercial Arcade Balcony & Parapet Wall Collapse',
        description: 'Heavy concrete balcony cantilever failed on 50-year-old market building, crashing onto crowded pedestrian street below. Multiple shoppers injured by fallen masonry chunks.',
        location: 'Chickpet Commercial Market Alley, City Center',
        landmark: 'Near Old Cloth Bazaar Entrance',
        lat: 12.9690 + (Math.random() - 0.5) * 0.02,
        lng: 77.5780 + (Math.random() - 0.5) * 0.02,
        casualties: Math.floor(4 + Math.random() * 6),
      },
      {
        category: 'Other Emergencies' as const,
        title: 'Underground Gas Main Puncture During Road Trenching Excavation',
        description: 'Backhoe excavator sliced 4-inch pressurized CNG gas pipeline. Loud hissing sound and strong mercaptan odor detected across 300m radius. Immediate area evacuation underway.',
        location: 'Indiranagar 100 Feet Road, 12th Main Crossing',
        landmark: 'Outside Metro Station Pillar 204',
        lat: 12.9710 + (Math.random() - 0.5) * 0.02,
        lng: 77.6410 + (Math.random() - 0.5) * 0.02,
        casualties: 0,
      },
    ];

    const pick = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    const existingIncidents = await incidentsCol.find({}).toArray();

    const intelligence = analyzeIncidentIntelligence({
      category: pick.category,
      peopleAffected: pick.casualties,
      title: `[SIMULATED] ${pick.title}`,
      description: pick.description,
      location: pick.location,
    });

    const duplicateCheck = detectDuplicateIncident(
      {
        category: pick.category,
        title: pick.title,
        description: pick.description,
        location: pick.location,
        latitude: pick.lat,
        longitude: pick.lng,
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
      title: `[SIMULATED] ${pick.title}`,
      description: pick.description,
      category: pick.category,
      location: pick.location,
      landmark: pick.landmark,
      latitude: pick.lat,
      longitude: pick.lng,
      peopleAffected: pick.casualties,
      contactInformation: {
        name: 'SentriX Demo Dispatch Simulator',
        phone: '+91 99999 00000',
        email: 'simulation@sentrix.internal',
      },
      severity: intelligence.recommendedSeverity,
      recommendedSeverity: intelligence.recommendedSeverity,
      severityReasoning: intelligence.severityReasoning,
      severityOverridden: false,
      priorityScore: intelligence.priorityScore,
      priorityFactors: intelligence.priorityFactors,
      status: 'Reported',
      isDemo: true,
      createdAt: now,
      updatedAt: now,
      duplicateWarning: duplicateCheck,
    };

    await incidentsCol.insertOne(newIncident as any);

    await activitiesCol.insertOne({
      id: `act-${Date.now()}-1`,
      incidentId: id,
      action: 'REPORTED',
      actor: 'Sentinel Demo Dispatch Simulator',
      description: `Simulated emergency injected into dispatch queue at ${pick.location}.`,
      timestamp: now,
    } as any);

    return res.status(201).json(newIncident);
  } catch (err: any) {
    console.error('API Error in /api/simulate:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
