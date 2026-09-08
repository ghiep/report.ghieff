import { Task, Project, UserSettings, DailyCheckIn } from "../types";

export const DEFAULT_CATEGORIES = [
  "Work",
  "Meeting",
  "Client",
  "Development",
  "Design",
  "Administration",
  "Marketing",
  "Personal",
  "Other"
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_CHECKINS: DailyCheckIn[] = [];

export const INITIAL_SETTINGS: UserSettings = {
  dailyWorkHoursGoal: 7,
  customCategories: [],
  userName: "Ghiep",
  workStartTime: "08:30",
  enableNotifications: true
};
