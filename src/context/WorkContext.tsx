import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  Task,
  Project,
  DailyCheckIn,
  UserSettings,
  AIPriorityResponse,
  TaskStatus,
  TaskPriority
} from "../types";
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_CHECKINS,
  INITIAL_SETTINGS,
  DEFAULT_CATEGORIES
} from "../data/initialData";
import { calculateProductivityScore, ScoreBreakdown } from "../utils/productivity";
import confetti from "canvas-confetti";

interface WorkContextType {
  tasks: Task[];
  projects: Project[];
  categories: string[];
  checkIns: DailyCheckIn[];
  settings: UserSettings;
  todayDate: string;
  setTodayDate: (d: string) => void;
  // Task operations
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  // Project operations
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  // Category operations
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  // Check-in operations
  saveCheckIn: (checkIn: Omit<DailyCheckIn, "id" | "createdAt">) => Promise<DailyCheckIn>;
  // Timer operations
  activeTimer: { taskId: string; elapsedSeconds: number; isRunning: boolean } | null;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  // AI Features
  aiPriorityData: AIPriorityResponse | null;
  isAIPrioritizing: boolean;
  runAIPrioritization: () => Promise<AIPriorityResponse | null>;
  applyAIPriorities: () => void;
  aiInsights: string[];
  fetchAIInsights: () => Promise<void>;
  isAIInsightsLoading: boolean;
  // Stats
  scoreBreakdown: ScoreBreakdown;
  todayStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    urgent: number;
    completionRate: number;
    totalWorkMinutes: number;
    remainingWorkMinutes: number;
  };
  notifications: { id: string; title: string; message: string; type: "urgent" | "overdue" | "deadline" | "info"; taskId?: string }[];
  clearNotification: (id: string) => void;
  // Quick Add Modal state
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  selectedTaskForDetail: Task | null;
  setSelectedTaskForDetail: (t: Task | null) => void;
  // Settings
  updateSettings: (s: Partial<UserSettings>) => void;
  clearAllData: () => void;
  resetAllData: () => void;
  resetData: () => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = "dwm_tasks_v2";
const STORAGE_KEY_PROJECTS = "dwm_projects_v2";
const STORAGE_KEY_CHECKINS = "dwm_checkins_v2";
const STORAGE_KEY_CATEGORIES = "dwm_categories_v2";
const STORAGE_KEY_SETTINGS = "dwm_settings_v2";

