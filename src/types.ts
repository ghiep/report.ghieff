export type TaskStatus =
  | "Belum dimulai"
  | "In Progress"
  | "Selesai"
  | "Ditunda"
  | "Dibatalkan";

export type TaskPriority =
  | "Critical"
  | "Urgent"
  | "High"
  | "Medium"
  | "Low";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // YYYY-MM-DD
  category: string;
  project: string;
  tags: string[];
  notes?: string;
  subtasks: SubTask[];
  createdAt: string; // ISO
  completedAt?: string; // ISO
  timeSlot?: "Morning" | "Afternoon" | "Evening"; // for daily planner
  order?: number;
  aiTier?: "DO NOW" | "DO NEXT" | "SCHEDULE" | "DELEGATE / OPTIONAL" | "DO LATER";
  aiReason?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  deadline?: string;
  priority: TaskPriority;
  notes?: string;
  createdAt: string;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  completedSummary: string;
  uncompletedSummary: string;
  biggestObstacle: string;
  tomorrowPriority: string;
  additionalNotes: string;
  createdAt: string;
  aiReview?: {
    review: string;
    whatWentWell: string[];
    needsAttention: string[];
    tomorrowRecommendation: string[];
    productivityScore: number;
  };
}

export interface AIPriorityItem {
  taskId: string;
  taskTitle: string;
  reason: string;
  suggestedSlot?: string;
  priorityScore: number;
}

export interface AIPriorityCategory {
  tier: "DO NOW" | "DO NEXT" | "SCHEDULE" | "DELEGATE / OPTIONAL" | "DO LATER";
  label: string;
  color: string;
  items: AIPriorityItem[];
}

export interface AIPriorityResponse {
  categories: AIPriorityCategory[];
  insights: string[];
  alerts: { type: string; message: string }[];
  summaryReasoning: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface UserSettings {
  dailyWorkHoursGoal: number; // e.g. 7 hours
  customCategories: string[];
  userName: string;
  workStartTime: string;
  enableNotifications: boolean;
}
