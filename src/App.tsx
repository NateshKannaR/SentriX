import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { TrackIncidentPage } from './pages/TrackIncidentPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { IncidentsPage } from './pages/admin/IncidentsPage';
import { MapPage } from './pages/admin/MapPage';
import { DuplicatesPage } from './pages/admin/DuplicatesPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/track" element={<TrackIncidentPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Command Center Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="duplicates" element={<DuplicatesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
