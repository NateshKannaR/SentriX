import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Radio, PhoneCall, LayoutDashboard, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-sentinel-navy/95 backdrop-blur-md border-b border-sentinel-darkBorder/60 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sentinel-red to-rose-700 shadow-md shadow-sentinel-red/25 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sentinel-cyan rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sentinel-cyan rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white">SENTINEL</span>
                <span className="bg-gradient-to-r from-sentinel-cyan to-blue-400 bg-clip-text text-transparent font-black text-xl">
                  360
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Intelligent Emergency Response & Disaster Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-sentinel-cyan bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/report"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/report') ? 'text-sentinel-cyan bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4 text-sentinel-red animate-pulse" />
              Report Emergency
            </Link>
            <Link
              to="/track"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/track') ? 'text-sentinel-cyan bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Incident
            </Link>
          </nav>

          {/* Quick Actions / Command Center CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/report"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sentinel-red hover:bg-red-600 text-white shadow-lg shadow-sentinel-red/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>SOS REPORT</span>
            </Link>

            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sentinel-darkBlue hover:bg-sentinel-darkSurface text-slate-200 hover:text-white border border-sentinel-darkBorder hover:border-sentinel-cyan/50 transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
              <span>COMMAND CENTER</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sentinel-darkBorder bg-sentinel-navy px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10"
          >
            Overview
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-sentinel-red hover:bg-white/10 flex items-center gap-2"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            Report an Emergency
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Track Incident Code
          </Link>
          <div className="pt-3 border-t border-sentinel-darkBorder/60 space-y-2">
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg text-center font-semibold bg-sentinel-red text-white flex items-center justify-center gap-2 shadow"
            >
              <PhoneCall className="w-4 h-4" />
              Emergency SOS Reporting
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg text-center font-semibold bg-sentinel-darkBlue text-white border border-sentinel-darkBorder flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-sentinel-cyan" />
              Admin Command Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
