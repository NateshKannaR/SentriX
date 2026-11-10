import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Activity, Heart, Globe, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-sentinel-navy text-slate-400 border-t border-sentinel-darkBorder/60 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-sentinel-darkBorder/40">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sentinel-red flex items-center justify-center text-white shadow-md shadow-sentinel-red/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white">
                Sentri<span className="text-sentinel-cyan">X</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Next-generation Emergency Response & Disaster Management Platform developed for
              <strong className="text-slate-200"> CODE CLASH 2026</strong>. Centralizing citizen intelligence,
              transparent AI severity scoring, duplicate suppression, and rapid dispatch command.
            </p>
            <div className="flex items-center gap-3 text-xs text-sentinel-cyan">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM STATUS: OPTIMAL (DISPATCH READY)
              </span>
            </div>
          </div>

          {/* Rapid Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Platform Hub</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-sentinel-cyan transition-colors">
                  Public Portal Overview
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-sentinel-cyan transition-colors flex items-center gap-1.5">
                  Report Emergency
                  <span className="text-[10px] bg-sentinel-red/20 text-sentinel-red px-1.5 rounded font-mono">SOS</span>
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-sentinel-cyan transition-colors">
                  Track Incident Status
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-sentinel-cyan transition-colors">
                  Admin Command Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Mandatory Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">🔥 Fire Emergency</span>
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">🚗 Road Accident</span>
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">🚑 Medical Emergency</span>
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">🌊 Flash Flood</span>
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">🏢 Building Collapse</span>
              <span className="px-2 py-1 bg-white/5 rounded text-slate-300">⚠️ Other Emergencies</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
          <p>© 2026 SentriX Emergency Infrastructure. Built for Code Clash 2026 Round 1.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" /> OpenStreetMap & Leaflet Geospatial
            </span>
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-sentinel-amber shrink-0" /> Intelligent Rule Engine Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
