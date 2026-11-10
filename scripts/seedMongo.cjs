const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://Natesh:Natesh@cluster0.wwp3oig.mongodb.net/?retryWrites=true&w=majority';

const INITIAL_INCIDENTS = [
  {
    id: 'inc-demo-1',
    incidentCode: 'STX-2026-9041',
    title: 'Peenya Industrial Boiler Explosion & Chemical Solvent Fire',
    description: 'High-pressure steam boiler ruptured triggering secondary blaze across ethanol storage drums. Dense toxic vapors threatening surrounding residential colonies. 4 workers trapped in basement turbine room.',
    category: 'Fire Emergency',
    location: 'Peenya Industrial Area, Phase II',
    landmark: 'Behind KSSIDC Warehouse Block 4',
    latitude: 13.0310,
    longitude: 77.5180,
    peopleAffected: 8,
    contactInformation: {
      name: 'Ramesh Sundaram',
      phone: '+91 98450 11223',
      email: 'plant.safety@peenyaindustries.in',
    },
    severity: 'Critical',
    recommendedSeverity: 'Critical',
    severityReasoning: [
      "Category 'Fire Emergency' presents rapid escalation and thermal/smoke hazards (+28)",
      "Multi-person incident: 8 people affected (+42 impact)",
      "Life-critical indicators detected: 'explosion', 'toxic', 'trapped' (+25)"
    ],
    severityOverridden: false,
    priorityScore: 94,
    priorityFactors: [
      { label: 'Severity Level', score: 40, weight: '40%', description: 'Critical classification (40/40 pts)' },
      { label: 'Casualty Impact', score: 28, weight: '30%', description: '8 individuals affected (28/30 pts)' },
      { label: 'Category Urgency', score: 15, weight: '15%', description: 'Fire Emergency urgency (15/15 pts)' },
      { label: 'Time Since Reporting', score: 11, weight: '15%', description: '110m elapsed (+11 escalation pts)' }
    ],
    status: 'In Progress',
    assignedUnit: 'Alpha Fire Tender 1',
    assignedTeamId: 'TEAM-FIRE-01',
    assignedTeamName: 'Alpha Fire Tender 1',
    assignedTeamCategory: 'Fire & Rescue',
    assignedDistanceKm: 1.2,
    assignedEtaMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-demo-2',
    incidentCode: 'STX-2026-9042',
    title: 'Multi-Vehicle Highway Collision on Electronics City Flyover',
    description: 'Inter-city multi-axle cargo truck lost braking control during heavy downpour, colliding into two commuter vans. One van turned over across median divider. Five individuals trapped in passenger compartment with crush injuries.',
    category: 'Road Accident',
    location: 'Electronics City Elevated Expressway, Pillar 142',
    landmark: 'Near Silk Board Ramp Merge',
    latitude: 12.8450,
    longitude: 77.6600,
    peopleAffected: 5,
    contactInformation: {
      name: 'Divya Krishnan',
      phone: '+91 97410 44556',
      email: 'divya.k@techpark.com',
    },
    severity: 'High',
    recommendedSeverity: 'High',
    severityReasoning: [
      "Category 'Road Accident' indicates kinetic trauma and transit obstruction (+20)",
      "Multi-person incident: 5 people affected (+28 impact)",
      "High-risk threat indicators: 'collision', 'crush' (+15)"
    ],
    severityOverridden: false,
    priorityScore: 82,
    priorityFactors: [
      { label: 'Severity Level', score: 28, weight: '40%', description: 'High classification (28/40 pts)' },
      { label: 'Casualty Impact', score: 24, weight: '30%', description: '5 persons affected (24/30 pts)' },
      { label: 'Category Urgency', score: 10, weight: '15%', description: 'Road Accident urgency (10/15 pts)' },
      { label: 'Time Since Reporting', score: 8, weight: '15%', description: '80m elapsed (+8 escalation pts)' }
    ],
    status: 'Assigned',
    assignedUnit: 'Delta Trauma ALS Ambulance',
    assignedTeamId: 'TEAM-MED-01',
    assignedTeamName: 'Delta Trauma ALS Ambulance',
    assignedTeamCategory: 'Medical & Trauma',
    assignedDistanceKm: 2.8,
    assignedEtaMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-demo-3',
    incidentCode: 'STX-2026-9043',
    title: 'Mass Pediatric Food Poisoning & Respiratory Distress at School',
    description: '12 elementary school students exhibit severe acute food-borne anaphylaxis, dyspnea, and recurrent vomiting following mid-day lunch. Campus medical room capacity exceeded.',
    category: 'Medical Emergency',
    location: 'Greenwood High International School Campus, Sarjapur Road',
    landmark: 'Main Administrative Gate 2',
    latitude: 12.8980,
    longitude: 77.7210,
    peopleAffected: 12,
    contactInformation: {
      name: 'Dr. Anita Roy',
      phone: '+91 98860 33445',
      email: 'principal@greenwoodhigh.edu.in',
    },
    severity: 'Critical',
    recommendedSeverity: 'Critical',
    severityReasoning: [
      "Category 'Medical Emergency' requires rapid physiological intervention (+24)",
      "High casualty count: 12 people at immediate risk (+42 impact)",
      "Vulnerable population at risk: 'children' (+12)"
    ],
    severityOverridden: false,
    priorityScore: 92,
    priorityFactors: [
      { label: 'Severity Level', score: 40, weight: '40%', description: 'Critical classification (40/40 pts)' },
      { label: 'Casualty Impact', score: 30, weight: '30%', description: '12 children affected (30/30 pts)' },
      { label: 'Category Urgency', score: 14, weight: '15%', description: 'Medical Emergency urgency (14/15 pts)' },
      { label: 'Time Since Reporting', score: 8, weight: '15%', description: '85m elapsed (+8 escalation pts)' }
    ],
    status: 'In Progress',
    assignedUnit: 'Echo Rapid Paramedic ICU',
    assignedTeamId: 'TEAM-MED-02',
    assignedTeamName: 'Echo Rapid Paramedic ICU',
    assignedTeamCategory: 'Medical & Trauma',
    assignedDistanceKm: 3.5,
    assignedEtaMinutes: 7,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-demo-4',
    incidentCode: 'STX-2026-9044',
    title: 'Flash Urban Flooding & Canal Embankment Rupture',
    description: 'Cloudburst triggered breach of storm runoff bund. Water level risen to 4.5 feet inside lower level apartments. 6 elderly occupants stranded on terrace with ground floor submerged.',
    category: 'Flood',
    location: 'Ejipura Canal Enclave, Koramangala 4th Block',
    landmark: 'Adjacent to National Games Village Flyover',
    latitude: 12.9410,
    longitude: 77.6320,
    peopleAffected: 6,
    contactInformation: {
      name: 'Srinivasan Raman',
      phone: '+91 94480 77889',
      email: 'srinivas.r@bangaloreresidents.org',
    },
    severity: 'High',
    recommendedSeverity: 'High',
    severityReasoning: [
      "Category 'Flood' indicates environmental expansion and rescue challenge (+22)",
      "Multi-person incident: 6 people affected (+28 impact)",
      "Vulnerable population at risk: 'elderly' (+12)"
    ],
    severityOverridden: false,
    priorityScore: 78,
    priorityFactors: [
      { label: 'Severity Level', score: 28, weight: '40%', description: 'High classification (28/40 pts)' },
      { label: 'Casualty Impact', score: 25, weight: '30%', description: '6 individuals at risk (25/30 pts)' },
      { label: 'Category Urgency', score: 12, weight: '15%', description: 'Flood urgency (12/15 pts)' },
      { label: 'Time Since Reporting', score: 5, weight: '15%', description: '50m elapsed (+5 escalation pts)' }
    ],
    status: 'Reported',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-demo-5',
    incidentCode: 'STX-2026-9045',
    title: 'Old Commercial Heritage Complex Cantilever Collapse',
    description: 'Three-story retail arcade masonry balcony failed following deep structural tremors. Heavy debris crashed onto busy market sidewalk. 3 pedestrians injured by falling brickwork.',
    category: 'Building Collapse',
    location: 'Chickpet Commercial Market Street',
    landmark: 'Opposite Raja Market Circle',
    latitude: 12.9690,
    longitude: 77.5780,
    peopleAffected: 3,
    contactInformation: {
      name: 'Mohd. Farooq',
      phone: '+91 99001 55667',
      email: 'farooq.textiles@gmail.com',
    },
    severity: 'High',
    recommendedSeverity: 'High',
    severityReasoning: [
      "Category 'Building Collapse' carries high structural collapse risk (+32)",
      "Multi-person incident: 3 people affected (+28 impact)",
      "Threat indicators: 'debris', 'collapsed' (+15)"
    ],
    severityOverridden: false,
    priorityScore: 76,
    priorityFactors: [
      { label: 'Severity Level', score: 28, weight: '40%', description: 'High classification (28/40 pts)' },
      { label: 'Casualty Impact', score: 20, weight: '30%', description: '3 people affected (20/30 pts)' },
      { label: 'Category Urgency', score: 15, weight: '15%', description: 'Building Collapse urgency (15/15 pts)' },
      { label: 'Time Since Reporting', score: 3, weight: '15%', description: '30m elapsed (+3 escalation pts)' }
    ],
    status: 'Reported',
    imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-demo-6',
    incidentCode: 'STX-2026-9046',
    title: 'Punctured Natural Gas Main Line during Excavation',
    description: 'Road utility trencher ruptured 4-inch pressurized underground CNG pipe. Strong mercaptan gas plume blowing toward residential apartments. Emergency 200m perimeter cordon required.',
    category: 'Other Emergencies',
    location: '100 Feet Road, Indiranagar',
    landmark: 'Opposite Metro Station Pillar 204',
    latitude: 12.9710,
    longitude: 77.6410,
    peopleAffected: 0,
    contactInformation: {
      name: 'Kavita Hegde',
      phone: '+91 98440 88990',
      email: 'kavita.ward112@bbmp.gov.in',
    },
    severity: 'Medium',
    recommendedSeverity: 'Medium',
    severityReasoning: [
      "Category 'Other Emergencies' initiated with standard baseline (+12)",
      "No confirmed casualties yet reported (+5 baseline)",
      "Risk keywords: 'gas leak' (+9)"
    ],
    severityOverridden: false,
    priorityScore: 54,
    priorityFactors: [
      { label: 'Severity Level', score: 16, weight: '40%', description: 'Medium classification (16/40 pts)' },
      { label: 'Casualty Impact', score: 5, weight: '30%', description: '0 confirmed casualties (5/30 pts)' },
      { label: 'Category Urgency', score: 6, weight: '15%', description: 'Other Emergencies baseline (6/15 pts)' },
      { label: 'Time Since Reporting', score: 1, weight: '15%', description: '15m elapsed (+1 escalation pt)' }
    ],
    status: 'Reported',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    isDemo: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_TEAMS = [
  {
    id: 'TEAM-FIRE-01',
    name: 'Alpha Fire Tender 1',
    category: 'Fire & Rescue',
    latitude: 13.0280,
    longitude: 77.5250,
    locationName: 'Peenya Industrial Fire Station',
    status: 'Busy',
    assignedIncidentId: 'inc-demo-1',
    assignedIncidentCode: 'STX-2026-9041',
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
    status: 'Busy',
    assignedIncidentId: 'inc-demo-2',
    assignedIncidentCode: 'STX-2026-9042',
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
    status: 'Busy',
    assignedIncidentId: 'inc-demo-3',
    assignedIncidentCode: 'STX-2026-9043',
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

async function seedDatabase(client, targetDbName) {
  console.log(`\n========================================`);
  console.log(`Seeding database: "${targetDbName}" on MongoDB Atlas`);
  console.log(`========================================`);
  const db = client.db(targetDbName);

  const incidentsCol = db.collection('incidents');
  const teamsCol = db.collection('teams');
  const activitiesCol = db.collection('activities');

  // 1. Incidents
  await incidentsCol.deleteMany({});
  const incResult = await incidentsCol.insertMany(INITIAL_INCIDENTS);
  console.log(`✓ Inserted ${incResult.insertedCount} incidents into "${targetDbName}.incidents"`);

  // 2. Teams
  await teamsCol.deleteMany({});
  const teamsResult = await teamsCol.insertMany(INITIAL_TEAMS);
  console.log(`✓ Inserted ${teamsResult.insertedCount} teams into "${targetDbName}.teams"`);

  // 3. Initial Activities
  await activitiesCol.deleteMany({});
  const sampleActivities = [
    {
      id: 'act-init-1',
      incidentId: 'inc-demo-1',
      action: 'TEAM_DISPATCHED',
      newValue: 'Alpha Fire Tender 1',
      actor: 'Commander Aditi Rao',
      description: 'Alpha Fire Tender 1 assigned to Peenya Industrial Boiler Explosion. Distance: 1.2 km, ETA: 3 mins.',
      timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-init-2',
      incidentId: 'inc-demo-2',
      action: 'TEAM_DISPATCHED',
      newValue: 'Delta Trauma ALS Ambulance',
      actor: 'Commander Aditi Rao',
      description: 'Delta Trauma ALS Ambulance dispatched to Electronics City flyover crash. Distance: 2.8 km, ETA: 6 mins.',
      timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    },
  ];
  const actResult = await activitiesCol.insertMany(sampleActivities);
  console.log(`✓ Inserted ${actResult.insertedCount} activities into "${targetDbName}.activities"`);
}

async function main() {
  const client = new MongoClient(uri);
  try {
    console.log('Connecting to MongoDB Atlas Cluster0...');
    await client.connect();
    console.log('Connected successfully!');

    // Seed into both sentrix AND Natesh so the user sees data in whichever database they inspect in Atlas
    await seedDatabase(client, 'sentrix');
    await seedDatabase(client, 'Natesh');

    console.log('\n>>> SUCCESS: MongoDB Atlas database seeding complete! <<<');
  } catch (err) {
    console.error('Error seeding MongoDB Atlas:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
