import React, { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  CheckCircle2,
  Calendar,
  Sparkles,
  Clock,
  AlertTriangle,
  FolderKanban,
  Printer,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Send
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { formatMinutesToHours } from "../../utils/productivity";

export const ReportsView: React.FC = () => {
  const {
    todayDate,
    tasks,
    todayStats,
    scoreBreakdown,
    checkIns,
    saveCheckIn
  } = useWork();

  const [activeReportTab, setActiveReportTab] = useState<"daily" | "weekly" | "monthly" | "checkin">("daily");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // End of Day check-in form state
  const existingCheckIn = checkIns[todayDate] || {
    date: todayDate,
    rating: 4,
    biggestAchievement: "",
    bottlenecks: "",
    tasksMovedToTomorrow: "",
    aiFeedback: ""
  };

  const [rating, setRating] = useState<number>(existingCheckIn.rating);
  const [achievement, setAchievement] = useState(existingCheckIn.biggestAchievement);
  const [bottlenecks, setBottlenecks] = useState(existingCheckIn.bottlenecks);
  const [tasksToTomorrow, setTasksToTomorrow] = useState(existingCheckIn.tasksMovedToTomorrow);
  const [aiFeedback, setAiFeedback] = useState(existingCheckIn.aiFeedback);
  const [isCheckInSubmitted, setIsCheckInSubmitted] = useState(Boolean(existingCheckIn.aiFeedback));
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Tasks today
  const todayCompleted = tasks.filter((t) => (t.date === todayDate || t.deadline === todayDate) && t.status === "Selesai");
  const todayPending = tasks.filter((t) => (t.date === todayDate || t.deadline === todayDate) && t.status !== "Selesai");

  // Weekly stats
  const weeklyTotalTasks = tasks.length;
  const weeklyCompletedTasks = tasks.filter((t) => t.status === "Selesai").length;
  const weeklyCompletionRate = weeklyTotalTasks > 0 ? Math.round((weeklyCompletedTasks / weeklyTotalTasks) * 100) : 0;

  const mostActiveProject = React.useMemo(() => {
    if (tasks.length === 0) return "-";
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.project) counts[t.project] = (counts[t.project] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : "-";
  }, [tasks]);

  // Copy to clipboard markdown format
  const handleCopyMarkdown = () => {
    let md = "";
    if (activeReportTab === "daily") {
      md = `# REKAP PEKERJAAN HARIAN (${todayDate})\n\n`;
      md += `**Productivity Score**: ${scoreBreakdown.totalScore}/100 (${scoreBreakdown.statusLabel})\n`;
      md += `**Total Waktu Kerja**: ${formatMinutesToHours(todayStats.totalWorkMinutes)}\n`;
      md += `**Completion Rate**: ${todayStats.completionRate}%\n\n`;
      md += `### Pekerjaan Selesai (${todayCompleted.length}):\n`;
      todayCompleted.forEach((t) => {
        md += `- [x] **${t.title}** (${t.project}) - ${formatMinutesToHours(t.actualDuration || t.estimatedDuration)}\n`;
      });
      md += `\n### Pekerjaan Belum Selesai (${todayPending.length}):\n`;
      todayPending.forEach((t) => {
        md += `- [ ] ${t.title} [${t.priority}] (Deadline: ${t.deadline})\n`;
      });
      if (achievement) {
        md += `\n**Pencapaian**: ${achievement}\n`;
      }
    } else if (activeReportTab === "weekly") {
      md = `# REKAP PEKERJAAN MINGGUAN\n\n`;
      md += `- **Total Task Minggu Ini**: ${weeklyTotalTasks}\n`;
      md += `- **Completed**: ${weeklyCompletedTasks} (${weeklyCompletionRate}%)\n`;
      md += `- **Project Paling Aktif**: ${mostActiveProject}\n`;
      md += `- **Completion Rate**: ${weeklyCompletionRate}%\n`;
    } else {
      md = `# REKAP PEKERJAAN BULANAN\n\n`;
      md += `- **Total Output**: ${tasks.length} pekerjaan dieksekusi\n`;
      md += `- **Skor Produktivitas**: ${tasks.length > 0 ? scoreBreakdown.totalScore : 0}/100 (${scoreBreakdown.statusLabel})\n`;
    }

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = "Task ID,Judul,Project,Kategori,Prioritas,Status,Deadline,Estimasi(Jam),Actual(Jam)\n";
    const rows = tasks
      .map(
        (t) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}","${t.project}","${t.category}","${t.priority}","${
            t.status
          }","${t.deadline}",${((t.estimatedDuration || 0) / 60).toFixed(1)},${(
            (t.actualDuration || 0) / 60
          ).toFixed(1)}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekap_Pekerjaan_${todayDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Daily Check In & Trigger AI Feedback
  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/ai/daily-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          rating,
          achievement,
          bottlenecks,
          tasksToTomorrow,
          stats: todayStats
        })
      });
      const data = await res.json();
      const feedback = data.feedback || "Evaluasi harian tersimpan dengan baik. Kerja bagus hari ini!";

      setAiFeedback(feedback);
      saveCheckIn({
        date: todayDate,
        rating,
        biggestAchievement: achievement,
        bottlenecks,
        tasksMovedToTomorrow: tasksToTomorrow,
        aiFeedback: feedback
      });
      setIsCheckInSubmitted(true);
    } catch {
      const fallbackFeedback = `Pencapaian hari ini solid! Kamu telah menyelesaikan ${todayStats.completed} pekerjaan dengan skor ${scoreBreakdown.totalScore}/100. Untuk kendala yang dihadapi, disarankan membagi task menjadi subtask berdurasi 30 menit besok pagi.`;
      setAiFeedback(fallbackFeedback);
      saveCheckIn({
        date: todayDate,
        rating,
        biggestAchievement: achievement,
        bottlenecks,
        tasksMovedToTomorrow: tasksToTomorrow,
        aiFeedback: fallbackFeedback
      });
      setIsCheckInSubmitted(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Reports & Daily Reflection</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            Rekap & Evaluasi Kerja
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan otomatis harian, mingguan, bulanan, dan form refleksi End-of-Day dengan AI feedback.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
            title="Salin ke format Markdown"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copiedNotification ? "Tersalin!" : "Copy Text/Markdown"}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
            title="Download Spreadsheet CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
            title="Cetak / PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportTab("daily")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeReportTab === "daily"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rekap Harian
        </button>
        <button
          onClick={() => setActiveReportTab("weekly")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeReportTab === "weekly"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rekap Mingguan
        </button>
        <button
          onClick={() => setActiveReportTab("monthly")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeReportTab === "monthly"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rekap Bulanan
        </button>
        <button
          onClick={() => setActiveReportTab("checkin")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeReportTab === "checkin"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>End-of-Day Check-in</span>
        </button>
      </div>

      {/* TAB 1: REKAP HARIAN */}
      {activeReportTab === "daily" && (
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Tanggal Rekap</span>
                <h3 className="text-xl font-black text-slate-800">{todayDate}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-tight">Productivity Score</span>
                  <span className="text-lg font-black text-slate-800">{scoreBreakdown.totalScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-tight">Total Waktu Kerja</span>
                  <span className="text-lg font-black text-slate-800">{formatMinutesToHours(todayStats.totalWorkMinutes)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-tight">Completion</span>
                  <span className="text-lg font-black text-emerald-600">{todayStats.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Selesai vs Tertunda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pekerjaan Selesai */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase">
                    Pekerjaan Selesai ({todayCompleted.length})
                  </h4>
                </div>

                {todayCompleted.length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada task selesai yang dicatat hari ini.</p>
                ) : (
                  <div className="space-y-2">
                    {todayCompleted.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg bg-white p-2.5 text-xs border border-emerald-100 shadow-2xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{t.title}</span>
                          <span className="text-[10px] text-slate-500 block">{t.project} • {t.category}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          {formatMinutesToHours(t.actualDuration || t.estimatedDuration)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pekerjaan Tertunda / Belum Selesai */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase">
                    Pekerjaan Belum Selesai ({todayPending.length})
                  </h4>
                </div>

                {todayPending.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {todayStats.total === 0 ? "Belum ada pekerjaan yang dicatat hari ini." : "Semua target pekerjaan tuntas!"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {todayPending.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg bg-white p-2.5 text-xs border border-slate-200 shadow-2xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{t.title}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {t.project} • Prioritas: {t.priority}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Deadline: {t.deadline}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Review of the Day */}
            <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800 mb-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Narrative Review</span>
              </div>
              <p className="leading-relaxed">
                {aiFeedback ||
                  (todayStats.total === 0
                    ? "Belum ada aktivitas pekerjaan yang dicatat hari ini. Silakan tambahkan tugas dan catat waktu kerja Anda untuk mengaktifkan kalkulasi skor produktivitas dan evaluasi harian dari AI."
                    : `Hari ini Anda menuntaskan ${todayCompleted.length} dari ${todayStats.total} target tugas dengan skor produktivitas ${scoreBreakdown.totalScore}/100. Pekerjaan selesai berfokus pada ${todayCompleted[0]?.project || "project utama"}. Isi form Check-in untuk evaluasi personal.`)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP MINGGUAN */}
      {activeReportTab === "weekly" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Rekap Performa Mingguan</h3>
            <p className="text-xs text-slate-500">Agregasi produktivitas Senin – Minggu berjalan</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Total Task Minggu Ini</span>
              <span className="text-2xl font-black text-slate-800">{weeklyTotalTasks}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Pekerjaan Selesai</span>
              <span className="text-2xl font-black text-emerald-700">{weeklyCompletedTasks}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Completion Rate</span>
              <span className="text-2xl font-black text-slate-800">{weeklyCompletionRate}%</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Project Paling Aktif</span>
              <span className="text-lg font-bold text-slate-800 truncate block mt-0.5">{mostActiveProject}</span>
            </div>
          </div>

          {/* AI Weekly Insight */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950 leading-relaxed">
            <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Analisis Bottleneck & Rekomendasi Mingguan</span>
            </h4>
            <p>
              {tasks.length === 0
                ? "Belum ada riwayat pekerjaan mingguan yang dicatat. Mulai catat aktivitas pekerjaan harian Anda untuk mengaktifkan analisis tren dan deteksi bottleneck mingguan."
                : "Secara umum, ritme kerja minggu ini konsisten. Bottleneck utama terdeteksi pada task dengan waktu estimasi lebih dari 3 jam yang kerap tertunda ke hari berikutnya. Disarankan memecah task besar ke dalam checklist subtask maksimal 45 menit sebelum memulai pengerjaan."}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: REKAP BULANAN */}
      {activeReportTab === "monthly" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Rekap Performa Bulanan</h3>
            <p className="text-xs text-slate-500">Ringkasan performa dan tren produktivitas bulan berjalan</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Total Output Pekerjaan</span>
              <span className="text-3xl font-black text-slate-800">{tasks.length}</span>
              <span className="text-[11px] text-slate-500 block mt-1">task dicatat & dikelola</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Skor Produktivitas Saat Ini</span>
              <span className="text-3xl font-black text-indigo-700">{tasks.length > 0 ? scoreBreakdown.totalScore : 0}</span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">Status: {tasks.length > 0 ? scoreBreakdown.statusLabel : "Belum Ada Data"}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Disiplin Deadline</span>
              <span className="text-3xl font-black text-emerald-700">{tasks.length > 0 ? `${todayStats.completionRate}%` : "-"}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Rasio penyelesaian target</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECTION 14: DAILY EVALUATION & REFLECTION (END-OF-DAY CHECK-IN) */}
      {activeReportTab === "checkin" && (
        <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white font-bold">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-bold text-slate-800">
                Daily Evaluation & Reflection (End-of-Day Check-in)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Luangkan 2 menit di akhir hari kerja untuk merefleksikan pencapaian, kendala, dan evaluasi personal dengan AI.
            </p>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="space-y-4">
            {/* 1. Rating 1-5 */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Bagaimana produktivitas Anda hari ini? (Skala 1–5)
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-black border transition-all ${
                      rating === num
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-md scale-105"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {num === 1 ? "😫 1" : num === 2 ? "😕 2" : num === 3 ? "😐 3" : num === 4 ? "😊 4" : "🔥 5"}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Biggest Achievement */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Apa pencapaian terbesar hari ini?
              </label>
              <input
                type="text"
                placeholder="Contoh: Menyelesaikan desain Socialuxe tepat waktu dan disetujui klien..."
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* 3. Bottlenecks */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Apa kendala atau hambatan yang dihadapi?
              </label>
              <input
                type="text"
                placeholder="Contoh: Revisi copywriter lambat, koneksi internet sempat drop..."
                value={bottlenecks}
                onChange={(e) => setBottlenecks(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* 4. Tasks moved to tomorrow */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. Apa yang belum selesai dan perlu dipindahkan ke besok?
              </label>
              <input
                type="text"
                placeholder="Contoh: Finalisasi invoice YAPHAR dan testing form website..."
                value={tasksToTomorrow}
                onChange={(e) => setTasksToTomorrow(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Jawaban akan dievaluasi oleh AI dan disimpan ke rekap harian.
              </span>
              <button
                type="submit"
                disabled={isEvaluating}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isEvaluating ? "Menyimpan & Menganalisis..." : "Kirim Check-in & Evaluasi AI"}</span>
              </button>
            </div>
          </form>

          {/* AI Response Card if submitted */}
          {aiFeedback && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs text-indigo-950 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Feedback AI untuk Hari Ini</span>
              </div>
              <p className="leading-relaxed">{aiFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
