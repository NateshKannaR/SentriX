import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Shield,
  Truck,
  Users,
  Radio,
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  Flame,
  HeartPulse,
  Compass,
  X,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { ResponseTeam, ResponseTeamCategory, ResponseTeamStatus, Incident } from '../../types';
import { teamService } from '../../services/teamService';
import { soundFx } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

interface AdminContextType {
  incidents: Incident[];
  onOpenIncident: (incident: Incident) => void;
  onOpenDuplicate: (incident: Incident) => void;
  onSimulate: () => void;
  onReset: () => void;
}

export const TeamsPage: React.FC = () => {
  const { t } = useLanguage();
  const { incidents, onOpenIncident } = useOutletContext<AdminContextType>();

  const [teams, setTeams] = useState<ResponseTeam[]>(() => teamService.getTeams());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State for Adding Team
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    category: 'Fire & Rescue' as ResponseTeamCategory,
    locationName: '',
    latitude: 12.9716,
    longitude: 77.5946,
    leaderName: '',
    membersCount: 4,
    contactRadio: 'CH-DISPATCH-01',
    vehicleType: '',
    equipment: '',
  });

  useEffect(() => {
    const unsub = teamService.subscribe(() => {
      setTeams(teamService.getTeams());
    });
    return unsub;
  }, []);

  const totalTeams = teams.length;
  const availableTeams = teams.filter(t => t.status === 'Available').length;
  const busyTeams = teams.filter(t => t.status === 'Busy' || t.status === 'En Route').length;
  const readinessPercent = totalTeams > 0 ? Math.round((availableTeams / totalTeams) * 100) : 100;

  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || team.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || team.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleToggleStatus = (team: ResponseTeam) => {
    soundFx.playClick();
    const nextStatus: ResponseTeamStatus = team.status === 'Available' ? 'Busy' : 'Available';
    teamService.setTeamStatus(team.id, nextStatus);
  };

  const handleDeleteTeam = (id: string) => {
    soundFx.playAlert();
    if (confirm('Are you sure you want to decommission this response unit?')) {
      teamService.deleteTeam(id);
    }
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.locationName.trim()) {
      alert('Please fill in team name and base location.');
      return;
    }
    soundFx.playSuccess();
    teamService.createTeam({
      name: newTeam.name.trim(),
      category: newTeam.category,
      locationName: newTeam.locationName.trim(),
      latitude: Number(newTeam.latitude) || 12.9716,
      longitude: Number(newTeam.longitude) || 77.5946,
      status: 'Available',
      leaderName: newTeam.leaderName.trim() || 'Command Chief',
      membersCount: Number(newTeam.membersCount) || 4,
      contactRadio: newTeam.contactRadio.trim() || 'CH-DISPATCH-01',
      vehicleType: newTeam.vehicleType.trim() || 'Emergency Intervention Vehicle',
      equipment: newTeam.equipment
        ? newTeam.equipment.split(',').map(s => s.trim()).filter(Boolean)
        : ['Basic Life Support', 'Rescue Rigging', 'Radio Comms'],
    });

    setIsAddModalOpen(false);
    setNewTeam({
      name: '',
      category: 'Fire & Rescue',
      locationName: '',
      latitude: 12.9716,
      longitude: 77.5946,
      leaderName: '',
      membersCount: 4,
      contactRadio: 'CH-DISPATCH-01',
      vehicleType: '',
      equipment: '',
    });
  };

  const getCategoryColor = (cat: ResponseTeamCategory) => {
    switch (cat) {
      case 'Fire & Rescue':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'Medical & Trauma':
        return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
      case 'Disaster & Urban SAR':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'Hazmat & Chemical':
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      case 'Flood & Marine Rescue':
        return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      case 'Police & Evacuation':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      default:
        return 'text-slate-300 bg-slate-500/15 border-slate-500/30';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Emergency Response Team Management
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              FLEET RADAR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mobilize, track, and assign frontline response units with real-time GPS coordinates and capability matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Response Team</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              teamService.resetDemoTeams();
            }}
            title="Reset Response Teams to Defaults"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#081226]/80 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Response Teams
            </span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">{totalTeams}</div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-agency tactical fleet</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#081226]/80 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Available Response Teams
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">{availableTeams}</div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate dispatch ready</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#081226]/80 border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Busy Response Teams
            </span>
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">{busyTeams}</div>
          <div className="text-[11px] text-slate-400 mt-1">Deployed on active emergencies</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#081226]/80 border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Fleet Readiness
            </span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-2 font-mono">{readinessPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Active availability index</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-[#081226]/80 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search team callsign, commander, vehicle, or station..."
            className="w-full text-xs rounded-xl border border-white/10 bg-[#040914] pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs rounded-xl border border-white/10 bg-[#040914] px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Fire & Rescue">Fire & Rescue</option>
            <option value="Medical & Trauma">Medical & Trauma</option>
            <option value="Disaster & Urban SAR">Disaster & Urban SAR</option>
            <option value="Hazmat & Chemical">Hazmat & Chemical</option>
            <option value="Flood & Marine Rescue">Flood & Marine Rescue</option>
            <option value="Police & Evacuation">Police & Evacuation</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs rounded-xl border border-white/10 bg-[#040914] px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available (Ready)</option>
            <option value="Busy">Busy (Deployed)</option>
            <option value="En Route">En Route</option>
          </select>
        </div>
      </div>

      {/* Response Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map(team => {
          const assignedInc = team.assignedIncidentId
            ? incidents.find(i => i.id === team.assignedIncidentId)
            : null;

          return (
            <div
              key={team.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                team.status === 'Available'
                  ? 'bg-[#09152C]/70 border-white/[0.08] hover:border-emerald-500/40'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-bold">
                      {team.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${getCategoryColor(
                        team.category
                      )}`}
                    >
                      {team.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1.5">{team.name}</h3>
                </div>

                {/* Status Toggle Badge */}
                <button
                  onClick={() => handleToggleStatus(team)}
                  title="Click to toggle Available / Busy status"
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black border transition-transform active:scale-95 flex items-center gap-1 ${
                    team.status === 'Available'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      team.status === 'Available' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span>{team.status.toUpperCase()}</span>
                </button>
              </div>

              {/* Station Location & Coordinates */}
              <div className="p-3 rounded-xl bg-[#040A17] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{team.locationName}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pl-5">
                  LAT: {team.latitude.toFixed(4)}, LNG: {team.longitude.toFixed(4)}
                </div>
              </div>

              {/* Personnel, Vehicle, Radio */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{team.membersCount} Crew ({team.leaderName.split(' ')[0]})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300">{team.contactRadio}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{team.vehicleType}</span>
              </div>

              {/* Equipment Tags */}
              <div className="flex flex-wrap gap-1">
                {team.equipment.slice(0, 3).map((eq, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/[0.06]"
                  >
                    {eq}
                  </span>
                ))}
              </div>

              {/* Assigned Incident Link if Busy */}
              {assignedInc && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block">
                      ASSIGNED MISSION
                    </span>
                    <span className="text-xs text-white font-bold truncate block">{assignedInc.title}</span>
                  </div>
                  <button
                    onClick={() => onOpenIncident(assignedInc)}
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shrink-0"
                    title="View Incident Telemetry"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(team)}
                  className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  {team.status === 'Available' ? 'Dispatch to Field' : 'Recall to Base'}
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  title="Decommission Team"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Response Team Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#09152C] border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Commission New Emergency Response Team</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Team Callsign / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeam.name}
                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="e.g. Charlie Rescue Tender 3"
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Response Category *
                  </label>
                  <select
                    value={newTeam.category}
                    onChange={e => setNewTeam({ ...newTeam, category: e.target.value as ResponseTeamCategory })}
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                  >
                    <option value="Fire & Rescue">Fire & Rescue</option>
                    <option value="Medical & Trauma">Medical & Trauma</option>
                    <option value="Disaster & Urban SAR">Disaster & Urban SAR</option>
                    <option value="Hazmat & Chemical">Hazmat & Chemical</option>
                    <option value="Flood & Marine Rescue">Flood & Marine Rescue</option>
                    <option value="Police & Evacuation">Police & Evacuation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Base Station / Deployment Zone *
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.locationName}
                  onChange={e => setNewTeam({ ...newTeam, locationName: e.target.value })}
                  placeholder="e.g. Jayanagar Fire Station, 4th Block"
                  className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newTeam.latitude}
                    onChange={e => setNewTeam({ ...newTeam, latitude: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newTeam.longitude}
                    onChange={e => setNewTeam({ ...newTeam, longitude: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Crew Size</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newTeam.membersCount}
                    onChange={e => setNewTeam({ ...newTeam, membersCount: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Officer in Charge</label>
                  <input
                    type="text"
                    value={newTeam.leaderName}
                    onChange={e => setNewTeam({ ...newTeam, leaderName: e.target.value })}
                    placeholder="Capt. John"
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Radio Channel</label>
                  <input
                    type="text"
                    value={newTeam.contactRadio}
                    onChange={e => setNewTeam({ ...newTeam, contactRadio: e.target.value })}
                    placeholder="CH-09"
                    className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Vehicle Rig</label>
                <input
                  type="text"
                  value={newTeam.vehicleType}
                  onChange={e => setNewTeam({ ...newTeam, vehicleType: e.target.value })}
                  placeholder="e.g. Scania Heavy Pumper Rig"
                  className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Equipment List (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newTeam.equipment}
                  onChange={e => setNewTeam({ ...newTeam, equipment: e.target.value })}
                  placeholder="e.g. SCBA breathing, Jaws of life, High-pressure foam"
                  className="w-full rounded-xl border border-white/10 bg-[#040A17] px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                >
                  Commission Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
