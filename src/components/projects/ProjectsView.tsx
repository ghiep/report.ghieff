import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  X
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Project, TaskPriority } from "../../types";
import { formatMinutesToHours } from "../../utils/productivity";
import { TaskCard } from "../tasks/TaskCard";

export const ProjectsView: React.FC = () => {
  const { projects, addProject, tasks, todayDate } = useWork();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // New project form state
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjDeadline, setNewProjDeadline] = useState("2026-09-30");
  const [newProjPriority, setNewProjPriority] = useState<TaskPriority>("High");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const colors = ["#4f46e5", "#0891b2", "#d97706", "#059669", "#dc2626", "#7c3aed"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addProject({
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      deadline: newProjDeadline,
      priority: newProjPriority,
      color: randomColor
    });

    setNewProjName("");
    setNewProjDesc("");
    setIsAddProjectModalOpen(false);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Calculate stats for all projects
  const projectsWithStats = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.project.toLowerCase() === p.name.toLowerCase());
    const total = pTasks.length;
    const completed = pTasks.filter((t) => t.status === "Selesai").length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalWorkMinutes = pTasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0);

    // AI slow alert check
    const isNearDeadline =
      p.deadline &&
      new Date(p.deadline).getTime() - new Date(todayDate).getTime() < 5 * 24 * 60 * 60 * 1000;
    const isSlow = progress < 50 && isNearDeadline;

    return {
      ...p,
      tasks: pTasks,
      total,
      completed,
      pending,
      progress,
      totalWorkMinutes,
      isNearDeadline,
      isSlow
    };
  });

  const activeProjectStats = projectsWithStats.find((p) => p.id === activeProject?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
            <span>Multi-Project Workspace</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            Manajemen Project
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau progress eksekusi, total working hours, deadline, dan insight AI per project.
          </p>
        </div>

        <button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>+ Project Baru</span>
        </button>
      </div>

      {/* Projects Grid Overview */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Belum Ada Project</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Buat project baru untuk mengelompokkan pekerjaan, menetapkan deadline target, dan memantau progres secara terstruktur.
          </p>
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Buat Project Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsWithStats.map((p) => {
            const isSelected = p.id === activeProject?.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`rounded-xl border p-4.5 cursor-pointer transition-all ${
                  isSelected
                    ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: p.color || "#4f46e5" }}
                    />
                    <h3 className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>
                      {p.name}
                    </h3>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      isSelected
                        ? "bg-slate-700 text-slate-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {p.priority}
                  </span>
                </div>

                {p.description && (
                  <p
                    className={`text-xs mt-2 line-clamp-2 ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {p.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className={isSelected ? "text-slate-300" : "text-slate-500"}>Progress</span>
                    <span className={isSelected ? "text-indigo-300 font-bold" : "text-slate-800 font-bold"}>
                      {p.progress}%
                    </span>
                  </div>
                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${
                      isSelected ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta stats */}
                <div
                  className={`mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-[11px] ${
                    isSelected ? "border-slate-700 text-slate-300" : "border-slate-100 text-slate-600"
                  }`}
                >
                  <div>
                    <span className="block text-[10px] font-bold uppercase opacity-70 tracking-tight">Task</span>
                    <span className="font-bold">
                      {p.completed}/{p.total}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase opacity-70 tracking-tight">Waktu Kerja</span>
                    <span className="font-bold">{formatMinutesToHours(p.totalWorkMinutes)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase opacity-70 tracking-tight">Deadline</span>
                    <span className="font-bold truncate block">{p.deadline || "-"}</span>
                  </div>
                </div>

                {/* AI Alert if slow */}
                {p.isSlow && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 p-2 text-[10px] text-rose-200">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>AI Alert: Progress lambat mendekati deadline!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Project Deep Dive & Tasks */}
      {activeProjectStats && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: activeProjectStats.color }}
                />
                <h3 className="text-lg font-bold text-slate-800">{activeProjectStats.name}</h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {activeProjectStats.total} pekerjaan terdaftar
                </span>
              </div>
              {activeProjectStats.description && (
                <p className="text-xs text-slate-500 mt-1">{activeProjectStats.description}</p>
              )}
            </div>

            {/* AI Project Insight Box */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950 max-w-md">
              <div className="flex items-center gap-1 font-bold text-indigo-900 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>AI Project Assessment</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {activeProjectStats.progress >= 80
                  ? "Project ini berjalan sangat mulus! Sisa task dapat dialokasikan ke tahap final review atau QA."
                  : activeProjectStats.isSlow
                  ? "Peringatan: Tingkat penyelesaian masih di bawah 50% mendekati tanggal jatuh tempo. Disarankan mendelegasikan atau memprioritaskan task kritis hari ini."
                  : "Ritme pengerjaan project stabil. Pastikan task dengan prioritas High/Critical diselesaikan lebih dulu sebelum deadline."}
              </p>
            </div>
          </div>

          {/* Project Task List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Task di Project {activeProjectStats.name}
            </h4>

            {activeProjectStats.tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada task yang dikaitkan ke project ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeProjectStats.tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800">Tambah Project Baru</h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Project
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Redesign Mobile App"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Objektif
                </label>
                <textarea
                  rows={2}
                  placeholder="Tujuan atau cakupan project..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prioritas Project
                  </label>
                  <select
                    value={newProjPriority}
                    onChange={(e) => setNewProjPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Simpan Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
