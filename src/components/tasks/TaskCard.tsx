import React from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  FolderKanban,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { Task } from "../../types";
import { useWork } from "../../context/WorkContext";
import { getPriorityBadge, getStatusBadge, getCategoryColor } from "../common/Badge";
import { formatMinutesToHours } from "../../utils/productivity";

interface TaskCardProps {
  task: Task;
  showTimeSlot?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, showTimeSlot }) => {
  const {
    toggleTaskStatus,
    setSelectedTaskForDetail,
    activeTimer,
    startTimer,
    pauseTimer,
    todayDate
  } = useWork();

  const isOverdue =
    task.status !== "Selesai" &&
    task.deadline &&
    new Date(task.deadline).getTime() < new Date(todayDate).getTime();

  const priorityBadge = getPriorityBadge(task.priority);
  const statusBadge = getStatusBadge(task.status);
  const isTimerRunning = activeTimer?.taskId === task.id && activeTimer.isRunning;

  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;

  const priorityBorderClass =
    task.status === "Selesai"
      ? "border-slate-200 bg-slate-50/75 opacity-70"
      : isOverdue
      ? "border-l-4 border-l-rose-600 border border-rose-200 bg-rose-50/20"
      : task.priority === "Critical"
      ? "border-l-4 border-l-rose-500 border border-slate-200 bg-white"
      : task.priority === "Urgent"
      ? "border-l-4 border-l-orange-400 border border-slate-200 bg-white"
      : task.priority === "High"
      ? "border-l-4 border-l-indigo-400 border border-slate-200 bg-white"
      : task.priority === "Medium"
      ? "border-l-4 border-l-blue-400 border border-slate-200 bg-white"
      : "border-l-4 border-l-slate-300 border border-slate-200 bg-white";

  return (
    <div
      onClick={() => setSelectedTaskForDetail(task)}
      className={`group relative flex flex-col justify-between rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${priorityBorderClass}`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${priorityBadge.bg}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dot}`} />
              {task.priority}
            </span>

            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryColor(
                task.category
              )}`}
            >
              {task.category}
            </span>

            {task.project && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                <FolderKanban className="h-2.5 w-2.5 text-slate-400" />
                {task.project}
              </span>
            )}
          </div>

          {/* Quick Play/Pause Timer Button */}
          {task.status !== "Selesai" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isTimerRunning) {
                  pauseTimer();
                } else {
                  startTimer(task.id);
                }
              }}
              title={isTimerRunning ? "Jeda Timer" : "Mulai Timer"}
              className={`rounded-md p-1 transition-colors ${
                isTimerRunning
                  ? "bg-emerald-100 text-emerald-700 animate-pulse"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {isTimerRunning ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
            </button>
          )}
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskStatus(task.id);
            }}
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              task.status === "Selesai"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 hover:border-indigo-500 bg-white"
            }`}
          >
            {task.status === "Selesai" && <CheckCircle2 className="h-3 w-3" />}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-xs font-bold leading-snug text-slate-800 ${
                task.status === "Selesai" ? "line-through text-slate-400" : ""
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* AI Tier badge if assigned */}
        {task.aiTier && task.status !== "Selesai" && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 rounded px-2 py-0.5 border border-indigo-200 font-bold uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
            <span>{task.aiTier}</span>
          </div>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-2.5">
          {/* Deadline */}
          <span
            className={`flex items-center gap-1 font-semibold ${
              isOverdue
                ? "text-rose-600 font-bold"
                : task.deadline === todayDate
                ? "text-orange-600 font-bold"
                : "text-slate-500"
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="h-3 w-3 text-rose-500" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            {isOverdue ? "Overdue" : task.deadline}
          </span>

          {/* Duration */}
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3 text-slate-400" />
            {formatMinutesToHours(task.estimatedDuration)}
            {task.actualDuration > 0 && (
              <span className="text-emerald-700 font-bold">
                ({formatMinutesToHours(task.actualDuration)})
              </span>
            )}
          </span>
        </div>

        {/* Subtask count */}
        {totalSubtasks > 0 && (
          <span className="flex items-center gap-1 text-slate-400 font-semibold">
            <CheckSquare className="h-3 w-3" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}
      </div>
    </div>
  );
};
