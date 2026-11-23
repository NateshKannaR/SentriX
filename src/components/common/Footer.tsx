import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-[#0b121c] pb-20 pt-8 text-sm text-slate-400 sm:pb-12">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <Link to="/" className="inline-flex w-fit items-center gap-2 text-base font-semibold text-white">
        <ShieldAlert className="h-5 w-5 text-cyan-300" aria-hidden="true" /> SentriX
      </Link>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
        <Link to="/report" className="hover:text-white">Report</Link>
        <Link to="/track" className="hover:text-white">Track</Link>
        <Link to="/citizen" className="hover:text-white">Citizen tools</Link>
        <Link to="/admin/dashboard" className="hover:text-white">Command center</Link>
      </nav>
      <a href="https://github.com/NateshKannaR/SentriX" className="w-fit hover:text-white">Source on GitHub</a>
    </div>
  </footer>
);
