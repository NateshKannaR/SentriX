export type EmergencyCategory =
  | 'Fire Emergency'
  | 'Road Accident'
  | 'Medical Emergency'
  | 'Flood'
  | 'Building Collapse'
  | 'Other Emergencies';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Reported' | 'Pending' | 'In Progress' | 'Resolved';

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
  status: IncidentStatus;
  assignedUnit?: string;
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
  pending: number;
  inProgress: number;
  resolved: number;
  high: number;
  medium: number;
  low: number;
  avgPriorityScore: number;
  totalCasualties: number;
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
