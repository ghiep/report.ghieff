import { Task } from "../types";

export interface ScoreBreakdown {
  totalScore: number;
  completionRate: number;
  weightedScore: number;
  deadlineAdherence: number;
  overduePenalty: number;
  workHoursContribution: number;
  statusLabel: "Belum Ada Data" | "Luar Biasa" | "Sangat Baik" | "Cukup Baik" | "Perlu Peningkatan" | "Kritis";
  statusColor: string;
}

export function calculateProductivityScore(
  tasks: Task[],
  today: string,
  dailyHoursGoal = 7
): ScoreBreakdown {
  const todayTasks = tasks.filter((t) => t.date === today);
  if (todayTasks.length === 0) {
    return {
      totalScore: 0,
      completionRate: 0,
      weightedScore: 0,
      deadlineAdherence: 0,
      overduePenalty: 0,
      workHoursContribution: 0,
      statusLabel: "Belum Ada Data",
      statusColor: "slate"
    };
  }

  const priorityWeights: Record<string, number> = {
    Critical: 5,
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  let maxPossibleWeight = 0;
  let earnedWeight = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let actualWorkMinutes = 0;

  todayTasks.forEach((t) => {
    const weight = priorityWeights[t.priority] || 2;
    maxPossibleWeight += weight;

    if (t.status === "Selesai") {
      earnedWeight += weight;
      completedCount++;
    } else if (t.status === "In Progress") {
      // Partial credit for in-progress tasks
      const subtaskRatio =
        t.subtasks && t.subtasks.length > 0
          ? t.subtasks.filter((st) => st.completed).length / t.subtasks.length
          : 0.4;
      earnedWeight += weight * (0.3 + subtaskRatio * 0.4);
    }

    if (t.status !== "Selesai" && t.deadline && new Date(t.deadline).getTime() < new Date(today).getTime()) {
      overdueCount++;
    }

    actualWorkMinutes += t.actualDuration || 0;
  });

  const completionRate = Math.round((completedCount / todayTasks.length) * 100);
  const weightedRatio = maxPossibleWeight > 0 ? earnedWeight / maxPossibleWeight : 0;
  const weightedScore = Math.round(weightedRatio * 55); // max 55 pts

  // Deadline adherence: max 25 pts
  const deadlineAdherence = Math.max(0, 25 - overdueCount * 8);

  // Work hours consistency: max 20 pts
  const goalMinutes = dailyHoursGoal * 60;
  const hoursRatio = Math.min(1.2, actualWorkMinutes / goalMinutes);
  const workHoursContribution = Math.round(Math.min(20, hoursRatio * 20));

  // Overdue penalty
  const overduePenalty = overdueCount * 6;

  let totalScore = Math.max(
    0,
    Math.min(100, Math.round(weightedScore + deadlineAdherence + workHoursContribution - overduePenalty))
  );

  let statusLabel: ScoreBreakdown["statusLabel"] = "Cukup Baik";
  let statusColor = "amber";

  if (totalScore === 0) {
    statusLabel = "Belum Ada Data";
    statusColor = "slate";
  } else if (totalScore >= 90) {
    statusLabel = "Luar Biasa";
    statusColor = "emerald";
  } else if (totalScore >= 78) {
    statusLabel = "Sangat Baik";
    statusColor = "blue";
  } else if (totalScore >= 60) {
    statusLabel = "Cukup Baik";
    statusColor = "amber";
  } else if (totalScore >= 40) {
    statusLabel = "Perlu Peningkatan";
    statusColor = "orange";
  } else {
    statusLabel = "Kritis";
    statusColor = "rose";
  }

  return {
    totalScore,
    completionRate,
    weightedScore,
    deadlineAdherence,
    overduePenalty,
    workHoursContribution,
    statusLabel,
    statusColor
  };
}

export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}
