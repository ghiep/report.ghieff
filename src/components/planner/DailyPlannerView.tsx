import React, { useState } from "react";
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar,
  MoveRight,
  ArrowUpDown
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Task } from "../../types";
import { TaskCard } from "../tasks/TaskCard";
import { formatMinutesToHours } from "../../utils/productivity";

export const DailyPlannerView: React.FC = () => {
  const {
    todayDate,
    tasks,
    updateTask,
    openQuickAdd,
    todayStats
  } = useWork();

  const todayTasks = tasks.filter((t) => t.date === todayDate);

  const morningTasks = todayTasks.filter((t) => (t.timeSlot || "Morning") === "Morning");
  const afternoonTasks = todayTasks.filter((t) => t.timeSlot === "Afternoon");
  const eveningTasks = todayTasks.filter((t) => t.timeSlot === "Evening");

  const calcSlotMinutes = (slotTasks: Task[]) =>
    slotTasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);

  const moveSlot = (task: Task, newSlot: "Morning" | "Afternoon" | "Evening") => {
    updateTask({ ...task, timeSlot: newSlot });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Time-Blocking & Schedule</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            Daily Planner — {todayDate}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur pekerjaan harianmu ke dalam blok waktu Morning, Afternoon, dan Evening untuk fokus optimal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openQuickAdd}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah ke Jadwal</span>
          </button>
        </div>
      </div>

      {/* Progress & Time summary banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-tight">Total Pekerjaan</span>
            <p className="text-lg font-black text-slate-800">{todayTasks.length} task</p>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-tight">Selesai</span>
            <p className="text-lg font-black text-emerald-700">{todayStats.completed} task</p>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-tight">Total Jam Direncanakan</span>
            <p className="text-lg font-black text-slate-800">
              {formatMinutesToHours(
                todayTasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0)
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">Completion: {todayStats.completionRate}%</span>
            <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${todayStats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Column Time-Blocking (Morning, Afternoon, Evening) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Morning Column */}
        <div className="flex flex-col rounded-xl border border-amber-200/80 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Morning (Pagi)</h3>
                <span className="text-[10px] text-slate-500">08:00 – 12:00 • Deep Work</span>
              </div>
            </div>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {formatMinutesToHours(calcSlotMinutes(morningTasks))}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {morningTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada task di sesi pagi.
              </div>
            ) : (
              morningTasks.map((t) => (
                <div key={t.id} className="relative group">
                  <TaskCard task={t} />
                  {/* Move slot quick dropdown */}
                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-md p-1 border border-slate-200 shadow text-[10px]">
                    <span className="text-slate-400 pl-1">Pindah ke:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Afternoon");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Siang
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Evening");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Sore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Afternoon Column */}
        <div className="flex flex-col rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Sunset className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Afternoon (Siang)</h3>
                <span className="text-[10px] text-slate-500">13:00 – 16:30 • Collaboration & Execution</span>
              </div>
            </div>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
              {formatMinutesToHours(calcSlotMinutes(afternoonTasks))}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {afternoonTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada task di sesi siang.
              </div>
            ) : (
              afternoonTasks.map((t) => (
                <div key={t.id} className="relative group">
                  <TaskCard task={t} />
                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-md p-1 border border-slate-200 shadow text-[10px]">
                    <span className="text-slate-400 pl-1">Pindah ke:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Morning");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Pagi
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Evening");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Sore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evening Column */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white shadow-xs">
                <Moon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Evening (Sore/Malam)</h3>
                <span className="text-[10px] text-slate-500">16:30 – 20:00 • Review & Learning</span>
              </div>
            </div>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {formatMinutesToHours(calcSlotMinutes(eveningTasks))}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {eveningTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada task di sesi sore/malam.
              </div>
            ) : (
              eveningTasks.map((t) => (
                <div key={t.id} className="relative group">
                  <TaskCard task={t} />
                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-md p-1 border border-slate-200 shadow text-[10px]">
                    <span className="text-slate-400 pl-1">Pindah ke:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Morning");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Pagi
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlot(t, "Afternoon");
                      }}
                      className="rounded hover:bg-slate-100 px-1 font-semibold text-slate-700"
                    >
                      Siang
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
