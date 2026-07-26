import { TeamMember, LeaveRequest, RosterConfig } from '../types';

export const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'emp-1', name: 'Alex Mercer', role: 'Sr. Console Engineer', preferredShift: 'Morning', maxOffDays: 8, avatarColor: '#3b82f6' },
  { id: 'emp-2', name: 'Sarah Chen', role: 'Mainframe Systems Tech', preferredShift: 'None', maxOffDays: 8, avatarColor: '#10b981' },
  { id: 'emp-3', name: 'Marcus Vance', role: 'Operations Specialist', preferredShift: 'Afternoon', maxOffDays: 8, avatarColor: '#f59e0b' },
  { id: 'emp-4', name: 'Elena Rostova', role: 'Console Monitor', preferredShift: 'Night', maxOffDays: 8, avatarColor: '#8b5cf6' },
  { id: 'emp-5', name: 'David Kim', role: 'Mainframe Tech II', preferredShift: 'None', maxOffDays: 8, avatarColor: '#ec4899' },
  { id: 'emp-6', name: 'Priya Patel', role: 'System Monitor', preferredShift: 'Morning', maxOffDays: 8, avatarColor: '#06b6d4' },
  { id: 'emp-7', name: 'James Wilson', role: 'Console Engineer', preferredShift: 'None', maxOffDays: 8, avatarColor: '#64748b' },
  { id: 'emp-8', name: 'Anita Sharma', role: 'Operations Tech', preferredShift: 'Afternoon', maxOffDays: 8, avatarColor: '#14b8a6' },
];

export const DEFAULT_CONFIG: RosterConfig = {
  month: 'August',
  year: 2026,
  daysInMonth: 31,
  staffPerShift: 2,
  defaultOffDays: 8,
};

export const DEFAULT_LEAVES: LeaveRequest[] = [
  { id: 'lv-1', memberId: 'emp-1', day: 5, reason: 'Personal errands', status: 'approved' },
  { id: 'lv-2', memberId: 'emp-2', day: 12, reason: 'Family event', status: 'approved' },
  { id: 'lv-3', memberId: 'emp-2', day: 13, reason: 'Family event', status: 'approved' },
  { id: 'lv-4', memberId: 'emp-4', day: 20, reason: 'Medical checkup', status: 'approved' },
  { id: 'lv-5', memberId: 'emp-6', day: 25, reason: 'Rest & relaxation', status: 'approved' },
];
