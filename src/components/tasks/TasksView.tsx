import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  FolderKanban,
  Tag,
  List,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Task, TaskPriority, TaskStatus } from "../../types";
import { TaskCard } from "./TaskCard";
import { getPriorityBadge, getStatusBadge, getCategoryColor } from "../common/Badge";
import { formatMinutesToHours } from "../../utils/productivity";

interface TasksViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ searchQuery, setSearchQuery }) => {
  const {
    tasks,
    todayDate,
    projects,
    categories,
    openQuickAdd,
    setSelectedTaskForDetail,
    toggleTaskStatus,
    setTaskStatus
  } = useWork();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "deadline" | "title" | "duration">("priority");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filter calculations
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description || "").toLowerCase().includes(q);
        const matchProj = (t.project || "").toLowerCase().includes(q);
        const matchCat = (t.category || "").toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchProj && !matchCat && !matchTags) {
          return false;
        }
      }

      // Quick filter buttons
      const isOverdue =
        t.status !== "Selesai" &&
        t.deadline &&
        new Date(t.deadline).getTime() < new Date(todayDate).getTime();

      const tomorrowDate = new Date(new Date(todayDate).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      if (activeFilter === "today" && t.date !== todayDate && t.deadline !== todayDate) return false;
      if (activeFilter === "tomorrow" && t.deadline !== tomorrowDate) return false;
      if (activeFilter === "overdue" && !isOverdue) return false;
      if (activeFilter === "completed" && t.status !== "Selesai") return false;
      if (activeFilter === "urgent" && t.priority !== "Critical" && t.priority !== "Urgent") return false;
      if (activeFilter === "high" && t.priority !== "High") return false;

      // Dropdown filters
      if (selectedProject !== "all" && t.project !== selectedProject) return false;
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;

      return true;
    });
  }, [
    tasks,
    searchQuery,
    activeFilter,
    selectedProject,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    todayDate
  ]);

  // Sorting
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "priority") {
        const pMap: Record<string, number> = { Critical: 5, Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline || "9999").getTime() - new Date(b.deadline || "9999").getTime();
      }
      if (sortBy === "duration") {
        return (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
      }
      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks, sortBy]);

  const quickFilterPills = [
    { id: "all", label: "Semua" },
    { id: "today", label: "Hari Ini" },
    { id: "tomorrow", label: "Besok" },
    { id: "urgent", label: "Urgent & Critical" },
    { id: "overdue", label: "Overdue" },
    { id: "completed", label: "Selesai" }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <List className="h-3.5 w-3.5 text-slate-400" />
            <span>Daily Work Log & Management</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            Daftar Pekerjaan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {sortedTasks.length} pekerjaan terfilter dari {tasks.length} total catatan pekerjaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Tampilan Tabel / List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={openQuickAdd}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickFilterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                activeFilter === pill.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Project Filter */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="all">Semua Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Belum dimulai">Belum dimulai</option>
              <option value="In Progress">In Progress</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditunda">Ditunda</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="priority">Urut: Prioritas AI</option>
              <option value="deadline">Urut: Batas Deadline</option>
              <option value="duration">Urut: Estimasi Waktu</option>
              <option value="title">Urut: Nama Judul</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: List Table or Grid */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Plus className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Daftar Pekerjaan Kosong</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Belum ada data pekerjaan yang tersimpan. Tambahkan pekerjaan pertama Anda untuk mulai mengatur jadwal, deadline, dan alokasi waktu.
          </p>
          <button
            onClick={openQuickAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Pekerjaan Baru</span>
          </button>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <Filter className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada pekerjaan yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter di atas.
          </p>
          <button
            onClick={() => {
              setActiveFilter("all");
              setSelectedProject("all");
              setSelectedCategory("all");
              setSelectedPriority("all");
              setSelectedStatus("all");
              setSearchQuery("");
            }}
            className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        /* List / Table Mode */
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 text-[11px] uppercase tracking-tighter">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Judul Pekerjaan</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Prioritas</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Durasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  const statusBadge = getStatusBadge(task.status);
                  const isOverdue =
                    task.status !== "Selesai" &&
                    task.deadline &&
                    new Date(task.deadline).getTime() < new Date(todayDate).getTime();

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskForDetail(task)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`flex h-4 w-4 mx-auto items-center justify-center rounded border transition-colors ${
                            task.status === "Selesai"
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 hover:border-indigo-500 bg-white"
                          }`}
                        >
                          {task.status === "Selesai" && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                      </td>

                      {/* Title & Subtasks */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-slate-950">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                        )}
                        {task.aiTier && task.status !== "Selesai" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-1 border border-indigo-200">
                            <Sparkles className="h-2 w-2" />
                            {task.aiTier}
                          </span>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3 px-3 font-medium text-slate-700">
                        <span className="flex items-center gap-1 text-[11px]">
                          <FolderKanban className="h-3 w-3 text-slate-400" />
                          {task.project}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryColor(
                            task.category
                          )}`}
                        >
                          {task.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${priorityBadge.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dot}`} />
                          {task.priority}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold ${
                            isOverdue
                              ? "text-rose-600 font-bold"
                              : task.deadline === todayDate
                              ? "text-orange-600 font-bold"
                              : "text-slate-600"
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                          {task.deadline}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                        <span>{formatMinutesToHours(task.estimatedDuration)}</span>
                        {task.actualDuration > 0 && (
                          <span className="text-emerald-700 font-bold ml-1">
                            ({formatMinutesToHours(task.actualDuration)})
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown Quick Change */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none hover:border-slate-400 cursor-pointer"
                        >
                          <option value="Belum dimulai">Belum dimulai</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Ditunda">Ditunda</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
