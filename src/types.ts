export type ShiftType = 'Morning' | 'Afternoon' | 'Night' | 'Off' | 'Leave';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  preferredShift: 'Morning' | 'Afternoon' | 'Night' | 'None';
  maxOffDays: number;
  avatarColor: string;
}

export interface LeaveRequest {
  id: string;
  memberId: string;
  day: number;
  reason?: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface ShiftAssignment {
  memberId: string;
  day: number; // 1-indexed (1..30/31)
  shift: ShiftType;
  isManualOverride?: boolean;
}

export interface RosterConfig {
  month: string;
  year: number;
  daysInMonth: number;
  staffPerShift: number; // default 2
  defaultOffDays: number; // default 8
}

export interface HealthViolation {
  id: string;
  memberId: string;
  day: number;
  type:
    | 'NightToMorning'
    | 'NightToAfternoon'
    | 'ShortRest'
    | 'Understaffed'
    | 'Overstaffed'
    | 'OnLeaveAssigned'
    | 'ExcessiveWorkDays'
    | 'NoDaysOffInWeek';
  description: string;
  severity: 'critical' | 'warning';
}

export interface MemberStats {
  morningCount: number;
  afternoonCount: number;
  nightCount: number;
  offCount: number;
  leaveCount: number;
  weekendShifts: number;
  healthViolations: number;
}

export interface RosterStats {
  totalRequiredShifts: number;
  totalAvailableShifts: number;
  deficit: number;
  healthScore: number; // 0 - 100%
  fairnessScore: number; // 0 - 100%
  understaffedDaysCount: number;
  memberStats: Record<string, MemberStats>;
  violations: HealthViolation[];
}
