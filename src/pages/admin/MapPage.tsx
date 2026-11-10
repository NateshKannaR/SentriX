import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import L from 'leaflet';
import { Incident, EmergencyCategory, SeverityLevel } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import {
  MapPin,
  Filter,
  Eye,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  WifiOff,
  Navigation,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

// Marker icon generator using SVG data URLs
const createCustomMarker = (severity: SeverityLevel) => {
  let color = '#19B878';
  if (severity === 'Critical') color = '#F04452';
  else if (severity === 'High') color = '#FF7A00';
  else if (severity === 'Medium') color = '#F5A623';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path fill="${color}" stroke="#FFFFFF" stroke-width="2" d="M16 0C7.16 0 0 7.16 0 16c0 10.66 14.2 24.8 14.82 25.42a1.64 1.64 0 0 0 2.36 0C17.8 40.8 32 26.66 32 16 32 7.16 24.84 0 16 0z"/>
    <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
    <circle cx="16" cy="15" r="3" fill="${color}"/>
  </svg>`;

  return L.divIcon({
    html: `<div style="transform: translate(-16px, -42px);">${svg}</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
};

export const MapPage: React.FC = () => {
  const { incidents, onOpenIncident } = useOutletContext<AdminContextType>();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapTileError, setMapTileError] = useState(false);

  // Filtered incidents with coordinates
  const mappedIncidents = incidents.filter(i => {
    if (!i.latitude || !i.longitude) return false;
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
    return true;
  });

  const unlocatedIncidents = incidents.filter(i => !i.latitude || !i.longitude);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [12.9716, 77.5946], // Default center on Bangalore Metropolitan
          zoom: 12,
          zoomControl: true,
        });

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        tileLayer.on('tileerror', () => {
          setMapTileError(true);
        });

        tileLayer.addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      } catch (e) {
        console.warn('Leaflet map initialization error', e);
        setMapTileError(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    mappedIncidents.forEach(inc => {
      if (inc.latitude && inc.longitude) {
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: createCustomMarker(inc.severity),
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-xs font-sans space-y-1.5';
        popupContent.innerHTML = `
          <div class="flex items-center gap-1 font-mono font-bold text-slate-800">
            <span>${inc.incidentCode}</span>
            <span style="color: ${inc.severity === 'Critical' ? '#F04452' : '#FF7A00'};">• ${inc.severity}</span>
          </div>
          <div class="font-bold text-slate-900">${inc.title}</div>
          <div class="text-[11px] text-slate-500">📍 ${inc.location}</div>
          <div class="text-[11px] text-slate-600 font-semibold">Casualties: ${inc.peopleAffected} | Priority: ${inc.priorityScore}/100</div>
          <button id="btn-popup-${inc.id}" style="margin-top:6px;width:100%;background:#071426;color:#fff;border-radius:6px;padding:4px;font-size:11px;font-weight:bold;cursor:pointer;">
            Inspect Incident Dossier
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${inc.id}`);
          if (btn) {
            btn.onclick = () => onOpenIncident(inc);
          }
        });

        marker.on('click', () => {
          setSelectedIncident(inc);
        });

        markersLayerRef.current?.addLayer(marker);
      }
    });
  }, [mappedIncidents, onOpenIncident]);

  const panToIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    if (mapInstanceRef.current && inc.latitude && inc.longitude) {
      mapInstanceRef.current.flyTo([inc.latitude, inc.longitude], 15, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row relative overflow-hidden bg-slate-900">
      {/* Map Filter & Controls Floating Toolbar */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 z-[1000] bg-white/95 dark:bg-sentinel-darkSurface/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-sentinel-darkBorder shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sentinel-cyan/20 text-sentinel-cyan flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Geospatial Operations
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-sentinel-cyan">
            {mappedIncidents.length} Pins
          </span>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Fire Emergency">Fire</option>
            <option value="Road Accident">Road</option>
            <option value="Medical Emergency">Medical</option>
            <option value="Flood">Flood</option>
            <option value="Building Collapse">Collapse</option>
            <option value="Other Emergencies">Other</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          </span>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

        {/* Graceful Fallback if Leaflet Tiles Fail */}
        {mapTileError && (
          <div className="absolute bottom-4 left-4 bg-amber-500/90 text-white p-3 rounded-xl text-xs flex items-center gap-2 shadow-lg z-[1000]">
            <WifiOff className="w-4 h-4" />
            <span>Map tile server offline/blocked. Incident location cards available in sidebar.</span>
          </div>
        )}
      </div>

      {/* Side Incident Inspector Drawer */}
      <div className="w-full lg:w-96 bg-white dark:bg-sentinel-darkSurface border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-sentinel-darkBorder flex flex-col h-72 lg:h-full z-10 shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-sentinel-darkBorder flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Geocoded Incidents ({mappedIncidents.length})
          </h4>
          <span className="text-[10px] font-mono text-sentinel-cyan">Select to Pan</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mappedIncidents.map(inc => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => panToIncident(inc)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sentinel-cyan bg-cyan-500/10 dark:bg-cyan-950/30 ring-1 ring-sentinel-cyan shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-sentinel-darkCard hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {inc.incidentCode}
                  </span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                </div>
                <h5 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {inc.title}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  📍 {inc.location}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    👥 {inc.peopleAffected} Affected
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onOpenIncident(inc);
                    }}
                    className="text-[11px] font-bold text-sentinel-cyan hover:underline flex items-center gap-1"
                  >
                    Dossier <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
