import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import L from 'leaflet';
import { Incident, EmergencyCategory, SeverityLevel } from '../../types';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { soundEffects } from '../../utils/soundEffects';
import { getLiveLocation, calculateDistanceKm, LiveLocationResult } from '../../utils/geolocation';
import { SAFE_MUSTER_ZONES, SafeMusterZone } from '../../data/safeZones';
import { useLanguage } from '../../context/LanguageContext';
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
  Shield,
  HeartPulse,
  Flame,
  PhoneCall,
  Plane,
  FileText,
} from 'lucide-react';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
  onOpenDrone?: (inc?: Incident) => void;
  onOpenPlaybook?: (inc?: Incident) => void;
  onOpenHospitals?: () => void;
}

// Glowing neon marker icon generator
const createCustomMarker = (severity: SeverityLevel) => {
  let color = '#19B878';
  if (severity === 'Critical') {
    color = '#F04452';
  } else if (severity === 'High') {
    color = '#FF7A00';
  } else if (severity === 'Medium') {
    color = '#F5A623';
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

// Safe zone marker icon generator
const createSafeZoneMarker = (type: SafeMusterZone['type']) => {
  let color = '#10B981'; // emerald shelter
  let symbol = '🛡️';
  if (type === 'Hospital') {
    color = '#38BDF8';
    symbol = '🏥';
  } else if (type === 'FireStation') {
    color = '#F59E0B';
    symbol = '🚒';
  }

  return L.divIcon({
    html: `<div style="transform: translate(-16px, -16px); background: #071426; border: 2px solid ${color}; width: 32px; height: 32px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px ${color}80; cursor: pointer;">${symbol}</div>`,
    className: 'safe-zone-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const MapPage: React.FC = () => {
  const { t } = useLanguage();
  const { incidents, onOpenIncident, onOpenDrone, onOpenPlaybook } = useOutletContext<AdminContextType>();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const safeZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const liveLocationMarkerRef = useRef<L.Marker | null>(null);
  const liveLocationCircleRef = useRef<L.Circle | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapTileError, setMapTileError] = useState(false);
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Live Command Location & Safe Zones State
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<LiveLocationResult | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Filtered incidents with coordinates
  const mappedIncidents = incidents.filter(i => {
    if (!i.latitude || !i.longitude) return false;
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
    return true;
  });

  // Closest incident distance calculation
  const closestEmergency = userLocation
    ? mappedIncidents
        .map(inc => ({
          inc,
          dist: calculateDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            inc.latitude!,
            inc.longitude!
          ),
        }))
        .sort((a, b) => a.dist - b.dist)[0]
    : null;

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

        // CartoDB Dark Matter tiles
        const darkTileLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          }
        );

        darkTileLayer.on('tileerror', () => {
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);
        });

        darkTileLayer.addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        const safeZonesLayer = L.layerGroup().addTo(map);
        safeZonesLayerRef.current = safeZonesLayer;

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

  // Sync Incident Markers
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
          soundEffects.playBeep();
          const btn = document.getElementById(`btn-popup-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              soundEffects.playClick();
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

  // Sync Safe Muster Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !safeZonesLayerRef.current) return;

    safeZonesLayerRef.current.clearLayers();

    if (showSafeZones) {
      SAFE_MUSTER_ZONES.forEach(sz => {
        const marker = L.marker([sz.latitude, sz.longitude], {
          icon: createSafeZoneMarker(sz.type),
        });

        const popup = document.createElement('div');
        popup.className = 'p-2.5 text-xs text-white space-y-2';
        popup.innerHTML = `
          <div class="border-b border-white/10 pb-1 flex items-center justify-between">
            <span style="font-family: monospace; font-weight: bold; color: #10B981;">${sz.type.toUpperCase()}</span>
            <span style="font-size: 10px; color: #6EE7B7; background: rgba(16,185,129,0.2); padding: 2px 6px; border-radius: 6px;">${sz.status}</span>
          </div>
          <div style="font-weight: bold; font-size: 12px; color: #FFFFFF;">${sz.name}</div>
          <div style="font-size: 11px; color: #94A3B8;">📍 ${sz.address}</div>
          <div style="font-family: monospace; font-size: 11px; color: #E2E8F0;">
            Capacity: <strong>${sz.capacity}</strong> | Current: <strong>${sz.currentOccupancy}</strong>
          </div>
          <a href="tel:${sz.contactPhone}" style="display:inline-block;margin-top:6px;color:#16C7E8;font-weight:bold;font-size:11px;text-decoration:none;">
            📞 Call Emergency Desk (${sz.contactPhone})
          </a>
        `;

        marker.bindPopup(popup);
        safeZonesLayerRef.current?.addLayer(marker);
      });
    }
  }, [showSafeZones]);

  // Toggle Live Command Position Tracking
  const handleToggleLiveLocation = async () => {
    if (isLiveTracking) {
      setIsLiveTracking(false);
      if (liveLocationMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(liveLocationMarkerRef.current);
        liveLocationMarkerRef.current = null;
      }
      if (liveLocationCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(liveLocationCircleRef.current);
        liveLocationCircleRef.current = null;
      }
      soundEffects.playClick();
      return;
    }

    soundEffects.playBeep();
    setIsLiveTracking(true);
    const loc = await getLiveLocation();
    setUserLocation(loc);

    if (mapInstanceRef.current) {
      // Create live pulsating radar marker
      const radarIcon = L.divIcon({
        html: `<div style="position:relative; width:24px; height:24px;">
          <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(22,199,232,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:24px; height:24px; border-radius:9999px; background:#16C7E8; border:3px solid #071426; box-shadow:0 0 15px #16C7E8;"></div>
        </div>`,
        className: 'command-live-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: radarIcon }).addTo(mapInstanceRef.current);
      const circle = L.circle([loc.latitude, loc.longitude], {
        radius: loc.accuracy || 100,
        color: '#16C7E8',
        fillColor: '#16C7E8',
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(mapInstanceRef.current);

      liveLocationMarkerRef.current = marker;
      liveLocationCircleRef.current = circle;

      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 14, { duration: 1.2 });
      soundEffects.playAlert();
    }
  };

  const panToIncident = (inc: Incident) => {
    soundEffects.playClick();
    setSelectedIncident(inc);
    if (mapInstanceRef.current && inc.latitude && inc.longitude) {
      mapInstanceRef.current.flyTo([inc.latitude, inc.longitude], 15, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row relative overflow-hidden bg-[#071426]">
      {/* Tactical Floating HUD Controls */}
      <div className="absolute top-2 sm:top-4 left-2 right-2 sm:right-auto sm:left-4 sm:w-88 z-[1000] bg-[#0B1E38]/95 backdrop-blur-2xl p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#16C7E8]/30 shadow-2xl space-y-3 sm:space-y-4 glow-cyan transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sentinel-cyan/20 text-sentinel-cyan flex items-center justify-center border border-sentinel-cyan/30 shrink-0">
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

        {/* Live Location & Safe Zones Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
          <button
            onClick={handleToggleLiveLocation}
            className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isLiveTracking
                ? 'bg-sentinel-cyan text-sentinel-navy ring-2 ring-sentinel-cyan/50 glow-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLiveTracking ? 'animate-spin' : ''}`} />
            <span>{isLiveTracking ? 'GPS Active' : 'Live Command'}</span>
          </button>

          <button
            onClick={() => {
              setShowSafeZones(s => !s);
              soundEffects.playClick();
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              showSafeZones
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{showSafeZones ? 'Shelters ON' : 'Safe Zones'}</span>
          </button>
        </div>

        {/* Live Telemetry Distance Card (Appears when GPS tracking is active) */}
        {isLiveTracking && userLocation && (
          <div className="p-3 rounded-2xl bg-[#050E1A] border border-sentinel-cyan/30 text-[11px] font-mono space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-sentinel-cyan font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live GPS Lock
              </span>
              <span>±{userLocation.accuracy}m</span>
            </div>
            <div className="text-slate-400">
              Sector: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </div>
            {closestEmergency && (
              <div className="pt-1 border-t border-white/10 text-amber-300 font-bold flex items-center justify-between">
                <span>Nearest Critical:</span>
                <span>{closestEmergency.dist} km ({closestEmergency.inc.incidentCode})</span>
              </div>
            )}
          </div>
        )}

        {/* Filter dropdowns (Expandable on mobile, always visible on sm+) */}
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

      {/* Side Tactical Incident Inspector Drawer */}
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
            const distFromMe = userLocation && inc.latitude && inc.longitude
              ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, inc.latitude, inc.longitude)
              : null;

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

                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>
                    👥 {inc.peopleAffected} Victims
                    {distFromMe !== null && <strong className="text-sentinel-cyan ml-1.5">({distFromMe}km away)</strong>}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      soundEffects.playClick();
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
