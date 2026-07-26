import React, { useState } from 'react';
import { Menu, X, Calendar, Sparkles, Download, ShieldCheck, RotateCcw, Users, Palmtree, UserCheck, Scale } from 'lucide-react';
import { RosterConfig } from '../types';

interface HeaderProps {
  config: RosterConfig;
  onConfigChange: (newConfig: RosterConfig) => void;
  onAutoGenerate: () => void;
  onEqualizeLoad: () => void;
  onExport: (type: 'csv' | 'pdf' | 'image') => void;
  onOpenAudit: () => void;
  onReset: () => void;
  activeTab: 'grid' | 'team' | 'leave' | 'schedules';
  onTabChange: (tab: 'grid' | 'team' | 'leave' | 'schedules') => void;
  healthScore: number;
  violationCount: number;
  approvedLeaveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onConfigChange,
  onAutoGenerate,
  onEqualizeLoad,
  onExport,
  onOpenAudit,
  onReset,
  activeTab,
  onTabChange,
  healthScore,
  violationCount,
  approvedLeaveCount,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value;
    const days = ['April', 'June', 'September', 'November'].includes(selectedMonth)
      ? 30
      : selectedMonth === 'February'
      ? (config.year % 4 === 0 ? 29 : 28)
      : 31;

    onConfigChange({ ...config, month: selectedMonth, daysInMonth: days });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ ...config, year: parseInt(e.target.value, 10) });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Month Picker */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Console Roster
            </h1>

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={config.month}
                onChange={handleMonthChange}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={config.year}
                onChange={handleYearChange}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAudit}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                violationCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Health Score: {healthScore}%</span>
              {violationCount > 0 && (
                <span className="bg-amber-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {violationCount}
                </span>
              )}
            </button>

            <button
              onClick={onAutoGenerate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-xs rounded-lg transition-all shadow-xs cursor-pointer group"
              title="Auto-generate health-compliant roster with contiguous shift blocks and max 5-6 work days/week"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Auto-Generate</span>
            </button>

            <button
              onClick={onEqualizeLoad}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-medium text-xs rounded-lg transition-all shadow-xs cursor-pointer group"
              title="Redistribute night and weekend shifts evenly across all team members"
            >
              <Scale className="w-3.5 h-3.5 text-violet-200 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Equalize Load</span>
              <span className="sm:hidden">Equalize</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-50">
                  <button
                    onClick={() => { onExport('csv'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => { onExport('pdf'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => { onExport('image'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Image
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset Roster"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => onTabChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'grid'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Roster</span>
          </button>

          <button
            onClick={() => onTabChange('schedules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'schedules'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Engineer Timetables</span>
          </button>

          <button
            onClick={() => onTabChange('leave')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'leave'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palmtree className="w-3.5 h-3.5" />
            <span>Leave Requests</span>
            {approvedLeaveCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-800 rounded-full">
                {approvedLeaveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('team')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team & Preferences</span>
          </button>
        </div>
      </div>
    </header>
  );
};
