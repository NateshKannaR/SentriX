import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FloatingEmergencyWhatsApp } from './components/common/FloatingEmergencyWhatsApp';

const TrackIncidentPage = lazy(() => import('./pages/TrackIncidentPage').then(module => ({ default: module.TrackIncidentPage })));
const ReportPage = lazy(() => import('./pages/ReportPage').then(module => ({ default: module.ReportPage })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));
const CitizenPortalPage = lazy(() => import('./pages/CitizenPortalPage').then(module => ({ default: module.CitizenPortalPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then(module => ({ default: module.DashboardPage })));
const IncidentsPage = lazy(() => import('./pages/admin/IncidentsPage').then(module => ({ default: module.IncidentsPage })));
const MapPage = lazy(() => import('./pages/admin/MapPage').then(module => ({ default: module.MapPage })));
const DuplicatesPage = lazy(() => import('./pages/admin/DuplicatesPage').then(module => ({ default: module.DuplicatesPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const TeamsPage = lazy(() => import('./pages/admin/TeamsPage').then(module => ({ default: module.TeamsPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(module => ({ default: module.SettingsPage })));

export const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div role="status" className="grid min-h-screen place-items-center text-sm text-slate-300">Loading SentriX…</div>}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/track" element={<TrackIncidentPage />} />
          <Route path="/citizen" element={<CitizenPortalPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Command Center Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="duplicates" element={<DuplicatesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Persistent Floating Emergency WhatsApp SOS (Direct to +91 7806869597) */}
      <FloatingEmergencyWhatsApp />
    </>
  );
};

export default App;
