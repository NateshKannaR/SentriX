# SENTRIX — Intelligent Emergency Response & Disaster Management Platform

> **Official Tagline**: *"Every Second Matters. Every Life Counts."*  
> **Hackathon**: **CODE CLASH 2026** — Round 2: Intelligent Emergency Coordination & Resource Allocation  
> **Live Deployment**: [https://sentrixbynk.vercel.app/](https://sentrixbynk.vercel.app/)  
> **Repository**: [https://github.com/NateshKannaR/SentriX.git](https://github.com/NateshKannaR/SentriX.git)  
> **Emergency Hotline (WhatsApp Direct SOS)**: `+91 7806869597`

---

## 🚨 Executive Summary

During critical disasters and urban emergencies—industrial chemical blazes, structural collapses, multi-vehicle highway pileups, and flash floods—every second lost in manual triage or misrouted response teams leads to preventable casualties.

**SENTRIX** is an intelligent emergency coordination platform designed for urban emergency operations centers (EOC) and frontline disaster coordinators. Upgraded from Round 1 incident capture into a fully autonomous, explainable decision-support and dispatch coordination platform, SENTRIX combines:
- **4-Factor Dynamic Incident Prioritization (40/25/20/15)** with the Anti-Minor-Outranking rule.
- **Geospatial Smart Nearest Team Assignment** using the Haversine formula and category capability matching.
- **Explainable Dispatch Intelligence** that clearly justifies why a unit was recommended over closer mismatched units.
- **Resource Conflict Detection** that prevents double-booking busy or offline response units.
- **Real-Time Fleet Telemetry & Readiness Radar** with zero-available category alerts.
- **Bidirectional Incident Lifecycle Syncing** across citizen portals, admin dashboards, and operations maps.

---

## 🎯 Code Clash 2026 Round 2 — 50-Mark Challenge Compliance Matrix

| Challenge Module | Requirement Breakdown | SENTRIX Implementation | Status |
| :--- | :--- | :--- | :---: |
| **Module 1: Intelligent Prioritization** (10 Marks) | Dynamic scoring algorithm combining Severity (40%), Casualties (25%), Waiting Time (20%), and Category Urgency (15%). Anti-minor outranking rule. Explainable "Why is this incident ranked #1?" panel. | `src/services/intelligenceEngine.ts`<br>`src/components/admin/IncidentDetailsModal.tsx`<br>`src/pages/admin/DashboardPage.tsx` | **100% Complete** |
| **Module 2: Team Management** (10 Marks) | Dedicated `/admin/teams` fleet management suite. Add/Edit/View/Filter response units across 6 specialist branches. 3 operational states (`Available`, `Busy`, `Offline`). 5 top-level KPI indicators. | `src/pages/admin/TeamsPage.tsx`<br>`src/services/teamService.ts` | **100% Complete** |
| **Module 3: Smart Nearest Team Assignment** (10 Marks) | Real Haversine geodesic distance in km. ETA estimation (40 km/h average urban speed). Category capability compatibility filter. Explainable recommendation rationale with comparison against closer excluded units. Admin override capability. Real GPS handling. | `src/services/teamService.ts`<br>`src/components/admin/IncidentDetailsModal.tsx` | **100% Complete** |
| **Module 4: Incident Lifecycle & Sync** (10 Marks) | Linear state machine: `Reported` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`. Automatic bidirectional status sync with assigned teams. Real-time broadcast channel. Conflict detection preventing assignment of busy/offline units. | `src/services/incidentService.ts`<br>`src/services/teamService.ts` | **100% Complete** |
| **Module 5: Interactive Operations Map** (5 Marks) | Dark-mode Leaflet tactical map at `/admin/map`. Incident pins color-coded by severity. Response unit markers with category icons and busy badges. Direct geodesic vector lines connecting incidents to assigned teams with distance and ETA HUD badges. | `src/pages/admin/MapPage.tsx` | **100% Complete** |
| **Module 6: Advanced Analytics Dashboard** (5 Marks) | 8 Mandatory Key Metrics: Total Emergencies, Critical Emergencies, Available Teams, Busy Teams, Assigned Incidents, Resolved Incidents, Team Utilization %, and Unassigned Incidents. 4 visual charts including team workload by category. | `src/pages/admin/AnalyticsPage.tsx` | **100% Complete** |

---

## 🏆 Standout Innovation Features (Phase 8)

### Feature A: Explainable Dispatch Intelligence
Rather than a "black-box" recommendation, SENTRIX explicitly informs the dispatcher:
> *"Fire Team Alpha is the nearest available team (2.3 km, ~3m ETA) with the appropriate Fire & Rescue capability. Medical Team Charlie was not selected despite being closer (1.1 km) because category mismatch (Medical & Trauma does not service Fire Emergency)."*

Dispatchers can also expand the **"View Exclusions (Why Not Selected?)"** accordion inside the dispatch drawer to inspect the exact exclusion reason for every unit within range.

### Feature B: Resource Conflict Detection
Attempting to deploy a response unit that is currently marked **Busy** on another incident or **Offline** for maintenance triggers an immediate visual and auditory alert:
> *"Resource Conflict: Fire Team Bravo is currently Busy on Mission STX-2026-9041. Reallocation would leave Incident #9041 unattended. Recommended alternative: Fire Team Alpha (Available, 2.3 km)."*

### Feature C: Emergency Response Readiness Panel
Prominently integrated into the Command Dashboard (`/admin/dashboard`):
- Displays available, busy, and offline team counts across all 6 specialized branches.
- Real-time monitor for unassigned emergencies.
- **Pulsing Deficit Alert**: Surfaces an immediate warning banner if any category has **0 available response units** in the sector.

### Feature D: Incident Command Timeline Audit Trail
An immutable, chronological log tracking every operational milestone:
1. Citizen submission timestamp with GPS coordinates.
2. AI dynamic priority score calculation and rank assignment.
3. Automated nearest team recommendation.
4. Dispatcher confirmation or manual override.
5. Unit state transitions (`Assigned` ➔ `In Progress` ➔ `Resolved`).
6. Resolution timestamp and field notes.

### Feature E: 1-Click Evaluation Scenario ("Simulate Critical Fire")
A dedicated button in the header and dashboard launches the **Peenya Industrial Chemical Fire Scenario**:
- Injects a 5-alarm blaze at coordinates `13.0310, 77.5180` with 15 casualties and hazardous materials.
- Resets known test units (`Medical Team Charlie` at 1.1 km, `Fire Team Alpha` at 2.3 km, `Fire Team Bravo` at 5.6 km).
- Instantly demonstrates the mathematical prioritization (#1 in queue) and the smart nearest team filter choosing `Fire Team Alpha` over the closer `Medical Team Charlie`.

---

## 📐 Mathematical Formulation & Algorithms

### 1. Dynamic Priority Scoring Matrix

$$\text{Priority Score} = S_{\text{sev}} + P_{\text{cas}} + W_{\text{wait}} + C_{\text{urg}}$$

Where the maximum total score is **100 points**:

#### Factor 1: Incident Severity ($S_{\text{sev}}$ — 40% Weight, Max 40 Points)
- **Critical**: 40 points (Immediate life threat / structural hazard)
- **High**: 30 points (Substantial hazard requiring rapid containment)
- **Medium**: 18 points (Localized damage, non-life-threatening)
- **Low**: 8 points (Minor inconvenience, controlled event)

#### Factor 2: People Affected ($P_{\text{cas}}$ — 25% Weight, Max 25 Points)
- **> 20 casualties**: 25 points (Mass casualty incident)
- **11 – 20 casualties**: 23 points
- **6 – 10 casualties**: 19 points
- **3 – 5 casualties**: 14 points
- **1 – 2 casualties**: 8 points
- **0 casualties**: 0 points

#### Factor 3: Waiting Time Factor ($W_{\text{wait}}$ — 20% Weight, Max 20 Points)
- Dynamic rate: **+1 point per 5 minutes** elapsed since initial report timestamp.
- **Anti-Minor Outranking Rule**: For Low and Medium severity calls with $\le 1$ person affected, waiting time points are strictly capped at **8 points maximum**. This guarantees that a minor event waiting 2 hours can never dynamically outrank an incoming Critical life hazard.
- Resolved incidents reset waiting time factor to **0 points**.

#### Factor 4: Category Urgency ($C_{\text{urg}}$ — 15% Weight, Max 15 Points)
- **Building Collapse / Fire Emergency**: 15 points
- **Medical Emergency**: 13 points
- **Flood**: 12 points
- **Road Accident**: 10 points
- **Other Emergencies**: 6 points

---

### 2. Haversine Geodesic Distance Algorithm

To calculate the exact straight-line distance across the Earth's ellipsoidal curvature between incident coordinate $(\phi_1, \lambda_1)$ and response team station $(\phi_2, \lambda_2)$:

$$\Delta\phi = \frac{(\phi_2 - \phi_1) \cdot \pi}{180}, \quad \Delta\lambda = \frac{(\lambda_2 - \lambda_1) \cdot \pi}{180}$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\left(\frac{\phi_1 \cdot \pi}{180}\right) \cdot \cos\left(\frac{\phi_2 \cdot \pi}{180}\right) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c \quad (\text{where } R = 6371\text{ km})$$

#### Estimated Transit Time (ETA)
Assuming an average urban emergency transit velocity of $v = 40\text{ km/h}$:

$$\text{ETA (minutes)} = \max\left(2, \text{round}\left(\frac{d}{40} \times 60\right)\right)$$

---

## 🧭 5-Minute Evaluation Guide for Hackathon Judges

Follow these steps to experience and verify all Round 2 capabilities:

### Step 1: Open the Application
Navigate to the live URL: [https://sentrixbynk.vercel.app/](https://sentrixbynk.vercel.app/)  
Or launch locally on `http://127.0.0.1:5173`. Click **Command Center Login** (`admin / sentinel2026`).

### Step 2: Trigger the 1-Click Evaluation Scenario
Click the **"Simulate Critical Fire"** button located in the top navigation bar or the dashboard header.
- A notification confirms: *"SIMULATION: Critical Peenya Chemical Fire generated. Fire Team Alpha recommended via Haversine & category matching."*
- Notice the **Red Alert Banner** at the top of the Command Center.
- Inspect the **Emergency Response Readiness Panel**: View live availability by category and notice any deficit warnings.

### Step 3: Verify Intelligent Prioritization & Explainability
Scroll to the **Critical Priority Incident Queue**:
- Observe the **"WHY IS THIS INCIDENT RANKED #1?"** card.
- Review the dynamic score breakdown: Severity (40/40), Casualties (23/25), Wait Time (1/20), Urgency (15/15) = Total 79/100.
- Click **"Inspect & Dispatch Best-Fit Unit"** or click on the incident row.

### Step 4: Verify Smart Nearest Team Assignment & Conflict Detection
Inside the Incident Details Modal:
- Look at the **Smart Nearest Team Dispatch** section.
- Verify that **Fire Team Alpha (Heavy Foam Tender)** is selected as the **⭐ BEST-FIT RECOMMENDATION** ($2.3\text{ km}$, $\sim 3\text{m ETA}$).
- Read the **Dispatch Rationale**: Notice how it explicitly mentions that **Medical Team Charlie** was closer ($1.1\text{ km}$) but excluded because of category incompatibility.
- Click **"View Exclusions (Why Not Selected?)"** to see the complete audit of excluded teams.
- Click **"Dispatch Recommended Unit"**:
  - Sound effect triggers.
  - Incident status moves to `Assigned`.
  - Assigned unit telemetry shows real-time distance and ETA.
  - Activity log records the dispatch timestamp.

### Step 5: Test Resource Conflict Detection
Close the modal and open another Fire incident.
- Attempt to dispatch **Fire Team Alpha** again.
- SENTRIX blocks the assignment and displays the red **Resource Conflict Banner**: *"Fire Team Alpha is currently Busy on Mission STX-2026-XXXX. Reallocation blocked."*
- Select an alternative available team via **Override**.

### Step 6: Verify Interactive Operations Map
Click **Operations Map** in the left sidebar (`/admin/map`):
- Zoom into Bengaluru / Peenya industrial sector.
- See the red pulsating fire marker and the yellow fire engine marker.
- Observe the dashed cyan vector connecting the assigned team directly to the incident scene.
- Read the on-map HUD badge: `"⚡ Direct Vector: 2.3 km (Straight-line Geodesic) • Est. Transit: ~3m"`.

### Step 7: Verify Response Team Fleet Management
Click **Response Teams** in the left sidebar (`/admin/teams`):
- Review the **5 KPI Cards**: Total Teams, Available Teams, Busy Teams, Offline Teams, and Fleet Readiness %.
- Click **Edit** on any team to update station coordinates, crew size, radio channel, or equipment.
- Use the 1-click status pills (`Available`, `Busy`, `Offline`) to toggle unit states and watch the readiness index dynamically update.

### Step 8: Verify Advanced Analytics Dashboard
Click **Analytics** in the left sidebar (`/admin/analytics`):
- Inspect the **8 Mandatory Round 2 Key Metrics**: Total, Critical, Available, Busy, Assigned, Resolved, Team Utilization %, and Unassigned Incidents.
- Review the 4 visual charts:
  1. Casualty Severity Footprint by Category (Bar Chart)
  2. Incident Distribution by Category (Donut Pie Chart)
  3. Incident Lifecycle Pipeline (Reported ➔ Assigned ➔ In Progress ➔ Resolved)
  4. Team Workload & Fleet Distribution (Stacked Bar Chart: Available vs Busy vs Offline)
- Click **"Export Analytics CSV"** to download the comprehensive report.

---

## 🏗️ Architecture & Technology Stack

```
SENTRIX System Architecture
├── Frontend Presentation Layer (React 19 + TypeScript + Vite 6 + Tailwind CSS)
│   ├── Citizen Incident Portal (Multilingual, Voice SOS, GPS Auto-detection, WhatsApp Hotline)
│   ├── Admin Tactical Command Suite (Dashboard, Incidents Queue, Response Teams Fleet, Operations Map, Analytics)
│   └── Specialized Tactical Modules (Drone UAV Recon, AI SOP Playbook Generator, Hospital Trauma Beds Matrix)
│
├── Intelligence & Decision-Support Engines
│   ├── intelligenceEngine.ts (4-factor dynamic prioritization, anti-minor outranking, priority explainability)
│   ├── teamService.ts (Haversine geospatial calculations, category suitability filter, conflict detection)
│   └── incidentService.ts (Lifecycle state machine, telemetry tracking, duplicate guard, simulation engine)
│
└── Data Persistence & Synchronization Layer
    ├── BroadcastChannel API (Instant multi-tab zero-latency operational sync)
    ├── LocalStorage Resilient Store (Complete offline functionality)
    └── Vercel Serverless Functions + MongoDB Atlas Cluster (Persistent cloud database)
        ├── /api/incidents
        ├── /api/teams
        ├── /api/activities
        └── /api/simulate
```

- **Frontend Framework**: React 19, TypeScript 5.7, Vite 6
- **Styling**: Tailwind CSS with custom mission-critical dark palette (`#060B14`, `#0A101D`, `#06B6D4`, `#F04452`)
- **Geospatial Mapping**: Leaflet 1.9, OpenStreetMap, Leaflet Vector HUD Markers
- **Data Visualizations**: Recharts 2.15 (Bar Charts, Donut Pie Charts, Stacked Load Charts)
- **Audio Feedback HUD**: Web Audio API synthesizer for mission-critical alerts
- **Database & Cloud**: MongoDB Atlas Cloud Database + Vercel Serverless Backend

---

## 💻 Local Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/NateshKannaR/SentriX.git
cd SentriX

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Compile and verify production build
npm run build
```

The application will be accessible at `http://localhost:5173`.

### Environment Configuration (Optional for Cloud Persistence)
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.wwp3oig.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=sentinel360
```

---

## 🔒 Branding Compliance Guarantee

- **Official Name**: **SENTRIX** strictly across all pages, documentation, tab titles, code manifests, and UI headers.
- **Official Tagline**: **"Every Second Matters. Every Life Counts."**
- **Round 1 Features**: 100% preserved and active (Reporting, Category triage, Fake report detection, Duplicate checking, Sound FX, AURA Voice Assistant, Multilingual support in 5 languages).

---

*SENTRIX — Code Clash 2026 Round 2 Submission.*  
*Engineered by Natesh Kanna R.*
