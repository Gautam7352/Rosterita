import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, CheckCircle2, Calendar, UserCheck, Palmtree, Users } from 'lucide-react';
import {
  TeamMember,
  LeaveRequest,
  ShiftAssignment,
  RosterConfig,
  ShiftType,
} from './types';
import {
  DEFAULT_MEMBERS,
  DEFAULT_CONFIG,
  DEFAULT_LEAVES,
} from './data/defaultData';
import {
  generateHealthCompliantRoster,
  auditRoster,
} from './utils/rosterEngine';
import { equalizeLoad } from './utils/equalizer';
import { exportRosterToCSV, exportRosterToImage, exportRosterToPDF } from './utils/exportUtils';
import { Header } from './components/Header';
import { ManpowerBanner } from './components/ManpowerBanner';
import { HealthSummaryCard } from './components/HealthSummaryCard';
import { RosterGrid } from './components/RosterGrid';
import { LeaveManager } from './components/LeaveManager';
import { TeamManager } from './components/TeamManager';
import { MemberScheduleView } from './components/MemberScheduleView';
import { HealthAuditModal } from './components/HealthAuditModal';

export default function App() {
  const [config, setConfig] = useState<RosterConfig>(DEFAULT_CONFIG);
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(DEFAULT_LEAVES);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [autoGenSeed, setAutoGenSeed] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'grid' | 'team' | 'leave' | 'schedules'>('grid');
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  useEffect(() => {
    const initialRoster = generateHealthCompliantRoster(members, leaves, config, autoGenSeed);
    setAssignments(initialRoster);
  }, [config.month, config.year, config.daysInMonth, members, leaves]);

  const stats = useMemo(() => {
    return auditRoster(assignments, members, leaves, config);
  }, [assignments, members, leaves, config]);

  const handleAutoGenerate = () => {
    const nextSeed = autoGenSeed + 1;
    setAutoGenSeed(nextSeed);
    const freshRoster = generateHealthCompliantRoster(members, leaves, config, nextSeed);
    setAssignments(freshRoster);

    setToastMessage('Roster Auto-Generated! Applied contiguous shift blocks & 5-day weekly work limits.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleEqualizeLoad = () => {
    const equalized = equalizeLoad(assignments, members, leaves, config);
    setAssignments(equalized);
    setToastMessage('Workload Equalized! Redistributed night & weekend shifts fairly.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleShiftChange = (memberId: string, day: number, newShift: ShiftType) => {
    setAssignments((prev) => {
      const idx = prev.findIndex((a) => a.memberId === memberId && a.day === day);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], shift: newShift, isManualOverride: true };
        return next;
      } else {
        return [...prev, { memberId, day, shift: newShift, isManualOverride: true }];
      }
    });
  };

  const handleAddLeave = (newLeave: Omit<LeaveRequest, 'id'>) => {
    const leaveObj: LeaveRequest = {
      ...newLeave,
      id: `lv-${Date.now()}`,
    };
    setLeaves((prev) => [...prev, leaveObj]);
    handleShiftChange(newLeave.memberId, newLeave.day, 'Leave');
  };

  const handleUpdateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const handleDeleteLeave = (id: string) => {
    const leaveObj = leaves.find((l) => l.id === id);
    if (leaveObj) {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      handleShiftChange(leaveObj.memberId, leaveObj.day, 'Off');
    }
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
  };

  const handleAddMember = (newMemberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...newMemberData,
      id: `emp-${Date.now()}`,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setMembers(DEFAULT_MEMBERS);
    setLeaves(DEFAULT_LEAVES);
    const fresh = generateHealthCompliantRoster(DEFAULT_MEMBERS, DEFAULT_LEAVES, DEFAULT_CONFIG);
    setAssignments(fresh);
  };

  const approvedLeavesCount = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased md:pb-12 pb-20 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Roster Generator Active</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      <Header
        config={config}
        onConfigChange={setConfig}
        onAutoGenerate={handleAutoGenerate}
        onEqualizeLoad={handleEqualizeLoad}
        onExport={(type) => {
          if (type === 'csv') exportRosterToCSV(assignments, members, config);
          else if (type === 'pdf') exportRosterToPDF('roster-grid-container', config);
          else if (type === 'image') exportRosterToImage('roster-grid-container', config);
        }}
        onOpenAudit={() => setIsAuditOpen(true)}
        onReset={handleReset}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        healthScore={stats.healthScore}
        violationCount={stats.violations.length}
        approvedLeaveCount={approvedLeavesCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        <ManpowerBanner stats={stats} config={config} />

        {activeTab === 'grid' && (
          <div className="space-y-4">
            <HealthSummaryCard
              stats={stats}
              members={members}
              onOpenAudit={() => setIsAuditOpen(true)}
            />

            <RosterGrid
              members={members}
              assignments={assignments}
              config={config}
              violations={stats.violations}
              leaves={leaves}
              onShiftChange={handleShiftChange}
            />
          </div>
        )}

        {activeTab === 'schedules' && (
          <MemberScheduleView
            members={members}
            assignments={assignments}
            config={config}
            memberStats={stats.memberStats}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveManager
            leaves={leaves}
            members={members}
            config={config}
            onAddLeave={handleAddLeave}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onDeleteLeave={handleDeleteLeave}
            onAutoGenerate={handleAutoGenerate}
          />
        )}

        {activeTab === 'team' && (
          <TeamManager
            members={members}
            config={config}
            onUpdateMember={handleUpdateMember}
            onAddMember={handleAddMember}
          />
        )}
      </main>

      <HealthAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        violations={stats.violations}
        healthScore={stats.healthScore}
        members={members}
        config={config}
        onAutoFix={handleAutoGenerate}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around items-center pb-safe">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            activeTab === 'grid' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Grid</span>
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            activeTab === 'schedules' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Timetable</span>
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`relative flex flex-col items-center justify-center w-full py-2 ${
            activeTab === 'leave' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Palmtree className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Leave</span>
          {approvedLeavesCount > 0 && (
            <span className="absolute top-1 right-1/4 translate-x-2 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
              {approvedLeavesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            activeTab === 'team' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Team</span>
        </button>
      </div>
    </div>
  );
}
