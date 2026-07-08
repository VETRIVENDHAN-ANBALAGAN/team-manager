import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  UserPlus, 
  UserCheck, 
  Clock, 
  Calendar, 
  ArrowRight,
  Filter,
  LogOut,
  LogIn,
  MoreVertical,
  Activity,
  Plus,
  X
} from 'lucide-react';
import { TeamMember, FeedEvent, AttendanceLog, User } from '../types';
import { CLANS } from '../data';

interface TeamViewProps {
  teamMembers: TeamMember[];
  feedEvents: FeedEvent[];
  attendanceLogs: AttendanceLog[];
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  onClockAction: (memberId: string, action: 'clock_in' | 'clock_out' | 'away' | 'on_leave') => void;
  searchQuery: string;
  currentUser: User | null;
}

export default function TeamView({
  teamMembers,
  feedEvents,
  attendanceLogs,
  onAddTeamMember,
  onClockAction,
  searchQuery,
  currentUser
}: TeamViewProps) {
  const [memberSearch, setMemberSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'online' | 'away' | 'on-leave'>('all');
  
  // New member form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState<'online' | 'away' | 'on-leave'>('online');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');
  const [newMemberClanId, setNewMemberClanId] = useState('vanguard');

  // Set default clan for Clan Leader on init
  useEffect(() => {
    if (currentUser && currentUser.role === 'Clan Leader' && currentUser.clanId) {
      setNewMemberClanId(currentUser.clanId);
    }
  }, [currentUser]);

  // Local stats calculations
  const totalCount = teamMembers.length;
  const activeCount = teamMembers.filter(m => m.status === 'online').length;
  const leaveCount = teamMembers.filter(m => m.status === 'on-leave').length;
  const awayCount = teamMembers.filter(m => m.status === 'away').length;

  // Filters combining both Header Search query and Team member specific search query
  const combinedSearch = (memberSearch || searchQuery).toLowerCase();

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(combinedSearch) || 
                          member.role.toLowerCase().includes(combinedSearch);
    const matchesStatus = selectedStatusFilter === 'all' || member.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRole) {
      alert("Please fill in both Name and Role fields.");
      return;
    }

    onAddTeamMember({
      name: newMemberName,
      role: newMemberRole,
      status: newMemberStatus,
      avatarUrl: newMemberAvatar || '',
      initials: !newMemberAvatar ? newMemberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : undefined,
      clanId: newMemberClanId,
    });

    // Reset Form & Close Modal
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberStatus('online');
    setNewMemberAvatar('');
    setNewMemberClanId('vanguard');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    // Generate CSV data string
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Role,Status,Clock-In Time,Hours Active\n";
    teamMembers.forEach(m => {
      csvContent += `"${m.name}","${m.role}","${m.status}","${m.clockInTime || 'N/A'}","${m.totalHoursToday || 'N/A'}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IMS_Pro_Attendance_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </span>
        );
      case 'away':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Away
          </span>
        );
      case 'on-leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> On Leave
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in pb-12 font-sans select-none">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Team Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage member roles, active status, and attendance logs.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV Logs
          </button>
          {currentUser?.role !== 'Team Member' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-950/20 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Team Member
            </button>
          )}
        </div>
      </section>

      {/* METRICS ROW */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Members</p>
          <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{totalCount}</span>
        </div>
        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Now</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{activeCount}</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping"></span> Live
            </span>
          </div>
        </div>
        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Rate</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">94%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded-full ml-1">
              +2%
            </span>
          </div>
        </div>
        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">On Leave</p>
          <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{leaveCount}</span>
        </div>
      </section>

      {/* TEAM DIRECTORY & LIVE ATTENDANCE BENTO BLOCK */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Directory Area (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          {/* Header toolbar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/10">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Team Directory</h3>
            
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
              {/* Internal Search field */}
              <div className="relative flex-grow sm:flex-grow-0 select-text">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status filter switcher */}
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 text-[10px] font-bold">
                {(['all', 'online', 'away', 'on-leave'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedStatusFilter(f)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer capitalize ${
                      selectedStatusFilter === f 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {f === 'on-leave' ? 'Leave' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/20 dark:bg-slate-950/20 flex-grow max-h-[500px] overflow-y-auto scrollbar-hide">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-4 hover:shadow-lg dark:hover:shadow-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 group"
                >
                  {/* Member Avatar */}
                  {member.avatarUrl ? (
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-800 shrink-0">
                      {member.initials || '??'}
                    </div>
                  )}

                  {/* Member Metadata & Quick Clock Action */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate mb-1">{member.role}</p>
                    
                    {/* Clan indicator */}
                    <div className="mb-3">
                      {member.clanId ? (() => {
                        const clan = CLANS.find(c => c.id === member.clanId);
                        if (!clan) return null;
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold ${clan.bg} ${clan.text} border ${clan.border}`}>
                            {clan.name}
                          </span>
                        );
                      })() : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-500">
                          No Clan Joined
                        </span>
                      )}
                    </div>
                    
                    {/* Active Controls */}
                    <div className="flex items-center justify-between gap-2.5">
                      {(() => {
                        const isSelf = currentUser && member.name.toLowerCase() === currentUser.name.split(' (')[0].toLowerCase();
                        if (isSelf) {
                          return (
                            <div className="flex items-center gap-1.5">
                              {member.status !== 'online' && (
                                <button
                                  onClick={() => onClockAction(member.id, 'clock_in')}
                                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Login / Clock In"
                                >
                                  <LogIn className="w-3 h-3" /> Login
                                </button>
                              )}
                              {member.status !== 'away' && (
                                <button
                                  onClick={() => onClockAction(member.id, 'away')}
                                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/20 px-2 py-1 rounded border border-amber-500/10 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Set status to Away"
                                >
                                  <Clock className="w-3 h-3" /> Away
                                </button>
                              )}
                              {member.status !== 'on-leave' && (
                                <button
                                  onClick={() => onClockAction(member.id, 'on_leave')}
                                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-500/5 dark:bg-slate-950/20 px-2 py-1 rounded border border-slate-500/10 hover:bg-slate-500/10 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Go on Leave"
                                >
                                  <LogOut className="w-3 h-3" /> Leave
                                </button>
                              )}
                              {member.status === 'online' && (
                                <button
                                  onClick={() => onClockAction(member.id, 'clock_out')}
                                  className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/5 dark:bg-red-950/20 px-2 py-1 rounded border border-red-500/10 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Clock Out / Logout"
                                >
                                  <LogOut className="w-3 h-3" /> Logout
                                </button>
                              )}
                            </div>
                          );
                        } else {
                          if (member.status === 'on-leave') {
                            return <span className="text-[10px] font-semibold text-slate-400 italic">On Leave</span>;
                          }
                          return (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {member.status === 'online' 
                                ? `Clocked In: ${member.clockInTime || '09:00 AM'}` 
                                : member.status === 'away'
                                ? `Away`
                                : `Clocked Out: ${member.totalHoursToday && member.totalHoursToday !== '--' ? member.totalHoursToday : 'Inactive'}`}
                            </span>
                          );
                        }
                      })()}
                      
                      <button
                        onClick={() => alert(`Profile Details for ${member.name}:\nRole: ${member.role}\nStatus: ${member.status}\nLogged Clock State: ${member.clockInTime ? `Clocked in at ${member.clockInTime}` : 'Not currently clocked in.'}`)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 cursor-pointer"
                      >
                        Profile Details <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
                <UserCheck className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm font-bold">No team members match search</p>
                <p className="text-xs mt-1">Try refining your search keyword or clearing status filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Attendance Activity Feed (Spans 1 column on desktop) */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shadow-sm h-[480px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-950 rounded-t-xl z-10 shrink-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Live Attendance Feed
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </h3>
            <Activity className="w-4.5 h-4.5 text-slate-400" />
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3.5 scrollbar-hide">
            {feedEvents.length > 0 ? (
              feedEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="mt-1">
                    {evt.action === 'clock_in' && (
                      <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <LogIn className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {evt.action === 'clock_out' && (
                      <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        <LogOut className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {evt.action === 'status_change' && (
                      <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-slate-900 dark:text-white">{evt.memberName}</span>{' '}
                      {evt.action === 'clock_in' ? 'clocked in.' : evt.action === 'clock_out' ? 'clocked out.' : 'status updated.'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{evt.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <Activity className="w-10 h-10 stroke-1 mb-2" />
                <p className="text-xs font-bold">No recent activities logged</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10 text-center rounded-b-xl shrink-0">
            <button 
              onClick={() => alert("Activity Audit: Complete historical live clocks are saved offline.")}
              className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline w-full cursor-pointer"
            >
              View Full Activity Feed
            </button>
          </div>
        </div>

      </section>

      {/* DETAILED ATTENDANCE TABLE CARD (from screenshot 2 bottom) */}
      <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/10 shrink-0">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Attendance Logs</h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
            This Week <Filter className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                <th className="py-3 px-6">Member Name</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Check-in Time</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
              {attendanceLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  {/* Name cell with small avatar */}
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    {log.avatarUrl ? (
                      <img 
                        src={log.avatarUrl} 
                        alt={log.memberName} 
                        className="w-6.5 h-6.5 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-200 dark:border-slate-800">
                        {log.initials || '??'}
                      </div>
                    )}
                    <span>{log.memberName}</span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">{log.date}</td>
                  <td className="py-3.5 px-6 text-xs font-semibold">{log.checkInTime}</td>
                  <td className="py-3.5 px-6">
                    {log.status === 'On Time' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">On Time</span>
                    )}
                    {log.status === 'Late' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">Late</span>
                    )}
                    {log.status === 'On Leave' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">On Leave</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-xs text-slate-900 dark:text-white">{log.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD MEMBER DIALOG OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" /> Add Team Member
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <input 
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Elena Rodriguez"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Professional Role</label>
                <input 
                  type="text"
                  required
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g. UX Designer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Avatar Image URL (Optional)</label>
                <input 
                  type="url"
                  value={newMemberAvatar}
                  onChange={(e) => setNewMemberAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">System Status</label>
                <select
                  value={newMemberStatus}
                  onChange={(e) => setNewMemberStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assigned Clan Segment</label>
                {currentUser?.role === 'Clan Leader' ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-500 text-sm font-semibold">
                    {CLANS.find(c => c.id === currentUser.clanId)?.name || 'Your Clan'} (Locked)
                  </div>
                ) : (
                  <select
                    value={newMemberClanId}
                    onChange={(e) => setNewMemberClanId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  >
                    {CLANS.map(clan => (
                      <option key={clan.id} value={clan.id}>{clan.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
