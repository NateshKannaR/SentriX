import { EmergencyCategory, SeverityLevel, PriorityScoreFactor, DuplicateMatch, Incident } from '../types';

interface IntelligenceInput {
  category: EmergencyCategory;
  peopleAffected: number;
  title: string;
  description: string;
  location?: string;
  createdAt?: string;
}

interface IntelligenceResult {
  recommendedSeverity: SeverityLevel;
  severityReasoning: string[];
  priorityScore: number;
  priorityFactors: PriorityScoreFactor[];
}

const CRITICAL_KEYWORDS = [
  'trapped', 'trap', 'explosion', 'blast', 'toxic', 'chemical', 'gas leak',
  'unconscious', 'no pulse', 'cardiac', 'bleeding heavily', 'head injury',
  'flames', 'blaze', 'crushed', 'debris', 'under rubble', 'collapsed',
  'drowning', 'submerged', 'electrocution', 'asphyxiation', 'casualties', 'dead'
];

const HIGH_KEYWORDS = [
  'smoke', 'fire', 'burn', 'fracture', 'blood', 'oxygen', 'collision',
  'pileup', 'overturned', 'flooded', 'rising water', 'short circuit',
  'breathing difficulty', 'critical', 'urgent', 'spill', 'crack'
];

const VULNERABLE_KEYWORDS = [
  'child', 'children', 'infant', 'baby', 'elderly', 'senior',
  'pregnant', 'disabled', 'school', 'hospital', 'daycare', 'nursing home'
];

export function analyzeIncidentIntelligence(input: IntelligenceInput): IntelligenceResult {
  const reasoning: string[] = [];
  const text = `${input.title} ${input.description}`.toLowerCase();

  // 1. Category Base Weight
  let categoryScore = 15;
  switch (input.category) {
    case 'Building Collapse':
      categoryScore = 32;
      reasoning.push("Category 'Building Collapse' carries high structural collapse risk & entrapment probability (+32)");
      break;
    case 'Fire Emergency':
      categoryScore = 28;
      reasoning.push("Category 'Fire Emergency' presents rapid escalation and thermal/smoke hazards (+28)");
      break;
    case 'Medical Emergency':
      categoryScore = 24;
      reasoning.push("Category 'Medical Emergency' requires rapid physiological intervention window (+24)");
      break;
    case 'Flood':
      categoryScore = 22;
      reasoning.push("Category 'Flood' indicates environmental expansion and rescue challenge (+22)");
      break;
    case 'Road Accident':
      categoryScore = 20;
      reasoning.push("Category 'Road Accident' indicates kinetic trauma and transit obstruction (+20)");
      break;
    case 'Other Emergencies':
      categoryScore = 12;
      reasoning.push("Category 'Other Emergencies' initiated with standard baseline evaluation (+12)");
      break;
  }

  // 2. People Affected Weight
  let peopleScore = 0;
  const count = Math.max(0, input.peopleAffected || 0);

  if (count === 0) {
    peopleScore = 5;
    reasoning.push("No confirmed casualties yet reported (+5 baseline)");
  } else if (count <= 2) {
    peopleScore = 15;
    reasoning.push(`${count} person(s) directly affected (+15 impact)`);
  } else if (count <= 5) {
    peopleScore = 28;
    reasoning.push(`Multi-person incident: ${count} people affected (+28 impact)`);
  } else if (count <= 15) {
    peopleScore = 42;
    reasoning.push(`High casualty count: ${count} people at immediate risk (+42 impact)`);
  } else {
    peopleScore = 55;
    reasoning.push(`MASS CASUALTY EVENT: ${count} people affected! (+55 impact)`);
  }

  // 3. Keyword Analysis
  let keywordScore = 0;
  const detectedCritical: string[] = [];
  const detectedHigh: string[] = [];
  const detectedVulnerable: string[] = [];

  for (const kw of CRITICAL_KEYWORDS) {
    if (text.includes(kw)) detectedCritical.push(kw);
  }
  for (const kw of HIGH_KEYWORDS) {
    if (text.includes(kw) && !detectedCritical.includes(kw)) detectedHigh.push(kw);
  }
  for (const kw of VULNERABLE_KEYWORDS) {
    if (text.includes(kw)) detectedVulnerable.push(kw);
  }

  if (detectedCritical.length > 0) {
    const pts = Math.min(25, detectedCritical.length * 9);
    keywordScore += pts;
    reasoning.push(`Life-critical indicators detected: "${detectedCritical.slice(0, 3).join('", "')}" (+${pts})`);
  }

  if (detectedHigh.length > 0) {
    const pts = Math.min(15, detectedHigh.length * 4);
    keywordScore += pts;
    reasoning.push(`High-risk threat indicators: "${detectedHigh.slice(0, 3).join('", "')}" (+${pts})`);
  }

  if (detectedVulnerable.length > 0) {
    keywordScore += 12;
    reasoning.push(`Vulnerable population at risk: "${detectedVulnerable.slice(0, 2).join('", "')}" (+12)`);
  }

  // Total Intelligence Assessment
  const totalRawScore = categoryScore + peopleScore + keywordScore;

  // Determine Severity
  let recommendedSeverity: SeverityLevel = 'Low';
  if (totalRawScore >= 70 || count >= 10 || detectedCritical.length >= 2) {
    recommendedSeverity = 'Critical';
  } else if (totalRawScore >= 45 || count >= 4 || detectedCritical.length >= 1) {
    recommendedSeverity = 'High';
  } else if (totalRawScore >= 25 || count >= 1) {
    recommendedSeverity = 'Medium';
  } else {
    recommendedSeverity = 'Low';
  }

  // Calculate 0 - 100 Priority Score based on the 4 mandatory factors:
  // 1. Severity (40%)
  // 2. People Affected (30%)
  // 3. Time Since Reporting aging escalation (15%)
  // 4. Emergency Category urgency (15%)
  const severityMultiplier =
    recommendedSeverity === 'Critical' ? 40 :
    recommendedSeverity === 'High' ? 28 :
    recommendedSeverity === 'Medium' ? 16 : 8;

  const peopleFactor = Math.min(30, Math.round((Math.min(count, 20) / 20) * 30));

  // Time elapsed aging factor (+1 per 10 mins, up to +15 pts)
  const elapsedMinutes = input.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(input.createdAt).getTime()) / (1000 * 60)))
    : 0;
  const timeFactor = Math.min(15, Math.floor(elapsedMinutes / 10));

  // Category urgency factor (up to 15 pts)
  let catUrgency = 10;
  if (input.category === 'Building Collapse' || input.category === 'Fire Emergency') catUrgency = 15;
  else if (input.category === 'Medical Emergency') catUrgency = 14;
  else if (input.category === 'Flood') catUrgency = 12;
  else if (input.category === 'Road Accident') catUrgency = 10;
  else catUrgency = 6;

  const priorityScore = Math.min(100, Math.max(10, severityMultiplier + peopleFactor + timeFactor + catUrgency));

  const priorityFactors: PriorityScoreFactor[] = [
    {
      label: 'Severity Level',
      score: severityMultiplier,
      weight: '40%',
      description: `${recommendedSeverity} classification (${severityMultiplier}/40 pts)`,
    },
    {
      label: 'Casualty Impact',
      score: peopleFactor,
      weight: '30%',
      description: `${count} individual(s) at direct risk (${peopleFactor}/30 pts)`,
    },
    {
      label: 'Category Urgency',
      score: catUrgency,
      weight: '15%',
      description: `${input.category} baseline response urgency (${catUrgency}/15 pts)`,
    },
    {
      label: 'Time Since Reporting',
      score: timeFactor,
      weight: '15%',
      description: `${elapsedMinutes}m elapsed since report (+${timeFactor} escalation pts)`,
    },
  ];

  return {
    recommendedSeverity,
    severityReasoning: reasoning,
    priorityScore,
    priorityFactors,
  };
}

