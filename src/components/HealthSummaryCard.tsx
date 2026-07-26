import React from 'react';
import { HeartPulse, AlertTriangle, Scale, Moon, Coffee } from 'lucide-react';
import { RosterStats, TeamMember, MemberStats } from '../types';

interface HealthSummaryCardProps {
  stats: RosterStats;
  members: TeamMember[];
  onOpenAudit: () => void;
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({
  stats,
  members,
  onOpenAudit,
}) => {
  const { healthScore, fairnessScore, violations, memberStats } = stats;

  const criticalViolations = violations.filter((v) => v.severity === 'critical');
  const warningViolations = violations.filter((v) => v.severity === 'warning');

  const totalNights = (Object.values(memberStats) as MemberStats[]).reduce(
    (sum, s) => sum + s.nightCount,
    0
  );
  const avgNights = (totalNights / (members.length || 1)).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 1. Health Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Circadian Health Index</h4>
              <p className="text-[11px] text-slate-500">Sleep & Rest Quality</p>
            </div>
          </div>
          <span
            className={`text-xl font-bold ${
              healthScore >= 90
                ? 'text-emerald-700'
                : healthScore >= 75
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}
          >
            {healthScore}%
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Block Rotation (M → A → N Blocks)</span>
          <button
            onClick={onOpenAudit}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Audit Details
          </button>
        </div>
      </div>

      {/* 2. Violations & Warnings */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md border ${
                violations.length > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Health Violations</h4>
              <p className="text-[11px] text-slate-500">Rest Cycle Conflicts</p>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900">{violations.length}</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          {violations.length === 0 ? (
            <span className="text-emerald-700 font-medium">Zero Health Risks</span>
          ) : (
            <>
              <span className="text-rose-700 font-medium">Critical: {criticalViolations.length}</span>
              <span className="text-amber-700 font-medium">Warnings: {warningViolations.length}</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Shift Equity */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Shift Fairness Index</h4>
              <p className="text-[11px] text-slate-500">Fair Night & Weekend Spread</p>
            </div>
          </div>
          <span className="text-xl font-bold text-indigo-700">{fairnessScore}%</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-600" />
            <span>Avg Nights: <strong className="text-slate-900">{avgNights}</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <Coffee className="w-3 h-3 text-emerald-600" />
            <span>Avg Offs: <strong className="text-slate-900">8.0</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};
