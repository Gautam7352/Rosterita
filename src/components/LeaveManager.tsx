import React, { useState } from 'react';
import { LeaveRequest, TeamMember, RosterConfig } from '../types';
import { Palmtree, Plus, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

interface LeaveManagerProps {
  leaves: LeaveRequest[];
  members: TeamMember[];
  config: RosterConfig;
  onAddLeave: (leave: Omit<LeaveRequest, 'id'>) => void;
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDeleteLeave: (id: string) => void;
  onAutoGenerate: () => void;
}

export const LeaveManager: React.FC<LeaveManagerProps> = ({
  leaves,
  members,
  config,
  onAddLeave,
  onUpdateLeaveStatus,
  onDeleteLeave,
  onAutoGenerate,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [day, setDay] = useState<number>(1);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || day < 1 || day > config.daysInMonth) return;

    onAddLeave({
      memberId: selectedMemberId,
      day,
      reason: reason.trim() || 'Leave request',
      status: 'approved',
    });

    setReason('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Leave Requests</h2>
            <p className="text-xs text-slate-500">
              Record leave preferences. Approved leaves are enforced as priority constraints during roster generation.
            </p>
          </div>
        </div>

        <button
          onClick={onAutoGenerate}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Re-Generate Roster with Leaves
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xs">New Leave Request</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Engineer</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Day of Month (1 - {config.daysInMonth})
              </label>
              <input
                type="number"
                min={1}
                max={config.daysInMonth}
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason</label>
              <input
                type="text"
                placeholder="Medical, family event, personal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Add Approved Leave
            </button>
          </form>
        </div>

        {/* Existing Leaves */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h3 className="font-bold text-slate-900 text-xs">
              Registered Leaves ({leaves.length})
            </h3>
          </div>

          {leaves.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No leave requests registered for {config.month} {config.year}.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {leaves.map((leave) => {
                const member = members.find((m) => m.id === leave.memberId);
                if (!member) return null;

                return (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900">
                          {member.name} — <span className="text-indigo-700">Day {leave.day}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {leave.reason || 'No details provided'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          leave.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {leave.status}
                      </span>

                      {leave.status !== 'approved' && (
                        <button
                          onClick={() => onUpdateLeaveStatus(leave.id, 'approved')}
                          className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer"
                          title="Approve Leave"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {leave.status !== 'rejected' && (
                        <button
                          onClick={() => onUpdateLeaveStatus(leave.id, 'rejected')}
                          className="p-1 text-amber-700 hover:bg-amber-100 rounded cursor-pointer"
                          title="Reject Leave"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteLeave(leave.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Leave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
