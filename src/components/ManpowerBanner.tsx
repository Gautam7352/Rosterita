import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { RosterStats, RosterConfig } from '../types';

interface ManpowerBannerProps {
  stats: RosterStats;
  config: RosterConfig;
}

export const ManpowerBanner: React.FC<ManpowerBannerProps> = ({ stats, config }) => {
  const { totalRequiredShifts, totalAvailableShifts, deficit, understaffedDaysCount } = stats;
  const isDeficit = deficit > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Left */}
      <div className="flex items-center gap-2.5">
        {isDeficit ? (
          <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : (
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span>Capacity Status ({config.month} {config.year})</span>
            {isDeficit ? (
              <span className="text-[11px] px-2 py-0.5 font-bold bg-amber-100 text-amber-800 rounded-md">
                Deficit of {deficit} shifts
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 rounded-md">
                Fully Staffed
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Required: <span className="font-semibold text-slate-700">{totalRequiredShifts}</span> shifts ({config.daysInMonth}d × 6 staff/d) • Available: <span className="font-semibold text-slate-700">{totalAvailableShifts}</span> shifts
          </p>
        </div>
      </div>

      {/* Right Stats */}
      <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Required</div>
          <div className="font-bold text-slate-800 text-sm">{totalRequiredShifts}</div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Available</div>
          <div className={`font-bold text-sm ${isDeficit ? 'text-amber-700' : 'text-emerald-700'}`}>
            {totalAvailableShifts}
          </div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Understaffed</div>
          <div className={`font-bold text-sm ${understaffedDaysCount > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
            {understaffedDaysCount} days
          </div>
        </div>
      </div>
    </div>
  );
};
