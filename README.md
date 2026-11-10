# SentriX — Intelligent Emergency Response & Disaster Management System

> **Tagline**: *"One Platform. Every Emergency. Faster Response."*  
> **Challenge**: **CODE CLASH 2026** — Round 1: Emergency Incident Reporting & Monitoring

---

## 🚨 Problem Statement & Product Vision

During emergency disasters such as road accidents, fires, floods, and structural collapses, coordinating rapid emergency response is hindered by fragmented citizen reports, lack of centralized intelligence, duplicate dispatches, and delayed casualty assessment.

**SentriX** centralizes citizen emergency reports, dynamically classifies incident severity using explainable decision support, suppresses duplicate reports, and equips emergency administrators with a centralized Command Center.

---

## ☁️ Vercel Deployment & MongoDB Atlas Setup

This application is fully pre-configured for one-click **Vercel Deployment** with **MongoDB Atlas** serverless backend functions:

1. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository: `https://github.com/NateshKannaR/SentriX`.
2. **Environment Variables**:
   Add the following in your Vercel Project Settings > Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://Natesh:Natesh@cluster0.wwp3oig.mongodb.net/?retryWrites=true&w=majority`
   - `MONGODB_DB`: `sentinel360`
3. **Deploy**:
   - Vercel automatically deploys the Vite frontend from `dist` and builds the serverless API routes in `/api`.
   - On first load, the serverless API automatically seeds the MongoDB collection with full rich demonstration incidents!

---

## 🎯 Round 1 Mandatory Requirements — Feature Compliance Matrix

| Challenge Brief Requirement | Implementation in SentriX | Status |
| :--- | :--- | :---: |
| **1. Emergency Incident Reporting** | Fast, responsive reporting form with Title, Category, Location, People Affected, Description, and Optional Contact details. | **Complete & Verified** |
| **2. Six Emergency Categories** | Fire Emergency, Road Accident, Medical Emergency, Flood, Building Collapse, Other Emergencies with dedicated visual iconography. | **Complete & Verified** |
| **3. Incident Severity Classification** | 4 Tiers: **Low**, **Medium**, **High**, **Critical**. Transparent, explainable Smart Severity Engine based on casualties and risk keywords. | **Complete & Verified** |
| **4. Emergency Dashboard** | Real-time statistics: Total Reported, Critical, Pending, In Progress, Resolved, and Category charts powered by stored incident data. | **Complete & Verified** |
| **5. Incident Management** | View all reports, filter/search/sort, open deep dossiers, inline and modal status updates (`Reported`, `Pending`, `In Progress`, `Resolved`), CSV export, delete test reports. | **Complete & Verified** |
| **6. UI/UX Excellence** | Mission control palette (`#071426`, `#16C7E8`, `#F04452`), responsive layouts, pulsing critical alert indicators, light & dark command modes. | **Complete & Verified** |

---

## ⚡ Innovative Standout Features

### 1. Smart Severity Intelligence Engine (Decision Support)
- Evaluates category baseline risk (e.g. Building Collapse +32, Fire +28, Medical +24).
- Evaluates casualty thresholds (1-2: +15, 3-5: +28, 6-15: +42, 16+: +55 Mass Casualty).
- Detects life-critical keywords (`trapped`, `explosion`, `toxic`, `unconscious`, `flames`, `crushed`, `chemical`, `debris`) and vulnerable population keywords (`child`, `infant`, `elderly`, `school`, `hospital`).
- Produces an explainable, bulleted rationale for why a severity was assigned.
- Commanders retain full override authority with audit logging.

### 2. Transparent Priority Score (0 to 100)
- Mathematical index:
  $$\text{Priority} = \text{SeverityWeight}(40\%) + \text{CasualtyImpact}(35\%) + \text{ThreatKeywords}(25\%)$$
- Automatically ranks the live incident priority queue.

### 3. Interactive Leaflet Emergency Map
- Interactive OpenStreetMap canvas with custom-styled SVG emergency pins.
- Pin colors correlate with severity (Red: Critical, Orange: High, Amber: Medium, Green: Low).
- Marker popups provide quick dossier inspection and pan-to-incident.
- Floating geospatial filters and graceful fallback for offline environments.

### 4. Duplicate Incident Detection Guard
- Cross-correlates reports across 4 dimensions:
  1. Identical emergency category.
  2. Haversine spatial proximity ($< 1.5\text{ km}$).
  3. Textual semantic token overlap (Jaccard similarity).
  4. Temporal window ($< 8\text{ hours}$).
- Surfaces warning badges with percentage match confidence.
- Dedicated Side-by-Side Comparison Inspector allows commanders to verify evidence and link/close duplicates without accidental data loss.

### 5. Chronological Incident Activity Timeline
- Immutable audit log tracking citizen submission, AI severity assignment, status changes, unit deployments, commander overrides, and custom field notes.

### 6. Emergency Alert Center (In-App Drawer)
- Top navigation bell indicator with unread badge counter.
- Sliding drawer highlighting active critical incidents and unreviewed duplicate reports with 1-click review.

### 7. Demo Simulation Engine
- Dedicated **"Simulate Emergency"** and **"Simulate Burst (3 Scenarios)"** buttons in top header and sidebar.
- Injects varied, realistic multi-casualty incidents with geocodes across all 6 categories.
- Includes a 1-click **Reset Demo Data** option to restore the initial seed dataset.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS
- **Icons**: Lucide React
- **Visualizations**: Recharts (Bar Charts, Donut Pie, Area Trend Lines)
- **Geospatial**: Leaflet & OpenStreetMap
- **Routing**: React Router v7
- **Database & Persistence**:
  - **MongoDB Atlas** serverless integration via `/api/incidents`, `/api/activities`, `/api/simulate`, `/api/reset`
  - Cached connection pool in `lib/mongodb.ts`
  - Browser storage fallback (`localStorage`) for offline resilience
  - Optional Supabase PostgreSQL database support (`supabase/schema.sql`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

```bash
# 1. Clone repository or navigate to project directory
cd SentriX

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧭 Page Routes & Navigation

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Public portal, hero, category cards, operational workflow, telemetry stats. |
| `/report` | **Emergency Reporting** | Citizen submission form with 6 categories, location presets, and real-time AI triage preview. |
| `/track` | **Incident Tracking** | Citizens track their incident code (`STX-2026-XXXX`) and response progress. |
| `/login` | **Commander Terminal** | Administrator sign-in with 1-click Judge Quick Access. |
| `/admin/dashboard` | **Command Dashboard** | Real-time statistics, Recharts visualizations, and Critical Priority Queue. |
| `/admin/incidents` | **Incident Management** | Interactive table with search, category/severity/status filters, CSV export, and deletion. |
| `/admin/map` | **Interactive Map** | Geospatial incident map with custom severity pins, popups, and drawer. |
| `/admin/duplicates` | **Duplicate Guard** | AI duplicate detector and side-by-side inspection tool. |
| `/admin/analytics` | **Intelligence Analytics**| Casualty impact breakdown, severity distribution, and CSV export. |
| `/admin/settings` | **Simulation & System** | One-click emergency simulator, seed data reset, and MongoDB/Supabase diagnostics. |

---

## 📄 License & Attribution

Built for **CODE CLASH 2026** — Round 1 Challenge. Developed with standard open-source technologies under MIT License.
