import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Flame,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Task } from "../../types";
import { TaskCard } from "../tasks/TaskCard";

export const AIAssistantView: React.FC = () => {
  const {
    tasks,
    runAIPrioritization,
    isAIPrioritizing,
    aiPrioritizedBuckets,
    aiChatMessages,
    sendAIChatMessage,
    isAIChatLoading,
    todayStats
  } = useWork();

  const [promptInput, setPromptInput] = useState("");

  const quickPrompts = [
    "Apa yang harus saya kerjakan sekarang?",
    "Urutkan task saya hari ini berdasarkan prioritas.",
    "Berapa persen produktivitas saya hari ini?",
    "Apakah ada task yang mendekati deadline?",
    "Buatkan rencana kerja untuk besok."
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isAIChatLoading) return;
    sendAIChatMessage(promptInput.trim());
    setPromptInput("");
  };

  const handleQuickPromptClick = (p: string) => {
    sendAIChatMessage(p);
  };

  // Buckets
  const doNowTasks = aiPrioritizedBuckets.doNow;
  const doNextTasks = aiPrioritizedBuckets.doNext;
  const scheduleTasks = aiPrioritizedBuckets.schedule;
  const delegateTasks = aiPrioritizedBuckets.delegate;
  const doLaterTasks = aiPrioritizedBuckets.doLater;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Trigger */}
      <div className="rounded-2xl border border-indigo-900 bg-indigo-950 text-white p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-tighter">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>AI Priority Logic & Personal Work Assistant</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Rekomendasi Prioritas & AI Workspace
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed opacity-90">
              Sistem menggunakan formula: <span className="font-bold text-white">Priority Score = Urgency + Importance + Deadline Proximity + Project Impact + Effort + Dependency</span>.
              AI mengelompokkan pekerjaan ke dalam 5 tier eksekusi lengkap dengan alasan logisnya.
            </p>
          </div>

          <button
            onClick={runAIPrioritization}
            disabled={isAIPrioritizing}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow transition-all active:scale-98 disabled:opacity-75"
          >
            <Sparkles className={`h-4 w-4 ${isAIPrioritizing ? "animate-spin" : ""}`} />
            <span>{isAIPrioritizing ? "Menganalisis Task..." : "✨ Analisis & Urutkan Task dengan AI"}</span>
          </button>
        </div>
      </div>

      {/* AI PRIORITY COLUMNS (Section 5 & 6) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">5 Kategori Hasil Analisis AI</h3>
            <p className="text-xs text-slate-500">
              Pekerjaan dikelompokkan berdasarkan tingkat urgensi eksekusi optimal hari ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. DO NOW */}
          <div className="flex flex-col rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
                <h4 className="text-xs font-black text-rose-900 uppercase">1. DO NOW</h4>
              </div>
              <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800">
                {doNowTasks.length}
              </span>
            </div>
            <p className="text-[10px] text-rose-800 font-medium mb-3">
              Task kritis, deadline sangat dekat, atau blocking task lain.
            </p>

            <div className="space-y-2.5 flex-1">
              {doNowTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-rose-200 p-4 text-center text-[11px] text-rose-600/70">
                  Tidak ada task kritis saat ini.
                </div>
              ) : (
                doNowTasks.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <TaskCard task={t} />
                    {t.aiReason && (
                      <div className="rounded-lg bg-white p-2.5 text-[10px] text-slate-600 border border-rose-200 shadow-2xs">
                        <span className="font-bold text-rose-700 block">Alasan AI:</span>
                        {t.aiReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. DO NEXT */}
          <div className="flex flex-col rounded-xl border border-orange-200 bg-orange-50/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-orange-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                <h4 className="text-xs font-black text-orange-900 uppercase">2. DO NEXT</h4>
              </div>
              <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-800">
                {doNextTasks.length}
              </span>
            </div>
            <p className="text-[10px] text-orange-800 font-medium mb-3">
              Task penting, deadline hari ini atau besok.
            </p>

            <div className="space-y-2.5 flex-1">
              {doNextTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-orange-200 p-4 text-center text-[11px] text-orange-600/70">
                  Kosong.
                </div>
              ) : (
                doNextTasks.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <TaskCard task={t} />
                    {t.aiReason && (
                      <div className="rounded-lg bg-white p-2.5 text-[10px] text-slate-600 border border-orange-200 shadow-2xs">
                        <span className="font-bold text-orange-700 block">Alasan AI:</span>
                        {t.aiReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. SCHEDULE */}
          <div className="flex flex-col rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <h4 className="text-xs font-black text-indigo-900 uppercase">3. SCHEDULE</h4>
              </div>
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                {scheduleTasks.length}
              </span>
            </div>
            <p className="text-[10px] text-indigo-800 font-medium mb-3">
              Task penting tetapi deadline masih beberapa hari lagi.
            </p>

            <div className="space-y-2.5 flex-1">
              {scheduleTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-indigo-200 p-4 text-center text-[11px] text-indigo-600/70">
                  Kosong.
                </div>
              ) : (
                scheduleTasks.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <TaskCard task={t} />
                    {t.aiReason && (
                      <div className="rounded-lg bg-white p-2.5 text-[10px] text-slate-600 border border-indigo-200 shadow-2xs">
                        <span className="font-bold text-indigo-700 block">Saran AI:</span>
                        {t.aiReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. DELEGATE / SIMPLIFY */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-slate-500" />
                <h4 className="text-xs font-black text-slate-800 uppercase">4. DELEGATE</h4>
              </div>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-700">
                {delegateTasks.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mb-3">
              Task yang bisa disederhanakan atau dikolaborasikan.
            </p>

            <div className="space-y-2.5 flex-1">
              {delegateTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-500">
                  Kosong.
                </div>
              ) : (
                delegateTasks.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <TaskCard task={t} />
                    {t.aiReason && (
                      <div className="rounded-lg bg-white p-2.5 text-[10px] text-slate-600 border border-slate-200 shadow-2xs">
                        <span className="font-bold text-slate-800 block">Saran AI:</span>
                        {t.aiReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. DO LATER */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-slate-400" />
                <h4 className="text-xs font-black text-slate-800 uppercase">5. DO LATER</h4>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700">
                {doLaterTasks.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mb-3">
              Task bernilai sekunder atau low priority.
            </p>

            <div className="space-y-2.5 flex-1">
              {doLaterTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400">
                  Kosong.
                </div>
              ) : (
                doLaterTasks.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <TaskCard task={t} />
                    {t.aiReason && (
                      <div className="rounded-lg bg-white p-2.5 text-[10px] text-slate-600 border border-slate-200 shadow-2xs">
                        <span className="font-bold text-slate-700 block">Saran AI:</span>
                        {t.aiReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 17: AI WORK COMMAND (CHAT / PROMPT ASSISTANT) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">AI Work Command Assistant</h3>
              <p className="text-[11px] text-slate-500">
                Tanyakan apa saja seputar pekerjaan, prioritas, evaluasi beban kerja, atau saran esok hari
              </p>
            </div>
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-tight text-slate-400">Prompt Cepat:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPromptClick(qp)}
              className="rounded px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="h-80 overflow-y-auto space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          {aiChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-indigo-600 text-white shadow-xs"
                }`}
              >
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div
                className={`max-w-xl rounded-xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span
                  className={`mt-1 block text-[9px] ${
                    msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isAIChatLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-700 p-2 font-semibold">
              <Sparkles className="h-4 w-4 animate-spin text-indigo-600" />
              <span>AI sedang memproses data pekerjaanmu...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan atau perintah untuk AI... (misal: 'Apa yang harus saya kerjakan sekarang?')"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
          <button
            type="submit"
            disabled={!promptInput.trim() || isAIChatLoading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