/**
 * Recalculates dynamic priority score with live elapsed time for an existing incident
 */
export function calculateDynamicPriorityScore(incident: Incident): {
  priorityScore: number;
  priorityFactors: PriorityScoreFactor[];
  elapsedMinutes: number;
} {
  const elapsedMinutes = incident.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60)))
    : 0;

  // Severity Weight (40%)
  const severityMultiplier =
    incident.severity === 'Critical' ? 40 :
    incident.severity === 'High' ? 28 :
    incident.severity === 'Medium' ? 16 : 8;

  // Casualty Factor (30%)
  const count = Math.max(0, incident.peopleAffected || 0);
  const peopleFactor = Math.min(30, Math.round((Math.min(count, 20) / 20) * 30));

  // Category Urgency (15%)
  let catUrgency = 10;
  if (incident.category === 'Building Collapse' || incident.category === 'Fire Emergency') catUrgency = 15;
  else if (incident.category === 'Medical Emergency') catUrgency = 14;
  else if (incident.category === 'Flood') catUrgency = 12;
  else if (incident.category === 'Road Accident') catUrgency = 10;
  else catUrgency = 6;

  // Aging Escalation Factor (15%): +1 pt per 10 mins unattended, capped at 15
  const timeFactor = incident.status === 'Resolved' ? 0 : Math.min(15, Math.floor(elapsedMinutes / 10));

  const priorityScore = Math.min(100, Math.max(10, severityMultiplier + peopleFactor + catUrgency + timeFactor));

  const priorityFactors: PriorityScoreFactor[] = [
    {
      label: 'Severity Level',
      score: severityMultiplier,
      weight: '40%',
      description: `${incident.severity} classification (${severityMultiplier}/40 pts)`,
    },
    {
      label: 'Casualty Impact',
      score: peopleFactor,
      weight: '30%',
      description: `${count} person(s) affected (${peopleFactor}/30 pts)`,
    },
    {
      label: 'Category Urgency',
      score: catUrgency,
      weight: '15%',
      description: `${incident.category} baseline urgency (${catUrgency}/15 pts)`,
    },
    {
      label: 'Time Aging Escalation',
      score: timeFactor,
      weight: '15%',
      description: incident.status === 'Resolved'
        ? 'Resolved incident (escalation cleared)'
        : `${elapsedMinutes}m elapsed since report (+${timeFactor}/15 aging escalation pts)`,
    },
  ];

  return {
    priorityScore,
    priorityFactors,
    elapsedMinutes,
  };
}

