import React from 'react';
import { HealthViolation, TeamMember, RosterConfig } from '../types';
import { ShieldCheck, AlertTriangle, Info, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface HealthAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  violations: HealthViolation[];
  healthScore: number;
  members: TeamMember[];
  config: RosterConfig;
  onAutoFix: () => void;
}

export const HealthAuditModal: React.FC<HealthAuditModalProps> = ({
  isOpen,
  onClose,
  violations,
  healthScore,
  members,
  config,
  onAutoFix,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                violations.length > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Health & Compliance Audit
              </h2>
              <p className="text-xs text-slate-500">
                {config.month} {config.year} • Score: {healthScore}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Rules */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Circadian Safety Rules
            </h3>
            <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
              <li><strong>Max 5–6 Work Days/Week:</strong> At least 1 to 2 mandatory rest days in every 7-day window; max 5 consecutive work days.</li>
              <li><strong>Block Shift Rotation:</strong> Group all Mornings (5d), Afternoons (5d), and Nights (5d) into contiguous shift blocks.</li>
              <li><strong>Circadian Rest Buffer:</strong> No Morning or Afternoon shift directly after a Night shift.</li>
              <li><strong>Leave Priority:</strong> Operational shifts automatically cleared on approved leave days.</li>
            </ul>
          </div>

          {/* Results */}
          {violations.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-xs">Zero Compliance Issues!</h3>
              <p className="text-slate-600 text-[11px]">
                All circadian health rules and shift staffing constraints are fully satisfied.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs">
                  Detected Issues ({violations.length})
                </h3>
                <button
                  onClick={() => {
                    onAutoFix();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fix All</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {violations.map((v) => {
                  const member = members.find((m) => m.id === v.memberId);
                  const isCritical = v.severity === 'critical';

                  return (
                    <div
                      key={v.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                        isCritical
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isCritical ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{member ? member.name : 'System Alert'}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              isCritical ? 'bg-rose-200 text-rose-950' : 'bg-amber-200 text-amber-950'
                            }`}
                          >
                            {v.type}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 mt-0.5">{v.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
