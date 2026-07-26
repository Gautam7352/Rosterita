import { TeamMember, LeaveRequest, ShiftAssignment, RosterConfig, ShiftType } from '../types';
import { isWeekendDay } from './rosterEngine';

export function equalizeLoad(
  assignments: ShiftAssignment[],
  members: TeamMember[],
  leaves: LeaveRequest[],
  config: RosterConfig
): ShiftAssignment[] {
  // We'll create a deep copy of assignments to mutate
  let currentAssignments = [...assignments.map(a => ({ ...a }))];
  
  const approvedLeavesMap = new Map<string, Set<number>>();
  leaves
    .filter((l) => l.status === 'approved')
    .forEach((l) => {
      if (!approvedLeavesMap.has(l.memberId)) {
        approvedLeavesMap.set(l.memberId, new Set());
      }
      approvedLeavesMap.get(l.memberId)!.add(l.day);
    });

  let improved = true;
  let iterations = 0;
  
  while (improved && iterations < 100) {
    improved = false;
    iterations++;
    
    // 1. Calculate burdens
    const burdens: Record<string, { memberId: string, score: number, nights: number, weekends: number }> = {};
    members.forEach(m => {
      burdens[m.id] = { memberId: m.id, score: 0, nights: 0, weekends: 0 };
    });
    
    currentAssignments.forEach(a => {
      if (a.shift === 'Leave') return;
      if (a.shift === 'Night') burdens[a.memberId].nights++;
      if (a.shift !== 'Off' && isWeekendDay(a.day)) burdens[a.memberId].weekends++;
    });
    
    Object.values(burdens).forEach(b => {
      b.score = b.nights * 1.5 + b.weekends; // Night shifts are slightly heavier burden
    });
    
    const sortedMembers = Object.values(burdens).sort((a, b) => b.score - a.score);
    const mostBurdened = sortedMembers[0];
    const leastBurdened = sortedMembers[sortedMembers.length - 1];
    
    if (mostBurdened.score - leastBurdened.score <= 1.5) {
      break; // Fair enough
    }
    
    // Try to swap a shift from mostBurdened to leastBurdened
    for (let day = 1; day <= config.daysInMonth; day++) {
      const maxAssign = currentAssignments.find(a => a.memberId === mostBurdened.memberId && a.day === day);
      const minAssign = currentAssignments.find(a => a.memberId === leastBurdened.memberId && a.day === day);
      
      if (!maxAssign || !minAssign) continue;
      
      const maxIsOnLeave = approvedLeavesMap.get(mostBurdened.memberId)?.has(day);
      const minIsOnLeave = approvedLeavesMap.get(leastBurdened.memberId)?.has(day);
      
      if (maxIsOnLeave || minIsOnLeave) continue;
      
      // Is this a shift that causes burden for max? (Night or Weekend work)
      const maxShiftIsBurden = maxAssign.shift === 'Night' || (maxAssign.shift !== 'Off' && isWeekendDay(day));
      // Does min have a lesser burden on this day?
      const minShiftIsLesser = (minAssign.shift === 'Off') || (minAssign.shift !== 'Night' && maxAssign.shift === 'Night');
      
      if (maxShiftIsBurden && minShiftIsLesser) {
        // Swap them temporarily
        const oldMaxShift = maxAssign.shift;
        const oldMinShift = minAssign.shift;
        
        maxAssign.shift = oldMinShift;
        minAssign.shift = oldMaxShift;
        
        // Check safety
        if (isSafe(mostBurdened.memberId, day, currentAssignments) && 
            isSafe(leastBurdened.memberId, day, currentAssignments)) {
          improved = true;
          break; // Break out of day loop to recalculate burdens
        } else {
          // Revert
          maxAssign.shift = oldMaxShift;
          minAssign.shift = oldMinShift;
        }
      }
    }
  }
  
  return currentAssignments;
}

function isSafe(memberId: string, day: number, assignments: ShiftAssignment[]): boolean {
  const mAssignments = assignments.filter(a => a.memberId === memberId).sort((a, b) => a.day - b.day);
  
  // Check Night -> Morning/Afternoon
  for (let i = 0; i < mAssignments.length - 1; i++) {
    const curr = mAssignments[i];
    const next = mAssignments[i+1];
    if (curr.shift === 'Night' && (next.shift === 'Morning' || next.shift === 'Afternoon')) {
      return false;
    }
  }
  
  // Check Max 6 consecutive work days
  let consecutive = 0;
  for (let i = 0; i < mAssignments.length; i++) {
    const shift = mAssignments[i].shift;
    if (shift !== 'Off' && shift !== 'Leave') {
      consecutive++;
      if (consecutive > 6) return false;
    } else {
      consecutive = 0;
    }
  }
  
  return true;
}
