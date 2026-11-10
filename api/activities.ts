import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { IncidentActivity } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    const activitiesCol = db.collection<IncidentActivity>('activities');

    if (req.method === 'GET') {
      const { incidentId } = req.query;
      const query = incidentId ? { incidentId: String(incidentId) } : {};
      const list = await activitiesCol.find(query as any).sort({ timestamp: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const data = req.body;
      if (!data || !data.incidentId || !data.description) {
        return res.status(400).json({ error: 'Missing incidentId or description' });
      }

      const activity: IncidentActivity = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        incidentId: data.incidentId,
        action: data.action || 'NOTE_ADDED',
        previousValue: data.previousValue,
        newValue: data.newValue,
        description: data.description,
        actor: data.actor || 'Commander Dispatch',
        timestamp: new Date().toISOString(),
      };

      await activitiesCol.insertOne(activity as any);
      return res.status(201).json(activity);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error in /api/activities:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
