import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import L from 'leaflet';
import { Incident, EmergencyCategory, SeverityLevel } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { soundFx } from '../../utils/soundEffects';
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
  Crosshair,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

// Glowing neon marker icon generator
const createCustomMarker = (severity: SeverityLevel) => {
  let color = '#19B878';
  let glow = 'rgba(25, 184, 120, 0.6)';
  if (severity === 'Critical') {
    color = '#F04452';
    glow = 'rgba(240, 68, 82, 0.8)';
  } else if (severity === 'High') {
    color = '#FF7A00';
    glow = 'rgba(255, 122, 0, 0.7)';
  } else if (severity === 'Medium') {
    color = '#F5A623';
    glow = 'rgba(245, 166, 35, 0.6)';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <defs>
      <filter id="glow-${severity}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${color}" flood-opacity="0.8"/>
      </filter>
    </defs>
    <path fill="${color}" stroke="#FFFFFF" stroke-width="2" filter="url(#glow-${severity})" d="M17 0C7.61 0 0 7.61 0 17c0 11.33 15.11 26.35 15.75 27.01a1.74 1.74 0 0 0 2.5 0C18.89 43.35 34 28.33 34 17 34 7.61 26.39 0 17 0z"/>
    <circle cx="17" cy="16" r="6" fill="#071426"/>
    <circle cx="17" cy="16" r="3.5" fill="${color}"/>
  </svg>`;

  return L.divIcon({
    html: `<div style="transform: translate(-17px, -44px); cursor: pointer;">${svg}</div>`,
    className: 'tactical-marker',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
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
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Filtered incidents with coordinates
  const mappedIncidents = incidents.filter(i => {
    if (!i.latitude || !i.longitude) return false;
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
    return true;
  });

  // Initialize Dark Tactical Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [12.9716, 77.5946], // Default center on Bangalore Metropolitan
          zoom: 12,
          zoomControl: false,
        });

        // Add custom zoom control in bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // CartoDB Dark Matter tiles for military/command center look
        const darkTileLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          }
        );

        darkTileLayer.on('tileerror', () => {
          // Fallback to standard OSM if dark tiles fail
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);
        });

        darkTileLayer.addTo(map);

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
        popupContent.className = 'p-2 text-xs font-sans space-y-2 text-white';
        popupContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <span style="font-family: monospace; font-weight: bold; color: #16C7E8;">${inc.incidentCode}</span>
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${inc.severity === 'Critical' ? '#F04452' : '#FF7A00'};">● ${inc.severity}</span>
          </div>
          <div style="font-weight: bold; font-size: 13px; line-height: 1.2; color: #FFFFFF;">${inc.title}</div>
          <div style="font-size: 11px; color: #94A3B8;">📍 ${inc.location}</div>
          <div style="font-family: monospace; font-size: 11px; color: #CBD5E1;">
            Casualties: <strong>${inc.peopleAffected}</strong> | Priority: <strong>${inc.priorityScore}/100</strong>
          </div>
          <button id="btn-popup-${inc.id}" style="margin-top:8px;width:100%;background:#16C7E8;color:#071426;border-radius:10px;padding:6px;font-size:11px;font-weight:bold;cursor:pointer;border:none;box-shadow:0 0 10px rgba(22,199,232,0.4);">
            Inspect Incident Dossier →
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          soundFx.playBeep(600, 0.05);
          const btn = document.getElementById(`btn-popup-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              soundFx.playClick();
              onOpenIncident(inc);
            };
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
    soundFx.playClick();
    setSelectedIncident(inc);
    if (mapInstanceRef.current && inc.latitude && inc.longitude) {
      mapInstanceRef.current.flyTo([inc.latitude, inc.longitude], 15, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row relative overflow-hidden bg-[#071426]">
      {/* Tactical Floating HUD Controls (Collapsible on mobile) */}
      <div className="absolute top-2 sm:top-4 left-2 right-2 sm:right-auto sm:left-4 sm:w-88 z-[1000] bg-[#0B1E38]/95 backdrop-blur-2xl p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#16C7E8]/30 shadow-2xl space-y-3 sm:space-y-4 glow-cyan transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sentinel-cyan/20 text-sentinel-cyan flex items-center justify-center border border-sentinel-cyan/30">
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-mono font-black text-xs text-white uppercase tracking-wider">
                Geospatial War Room
              </h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden xs:block">
                Dark Matter Cartographic View
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-black text-sentinel-cyan px-2 py-0.5 rounded bg-sentinel-cyan/10 border border-sentinel-cyan/30">
              {mappedIncidents.length} Targets
            </span>
            <button
              onClick={() => setIsHudExpanded(!isHudExpanded)}
              className="sm:hidden p-1 rounded-lg text-slate-300 hover:text-white bg-white/5 border border-white/10"
              aria-label="Toggle filters"
            >
              {isHudExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter dropdowns (Always visible on sm+, expandable on mobile) */}
        <div className={`${isHudExpanded ? 'block' : 'hidden sm:block'} space-y-3 pt-1 border-t border-white/10`}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#071426] text-white px-2.5 py-1.5 focus:outline-none focus:border-sentinel-cyan text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="Fire Emergency">Fire</option>
                <option value="Road Accident">Road</option>
                <option value="Medical Emergency">Medical</option>
                <option value="Flood">Flood</option>
                <option value="Building Collapse">Collapse</option>
                <option value="Other Emergencies">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#071426] text-white px-2.5 py-1.5 focus:outline-none focus:border-sentinel-cyan text-xs"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse glow-red" /> Critical
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> High
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Med
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#071426]" />

        {/* Fallback notice if tiles fail */}
        {mapTileError && (
          <div className="absolute bottom-6 left-6 bg-amber-500/90 text-white p-3 rounded-2xl text-xs flex items-center gap-2 shadow-2xl z-[1000] backdrop-blur-md">
            <WifiOff className="w-4 h-4" />
            <span>Map tile server offline. All location cards available in the side drawer.</span>
          </div>
        )}
      </div>

      {/* Side Tactical Incident Inspector Drawer (Responsive height on mobile) */}
      <div
        className={`w-full lg:w-96 bg-[#0B1E38]/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col z-10 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          isListExpanded ? 'h-72' : 'h-36 sm:h-52'
        } lg:h-full`}
      >
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-sentinel-cyan animate-pulse" />
            <span>Dispatches ({mappedIncidents.length})</span>
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsListExpanded(!isListExpanded)}
              className="lg:hidden text-[11px] font-mono text-sentinel-cyan flex items-center gap-1 p-1 hover:bg-white/5 rounded-lg"
            >
              <span>{isListExpanded ? 'Collapse' : 'Expand'}</span>
              {isListExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">Tap to Center</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
          {mappedIncidents.map(inc => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => panToIncident(inc)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sentinel-cyan bg-sentinel-cyan/15 ring-1 ring-sentinel-cyan shadow-lg shadow-sentinel-cyan/20 glow-cyan'
                    : 'border-white/10 bg-[#071426] hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-black text-sentinel-cyan">
                    {inc.incidentCode}
                  </span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-1">
                  {inc.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  📍 {inc.location}
                </p>

                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    👥 {inc.peopleAffected} Casualties
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      soundFx.playClick();
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
