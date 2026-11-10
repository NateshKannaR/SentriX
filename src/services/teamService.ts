import { ResponseTeam, ResponseTeamCategory, ResponseTeamStatus, Incident, EmergencyCategory } from '../types';
import { calculateHaversineDistance } from './intelligenceEngine';

const TEAMS_STORAGE_KEY = 'sentrix_teams_v2';

export interface NearestTeamMatch {
  team: ResponseTeam;
  distanceKm: number;
  etaMinutes: number;
  isCategoryMatch: boolean;
  suitabilityScore: number; // 0 - 100
  isBestFit: boolean;
}

export const INITIAL_TEAMS: ResponseTeam[] = [
  {
    id: 'TEAM-FIRE-01',
    name: 'Alpha Fire Tender 1',
    category: 'Fire & Rescue',
    latitude: 13.0280,
    longitude: 77.5250,
    locationName: 'Peenya Industrial Fire Station',
    status: 'Available',
    membersCount: 6,
    leaderName: 'Capt. Ramesh Kumar',
    contactRadio: 'CH-FIRE-04',
    vehicleType: 'Rosenbauer 12,000L Foam Tender',
    equipment: ['High-Pressure Water Cannon', 'Thermal Imaging Camera', 'SCBA Breathing Sets', 'Hydraulic Jaws of Life'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-FIRE-02',
    name: 'Bravo Aerial Fire Platform',
    category: 'Fire & Rescue',
    latitude: 12.9720,
    longitude: 77.6080,
    locationName: 'Mayo Hall Central Fire Command',
    status: 'Available',
    membersCount: 5,
    leaderName: 'Lt. Suresh Gowda',
    contactRadio: 'CH-FIRE-02',
    vehicleType: 'Bronto Skylift 55m Aerial Ladder',
    equipment: ['Hydraulic Turntable Ladder', 'Foam Induction System', 'Rescue Harnesses', 'Gas Analyzers'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-MED-01',
    name: 'Delta Trauma ALS Ambulance',
    category: 'Medical & Trauma',
    latitude: 12.9620,
    longitude: 77.5750,
    locationName: 'Victoria Hospital Trauma Center',
    status: 'Available',
    membersCount: 4,
    leaderName: 'Dr. Priya Menon, MD',
    contactRadio: 'CH-MED-108',
    vehicleType: 'Force Traveller Mobile ICU Unit',
    equipment: ['Zoll X-Series Defibrillator', 'Hamilton Ventilator', 'Trauma Resuscitation Kit', 'Blood Transfusion Carrier'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-MED-02',
    name: 'Echo Rapid Paramedic ICU',
    category: 'Medical & Trauma',
    latitude: 12.9340,
    longitude: 77.6950,
    locationName: 'Manipal Trauma Rapid Dispatch, Bellandur',
    status: 'Available',
    membersCount: 3,
    leaderName: 'Paramedic Ananya Sharma',
    contactRadio: 'CH-MED-102',
    vehicleType: 'Mercedes Sprinter Trauma Sprint',
    equipment: ['Portable Ultrasound', 'Lucas CPR Device', 'Emergency Airway Kit', 'Advanced Cardiac Drugs'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-RESCUE-01',
    name: 'NDRF Urban SAR Squad 7',
    category: 'Disaster & Urban SAR',
    latitude: 13.0380,
    longitude: 77.5920,
    locationName: 'Hebbal NDRF Regional Depot',
    status: 'Available',
    membersCount: 8,
    leaderName: 'Cmdr. Vikram Rathore',
    contactRadio: 'CH-NDRF-09',
    vehicleType: 'Tata Heavy Tactical Rescue Rig',
    equipment: ['Acoustic Life Detector', 'Concrete Diamond Saws', 'Pneumatic Lifting Bags (70T)', 'Search K9 Unit'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-HAZMAT-01',
    name: 'Hazmat CBRN Neutralization Unit',
    category: 'Hazmat & Chemical',
    latitude: 12.8490,
    longitude: 77.6630,
    locationName: 'Electronic City Industrial Safety Base',
    status: 'Available',
    membersCount: 5,
    leaderName: 'Inspector Rajiv Nambiar',
    contactRadio: 'CH-HAZMAT-01',
    vehicleType: 'Level-A Chemical Hazard Carrier',
    equipment: ['Encapsulated Level-A Hazmat Suits', 'Chemical Neutralizer Sprayers', 'Photoionization Detectors', 'Decon Shower Station'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-BOAT-01',
    name: 'SDRF Flood Marine Boat 3',
    category: 'Flood & Marine Rescue',
    latitude: 12.9810,
    longitude: 77.6210,
    locationName: 'Ulsoor Marine Command Dock',
    status: 'Available',
    membersCount: 4,
    leaderName: 'Sub-Inspector Sandeep Patil',
    contactRadio: 'CH-MARINE-03',
    vehicleType: 'Heavy Twin-Engine Inflatable Zodiac',
    equipment: ['Mercury 60HP Outboard Engines', 'Inflatable Life Rafts (20-pax)', 'Throw Ropes & Flotation Gear', 'Sonar Depth Scanner'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TEAM-POLICE-01',
    name: 'Falcon Traffic & Evacuation Escort',
    category: 'Police & Evacuation',
    latitude: 12.9750,
    longitude: 77.5980,
    locationName: 'Traffic Police HQ, Infantry Road',
    status: 'Available',
    membersCount: 4,
    leaderName: 'Inspector Rajesh V.',
    contactRadio: 'CH-POLICE-100',
    vehicleType: 'Mahindra Scorpio High-Speed Interceptor',
    equipment: ['Corridor Clearing Sirens', 'Emergency Barricades', 'Megaphones', 'Traffic Diversion Strobe Arrays'],
    updatedAt: new Date().toISOString(),
  },
];

class TeamService {
  private teams: ResponseTeam[] = [];
  private listeners: (() => void)[] = [];
  private syncChannel: BroadcastChannel | null = null;

  constructor() {
    this.loadFromStorage();
    this.initSync();
  }

  private initSync(): void {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel('sentrix_realtime_sync');
        this.syncChannel.onmessage = (event) => {
          if (event.data && (event.data.type === 'TEAMS_UPDATED' || event.data.type === 'TEAM_DISPATCHED')) {
            this.loadFromStorage();
            this.notifyListeners();
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel sync unavailable for teams:', err);
      }
    }

    window.addEventListener('storage', (e) => {
      if (e.key === TEAMS_STORAGE_KEY) {
        this.loadFromStorage();
        this.notifyListeners();
      }
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (stored && stored !== '[]') {
        this.teams = JSON.parse(stored);
      } else {
        this.teams = [...INITIAL_TEAMS];
        this.saveToStorage();
      }
    } catch {
      this.teams = [...INITIAL_TEAMS];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(this.teams));
    } catch (e) {
      console.error('Failed to save teams to localStorage:', e);
    }
    this.notifyListeners();

    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage({
          type: 'TEAMS_UPDATED',
          timestamp: Date.now(),
        });
      } catch (_) {}
    }

    // Push to serverless backend if online
    fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: this.teams }),
    }).catch(() => {});
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const l of this.listeners) {
      l();
    }
  }

  public getTeams(): ResponseTeam[] {
    return [...this.teams];
  }

  public getTeamById(id: string): ResponseTeam | undefined {
    return this.teams.find(t => t.id === id);
  }

  public createTeam(data: Omit<ResponseTeam, 'id' | 'updatedAt'>): ResponseTeam {
    const id = `TEAM-${data.category.replace(/[^A-Z]/g, '').slice(0, 4)}-${Math.floor(10 + Math.random() * 90)}`;
    const newTeam: ResponseTeam = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.teams.push(newTeam);
    this.saveToStorage();
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<ResponseTeam>): ResponseTeam | undefined {
    const idx = this.teams.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.teams[idx] = {
      ...this.teams[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.teams[idx];
  }

  public deleteTeam(id: string): boolean {
    const prev = this.teams.length;
    this.teams = this.teams.filter(t => t.id !== id);
    if (this.teams.length !== prev) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public setTeamStatus(
    id: string,
    status: ResponseTeamStatus,
    assignedIncidentId?: string,
    assignedIncidentCode?: string
  ): ResponseTeam | undefined {
    const idx = this.teams.findIndex(t => t.id === id);
    if (idx === -1) return undefined;

    this.teams[idx] = {
      ...this.teams[idx],
      status,
      assignedIncidentId: status === 'Available' ? undefined : (assignedIncidentId ?? this.teams[idx].assignedIncidentId),
      assignedIncidentCode: status === 'Available' ? undefined : (assignedIncidentCode ?? this.teams[idx].assignedIncidentCode),
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.teams[idx];
  }

  public resetDemoTeams(): void {
    this.teams = [...INITIAL_TEAMS];
    this.saveToStorage();
  }

  /**
   * Location-based match: identifies and ranks nearest available teams for an incident
   * using the Haversine formula and category suitability scoring.
   */
  public findNearestTeamsForIncident(
    incident: Pick<Incident, 'category' | 'latitude' | 'longitude'>,
    includeBusy = false
  ): NearestTeamMatch[] {
    if (!incident.latitude || !incident.longitude) {
      return [];
    }

    const incLat = incident.latitude;
    const incLng = incident.longitude;

    const candidates = this.teams.filter(t => includeBusy || t.status === 'Available');

    const matches: NearestTeamMatch[] = candidates.map(team => {
      const distanceKm = calculateHaversineDistance(team.latitude, team.longitude, incLat, incLng);
      // Average 40km/h siren speed in city traffic + 2 min preparation buffer
      const etaMinutes = Math.max(2, Math.round((distanceKm / 40) * 60));

      const isCategoryMatch = this.checkCategorySuitability(incident.category, team.category);

      // Suitability formula: distance weight (60%) + category compatibility (40%)
      const distScore = Math.max(0, 60 - Math.min(60, distanceKm * 3));
      const catScore = isCategoryMatch ? 40 : 15;
      const suitabilityScore = Math.round(distScore + catScore);

      return {
        team,
        distanceKm: Math.round(distanceKm * 10) / 10,
        etaMinutes,
        isCategoryMatch,
        suitabilityScore,
        isBestFit: false,
      };
    });

    // Sort by best-fit suitability score descending, then by distance ascending
    matches.sort((a, b) => {
      if (b.suitabilityScore !== a.suitabilityScore) {
        return b.suitabilityScore - a.suitabilityScore;
      }
      return a.distanceKm - b.distanceKm;
    });

    if (matches.length > 0) {
      matches[0].isBestFit = true;
    }

    return matches;
  }

  private checkCategorySuitability(incCat: EmergencyCategory, teamCat: ResponseTeamCategory): boolean {
    switch (incCat) {
      case 'Fire Emergency':
        return teamCat === 'Fire & Rescue' || teamCat === 'Hazmat & Chemical';
      case 'Medical Emergency':
        return teamCat === 'Medical & Trauma';
      case 'Building Collapse':
        return teamCat === 'Disaster & Urban SAR' || teamCat === 'Fire & Rescue';
      case 'Flood':
        return teamCat === 'Flood & Marine Rescue' || teamCat === 'Disaster & Urban SAR';
      case 'Road Accident':
        return teamCat === 'Medical & Trauma' || teamCat === 'Police & Evacuation' || teamCat === 'Fire & Rescue';
      case 'Other Emergencies':
        return true;
      default:
        return false;
    }
  }
}

export const teamService = new TeamService();
