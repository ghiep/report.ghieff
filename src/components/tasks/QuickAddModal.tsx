import React, { useState } from "react";
import { X, Clock, Calendar, Tag, FolderKanban, AlertCircle, Plus, Check } from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { TaskPriority } from "../../types";

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    addTask,
    projects,
    categories,
    todayDate
  } = useWork();

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(todayDate);
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [priority, setPriority] = useState<TaskPriority>("High");
  const [project, setProject] = useState(projects[0]?.name || "Socialuxe");
  const [category, setCategory] = useState("Design");
  const [notes, setNotes] = useState("");
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const [timeSlot, setTimeSlot] = useState<"Morning" | "Afternoon" | "Evening">("Morning");

  if (!isQuickAddOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: "st-" + Date.now(), title: newSubtaskInput.trim(), completed: false }
    ]);
    setNewSubtaskInput("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const estMinutes = Math.max(15, Math.round(parseFloat(estimatedHours || "1") * 60));

    addTask({
      title: title.trim(),
      description: notes.trim(),
      date: todayDate,
      estimatedDuration: estMinutes,
      actualDuration: 0,
      status: "Belum dimulai",
      priority,
      deadline: deadline || todayDate,
      category: category || "Other",
      project: project || "General",
      tags: [category.toLowerCase()],
      notes: notes.trim(),
      subtasks,
      timeSlot,
      aiTier: priority === "Critical" || priority === "Urgent" ? "DO NOW" : priority === "High" ? "DO NEXT" : "SCHEDULE",
      aiReason: "Task baru ditambahkan, siap dianalisis sistem prioritas."
    });

    // Reset Form
    setTitle("");
    setNotes("");
    setSubtasks([]);
    setEstimatedHours("1");
    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Tambah Pekerjaan Baru</h2>
            <p className="text-xs text-slate-500">Catat detail task untuk diatur dalam agenda harian & prioritas AI</p>
          </div>
          <button
            onClick={closeQuickAdd}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Task */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pekerjaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Revisi desain Instagram Socialuxe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Grid 2 Column for Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project
              </label>
              <div className="relative">
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="General">General / Lainnya</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="Critical">🔴 Critical (Sangat Mendesak & Penting)</option>
                <option value="Urgent">🟠 Urgent (Segera Dikerjakan)</option>
                <option value="High">🟡 High (Prioritas Tinggi)</option>
                <option value="Medium">🔵 Medium (Normal)</option>
                <option value="Low">⚪ Low (Bisa Terakhir)</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {/* Estimasi Durasi (Jam) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Waktu (Jam)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.25"
                max="24"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {/* Time Slot (Daily Planner) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slot Waktu (Daily Planner)
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="Morning">Morning (Pagi)</option>
                <option value="Afternoon">Afternoon (Siang)</option>
                <option value="Evening">Evening (Sore/Malam)</option>
              </select>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Checklist / Subtask (Opsional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Tambahkan subtask (misal: Review feedback client)..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                + Tambah
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-800 border border-slate-200"
                  >
                    <span>{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              rows={2}
              placeholder="Revisi berdasarkan feedback client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