export const WorkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todayDate, setTodayDate] = useState<string>("2026-09-07");

  // Remove deprecated demo data if present in browser storage
  useEffect(() => {
    try {
      localStorage.removeItem("dwm_tasks_v1");
      localStorage.removeItem("dwm_projects_v1");
      localStorage.removeItem("dwm_checkins_v1");
      localStorage.removeItem("dwm_categories_v1");
      localStorage.removeItem("dwm_settings_v1");
    } catch {}
  }, []);

  // Load from local storage or fallback to initial data
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      // Clear out any old v1 data
      localStorage.removeItem("dwm_tasks_v1");
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      localStorage.removeItem("dwm_projects_v1");
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    try {
      localStorage.removeItem("dwm_checkins_v1");
      const saved = localStorage.getItem(STORAGE_KEY_CHECKINS);
      return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
    } catch {
      return INITIAL_CHECKINS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // UI States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  // AI States
  const [aiPriorityData, setAiPriorityData] = useState<AIPriorityResponse | null>(null);
  const [isAIPrioritizing, setIsAIPrioritizing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([
    "Sistem siap digunakan! Mulai dengan mencatat pekerjaan pertama Anda hari ini menggunakan tombol '+ Add Task'.",
    "Tentukan tingkat prioritas (Critical, Urgent, High) dan estimasi waktu agar AI dapat mengurutkan agenda harian secara otomatis.",
    "Gunakan fitur timer pada kartu tugas untuk melacak durasi kerja aktual secara akurat."
  ]);
  const [isAIInsightsLoading, setIsAIInsightsLoading] = useState(false);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string;
    elapsedSeconds: number;
    isRunning: boolean;
  } | null>(null);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns));
    } catch (e) {
      console.error(e);
    }
  }, [checkIns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => (prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Timer functions
  const startTimer = (taskId: string) => {
    if (activeTimer && activeTimer.taskId === taskId) {
      setActiveTimer({ ...activeTimer, isRunning: true });
    } else {
      setActiveTimer({ taskId, elapsedSeconds: 0, isRunning: true });
    }
    // Update task status to "In Progress"
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId && t.status === "Belum dimulai" ? { ...t, status: "In Progress" } : t))
    );
  };

  const pauseTimer = () => {
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, isRunning: false });
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      const addedMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTimer.taskId
            ? { ...t, actualDuration: (t.actualDuration || 0) + addedMinutes }
            : t
        )
      );
      setActiveTimer(null);
    }
  };

  // Task Operations
  const addTask = (newTaskData: Omit<Task, "id" | "createdAt">) => {
    const id = "task-" + Date.now();
    const newTask: Task = {
      ...newTaskData,
      id,
      createdAt: new Date().toISOString(),
      order: tasks.length + 1
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTaskForDetail?.id === updatedTask.id) {
      setSelectedTaskForDetail(updatedTask);
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskForDetail?.id === id) {
      setSelectedTaskForDetail(null);
    }
    if (activeTimer?.taskId === id) {
      setActiveTimer(null);
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isNowCompleted = t.status !== "Selesai";
        if (isNowCompleted) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch {}
        }
        return {
          ...t,
          status: isNowCompleted ? "Selesai" : "In Progress",
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      })
    );
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (status === "Selesai") {
          try {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.8 }
            });
          } catch {}
        }
        return {
          ...t,
          status,
          completedAt: status === "Selesai" ? new Date().toISOString() : undefined
        };
      })
    );
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((st) =>
          st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  const addSubTask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newSubtask = {
          id: "st-" + Date.now(),
          title: title.trim(),
          completed: false
        };
        return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
      })
    );
  };

  const reorderTasks = (newTasksList: Task[]) => {
    setTasks(newTasksList.map((t, idx) => ({ ...t, order: idx + 1 })));
  };

  // Project Operations
  const addProject = (pData: Omit<Project, "id" | "createdAt">) => {
    const newProj: Project = {
      ...pData,
      id: "proj-" + Date.now(),
      createdAt: new Date().toISOString()
    };
    setProjects((prev) => [...prev, newProj]);
  };

  const updateProject = (proj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? proj : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Category Operations
  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  // Check-In Operations
  const saveCheckIn = async (cData: Omit<DailyCheckIn, "id" | "createdAt">): Promise<DailyCheckIn> => {
    const id = "checkin-" + Date.now();
    const todayTasks = tasks.filter((t) => t.date === todayDate);

    let aiReviewData = undefined;
    try {
      const res = await fetch("/api/ai/daily-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          tasks: todayTasks,
          checkInAnswers: cData,
          stats: todayStats
        })
      });
      const data = await res.json();
      if (data.success) {
        aiReviewData = {
          review: data.review,
          whatWentWell: data.whatWentWell || [],
          needsAttention: data.needsAttention || [],
          tomorrowRecommendation: data.tomorrowRecommendation || [],
          productivityScore: data.productivityScore || 80
        };
      }
    } catch (e) {
      console.warn("AI review call fallback:", e);
    }

    const newCheckIn: DailyCheckIn = {
      ...cData,
      id,
      createdAt: new Date().toISOString(),
      aiReview: aiReviewData
    };

    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => c.date !== todayDate)]);
    return newCheckIn;
  };

  // AI Task Prioritization
  const runAIPrioritization = async (): Promise<AIPriorityResponse | null> => {
    setIsAIPrioritizing(true);
    try {
      const res = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          projects,
          todayDate
        })
      });
      const data = await res.json();
      if (data.success) {
        const result: AIPriorityResponse = {
          categories: data.categories || data.recommendations || [],
          insights: data.insights || [],
          alerts: data.alerts || [],
          summaryReasoning: data.summaryReasoning || "Prioritas diurutkan secara optimal berdasarkan urgensi dan batas waktu."
        };
        setAiPriorityData(result);
        return result;
      }
      return null;
    } catch (err) {
      console.error("Prioritization error:", err);
      return null;
    } finally {
      setIsAIPrioritizing(false);
    }
  };

  // Apply AI Prioritization back into Task items
  const applyAIPriorities = () => {
    if (!aiPriorityData) return;
    const itemMap = new Map<string, { tier: any; reason: string; score: number }>();
    aiPriorityData.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        itemMap.set(item.taskId, {
          tier: cat.tier,
          reason: item.reason,
          score: item.priorityScore
        });
      });
    });

    setTasks((prev) =>
      prev.map((t) => {
        const aiInfo = itemMap.get(t.id);
        if (aiInfo) {
          return {
            ...t,
            aiTier: aiInfo.tier,
            aiReason: aiInfo.reason
          };
        }
        return t;
      })
    );
  };

  // AI Insights
  const fetchAIInsights = async () => {
    setIsAIInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          projects,
          todayDate,
          stats: todayStats
        })
      });
      const data = await res.json();
      if (data.success && data.insights) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.error("AI insights error:", e);
    } finally {
      setIsAIInsightsLoading(false);
    }
  };

  // Calculate Today's Stats & Productivity Score
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === todayDate), [tasks, todayDate]);

  const todayStats = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.status === "Selesai").length;
    const pending = total - completed;
    const overdue = todayTasks.filter(
      (t) => t.status !== "Selesai" && t.deadline && new Date(t.deadline).getTime() < new Date(todayDate).getTime()
    ).length;
    const urgent = todayTasks.filter(
      (t) => t.status !== "Selesai" && (t.priority === "Critical" || t.priority === "Urgent")
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalWorkMinutes = todayTasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0);
    const remainingWorkMinutes = todayTasks
      .filter((t) => t.status !== "Selesai")
      .reduce((acc, t) => acc + Math.max(0, (t.estimatedDuration || 0) - (t.actualDuration || 0)), 0);

    return {
      total,
      completed,
      pending,
      overdue,
      urgent,
      completionRate,
      totalWorkMinutes,
      remainingWorkMinutes
    };
  }, [todayTasks, todayDate]);

  const scoreBreakdown = useMemo(
    () => calculateProductivityScore(tasks, todayDate, settings.dailyWorkHoursGoal),
    [tasks, todayDate, settings.dailyWorkHoursGoal]
  );

  // Notifications
  const notifications = useMemo(() => {
    const list: { id: string; title: string; message: string; type: "urgent" | "overdue" | "deadline" | "info"; taskId?: string }[] = [];

    // Overdue tasks
    const overdueTasks = tasks.filter(
      (t) => t.status !== "Selesai" && t.deadline && new Date(t.deadline).getTime() < new Date(todayDate).getTime()
    );
    if (overdueTasks.length > 0) {
      list.push({
        id: "notif-overdue",
        title: "Pekerjaan Overdue",
        message: `Ada ${overdueTasks.length} pekerjaan yang telah melewati batas deadline!`,
        type: "overdue"
      });
    }

    // Urgent tasks today
    const urgentToday = todayTasks.filter(
      (t) => t.status !== "Selesai" && (t.priority === "Critical" || t.priority === "Urgent")
    );
    if (urgentToday.length > 0) {
      list.push({
        id: "notif-urgent",
        title: "Tugas Urgent & Kritis",
        message: `Kamu memiliki ${urgentToday.length} task urgent hari ini yang membutuhkan fokus segera.`,
        type: "urgent"
      });
    }

    // Tomorrow deadlines
    const tomorrow = new Date(new Date(todayDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dueTomorrow = tasks.filter((t) => t.status !== "Selesai" && t.deadline === tomorrow);
    dueTomorrow.forEach((t) => {
      list.push({
        id: `notif-tomorrow-${t.id}`,
        title: "Deadline Besok",
        message: `"${t.title}" memiliki deadline besok (${tomorrow}).`,
        type: "deadline",
        taskId: t.id
      });
    });

    return list.filter((n) => !dismissedNotificationIds.includes(n.id));
  }, [tasks, todayTasks, todayDate, dismissedNotificationIds]);

  const clearNotification = (id: string) => {
    setDismissedNotificationIds((prev) => [...prev, id]);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_TASKS);
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_CHECKINS);
    } catch (e) {
      console.error(e);
    }
    setTasks([]);
    setProjects([]);
    setCheckIns([]);
    setAiPriorityData(null);
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_TASKS);
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_CHECKINS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
    } catch (e) {
      console.error(e);
    }
    setTasks([]);
    setProjects([]);
    setCheckIns([]);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    setAiPriorityData(null);
  };

  return (
    <WorkContext.Provider
      value={{
        tasks,
        projects,
        categories,
        checkIns,
        settings,
        todayDate,
        setTodayDate,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        setTaskStatus,
        toggleSubTask,
        addSubTask,
        reorderTasks,
        addProject,
        updateProject,
        deleteProject,
        addCategory,
        deleteCategory,
        saveCheckIn,
        activeTimer,
        startTimer,
        pauseTimer,
        stopTimer,
        aiPriorityData,
        isAIPrioritizing,
        runAIPrioritization,
        applyAIPriorities,
        aiInsights,
        fetchAIInsights,
        isAIInsightsLoading,
        scoreBreakdown,
        todayStats,
        notifications,
        clearNotification,
        isQuickAddOpen,
        openQuickAdd: () => setIsQuickAddOpen(true),
        closeQuickAdd: () => setIsQuickAddOpen(false),
        selectedTaskForDetail,
        setSelectedTaskForDetail,
        updateSettings,
        clearAllData,
        resetAllData,
        resetData: resetAllData
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error("useWork must be used within a WorkProvider");
  }
  return context;
};
