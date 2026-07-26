import {
  TeamMember,
  LeaveRequest,
  ShiftAssignment,
  RosterConfig,
  HealthViolation,
  RosterStats,
  ShiftType,
  MemberStats,
} from '../types';

// Helper to determine if a given day index is a weekend (assuming Day 1 starts on a Monday/configurable)
export function isWeekendDay(day: number, startDayOfWeek = 1): boolean {
  // startDayOfWeek: 0 = Sun, 1 = Mon...
  const dayOfWeek = (day - 1 + startDayOfWeek) % 7;
  return dayOfWeek === 5 || dayOfWeek === 6; // Sat, Sun
}

export function getDayName(day: number, month: string, year: number): string {
  // Map month name to month index
  const months: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const monthIdx = months[month] ?? 7;
  const date = new Date(year, monthIdx, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Auto-generates a health-compliant roster using Block Shift Rotation logic.
 * Engineers are assigned contiguous blocks of the same shift type (e.g., 5 consecutive Mornings,
 * 5 consecutive Afternoons, 5 consecutive Nights) separated by rest periods (Off blocks),
 * ensuring max 5 working days per week and eliminating rapid shift flip-flops.
 */
export function generateHealthCompliantRoster(
  members: TeamMember[],
  leaves: LeaveRequest[],
  config: RosterConfig,
  seed = 0
): ShiftAssignment[] {
  const { daysInMonth, staffPerShift } = config;
  const assignments: ShiftAssignment[] = [];

  // Map approved leaves for fast lookup
  const approvedLeavesMap = new Map<string, Set<number>>();
  leaves
    .filter((l) => l.status === 'approved')
    .forEach((l) => {
      if (!approvedLeavesMap.has(l.memberId)) {
        approvedLeavesMap.set(l.memberId, new Set());
      }
      approvedLeavesMap.get(l.memberId)!.add(l.day);
    });

  // Master Block Pattern template (21 days length):
  // Block 1: 5 x Morning + 2 x Off (7 days = 5 work, 2 rest)
  // Block 2: 5 x Afternoon + 2 x Off (7 days = 5 work, 2 rest)
  // Block 3: 5 x Night + 2 x Off (7 days = 5 work, 2 rest)
  const masterBlockPattern: ShiftType[] = [
    'Morning', 'Morning', 'Morning', 'Morning', 'Morning', 'Off', 'Off',
    'Afternoon', 'Afternoon', 'Afternoon', 'Afternoon', 'Afternoon', 'Off', 'Off',
    'Night', 'Night', 'Night', 'Night', 'Night', 'Off', 'Off'
  ];

  const numMembers = members.length;
  const seedShift = seed ? seed % masterBlockPattern.length : 0;

  // Stagger members across phase groups so all 3 shifts (M, A, N) are covered daily
  for (let mIdx = 0; mIdx < numMembers; mIdx++) {
    const member = members[mIdx];
    const memberLeaves = approvedLeavesMap.get(member.id) || new Set<number>();

    // Calculate phase offset for pair staggering
    // Pair 0 (mIdx 0,1): offset 0 (starts Morning block)
    // Pair 1 (mIdx 2,3): offset 7 (starts Afternoon block)
    // Pair 2 (mIdx 4,5): offset 14 (starts Night block)
    // Pair 3 (mIdx 6,7): offset 4 (starts Off/Recovery block)
    let phaseOffset = (Math.floor(mIdx / 2) * 7 + seedShift) % masterBlockPattern.length;

    // Adjust offset if member has strong shift preference
    if (member.preferredShift === 'Morning') {
      phaseOffset = (0 + seedShift) % masterBlockPattern.length;
    } else if (member.preferredShift === 'Afternoon') {
      phaseOffset = (7 + seedShift) % masterBlockPattern.length;
    } else if (member.preferredShift === 'Night') {
      phaseOffset = (14 + seedShift) % masterBlockPattern.length;
    }

    // Micro-stagger if multiple members share same preference
    if (mIdx % 2 === 1) {
      phaseOffset = (phaseOffset + 1) % masterBlockPattern.length;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      if (memberLeaves.has(day)) {
        assignments.push({ memberId: member.id, day, shift: 'Leave' });
      } else {
        const patternIndex = (day - 1 + phaseOffset) % masterBlockPattern.length;
        const assignedShift = masterBlockPattern[patternIndex];
        assignments.push({ memberId: member.id, day, shift: assignedShift });
      }
    }
  }

  // Phase 2: Daily Staffing Balancing Optimization
  // Ensure required staff count per shift while enforcing max 5-6 work days/week & circadian safety
  for (let day = 1; day <= daysInMonth; day++) {
    balanceDailyShifts(day, assignments, members, approvedLeavesMap, staffPerShift);
  }

  return assignments;
}

/**
 * Balances shift counts for a single day while avoiding circadian health violations,
 * enforcing max 5-6 work days/week limit, and preserving contiguous shift blocks.
 */
function balanceDailyShifts(
  day: number,
  assignments: ShiftAssignment[],
  members: TeamMember[],
  approvedLeavesMap: Map<string, Set<number>>,
  staffPerShift: number
) {
  const dayAssignments = assignments.filter((a) => a.day === day);

  const counts: Record<ShiftType, number> = {
    Morning: 0,
    Afternoon: 0,
    Night: 0,
    Off: 0,
    Leave: 0,
  };

  dayAssignments.forEach((a) => {
    counts[a.shift]++;
  });

  const shiftsNeeded: ShiftType[] = ['Morning', 'Afternoon', 'Night'];

  shiftsNeeded.forEach((targetShift) => {
    // 1. Remove surplus staff if we have more than required
    while (counts[targetShift] > staffPerShift) {
      const surplusCandidates = dayAssignments.filter(a => a.shift === targetShift);
      if (surplusCandidates.length === 0) break;
      // Convert the last one found to 'Leave'
      const toRemove = surplusCandidates[surplusCandidates.length - 1];
      toRemove.shift = 'Leave';
      counts[targetShift]--;
      counts['Leave']++;
    }

    // 2. Fill deficit if we have less than required
    let attempts = 0;
    while (counts[targetShift] < staffPerShift && attempts < 8) {
      attempts++;
      const candidate = findBestCandidateForShift(
        day,
        targetShift,
        assignments,
        members,
        approvedLeavesMap
      );

      if (!candidate) break;

      const assignmentObj = assignments.find(
        (a) => a.memberId === candidate.memberId && a.day === day
      );

      if (assignmentObj) {
        counts[assignmentObj.shift]--;
        assignmentObj.shift = targetShift;
        counts[targetShift]++;
      } else {
        break;
      }
    }
  });
}

/**
 * Finds the safest candidate to take a shift on a given day, prioritizing candidates
 * who are currently Off and can work without exceeding 5-6 days/week or causing circadian shock.
 */
function findBestCandidateForShift(
  day: number,
  targetShift: ShiftType,
  assignments: ShiftAssignment[],
  members: TeamMember[],
  approvedLeavesMap: Map<string, Set<number>>
): { memberId: string } | null {
  let bestCandidateId: string | null = null;
  let bestScore = -9999;

  for (const member of members) {
    const leaves = approvedLeavesMap.get(member.id);
    if (leaves && leaves.has(day)) continue; // On leave

    const currentAssign = assignments.find(
      (a) => a.memberId === member.id && a.day === day
    );
    if (!currentAssign) continue;

    // Only swap candidates who are currently 'Off'
    if (currentAssign.shift !== 'Off') {
      continue;
    }

    const score = evaluateCandidateSafety(member.id, day, targetShift, assignments, member);
    if (score > bestScore && score > -1000) {
      bestScore = score;
      bestCandidateId = member.id;
    }
  }

  return bestCandidateId ? { memberId: bestCandidateId } : null;
}

/**
 * Evaluates candidate safety, 5-6 day weekly work limits, and block compatibility.
 */
function evaluateCandidateSafety(
  memberId: string,
  day: number,
  targetShift: ShiftType,
  assignments: ShiftAssignment[],
  member?: TeamMember
): number {
  let score = 0;

  const prevAssign = assignments.find((a) => a.memberId === memberId && a.day === day - 1);
  const nextAssign = assignments.find((a) => a.memberId === memberId && a.day === day + 1);

  // Severe penalty for circadian violation: Night -> Morning/Afternoon
  if (prevAssign && prevAssign.shift === 'Night' && targetShift !== 'Night' && targetShift !== 'Off') {
    return -2000;
  }
  if (nextAssign && nextAssign.shift !== 'Night' && nextAssign.shift !== 'Off' && targetShift === 'Night') {
    return -2000;
  }

  // Check consecutive working days around `day` if assigned `targetShift`
  let consecutiveBefore = 0;
  let dBefore = day - 1;
  while (dBefore >= 1) {
    const a = assignments.find((x) => x.memberId === memberId && x.day === dBefore);
    if (a && a.shift !== 'Off' && a.shift !== 'Leave') {
      consecutiveBefore++;
      dBefore--;
    } else {
      break;
    }
  }

  let consecutiveAfter = 0;
  let dAfter = day + 1;
  while (dAfter <= 31) {
    const a = assignments.find((x) => x.memberId === memberId && x.day === dAfter);
    if (a && a.shift !== 'Off' && a.shift !== 'Leave') {
      consecutiveAfter++;
      dAfter++;
    } else {
      break;
    }
  }

  const totalConsecutive = consecutiveBefore + 1 + consecutiveAfter;
  if (totalConsecutive > 6) {
    return -2000; // Cannot exceed 6 consecutive work days without a day off
  }

  // Check 7-day window surrounding `day`
  let workInWindow = 1; // assigning this day
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue;
    const checkDay = day + offset;
    const a = assignments.find((x) => x.memberId === memberId && x.day === checkDay);
    if (a && a.shift !== 'Off' && a.shift !== 'Leave') {
      workInWindow++;
    }
  }
  if (workInWindow > 6) {
    return -2000; // Cannot work 7 days out of 7 in a 7-day window
  }

  // Strong bonus for BLOCK CONTINUITY (same shift as yesterday or tomorrow)
  if (prevAssign && prevAssign.shift === targetShift) {
    score += 150;
  }
  if (nextAssign && nextAssign.shift === targetShift) {
    score += 150;
  }
  if (prevAssign && nextAssign && prevAssign.shift === targetShift && nextAssign.shift === targetShift) {
    score += 300;
  }

  // Bonus if shift matches member's preferred shift
  if (member && member.preferredShift === targetShift) {
    score += 50;
  }

  // Penalty if candidate is in the middle of a different shift block
  if (
    prevAssign &&
    nextAssign &&
    prevAssign.shift !== 'Off' &&
    prevAssign.shift !== targetShift &&
    prevAssign.shift === nextAssign.shift
  ) {
    score -= 400;
  }

  return score;
}

/**
 * Audits a roster and calculates comprehensive health score, violations, and fairness.
 */
export function auditRoster(
  assignments: ShiftAssignment[],
  members: TeamMember[],
  leaves: LeaveRequest[],
  config: RosterConfig
): RosterStats {
  const { daysInMonth, staffPerShift } = config;
  const violations: HealthViolation[] = [];

  const totalRequiredShifts = daysInMonth * staffPerShift * 3; // 3 shifts / day
  
  // Calculate total available working shifts
  const approvedLeaves = leaves.filter((l) => l.status === 'approved').length;
  const totalOffDaysAllowed = members.reduce((sum, m) => sum + (m.maxOffDays || 8), 0);
  const totalMemberDays = members.length * daysInMonth;
  const totalAvailableShifts = totalMemberDays - totalOffDaysAllowed - approvedLeaves;
  const deficit = totalRequiredShifts - totalAvailableShifts;

  // Initialize Member Stats
  const memberStats: Record<string, MemberStats> = {};
  members.forEach((m) => {
    memberStats[m.id] = {
      morningCount: 0,
      afternoonCount: 0,
      nightCount: 0,
      offCount: 0,
      leaveCount: 0,
      weekendShifts: 0,
      healthViolations: 0,
    };
  });

  const approvedLeavesSet = new Set(
    leaves.filter((l) => l.status === 'approved').map((l) => `${l.memberId}_${l.day}`)
  );

  let understaffedDaysCount = 0;

  // 1. Audit Daily Staffing Levels
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAssignments = assignments.filter((a) => a.day === day);
    const mCount = dayAssignments.filter((a) => a.shift === 'Morning').length;
    const aCount = dayAssignments.filter((a) => a.shift === 'Afternoon').length;
    const nCount = dayAssignments.filter((a) => a.shift === 'Night').length;

    let isDayUnderstaffed = false;

    if (mCount < staffPerShift) {
      isDayUnderstaffed = true;
      violations.push({
        id: `v-m-${day}`,
        memberId: 'system',
        day,
        type: 'Understaffed',
        description: `Day ${day}: Morning shift has ${mCount}/${staffPerShift} staff members assigned.`,
        severity: 'critical',
      });
    } else if (mCount > staffPerShift) {
      violations.push({
        id: `v-m-over-${day}`,
        memberId: 'system',
        day,
        type: 'Overstaffed',
        description: `Day ${day}: Morning shift has ${mCount}/${staffPerShift} staff. Max allowed is ${staffPerShift}.`,
        severity: 'warning',
      });
    }
    
    if (aCount < staffPerShift) {
      isDayUnderstaffed = true;
      violations.push({
        id: `v-a-${day}`,
        memberId: 'system',
        day,
        type: 'Understaffed',
        description: `Day ${day}: Afternoon shift has ${aCount}/${staffPerShift} staff members assigned.`,
        severity: 'critical',
      });
    } else if (aCount > staffPerShift) {
      violations.push({
        id: `v-a-over-${day}`,
        memberId: 'system',
        day,
        type: 'Overstaffed',
        description: `Day ${day}: Afternoon shift has ${aCount}/${staffPerShift} staff. Max allowed is ${staffPerShift}.`,
        severity: 'warning',
      });
    }

    if (nCount < staffPerShift) {
      isDayUnderstaffed = true;
      violations.push({
        id: `v-n-${day}`,
        memberId: 'system',
        day,
        type: 'Understaffed',
        description: `Day ${day}: Night shift has ${nCount}/${staffPerShift} staff members assigned.`,
        severity: 'critical',
      });
    } else if (nCount > staffPerShift) {
      violations.push({
        id: `v-n-over-${day}`,
        memberId: 'system',
        day,
        type: 'Overstaffed',
        description: `Day ${day}: Night shift has ${nCount}/${staffPerShift} staff. Max allowed is ${staffPerShift}.`,
        severity: 'warning',
      });
    }

    if (isDayUnderstaffed) understaffedDaysCount++;
  }

  // 2. Audit Individual Member Health & Rest Cycles
  members.forEach((m) => {
    const mAssignments = assignments
      .filter((a) => a.memberId === m.id)
      .sort((a, b) => a.day - b.day);

    let consecutiveStreak = 0;

    mAssignments.forEach((assign) => {
      const stats = memberStats[m.id];
      if (!stats) return;

      if (assign.shift === 'Morning') stats.morningCount++;
      else if (assign.shift === 'Afternoon') stats.afternoonCount++;
      else if (assign.shift === 'Night') stats.nightCount++;
      else if (assign.shift === 'Off') stats.offCount++;
      else if (assign.shift === 'Leave') stats.leaveCount++;

      if (assign.shift !== 'Off' && assign.shift !== 'Leave' && isWeekendDay(assign.day)) {
        stats.weekendShifts++;
      }

      // Check working streak
      if (assign.shift === 'Morning' || assign.shift === 'Afternoon' || assign.shift === 'Night') {
        consecutiveStreak++;
        if (consecutiveStreak > 6) {
          stats.healthViolations++;
          violations.push({
            id: `v-streak-${m.id}-${assign.day}`,
            memberId: m.id,
            day: assign.day,
            type: 'ExcessiveWorkDays',
            description: `${m.name} assigned ${consecutiveStreak} consecutive work days (Days ${assign.day - consecutiveStreak + 1} to ${assign.day}) without a day off (Max limit: 5-6 days).`,
            severity: 'critical',
          });
        }
      } else {
        consecutiveStreak = 0;
      }

      // Check if working on approved leave
      if (approvedLeavesSet.has(`${m.id}_${assign.day}`) && assign.shift !== 'Leave') {
        stats.healthViolations++;
        violations.push({
          id: `v-leave-${m.id}-${assign.day}`,
          memberId: m.id,
          day: assign.day,
          type: 'OnLeaveAssigned',
          description: `${m.name} is scheduled for ${assign.shift} on Day ${assign.day} despite approved leave!`,
          severity: 'critical',
        });
      }

      // Circadian Check: Look back at previous day
      const prevAssign = mAssignments.find((a) => a.day === assign.day - 1);
      if (prevAssign) {
        if (prevAssign.shift === 'Night' && assign.shift === 'Morning') {
          stats.healthViolations++;
          violations.push({
            id: `v-nm-${m.id}-${assign.day}`,
            memberId: m.id,
            day: assign.day,
            type: 'NightToMorning',
            description: `${m.name} assigned Morning shift on Day ${assign.day} immediately after Night shift on Day ${assign.day - 1} (Severe circadian shock < 8h rest).`,
            severity: 'critical',
          });
        } else if (prevAssign.shift === 'Night' && assign.shift === 'Afternoon') {
          stats.healthViolations++;
          violations.push({
            id: `v-na-${m.id}-${assign.day}`,
            memberId: m.id,
            day: assign.day,
            type: 'NightToAfternoon',
            description: `${m.name} assigned Afternoon shift on Day ${assign.day} right after Night shift on Day ${assign.day - 1} (< 16h rest).`,
            severity: 'warning',
          });
        }
      }
    });

    // 7-day rolling window check (No days off in a week)
    for (let startD = 1; startD <= daysInMonth - 6; startD++) {
      const windowAssignments = mAssignments.filter(
        (a) => a.day >= startD && a.day <= startD + 6
      );
      const workDaysInWindow = windowAssignments.filter(
        (a) => a.shift === 'Morning' || a.shift === 'Afternoon' || a.shift === 'Night'
      ).length;

      if (workDaysInWindow > 6) {
        memberStats[m.id].healthViolations++;
        violations.push({
          id: `v-window7-${m.id}-${startD}`,
          memberId: m.id,
          day: startD + 6,
          type: 'NoDaysOffInWeek',
          description: `${m.name} scheduled for ${workDaysInWindow} work days in 7-day window (Days ${startD} to ${startD + 6}). Zero rest days in a week!`,
          severity: 'critical',
        });
      }
    }
  });

  // Calculate Overall Health Score (100% minus penalties)
  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;

  let healthPenalty = criticalCount * 12 + warningCount * 5;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - healthPenalty)));

  // Calculate Fairness Score based on variance of night shift distribution
  const nightCounts = Object.values(memberStats).map((s) => s.nightCount);
  const avgNights = nightCounts.reduce((a, b) => a + b, 0) / (members.length || 1);
  const variance =
    nightCounts.reduce((sum, count) => sum + Math.pow(count - avgNights, 2), 0) /
    (members.length || 1);
  const stdDev = Math.sqrt(variance);
  const fairnessScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 10)));

  return {
    totalRequiredShifts,
    totalAvailableShifts,
    deficit,
    healthScore,
    fairnessScore,
    understaffedDaysCount,
    memberStats,
    violations,
  };
}
