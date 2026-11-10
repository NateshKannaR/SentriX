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
    name: 'Fire Team Alpha (Heavy Foam Tender)',
    category: 'Fire & Rescue',
    latitude: 13.0280,
    longitude: 77.5380,
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
    name: 'Fire Team Bravo (Aerial Platform)',
    category: 'Fire & Rescue',
    latitude: 12.9850,
    longitude: 77.5400,
    locationName: 'Central Command Fire Station',
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
    name: 'Medical Team Charlie (ALS Trauma)',
    category: 'Medical & Trauma',
    latitude: 13.0330,
    longitude: 77.5270,
    locationName: 'Peenya Emergency Trauma Clinic',
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

  /**
   * PHASE 4: SMART NEAREST SUITABLE AVAILABLE RESPONSE TEAM RECOMMENDATION
   * Steps 1 - 8 executed deterministically with full explainability.
   */
  public findSmartRecommendation(
    incident: Pick<Incident, 'category' | 'latitude' | 'longitude' | 'title'>
  ): SmartDispatchRecommendation {
    // Step 1: Read incident coordinates
    if (!incident.latitude || !incident.longitude) {
      return {
        recommendedMatch: null,
        alternativeMatches: [],
        excludedMatches: [],
        explanation: 'Incident GPS coordinates are missing. Unable to compute geodesic Haversine distance.',
        hasMissingCoordinates: true,
        noTeamAvailableReason: 'Incident lacks verified dispatch latitude and longitude coordinates.',
      };
    }

    const incLat = incident.latitude;
    const incLng = incident.longitude;

    // Step 2: Retrieve all response teams
    const allTeams = this.getTeams();

    const eligibleMatches: NearestTeamMatch[] = [];
    const excludedMatches: { team: ResponseTeam; reason: string; distanceKm: number }[] = [];

    allTeams.forEach(team => {
      const distanceKm = Math.round(calculateHaversineDistance(team.latitude, team.longitude, incLat, incLng) * 10) / 10;
      const etaMinutes = Math.max(2, Math.round((distanceKm / 40) * 60));
      const isCategoryMatch = this.checkCategorySuitability(incident.category, team.category);
      const isAvailable = team.status === 'Available';

      if (!isCategoryMatch) {
        excludedMatches.push({
          team,
          distanceKm,
          reason: `Category mismatch (${team.category} does not service ${incident.category})`,
        });
        return;
      }

      if (!isAvailable) {
        excludedMatches.push({
          team,
          distanceKm,
          reason: `Unit is currently ${team.status}${team.assignedIncidentCode ? ` on Mission ${team.assignedIncidentCode}` : ''}`,
        });
        return;
      }

      // Eligible!
      eligibleMatches.push({
        team,
        distanceKm,
        etaMinutes,
        isCategoryMatch: true,
        suitabilityScore: 100,
        isBestFit: false,
      });
    });

    // Step 6: Sort eligible teams by distance
    eligibleMatches.sort((a, b) => a.distanceKm - b.distanceKm);

    if (eligibleMatches.length === 0) {
      const busyMatches = allTeams.filter(t => this.checkCategorySuitability(incident.category, t.category));
      const reason = busyMatches.length > 0
        ? `All ${incident.category}-compatible units are currently deployed or offline.`
        : `No response units commissioned for ${incident.category}.`;

      return {
        recommendedMatch: null,
        alternativeMatches: [],
        excludedMatches,
        explanation: 'No suitable available response team found within operational range.',
        hasMissingCoordinates: false,
        noTeamAvailableReason: reason,
      };
    }

    // Step 7: Recommend nearest suitable available team
    eligibleMatches[0].isBestFit = true;
    const recommended = eligibleMatches[0];
    const alternatives = eligibleMatches.slice(1);

    // Step 8: Clear explanation with comparison against closest excluded units
    const closerExcluded = excludedMatches.find(e => e.distanceKm < recommended.distanceKm);
    let explanation = `${recommended.team.name} is the nearest available team (${recommended.distanceKm} km, ~${recommended.etaMinutes}m ETA) with the appropriate ${recommended.team.category} capability.`;
    if (closerExcluded) {
      explanation += ` ${closerExcluded.team.name} was not selected despite being closer (${closerExcluded.distanceKm} km) because ${closerExcluded.reason.toLowerCase()}.`;
    }

    return {
      recommendedMatch: recommended,
      alternativeMatches: alternatives,
      excludedMatches,
      explanation,
      hasMissingCoordinates: false,
    };
  }

  /**
   * PHASE 8 FEATURE B: RESOURCE CONFLICT DETECTION
   * Prevents assigning busy or offline teams and suggests alternatives
   */
  public validateAssignment(teamId: string, incCat?: EmergencyCategory): {
    allowed: boolean;
    conflictReason?: string;
    alternativeTeam?: ResponseTeam;
  } {
    const team = this.getTeamById(teamId);
    if (!team) {
      return { allowed: false, conflictReason: 'Selected response team does not exist in fleet registry.' };
    }

    if (team.status === 'Busy' || team.status === 'En Route') {
      const alt = this.teams.find(t => t.id !== teamId && t.status === 'Available' && (!incCat || this.checkCategorySuitability(incCat, t.category)));
      return {
        allowed: false,
        conflictReason: `Resource Conflict: Team "${team.name}" is currently Busy (deployed on mission ${team.assignedIncidentCode || 'active'}) and cannot be double-booked.`,
        alternativeTeam: alt,
      };
    }

    if (team.status === 'Offline' || team.status === 'Off Duty') {
      const alt = this.teams.find(t => t.id !== teamId && t.status === 'Available' && (!incCat || this.checkCategorySuitability(incCat, t.category)));
      return {
        allowed: false,
        conflictReason: `Resource Conflict: Team "${team.name}" is currently Offline/Off-Duty and unavailable for active deployment.`,
        alternativeTeam: alt,
      };
    }

    return { allowed: true };
  }

  public checkCategorySuitability(incCat: EmergencyCategory, teamCat: ResponseTeamCategory): boolean {
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

export interface SmartDispatchRecommendation {
  recommendedMatch: NearestTeamMatch | null;
  alternativeMatches: NearestTeamMatch[];
  excludedMatches: { team: ResponseTeam; reason: string; distanceKm: number }[];
  explanation: string;
  hasMissingCoordinates: boolean;
  noTeamAvailableReason?: string;
}

export const teamService = new TeamService();
