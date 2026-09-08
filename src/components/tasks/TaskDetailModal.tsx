import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Trash2,
  Play,
  Square,
  Pause,
  AlertTriangle,
  Plus,
  Sparkles,
  Edit2,
  Tag
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Task, TaskPriority, TaskStatus } from "../../types";
import { getPriorityBadge, getStatusBadge, getCategoryColor } from "../common/Badge";
import { formatMinutesToHours } from "../../utils/productivity";

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskForDetail,
    setSelectedTaskForDetail,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleSubTask,
    addSubTask,
    projects,
    categories,
    activeTimer,
    startTimer,
    pauseTimer,
    stopTimer
  } = useWork();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("Belum dimulai");
  const [deadline, setDeadline] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [actualDuration, setActualDuration] = useState(0);
  const [category, setCategory] = useState("General");
  const [project, setProject] = useState("General");
  const [notes, setNotes] = useState("");
  const [timeSlot, setTimeSlot] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const task = selectedTaskForDetail;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setDeadline(task.deadline);
      setDate(task.date);
      setStartTime(task.startTime || "");
      setEndTime(task.endTime || "");
      setEstimatedDuration(task.estimatedDuration || 60);
      setActualDuration(task.actualDuration || 0);
      setCategory(task.category);
      setProject(task.project);
      setNotes(task.notes || "");
      setTimeSlot(task.timeSlot || "Morning");
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const isCurrentTimerRunning = activeTimer?.taskId === task.id && activeTimer.isRunning;
  const isCurrentTimerPaused = activeTimer?.taskId === task.id && !activeTimer.isRunning;

  const handleSaveEdit = () => {
    const updated: Task = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      deadline,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      estimatedDuration: Number(estimatedDuration),
      actualDuration: Number(actualDuration),
      category,
      project,
      notes: notes.trim(),
      timeSlot
    };
    updateTask(updated);
    setIsEditing(false);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    addSubTask(task.id, newSubtaskText.trim());
    setNewSubtaskText("");
  };

  const completedSubtasksCount = (task.subtasks || []).filter((st) => st.completed).length;
  const totalSubtasksCount = (task.subtasks || []).length;
  const subtaskProgress =
    totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const priorityBadge = getPriorityBadge(task.priority);
  const statusBadge = getStatusBadge(task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                task.status === "Selesai"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 hover:border-emerald-500"
              }`}
            >
              {task.status === "Selesai" && <CheckCircle2 className="h-4 w-4" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityBadge.bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dot}`} />
                  {task.priority}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusBadge.bg}`}>
                  {task.status}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`rounded-lg p-1.5 text-xs font-bold flex items-center gap-1 transition-colors ${
                isEditing ? "bg-indigo-100 text-indigo-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{isEditing ? "Batal Edit" : "Edit"}</span>
            </button>
            <button
              onClick={() => {
                if (confirm("Hapus pekerjaan ini?")) {
                  deleteTask(task.id);
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Hapus Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedTaskForDetail(null)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Task</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Belum dimulai">Belum dimulai</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditunda">Ditunda</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slot Waktu</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi (Menit)</label>
                <input
                  type="number"
                  step="10"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Catatan</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-bold text-slate-800 ${task.status === "Selesai" ? "line-through text-slate-400" : ""}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            {/* AI Recommendation Banner if available */}
            {task.aiTier && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Rekomendasi AI: {task.aiTier}</span>
                </div>
                <p className="text-indigo-700 text-[11px] leading-normal">{task.aiReason}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight block">Project</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <FolderKanban className="h-3 w-3 text-slate-500" />
                  {task.project}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight block">Deadline</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {task.deadline}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight block">Estimasi Waktu</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {formatMinutesToHours(task.estimatedDuration)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight block">Actual Time</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  {formatMinutesToHours(task.actualDuration || 0)}
                </span>
              </div>
            </div>

            {/* Live Time Tracker Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Pelacak Waktu Kerja (Live Timer)</h4>
                  <p className="text-[11px] text-slate-500">Mulai timer saat mengerjakan task untuk mencatat actual time secara presisi.</p>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrentTimerRunning ? (
                    <>
                      <button
                        onClick={pauseTimer}
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                      >
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={stopTimer}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Simpan Durasi</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startTimer(task.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isCurrentTimerPaused ? "Lanjutkan Timer" : "Mulai Kerjakan"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist / Subtasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800">Checklist & Subtask</h4>
                  {totalSubtasksCount > 0 && (
                    <span className="text-[11px] text-slate-500 font-bold">
                      ({completedSubtasksCount}/{totalSubtasksCount} selesai)
                    </span>
                  )}
                </div>
                {totalSubtasksCount > 0 && (
                  <span className="text-xs font-mono font-bold text-slate-700">{subtaskProgress}%</span>
                )}
              </div>

              {totalSubtasksCount > 0 && (
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-1.5 mb-3">
                {(task.subtasks || []).map((st) => (
                  <label
                    key={st.id}
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-xs cursor-pointer transition-colors ${
                      st.completed
                        ? "border-slate-200 bg-slate-50/70 text-slate-400 line-through"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubTask(task.id, st.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <span>{st.title}</span>
                  </label>
                ))}
              </div>

              {/* Add Subtask Input */}
              <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambahkan subtask baru..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Notes Section */}
            {task.notes && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Catatan Tambahan:</span>
                <p className="text-slate-600 whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