/**
 * Automatically ranks incidents based on 4 factors:
 * Severity, People Affected, Time Since Reporting, and Category
 */
export function rankIncidents(incidents: Incident[]): Incident[] {
  // Compute dynamic scores
  const withDynamic = incidents.map(inc => {
    const dynamic = calculateDynamicPriorityScore(inc);
    return {
      ...inc,
      priorityScore: dynamic.priorityScore,
      priorityFactors: dynamic.priorityFactors,
    };
  });

  // Sort: Active before resolved, then higher priority score, then newer
  const sorted = [...withDynamic].sort((a, b) => {
    if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
    if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Assign 1-indexed priority rank (#1, #2, #3...)
  return sorted.map((inc, index) => ({
    ...inc,
    priorityRank: index + 1,
  }));
}

// Haversine distance in kilometers
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Tokenize text into set of lowercase significant words
function tokenize(text: string): Set<string> {
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near', 'by', 'of', 'for', 'to']);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  return new Set(words);
}

// Jaccard similarity between two sets of tokens
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function detectDuplicateIncident(
  target: {
    id?: string;
    category: EmergencyCategory;
    title: string;
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    createdAt?: string;
  },
  existingIncidents: Incident[]
): DuplicateMatch | undefined {
  const targetTokens = tokenize(`${target.title} ${target.description} ${target.location}`);
  const targetTime = target.createdAt ? new Date(target.createdAt).getTime() : Date.now();

  let highestMatch: DuplicateMatch | undefined;
  let maxScore = 0;

  for (const existing of existingIncidents) {
    // Ignore comparing to self
    if (target.id && existing.id === target.id) continue;
    // Don't compare resolved incidents from days ago
    if (existing.status === 'Resolved') continue;

    const existingTime = new Date(existing.createdAt).getTime();
    const timeDiffMinutes = Math.abs(Math.round((targetTime - existingTime) / (1000 * 60)));

    // Ignore reports more than 8 hours apart
    if (timeDiffMinutes > 480) continue;

    const reasons: string[] = [];
    let score = 0;

    // 1. Same category is primary prerequisite (+30%)
    if (target.category === existing.category) {
      score += 30;
      reasons.push(`Identical emergency category: "${target.category}"`);
    } else {
      // Different category is very unlikely duplicate
      continue;
    }

    // 2. Spatial proximity
    let distKm: number | undefined;
    if (target.latitude && target.longitude && existing.latitude && existing.longitude) {
      distKm = calculateHaversineDistance(
        target.latitude,
        target.longitude,
        existing.latitude,
        existing.longitude
      );
      if (distKm <= 0.5) {
        score += 40;
        reasons.push(`Extremely close geographic proximity: ${(distKm * 1000).toFixed(0)}m apart`);
      } else if (distKm <= 1.5) {
        score += 25;
        reasons.push(`Within immediate vicinity: ${distKm.toFixed(2)} km apart`);
      } else if (distKm <= 3.0) {
        score += 10;
        reasons.push(`In neighboring zone: ${distKm.toFixed(2)} km apart`);
      }
    } else {
      // Fallback location text check
      const locTarget = target.location.toLowerCase();
      const locExisting = existing.location.toLowerCase();
      if (locTarget.includes(locExisting) || locExisting.includes(locTarget)) {
        score += 30;
        reasons.push(`Location descriptions match closely: "${existing.location}"`);
      }
    }

    // 3. Text description / keyword similarity
    const existingTokens = tokenize(`${existing.title} ${existing.description} ${existing.location}`);
    const jaccard = calculateJaccardSimilarity(targetTokens, existingTokens);
    if (jaccard >= 0.4) {
      score += 30;
      reasons.push(`High textual similarity (${(jaccard * 100).toFixed(0)}% word match)`);
    } else if (jaccard >= 0.2) {
      score += 15;
      reasons.push(`Moderate textual overlap (${(jaccard * 100).toFixed(0)}% word match)`);
    }

    // 4. Temporal proximity bonus
    if (timeDiffMinutes <= 60) {
      score += 10;
      reasons.push(`Reported within ${timeDiffMinutes} minutes of each other`);
    }

    const finalSimilarity = Math.min(100, Math.round(score));

    // Threshold: at least 60% match
    if (finalSimilarity >= 55 && finalSimilarity > maxScore) {
      maxScore = finalSimilarity;
      highestMatch = {
        suspectId: existing.id,
        suspectCode: existing.incidentCode,
        suspectTitle: existing.title,
        similarityScore: finalSimilarity,
        timeDifferenceMinutes: timeDiffMinutes,
        distanceKm: distKm ? Math.round(distKm * 100) / 100 : undefined,
        reasons,
      };
    }
  }

  return highestMatch;
}
