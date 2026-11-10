export type EmergencyCategory =
  | 'Fire Emergency'
  | 'Road Accident'
  | 'Medical Emergency'
  | 'Flood'
  | 'Building Collapse'
  | 'Other Emergencies';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Reported' | 'Assigned' | 'Pending' | 'In Progress' | 'Resolved';

export type ResponseTeamCategory =
  | 'Fire & Rescue'
  | 'Medical & Trauma'
  | 'Disaster & Urban SAR'
  | 'Police & Evacuation'
  | 'Hazmat & Chemical'
  | 'Flood & Marine Rescue';

export type ResponseTeamStatus = 'Available' | 'Busy' | 'En Route' | 'Off Duty';

export interface ResponseTeam {
  id: string; // e.g. "TEAM-FIRE-01"
  name: string; // e.g. "Alpha Fire Tender 1"
  category: ResponseTeamCategory;
  latitude: number;
  longitude: number;
  locationName: string;
  status: ResponseTeamStatus;
  assignedIncidentId?: string;
  assignedIncidentCode?: string;
  membersCount: number;
  leaderName: string;
  contactRadio: string;
  vehicleType: string;
  equipment: string[];
  updatedAt: string;
}

export interface PriorityScoreFactor {
  label: string;
  score: number;
  weight: string;
  description: string;
}

export interface DuplicateMatch {
  suspectId: string;
  suspectCode: string;
  suspectTitle: string;
  similarityScore: number; // 0 to 100
  timeDifferenceMinutes: number;
  distanceKm?: number;
  reasons: string[];
}

export interface Incident {
  id: string;
  incidentCode: string; // e.g. STX-2026-9041
  title: string;
  description: string;
  category: EmergencyCategory;
  location: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  peopleAffected: number;
  contactInformation?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  severity: SeverityLevel;
  recommendedSeverity: SeverityLevel;
  severityReasoning: string[];
  severityOverridden: boolean;
  priorityScore: number; // 0 - 100
  priorityFactors: PriorityScoreFactor[];
  priorityRank?: number; // Calculated dynamic rank #1, #2, #3...
  status: IncidentStatus;
  assignedUnit?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedTeamCategory?: string;
  assignedDistanceKm?: number;
  assignedEtaMinutes?: number;
  imageUrl?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  duplicateWarning?: DuplicateMatch;
  duplicateOf?: string;
}

export interface IncidentActivity {
  id: string;
  incidentId: string;
  action:
    | 'REPORTED'
    | 'SEVERITY_ASSIGNED'
    | 'SEVERITY_OVERRIDDEN'
    | 'STATUS_CHANGED'
    | 'UNIT_ASSIGNED'
    | 'TEAM_DISPATCHED'
    | 'TEAM_RELEASED'
    | 'NOTE_ADDED'
    | 'DUPLICATE_FLAGGED'
    | 'DUPLICATE_DISMISSED'
    | 'CITIZEN_UPDATE';
  previousValue?: string;
  newValue?: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface DashboardMetrics {
  total: number;
  critical: number;
  assigned: number;
  pending: number;
  inProgress: number;
  resolved: number;
  high: number;
  medium: number;
  low: number;
  avgPriorityScore: number;
  totalCasualties: number;
  availableTeams: number;
  busyTeams: number;
  totalTeams: number;
  fleetReadinessPercent: number;
  byCategory: { category: EmergencyCategory; count: number; criticalCount: number }[];
  bySeverity: { severity: SeverityLevel; count: number; color: string }[];
  byStatus: { status: IncidentStatus; count: number; color: string }[];
  timeline: { timeLabel: string; count: number; critical: number }[];
}

export type UserRole = 'Commander' | 'Operator' | 'Dispatcher' | 'Citizen';

export interface UserSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    badge: string;
    phone?: string;
    bloodGroup?: string;
  } | null;
}
