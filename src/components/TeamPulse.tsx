import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Sparkles, 
  Briefcase, 
  Activity, 
  ChevronDown, 
  Shield, 
  Clock, 
  Compass, 
  Flame, 
  Coffee 
} from 'lucide-react';
import { Project, User } from '../types';
import { CLANS } from '../data';
import { socket } from '../socket';

interface TeamAvailability {
  userId: string;
  name: string;
  role: string;
  clanId?: string;
  status: 'Available' | 'Deep Work' | 'Away' | 'Offline';
  avatarUrl: string;
  initials: string;
  activeProject?: {
    id: string;
    name: string;
  } | null;
  lastUpdated?: string | null;
}

interface TeamPulseProps {
  currentUser: User | null;
  projects: Project[];
}

const STATUSES: { name: 'Available' | 'Deep Work' | 'Away' | 'Offline'; color: string; bg: string; ring: string; icon: React.ReactNode }[] = [
  { name: 'Available', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', ring: 'border-emerald-500/50 shadow-emerald-500/20', icon: <Flame className="w-3.5 h-3.5 text-emerald-500" /> },
  { name: 'Deep Work', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20', ring: 'border-purple-500/50 shadow-purple-500/20', icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" /> },
  { name: 'Away', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', ring: 'border-amber-500/50 shadow-amber-500/20', icon: <Coffee className="w-3.5 h-3.5 text-amber-500" /> },
  { name: 'Offline', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', ring: 'border-slate-500/30 shadow-slate-500/10', icon: <Clock className="w-3.5 h-3.5 text-slate-500" /> }
];

export default function TeamPulse({ currentUser, projects }: TeamPulseProps) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const [teamList, setTeamList] = useState<TeamAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState<'Available' | 'Deep Work' | 'Away' | 'Offline'>('Offline');
  const [myProject, setMyProject] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Fetch Team availability
  const fetchTeamPulse = async () => {
    try {
      const token = localStorage.getItem('ims_jwt_token');
      const res = await fetch(API_BASE + '/api/attendance/team', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamList(data);
        
        // Find own status if present
        if (currentUser) {
          const self = data.find((member: TeamAvailability) => member.userId === currentUser.id);
          if (self) {
            setMyStatus(self.status);
            setMyProject(self.activeProject?.id || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching team availability pulse:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamPulse();

    // Socket.io Real-time syncing listener
    socket.on('attendance:pulse', (data: any) => {
      setTeamList(prev => prev.map(member => {
        if (member.userId === data.userId) {
          return {
            ...member,
            status: data.status,
            activeProject: data.activeProject,
            lastUpdated: data.lastUpdated
          };
        }
        return member;
      }));
    });

    return () => {
      socket.off('attendance:pulse');
    };
  }, [currentUser]);

  // Update own Pulse status
  const handleUpdatePulse = async (newStatus: 'Available' | 'Deep Work' | 'Away' | 'Offline', linkedProjId: string = myProject) => {
    if (!currentUser) return;
    setUpdating(true);
    setMyStatus(newStatus);
    setMyProject(linkedProjId);

    try {
      const token = localStorage.getItem('ims_jwt_token');
      await fetch(API_BASE + '/api/attendance/pulse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          activeProjectId: linkedProjId || undefined
        })
      });
    } catch (error) {
      console.error('Error sending availability pulse:', error);
    } finally {
      setUpdating(false);
    }
  };

  const myClanInfo = CLANS.find(c => c.id === currentUser?.clanId);

  return (
    <div className="space-y-6">
      
      {/* 1. FAST-ACTION STATUS & PROJECT FOCUS SWITCHER */}
      {currentUser && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/20 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-all duration-500" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Operations Pulse Dashboard
              </span>
              <h3 className="text-lg font-extrabold text-white">Broadcast Your Availability</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Keep the ecosystem synced. Let the team know if you are available to chat, deep-focusing, or stepped away.
              </p>
            </div>

            {/* Availability Switches Grid */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              
              {/* Project Focus Dropdown Selector */}
              <div className="relative min-w-[200px]">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Link Focus Project</label>
                <div className="relative">
                  <select
                    value={myProject}
                    onChange={(e) => {
                      setMyProject(e.target.value);
                      handleUpdatePulse(myStatus, e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-blue-500 shadow transition-colors cursor-pointer"
                  >
                    <option value="">No Active Project Link</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status Switch Chips */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Availability Status</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 p-1 rounded-xl shadow gap-1">
                  {(STATUSES.filter(s => s.name !== 'Offline')).map((s) => {
                    const isActive = myStatus === s.name;
                    return (
                      <button
                        key={s.name}
                        onClick={() => handleUpdatePulse(s.name)}
                        disabled={updating}
                        className={`px-3 py-2 rounded-lg text-xs font-black cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`}
                      >
                        {React.cloneElement(s.icon, { className: `w-3.5 h-3.5 ${isActive ? 'text-white' : ''}` })}
                        <span className="hidden md:inline">{s.name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleUpdatePulse('Offline')}
                    disabled={updating}
                    className={`px-3 py-2 rounded-lg text-xs font-black cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                      myStatus === 'Offline'
                        ? 'bg-slate-800 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                    title="Go Offline"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Offline</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. TEAM DIRECTORY LIVE STATUS GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-850 rounded-xl">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-blue-500" /> Live Availability Monitor
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
            {teamList.filter(t => t.status === 'Available').length} available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {teamList.map((member) => {
                const statusObj = STATUSES.find(s => s.name === member.status) || STATUSES[3];
                const clan = CLANS.find(c => c.id === member.clanId);

                return (
                  <motion.div
                    key={member.userId}
                    layoutId={`pulse-card-${member.userId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-lg hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative"
                  >
                    {/* Ring highlight status background glow */}
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${
                      member.status === 'Available' ? 'bg-emerald-500' :
                      member.status === 'Deep Work' ? 'bg-purple-500' :
                      member.status === 'Away' ? 'bg-amber-500' : 'bg-slate-500'
                    }`} />

                    <div className="flex items-start gap-3.5 relative">
                      {/* Live color ring status indicator */}
                      <div className="relative shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className={`w-11 h-11 rounded-full object-cover border-2 shadow ${statusObj.ring}`}
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-900 border-2 font-bold text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 uppercase shadow ${statusObj.ring}`}>
                            {member.initials}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center p-0.5 shadow-sm ${
                          member.status === 'Available' ? 'bg-emerald-500' :
                          member.status === 'Deep Work' ? 'bg-purple-500' :
                          member.status === 'Away' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-white ${member.status !== 'Offline' ? 'animate-ping' : ''}`} />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">
                          {member.role}
                        </p>
                        
                        {clan && (
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wide mt-1.5 border ${clan.bg} ${clan.text} ${clan.border}`}>
                            {clan.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-900 mt-4 pt-3 flex flex-col gap-1.5 relative">
                      {/* Status label info */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Pulse State</span>
                        <span className={`font-black flex items-center gap-1 ${statusObj.color}`}>
                          {statusObj.icon}
                          {member.status}
                        </span>
                      </div>

                      {/* Linked Project info */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 min-w-0 font-semibold">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {member.activeProject ? (
                          <span className="truncate text-blue-600 dark:text-blue-400 font-bold">
                            Active on: <span className="underline decoration-1">{member.activeProject.name}</span>
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Idle / No Linked Project</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {!loading && teamList.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Compass className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-bold">No active logs</p>
                <p className="text-xs mt-1">Register dynamic operators to test telemetry.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
