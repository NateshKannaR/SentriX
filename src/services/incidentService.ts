import {
  Incident,
  IncidentActivity,
  IncidentStatus,
  SeverityLevel,
  EmergencyCategory,
  DashboardMetrics,
} from '../types';
import { analyzeIncidentIntelligence, detectDuplicateIncident } from './intelligenceEngine';
import { getInitialSeedIncidents, INITIAL_ACTIVITIES } from './seedData';

const INCIDENTS_STORAGE_KEY = 'sentrix_incidents_v2';
const ACTIVITIES_STORAGE_KEY = 'sentrix_activities_v2';

class IncidentService {
  private incidents: Incident[] = [];
  private activities: Record<string, IncidentActivity[]> = {};
  private listeners: (() => void)[] = [];
  private isApiConnected = false;

  constructor() {
    this.loadFromStorage();
    this.syncWithBackend();
  }

  private loadFromStorage(): void {
    try {
      const storedIncidents = localStorage.getItem(INCIDENTS_STORAGE_KEY) || localStorage.getItem('sentinel_360_incidents_v2');
      const storedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY) || localStorage.getItem('sentinel_360_activities_v2');

      if (storedIncidents && storedIncidents !== '[]') {
        this.incidents = JSON.parse(storedIncidents);
      } else {
        this.incidents = getInitialSeedIncidents();
        this.saveIncidents();
      }

      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
      } else {
        this.activities = { ...INITIAL_ACTIVITIES };
        this.saveActivities();
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using in-memory seed', e);
      this.incidents = getInitialSeedIncidents();
      this.activities = { ...INITIAL_ACTIVITIES };
    }
  }

  public async syncWithBackend(): Promise<void> {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const remoteIncidents = await res.json();
        if (Array.isArray(remoteIncidents) && remoteIncidents.length > 0) {
          this.incidents = remoteIncidents;
          this.saveIncidents();
          this.isApiConnected = true;
        }
      }
    } catch {
      // Running offline or local vite dev without API server; fallback to localStorage
      this.isApiConnected = false;
    }
  }

  private saveIncidents(): void {
    try {
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(this.incidents));
    } catch (e) {
      console.error('Failed to persist incidents to localStorage', e);
    }
    this.notifyListeners();
  }

  private saveActivities(): void {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.error('Failed to persist activities to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getIncidents(): Incident[] {
    return [...this.incidents];
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id);
  }

  public getIncidentByCode(code: string): Incident | undefined {
    const clean = code.trim().toUpperCase();
    return this.incidents.find(i => i.incidentCode.toUpperCase() === clean);
  }

  public getActivities(incidentId: string): IncidentActivity[] {
    return this.activities[incidentId] || [];
  }

  public addActivity(
    incidentId: string,
    activityData: Omit<IncidentActivity, 'id' | 'incidentId' | 'timestamp'>
  ): IncidentActivity {
    const activity: IncidentActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      incidentId,
      timestamp: new Date().toISOString(),
      ...activityData,
    };

    if (!this.activities[incidentId]) {
      this.activities[incidentId] = [];
    }
    this.activities[incidentId].unshift(activity);
    this.saveActivities();

    // Async push to MongoDB API if active
    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    }).catch(() => {});

    return activity;
  }

  public createIncident(data: {
    title: string;
    description: string;
    category: EmergencyCategory;
    location: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    peopleAffected: number;
    contactInformation?: { name?: string; phone?: string; email?: string };
    imageUrl?: string;
    isDemo?: boolean;
    assignedUnit?: string;
  }): Incident {
    const intelligence = analyzeIncidentIntelligence({
      category: data.category,
      peopleAffected: data.peopleAffected,
      title: data.title,
      description: data.description,
      location: data.location,
    });

    const duplicateCheck = detectDuplicateIncident(
      {
        category: data.category,
        title: data.title,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      this.incidents
    );

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const incidentCode = `STX-2026-${randomSuffix}`;
    const id = `inc-${Date.now()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      id,
      incidentCode,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      landmark: data.landmark,
      latitude: data.latitude,
      longitude: data.longitude,
      peopleAffected: data.peopleAffected,
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
      isDemo: data.isDemo ?? false,
      createdAt: now,
      updatedAt: now,
      duplicateWarning: duplicateCheck,
    };

    this.incidents.unshift(newIncident);
    this.saveIncidents();

    // Log reporting activity
    this.addActivity(id, {
      action: 'REPORTED',
      actor: data.contactInformation?.name || 'Citizen Emergency Reporter',
      description: `Emergency incident registered at ${data.location}. Initial status: Reported.`,
    });

    // Log intelligence assessment
    this.addActivity(id, {
      action: 'SEVERITY_ASSIGNED',
      actor: 'SentriX AI Intelligence Engine',
      newValue: intelligence.recommendedSeverity,
      description: `Priority Score ${intelligence.priorityScore}/100. Reasoning: ${intelligence.severityReasoning.slice(0, 2).join('; ')}`,
    });

    if (duplicateCheck) {
      this.addActivity(id, {
        action: 'DUPLICATE_FLAGGED',
        actor: 'Duplicate SentriX Engine',
        description: `Potential duplicate flagged with ${duplicateCheck.suspectCode} (${duplicateCheck.similarityScore}% match confidence)`,
      });
    }

    // Push to MongoDB API if active
    fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIncident),
    }).catch(() => {});

    return newIncident;
  }

  public updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    actor = 'Commander Dispatch',
    notes?: string
  ): Incident | undefined {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx === -1) return undefined;

    const oldStatus = this.incidents[idx].status;
    if (oldStatus === newStatus && !notes) return this.incidents[idx];

    const updated: Incident = {
      ...this.incidents[idx],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.incidents[idx] = updated;
    this.saveIncidents();

    this.addActivity(id, {
      action: 'STATUS_CHANGED',
      previousValue: oldStatus,
      newValue: newStatus,
      actor,
      description: notes || `Operational status transitioned from ${oldStatus} to ${newStatus}.`,
    });

    // Sync with MongoDB API
    fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, actor, notes }),
    }).catch(() => {});

    return updated;
  }

  public updateIncidentSeverity(
    id: string,
    newSeverity: SeverityLevel,
    actor = 'Command Center Chief',
    reason?: string
  ): Incident | undefined {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx === -1) return undefined;

    const oldSeverity = this.incidents[idx].severity;
    const updated: Incident = {
      ...this.incidents[idx],
      severity: newSeverity,
      severityOverridden: newSeverity !== this.incidents[idx].recommendedSeverity,
      updatedAt: new Date().toISOString(),
    };

    this.incidents[idx] = updated;
    this.saveIncidents();

    this.addActivity(id, {
      action: 'SEVERITY_OVERRIDDEN',
      previousValue: oldSeverity,
      newValue: newSeverity,
      actor,
      description: reason || `Commander manually adjusted severity classification to ${newSeverity}.`,
    });

    // Sync with MongoDB API
    fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, severity: newSeverity, actor, notes: reason }),
    }).catch(() => {});

    return updated;
  }

  public assignUnit(id: string, unitName: string, actor = 'Dispatch Operator'): Incident | undefined {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx === -1) return undefined;

    const updated: Incident = {
      ...this.incidents[idx],
      assignedUnit: unitName,
      status: this.incidents[idx].status === 'Reported' ? 'In Progress' : this.incidents[idx].status,
      updatedAt: new Date().toISOString(),
    };

    this.incidents[idx] = updated;
    this.saveIncidents();

    this.addActivity(id, {
      action: 'UNIT_ASSIGNED',
      newValue: unitName,
      actor,
      description: `Rapid Response Unit "${unitName}" assigned to incident scene.`,
    });

    fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, assignedUnit: unitName, actor }),
    }).catch(() => {});

    return updated;
  }

  public dismissDuplicateWarning(id: string): Incident | undefined {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx === -1) return undefined;

    const updated: Incident = {
      ...this.incidents[idx],
      duplicateWarning: undefined,
      updatedAt: new Date().toISOString(),
    };

    this.incidents[idx] = updated;
    this.saveIncidents();

    this.addActivity(id, {
      action: 'DUPLICATE_DISMISSED',
      actor: 'Incident Commander',
      description: 'Duplicate warning reviewed and dismissed. Confirmed as independent incident.',
    });

    fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, dismissDuplicate: true }),
    }).catch(() => {});

    return updated;
  }

  public markAsDuplicate(id: string, targetId: string): Incident | undefined {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx === -1) return undefined;

    const updated: Incident = {
      ...this.incidents[idx],
      duplicateOf: targetId,
      status: 'Resolved',
      updatedAt: new Date().toISOString(),
    };

    this.incidents[idx] = updated;
    this.saveIncidents();

    this.addActivity(id, {
      action: 'DUPLICATE_FLAGGED',
      actor: 'Incident Commander',
      description: `Incident marked as duplicate of ${targetId} and closed.`,
    });

    fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, duplicateOf: targetId }),
    }).catch(() => {});

    return updated;
  }

  public deleteIncident(id: string): boolean {
    const prevLen = this.incidents.length;
    this.incidents = this.incidents.filter(i => i.id !== id);
    if (this.incidents.length !== prevLen) {
      delete this.activities[id];
      this.saveIncidents();
      this.saveActivities();

      fetch(`/api/incidents?id=${id}`, {
        method: 'DELETE',
      }).catch(() => {});

      return true;
    }
    return false;
  }

  public resetDemoData(): void {
    localStorage.removeItem(INCIDENTS_STORAGE_KEY);
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    this.loadFromStorage();
    this.notifyListeners();

    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  }

  public simulateEmergency(): Incident {
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

    return this.createIncident({
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
      isDemo: true,
    });
  }

  public exportIncidentsCSV(): string {
    const headers = [
      'Incident Code',
      'Title',
      'Category',
      'Severity',
      'Recommended Severity',
      'Priority Score',
      'Status',
      'People Affected',
      'Location',
      'Coordinates',
      'Assigned Unit',
      'Reported Time',
      'Is Demo',
    ];

    const rows = this.incidents.map(inc => [
      `"${inc.incidentCode}"`,
      `"${inc.title.replace(/"/g, '""')}"`,
      `"${inc.category}"`,
      `"${inc.severity}"`,
      `"${inc.recommendedSeverity}"`,
      inc.priorityScore,
      `"${inc.status}"`,
      inc.peopleAffected,
      `"${inc.location.replace(/"/g, '""')}"`,
      inc.latitude && inc.longitude ? `"${inc.latitude}, ${inc.longitude}"` : '""',
      `"${inc.assignedUnit || 'Unassigned'}"`,
      `"${inc.createdAt}"`,
      inc.isDemo ? 'Yes' : 'No',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public getDashboardMetrics(): DashboardMetrics {
    const total = this.incidents.length;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let totalScore = 0;
    let totalCasualties = 0;

    const categoryCounts: Record<EmergencyCategory, { count: number; critical: number }> = {
      'Fire Emergency': { count: 0, critical: 0 },
      'Road Accident': { count: 0, critical: 0 },
      'Medical Emergency': { count: 0, critical: 0 },
      'Flood': { count: 0, critical: 0 },
      'Building Collapse': { count: 0, critical: 0 },
      'Other Emergencies': { count: 0, critical: 0 },
    };

    for (const inc of this.incidents) {
      if (inc.severity === 'Critical') critical++;
      else if (inc.severity === 'High') high++;
      else if (inc.severity === 'Medium') medium++;
      else if (inc.severity === 'Low') low++;

      if (inc.status === 'Pending') pending++;
      else if (inc.status === 'In Progress') inProgress++;
      else if (inc.status === 'Resolved') resolved++;

      totalScore += inc.priorityScore || 0;
      totalCasualties += inc.peopleAffected || 0;

      if (categoryCounts[inc.category]) {
        categoryCounts[inc.category].count++;
        if (inc.severity === 'Critical') {
          categoryCounts[inc.category].critical++;
        }
      }
    }

    const avgPriorityScore = total > 0 ? Math.round(totalScore / total) : 0;

    const byCategory = (Object.keys(categoryCounts) as EmergencyCategory[]).map(cat => ({
      category: cat,
      count: categoryCounts[cat].count,
      criticalCount: categoryCounts[cat].critical,
    }));

    const bySeverity: { severity: SeverityLevel; count: number; color: string }[] = [
      { severity: 'Critical', count: critical, color: '#F04452' },
      { severity: 'High', count: high, color: '#FF7A00' },
      { severity: 'Medium', count: medium, color: '#F5A623' },
      { severity: 'Low', count: low, color: '#19B878' },
    ];

    const byStatus: { status: IncidentStatus; count: number; color: string }[] = [
      { status: 'Reported', count: total - (pending + inProgress + resolved), color: '#3B82F6' },
      { status: 'Pending', count: pending, color: '#F5A623' },
      { status: 'In Progress', count: inProgress, color: '#16C7E8' },
      { status: 'Resolved', count: resolved, color: '#19B878' },
    ];

    const timelineSlots: Record<string, { count: number; critical: number }> = {
      '00:00 - 04:00': { count: 1, critical: 0 },
      '04:00 - 08:00': { count: 2, critical: 1 },
      '08:00 - 12:00': { count: 4, critical: 2 },
      '12:00 - 16:00': { count: 2, critical: 1 },
      '16:00 - 20:00': { count: 3, critical: 1 },
      '20:00 - 24:00': { count: 1, critical: 0 },
    };

    const timeline = Object.keys(timelineSlots).map(label => ({
      timeLabel: label,
      count: timelineSlots[label].count,
      critical: timelineSlots[label].critical,
    }));

    return {
      total,
      critical,
      pending,
      inProgress,
      resolved,
      high,
      medium,
      low,
      avgPriorityScore,
      totalCasualties,
      byCategory,
      bySeverity,
      byStatus,
      timeline,
    };
  }
}

export const incidentService = new IncidentService();
