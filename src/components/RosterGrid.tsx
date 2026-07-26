import React, { useState } from 'react';
import {
  TeamMember,
  ShiftAssignment,
  RosterConfig,
  ShiftType,
  HealthViolation,
  LeaveRequest,
} from '../types';
import { getDayName, isWeekendDay } from '../utils/rosterEngine';
import { AlertTriangle, Sun, Sunset, Moon, Coffee, Palmtree, Check } from 'lucide-react';

interface RosterGridProps {
  members: TeamMember[];
  assignments: ShiftAssignment[];
  config: RosterConfig;
  violations: HealthViolation[];
  leaves: LeaveRequest[];
  onShiftChange: (memberId: string, day: number, newShift: ShiftType) => void;
}

export const RosterGrid: React.FC<RosterGridProps> = ({
  members,
  assignments,
  config,
  violations,
  leaves,
  onShiftChange,
}) => {
  const { daysInMonth, month, year, staffPerShift } = config;
  const [activeCell, setActiveCell] = useState<{ memberId: string; day: number } | null>(null);

  const assignmentMap = new Map<string, ShiftType>();
  assignments.forEach((a) => {
    assignmentMap.set(`${a.memberId}_${a.day}`, a.shift);
  });

  const violationMap = new Map<string, HealthViolation[]>();
  violations.forEach((v) => {
    if (v.memberId !== 'system') {
      const key = `${v.memberId}_${v.day}`;
      if (!violationMap.has(key)) violationMap.set(key, []);
      violationMap.get(key)!.push(v);
    }
  });

  const dailyStaffing: Record<
    number,
    { morning: number; afternoon: number; night: number; off: number; leave: number }
  > = {};

  for (let d = 1; d <= daysInMonth; d++) {
    dailyStaffing[d] = { morning: 0, afternoon: 0, night: 0, off: 0, leave: 0 };
  }

  assignments.forEach((a) => {
    if (dailyStaffing[a.day]) {
      if (a.shift === 'Morning') dailyStaffing[a.day].morning++;
      else if (a.shift === 'Afternoon') dailyStaffing[a.day].afternoon++;
      else if (a.shift === 'Night') dailyStaffing[a.day].night++;
      else if (a.shift === 'Off') dailyStaffing[a.day].off++;
      else if (a.shift === 'Leave') dailyStaffing[a.day].leave++;
    }
  });

  const shiftOptions: { type: ShiftType; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { type: 'Morning', label: 'Morning (06:00 - 14:00)', icon: <Sun className="w-3.5 h-3.5 text-amber-600" />, colorClass: 'hover:bg-amber-50 text-amber-900' },
    { type: 'Afternoon', label: 'Afternoon (14:00 - 22:00)', icon: <Sunset className="w-3.5 h-3.5 text-orange-600" />, colorClass: 'hover:bg-orange-50 text-orange-900' },
    { type: 'Night', label: 'Night (22:00 - 06:00)', icon: <Moon className="w-3.5 h-3.5 text-indigo-600" />, colorClass: 'hover:bg-indigo-50 text-indigo-900' },
    { type: 'Off', label: 'Weekoff', icon: <Coffee className="w-3.5 h-3.5 text-slate-600" />, colorClass: 'hover:bg-slate-100 text-slate-900' },
    { type: 'Leave', label: 'Approved Leave', icon: <Palmtree className="w-3.5 h-3.5 text-rose-600" />, colorClass: 'hover:bg-rose-50 text-rose-900' },
  ];

  const getShiftBadge = (shift: ShiftType, hasViolation: boolean) => {
    switch (shift) {
      case 'Morning':
        return (
          <span className={`inline-flex items-center justify-center font-bold text-[11px] px-1.5 py-0.5 rounded ${hasViolation ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-500' : 'bg-amber-100 text-amber-900'}`}>
            M
          </span>
        );
      case 'Afternoon':
        return (
          <span className={`inline-flex items-center justify-center font-bold text-[11px] px-1.5 py-0.5 rounded ${hasViolation ? 'bg-orange-200 text-orange-900 ring-2 ring-amber-500' : 'bg-orange-100 text-orange-900'}`}>
            A
          </span>
        );
      case 'Night':
        return (
          <span className={`inline-flex items-center justify-center font-bold text-[11px] px-1.5 py-0.5 rounded ${hasViolation ? 'bg-indigo-200 text-indigo-950 ring-2 ring-amber-500' : 'bg-indigo-100 text-indigo-900'}`}>
            N
          </span>
        );
      case 'Off':
        return (
          <span className="inline-flex items-center justify-center font-medium text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            OFF
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center justify-center font-medium text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
            LV
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Legend Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Shifts:</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-amber-100 text-amber-900">M</span>
            <span className="text-slate-700 text-xs">Morning (06:00-14:00)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-orange-100 text-orange-900">A</span>
            <span className="text-slate-700 text-xs">Afternoon (14:00-22:00)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-indigo-100 text-indigo-900">N</span>
            <span className="text-slate-700 text-xs">Night (22:00-06:00)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded font-medium text-[10px] bg-slate-100 text-slate-700">OFF</span>
            <span className="text-slate-700 text-xs">Weekoff</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded font-medium text-[10px] bg-rose-100 text-rose-800">LV</span>
            <span className="text-slate-700 text-xs">Leave</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span className="inline-block w-2.5 h-2.5 rounded bg-amber-200 border border-amber-500" />
          <span>Health Risk</span>
          <span className="ml-2 inline-block w-2.5 h-2.5 rounded bg-slate-200" />
          <span>Weekend</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto max-h-[65vh]">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
              <th className="sticky left-0 z-20 bg-slate-100 p-2.5 w-48 border-r border-slate-200 shadow-xs">
                Console Engineer
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayName = getDayName(day, month, year);
                const isWeekend = isWeekendDay(day);
                return (
                  <th
                    key={day}
                    className={`p-1.5 text-center border-r border-slate-200 min-w-[38px] ${
                      isWeekend ? 'bg-slate-200/60 text-slate-900' : ''
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">{dayName}</div>
                    <div className="text-xs font-extrabold text-slate-900">{day}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-xs">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                {/* Member Info */}
                <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate text-xs">{member.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                    </div>
                  </div>
                </td>

                {/* Days 1..N */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const key = `${member.id}_${day}`;
                  const shift = assignmentMap.get(key) || 'Off';
                  const isWeekend = isWeekendDay(day);
                  const cellViolations = violationMap.get(key) || [];
                  const hasViolation = cellViolations.length > 0;
                  const isCellActive = activeCell?.memberId === member.id && activeCell?.day === day;

                  return (
                    <td
                      key={day}
                      className={`p-1 text-center border-r border-slate-200 relative cursor-pointer group transition-colors ${
                        isWeekend ? 'bg-slate-50' : ''
                      } ${hasViolation ? 'bg-amber-50' : ''}`}
                      onClick={() => setActiveCell(isCellActive ? null : { memberId: member.id, day })}
                    >
                      <div className="flex items-center justify-center relative">
                        {getShiftBadge(shift, hasViolation)}

                        {hasViolation && (
                          <div
                            className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full"
                            title={cellViolations.map((v) => v.description).join('\n')}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown Popover */}
                      {isCellActive && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 w-44 bg-white border border-slate-300 rounded-lg shadow-lg p-1 text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                            Set Shift (Day {day})
                          </div>
                          {shiftOptions.map((opt) => (
                            <button
                              key={opt.type}
                              onClick={() => {
                                onShiftChange(member.id, day, opt.type);
                                setActiveCell(null);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${opt.colorClass}`}
                            >
                              <div className="flex items-center gap-2">
                                {opt.icon}
                                <span>{opt.type}</span>
                              </div>
                              {shift === opt.type && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* Bottom Staffing Tallies */}
          <tfoot className="bg-slate-50 text-xs font-bold border-t-2 border-slate-300 divide-y divide-slate-200">
            <tr>
              <td className="sticky left-0 z-20 bg-slate-50 p-2 border-r border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Morning Staff</span>
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const count = dailyStaffing[day]?.morning || 0;
                const isUnder = count < staffPerShift;
                return (
                  <td
                    key={day}
                    className={`p-1 text-center border-r border-slate-200 font-extrabold ${
                      isUnder ? 'bg-amber-100 text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="sticky left-0 z-20 bg-slate-50 p-2 border-r border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
                <Sunset className="w-3.5 h-3.5 text-orange-600" />
                <span>Afternoon Staff</span>
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const count = dailyStaffing[day]?.afternoon || 0;
                const isUnder = count < staffPerShift;
                return (
                  <td
                    key={day}
                    className={`p-1 text-center border-r border-slate-200 font-extrabold ${
                      isUnder ? 'bg-amber-100 text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="sticky left-0 z-20 bg-slate-50 p-2 border-r border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Night Staff</span>
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const count = dailyStaffing[day]?.night || 0;
                const isUnder = count < staffPerShift;
                return (
                  <td
                    key={day}
                    className={`p-1 text-center border-r border-slate-200 font-extrabold ${
                      isUnder ? 'bg-amber-100 text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
