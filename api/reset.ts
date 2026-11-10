import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { getInitialSeedIncidents, INITIAL_ACTIVITIES } from '../src/services/seedData';
import { Incident, IncidentActivity } from '../src/types';

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

    await incidentsCol.deleteMany({});
    await activitiesCol.deleteMany({});

    const initialIncidents = getInitialSeedIncidents();
    await incidentsCol.insertMany(initialIncidents as any);

    const allActs: IncidentActivity[] = [];
    for (const incId of Object.keys(INITIAL_ACTIVITIES)) {
      allActs.push(...INITIAL_ACTIVITIES[incId]);
    }
    if (allActs.length > 0) {
      await activitiesCol.insertMany(allActs as any);
    }

    return res.status(200).json({ success: true, message: 'Database reset to initial seed data' });
  } catch (err: any) {
    console.error('API Error in /api/reset:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
