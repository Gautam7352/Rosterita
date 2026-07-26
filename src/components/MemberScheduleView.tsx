import React, { useState } from 'react';
import { TeamMember, ShiftAssignment, RosterConfig, MemberStats } from '../types';
import { getDayName, isWeekendDay } from '../utils/rosterEngine';
import { Sun, Sunset, Moon, Coffee, Palmtree, UserCheck } from 'lucide-react';

interface MemberScheduleViewProps {
  members: TeamMember[];
  assignments: ShiftAssignment[];
  config: RosterConfig;
  memberStats: Record<string, MemberStats>;
}

export const MemberScheduleView: React.FC<MemberScheduleViewProps> = ({
  members,
  assignments,
  config,
  memberStats,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  const activeMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const stats = activeMember ? memberStats[activeMember.id] : null;

  const memberAssignments = assignments
    .filter((a) => a.memberId === activeMember?.id)
    .sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Engineer Timetable</h2>
            <p className="text-xs text-slate-500">
              Personalized monthly shift breakdown & rest balance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-semibold">Engineer:</label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeMember && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Member Stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-white text-base mb-2"
                style={{ backgroundColor: activeMember.avatarColor }}
              >
                {activeMember.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{activeMember.name}</h3>
              <p className="text-xs text-slate-500">{activeMember.role}</p>
            </div>

            {stats && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1">
                  Shift Totals ({config.month})
                </h4>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="text-amber-800 font-bold text-[11px]">Mornings</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.morningCount}</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="text-orange-800 font-bold text-[11px]">Afternoons</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.afternoonCount}</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="text-indigo-800 font-bold text-[11px]">Nights</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.nightCount}</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="text-emerald-800 font-bold text-[11px]">Weekoffs</div>
                    <div className="text-base font-extrabold text-slate-900">{stats.offCount}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-bold text-slate-900 text-xs">
                Monthly Timeline ({config.month} {config.year})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2">
              {memberAssignments.map((assign) => {
                const dayName = getDayName(assign.day, config.month, config.year);
                const isWeekend = isWeekendDay(assign.day);

                return (
                  <div
                    key={assign.day}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between h-20 ${
                      isWeekend ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-extrabold text-slate-900 text-xs">{assign.day}</span>
                      <span className="text-[10px] uppercase font-bold">{dayName}</span>
                    </div>

                    <div>
                      {assign.shift === 'Morning' && (
                        <div className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[11px] text-center">
                          Morning
                        </div>
                      )}
                      {assign.shift === 'Afternoon' && (
                        <div className="font-bold text-orange-900 bg-orange-100 px-1.5 py-0.5 rounded text-[11px] text-center">
                          Afternoon
                        </div>
                      )}
                      {assign.shift === 'Night' && (
                        <div className="font-bold text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded text-[11px] text-center">
                          Night
                        </div>
                      )}
                      {assign.shift === 'Off' && (
                        <div className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-center">
                          Off
                        </div>
                      )}
                      {assign.shift === 'Leave' && (
                        <div className="font-bold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded text-[11px] text-center">
                          Leave
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
