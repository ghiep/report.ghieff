import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// 1. AI Task Prioritization & Auto-sort
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { tasks, projects, todayDate } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Heuristic fallback prioritizing algorithm
      return res.json({
        success: true,
        source: "algorithmic",
        recommendations: generateAlgorithmicPrioritization(tasks || [], todayDate || new Date().toISOString().split("T")[0]),
        insights: [
          "Urutan dianalisis berdasarkan bobot Urgency + Importance + Deadline Proximity + Project Impact.",
          "Fokus pada task berstatus Overdue dan High Priority sebelum menambahkan task baru."
        ],
        alerts: generateAlgorithmicAlerts(tasks || [], todayDate || new Date().toISOString().split("T")[0])
      });
    }

    const prompt = `Anda adalah AI Work Assistant and Productivity Expert untuk aplikasi Daily Work Management.
Tugas Anda adalah menganalisis daftar pekerjaan berikut dan menghasilkan rekomendasi prioritas serta pengelompokan yang cerdas.

Tanggal Hari Ini: ${todayDate || new Date().toISOString().split("T")[0]}
Daftar Pekerjaan Saat Ini:
${JSON.stringify(tasks, null, 2)}

Proyek Aktif:
${JSON.stringify(projects || [], null, 2)}

Logika Penentuan Prioritas:
Priority Score = Urgensi + Kepentingan (Importance) + Kedekatan Deadline + Dampak Proyek + Estimasi Waktu + Ketergantungan (Dependency) + Status Overdue.
Kelompokkan task ke dalam 5 kategori:
1. "DO NOW" (🔴 Kerjakan Sekarang) - Task overdue, deadline hari ini/besok, atau blocker penting.
2. "DO NEXT" (🟠 Kerjakan Setelah Ini) - Task penting berikutnya atau quick wins dengan dampak tinggi.
3. "SCHEDULE" (🟡 Bisa Dijadwalkan) - Task penting tanpa deadline mendesak, jadwalkan waktu khusus.
4. "DELEGATE / OPTIONAL" (🔵 Delegasikan / Opsional) - Pekerjaan administratif atau yang bisa disederhanakan/didelegasikan.
5. "DO LATER" (🟢 Bisa Dikerjakan Terakhir) - Low impact, no deadline, kegiatan belajar non-kritis.

Berikan alasan terperinci untuk setiap task mengapa masuk kelompok tersebut.
Juga deteksi:
- Task yang terlalu lama tertunda atau overdue
- Task yang mendekati deadline bersamaan
- Task yang estimasi waktunya berisiko molor
- Task yang sebaiknya digabungkan atau dipecah jadi subtask

Kembalikan format JSON murni:
{
  "categories": [
    {
      "tier": "DO NOW",
      "label": "Kerjakan Sekarang",
      "color": "red",
      "items": [
        {
          "taskId": "id_task",
          "taskTitle": "judul",
          "reason": "alasan jelas dan spesifik",
          "suggestedSlot": "Pagi / Segera",
          "priorityScore": 95
        }
      ]
    },
    {
      "tier": "DO NEXT",
      "label": "Kerjakan Setelah Ini",
      "color": "amber",
      "items": []
    },
    {
      "tier": "SCHEDULE",
      "label": "Bisa Dijadwalkan",
      "color": "blue",
      "items": []
    },
    {
      "tier": "DELEGATE / OPTIONAL",
      "label": "Delegasikan / Opsional",
      "color": "purple",
      "items": []
    },
    {
      "tier": "DO LATER",
      "label": "Bisa Dikerjakan Terakhir",
      "color": "emerald",
      "items": []
    }
  ],
  "insights": [
    "string insight 1...",
    "string insight 2..."
  ],
  "alerts": [
    {
      "type": "overdue" | "deadline_cluster" | "time_risk" | "subtask_suggestion",
      "message": "deskripsi peringatan atau saran"
    }
  ],
  "summaryReasoning": "Ringkasan strategi eksekusi hari ini dalam 2-3 kalimat"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("AI Prioritize error:", err);
    // Fallback to algorithmic prioritization if Gemini call fails
    const { tasks, todayDate } = req.body;
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      recommendations: generateAlgorithmicPrioritization(tasks || [], todayDate || new Date().toISOString().split("T")[0]),
      insights: [
        "Sistem menggunakan optimasi heuristik cerdas untuk mengurutkan prioritas berdasarkan deadline dan bobot urgensi.",
      ],
      alerts: generateAlgorithmicAlerts(tasks || [], todayDate || new Date().toISOString().split("T")[0]),
      summaryReasoning: "Prioritaskan task overdue dan high priority di slot pagi, lalu lanjutkan ke task terjadwal."
    });
  }
});

// 2. AI Work Insights & Proactive Suggestions
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { tasks, projects, todayDate, stats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "algorithmic",
        insights: [
          `Kamu memiliki ${tasks.filter((t: any) => t.status !== "Selesai").length} task aktif. Fokus selesaikan task dengan deadline terdekat terlebih dahulu.`,
          "Kelompokkan pekerjaan sejenis (seperti Design atau Meeting) dalam satu batch time-block untuk mengurangi cognitive switching.",
          "Review subtask secara berkala untuk menjaga momentum progres harian."
        ],
        focusRecommendation: "Prioritaskan 2-3 pekerjaan kunci hari ini sebelum menerima distraksi atau task baru."
      });
    }

    const prompt = `Anda adalah Productivity Coach AI.
Analisis beban kerja dan metrik produktivitas pengguna:
Tanggal: ${todayDate}
Statistik: ${JSON.stringify(stats || {})}
Daftar Task: ${JSON.stringify(tasks || [])}
Daftar Proyek: ${JSON.stringify(projects || [])}

Berikan insight kerja yang tajam, motivatif, dan langsung bisa dieksekusi (actionable) dalam bahasa Indonesia:
1. Prioritas hari ini (top 2-3)
2. Task yang sebaiknya ditunda/dijadwalkan ulang
3. Analisis beban kerja (workload balance & category distribution)
4. Rekomendasi pembagian waktu (time blocking tips)

Kembalikan format JSON murni:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "focusRecommendation": "saran fokus utama hari ini",
  "workloadStatus": "Optimal" | "Heavy" | "Overloaded" | "Light",
  "suggestedTimeBlocking": [
    { "period": "Pagi (09:00 - 12:00)", "focus": "Deep Work / Urgent tasks", "suggestedTaskTitles": [] },
    { "period": "Siang (13:00 - 15:30)", "focus": "Collaboration / Execution", "suggestedTaskTitles": [] },
    { "period": "Sore (16:00 - 17:30)", "focus": "Admin / Review / Learning", "suggestedTaskTitles": [] }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("AI Insights error:", err);
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      insights: [
        "Selesaikan task overdue dan high priority sebelum memulai task baru.",
        "Gunakan teknik 25-minute Pomodoro untuk task dengan estimasi lebih dari 1 jam.",
        "Luangkan 10 menit di akhir hari untuk mengisi check-in evaluasi harian."
      ],
      focusRecommendation: "Fokus pada penyelesaian task utama di pagi hari saat energi paling optimal.",
      workloadStatus: "Optimal"
    });
  }
});

// 3. AI Work Command / Chat Assistant
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "algorithmic",
        reply: generateAlgorithmicChatReply(message, context)
      });
    }

    const systemPrompt = `Anda adalah "Aira", asisten pribadi cerdas untuk manajemen pekerjaan, produktivitas, dan perencanaan harian pengguna (Daily Work Assistant).
Karakter Anda: Profesional, ramah, to-the-point, sangat terstruktur, dan berorientasi pada aksi nyata.
Anda memiliki akses ke data pekerjaan pengguna:
${JSON.stringify(context || {}, null, 2)}

Instruksi Khusus:
1. Jika pengguna bertanya "mana yang harus dikerjakan dulu?", baca data task dan berikan rekomendasi berurutan dengan alasan yang kuat (deadline, urgensi, dampak).
2. Jika pengguna bertanya "mana pekerjaan yang bisa aku tunda?", cari task prioritas rendah (Medium/Low), deadline masih lama, atau kategori personal/learning.
3. Jika ditanya "Kenapa produktivitasku rendah?" atau "Project mana yang paling banyak menyita waktu?", analisis data actual duration dan completion rate.
4. Jawab dalam bahasa Indonesia yang elegan, jelas, gunakan bullet points yang rapi. Jangan bertele-tele.`;

    const chatMessages = (history || []).map((msg: any) => `${msg.role === "user" ? "Pengguna" : "Aira"}: ${msg.content}`).join("\n");
    const fullPrompt = `${systemPrompt}\n\nRiwayat Percakapan:\n${chatMessages}\n\nPengguna: ${message}\nAira:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
    });

    return res.json({
      success: true,
      source: "gemini",
      reply: response.text || "Maaf, saya tidak dapat memproses jawaban saat ini."
    });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      reply: generateAlgorithmicChatReply(req.body.message, req.body.context)
    });
  }
});

// 4. AI Daily Review & End-of-Day Evaluation
app.post("/api/ai/daily-review", async (req, res) => {
  try {
    const { date, tasks, checkInAnswers, stats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const completed = (tasks || []).filter((t: any) => t.status === "Selesai").length;
      const total = (tasks || []).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
      return res.json({
        success: true,
        source: "algorithmic",
        review: `Hari ini kamu telah menyelesaikan ${completed} dari ${total} pekerjaan (${rate}% completion rate). Tetap konsisten dan jadwalkan sisa pekerjaan untuk besok pagi.`,
        whatWentWell: [
          `${completed} pekerjaan berhasil diselesaikan dengan baik`,
          "Komitmen pencatatan waktu kerja tercatat rapi"
        ],
        needsAttention: [
          `${total - completed} pekerjaan belum selesai atau dijadwalkan ulang`,
          "Perhatikan alokasi istirahat agar tidak burnout"
        ],
        tomorrowRecommendation: [
          "Mulai hari dengan menyelesaikan sisa task hari ini",
          "Prioritaskan 2 pekerjaan utama di paruh pertama hari",
          "Batasi rapat yang tidak mendesak"
        ],
        productivityScore: Math.min(100, Math.max(40, rate + (completed > 4 ? 10 : 0)))
      });
    }

    const prompt = `Anda adalah Evaluator Produktivitas AI.
Buat tinjauan evaluasi harian (Daily Review) berdasarkan data berikut:
Tanggal: ${date}
Statistik Hari Ini: ${JSON.stringify(stats || {})}
Daftar Pekerjaan Hari Ini: ${JSON.stringify(tasks || [])}
Jawaban Check-In Akhir Hari dari Pengguna: ${JSON.stringify(checkInAnswers || {})}

Susun evaluasi yang objektif, menyemangati, dan praktis:
1. AI Daily Review (2-3 kalimat evaluasi menyeluruh)
2. What Went Well (pencapaian & hal positif)
3. Needs Attention (kendala, task tertunda, atau risiko)
4. Tomorrow Recommendation (langkah konkret untuk besok)
5. Productivity Score (0-100 dengan pertimbangan prioritas, completion rate, konsistensi)

Kembalikan format JSON murni:
{
  "review": "teks review...",
  "whatWentWell": ["poin 1", "poin 2"],
  "needsAttention": ["poin 1", "poin 2"],
  "tomorrowRecommendation": ["rekomendasi 1", "rekomendasi 2"],
  "productivityScore": 85
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("AI Daily Review error:", err);
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      review: "Produktivitas hari ini berjalan cukup baik dengan progres di beberapa target kunci. Evaluasi kembali task prioritas untuk dieksekusi besok.",
      whatWentWell: ["Pencatatan task tercatat rapi", "Fokus pada penyelesaian tugas harian"],
      needsAttention: ["Ada beberapa task yang butuh penyesuaian deadline"],
      tomorrowRecommendation: ["Selesaikan task overdue di slot pagi", "Jaga ritme kerja fokus"],
      productivityScore: 78
    });
  }
});

// 5. AI Weekly Review
app.post("/api/ai/weekly-review", async (req, res) => {
  try {
    const { weeklyData, stats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "algorithmic",
        weeklyReview: "Performa mingguan menunjukkan ritme kerja yang stabil. Kategori dengan output tertinggi berhasil mencapai target mingguan.",
        highlights: ["Konsistensi penyelesaian task di hari kerja", "Alokasi jam kerja produktif terjaga"],
        bottlenecks: ["Task di akhir pekan cenderung tertunda", "Beberapa task kompleks membutuhkan pembagian subtask lebih rinci"],
        nextWeekStrategy: ["Tentukan 3 Big Wins untuk minggu depan", "Review project yang mengalami perlambatan progres"]
      });
    }

    const prompt = `Anda adalah Senior Productivity Analyst.
Analisis data performa 7 hari terakhir:
Statistik Mingguan: ${JSON.stringify(stats || {})}
Data Task Mingguan: ${JSON.stringify(weeklyData || [])}

Berikan Weekly AI Review mencakup:
1. Ringkasan performa minggu ini
2. Pencapaian terbesar (Highlights)
3. Hambatan / Kendala yang terdeteksi (Bottlenecks)
4. Rekomendasi strategi minggu depan (Next Week Strategy)

Kembalikan format JSON murni:
{
  "weeklyReview": "ringkasan narasi...",
  "highlights": ["highlight 1", "highlight 2"],
  "bottlenecks": ["kendala 1", "kendala 2"],
  "nextWeekStrategy": ["strategi 1", "strategi 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("AI Weekly Review error:", err);
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      weeklyReview: "Secara keseluruhan minggu ini menghasilkan progres yang baik di proyek-proyek aktif.",
      highlights: ["Penyelesaian task konsisten", "Waktu kerja produktif terkontrol"],
      bottlenecks: ["Estimasi waktu pada beberapa task masih perlu kalibrasi"],
      nextWeekStrategy: ["Fokus pada high-impact goals", "Rencanakan time blocking di awal minggu"]
    });
  }
});

// 6. AI Monthly Review
app.post("/api/ai/monthly-review", async (req, res) => {
  try {
    const { monthlyData, stats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "algorithmic",
        monthlyReview: "Bulan ini menunjukkan peningkatan efisiensi kerja dengan dominasi progres pada proyek utama.",
        keyMilestones: ["Target bulanan tercapai pada proyek prioritas", "Rasio penyelesaian tugas meningkat"],
        areasForImprovement: ["Pengelolaan waktu untuk task tidak terjadwal", "Pengurangan task yang sering di-reschedule"],
        longTermAdvice: "Pertahankan konsistensi daily logging untuk data analitik produktivitas yang semakin akurat."
      });
    }

    const prompt = `Analisis performa bulanan produktivitas:
Statistik: ${JSON.stringify(stats || {})}
Data Bulanan: ${JSON.stringify(monthlyData || [])}

Kembalikan JSON murni:
{
  "monthlyReview": "analisis mendalam narasi bulanan...",
  "keyMilestones": ["pencapaian 1", "pencapaian 2"],
  "areasForImprovement": ["area perbaikan 1", "area perbaikan 2"],
  "longTermAdvice": "nasihat strategis produktivitas jangka panjang"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("AI Monthly error:", err);
    return res.json({
      success: true,
      source: "algorithmic_fallback",
      monthlyReview: "Evaluasi bulanan menunjukkan perkembangan positif dalam pengelolaan alur kerja harian.",
      keyMilestones: ["Rata-rata penyelesaian task harian meningkat", "Proyek utama tetap pada jalurnya"],
      areasForImprovement: ["Minimalisir akumulasi task overdue menjelang akhir bulan"],
      longTermAdvice: "Lakukan review mingguan secara disiplin untuk mencegah beban kerja menumpuk."
    });
  }
});

// Helper Heuristic Algorithms for resilient offline/fallback performance
function generateAlgorithmicPrioritization(tasks: any[], today: string) {
  const activeTasks = tasks.filter((t: any) => t.status !== "Selesai" && t.status !== "Dibatalkan");
  
  const scored = activeTasks.map((t) => {
    let score = 50;
    const priority = (t.priority || "Medium").toLowerCase();
    if (priority === "critical") score += 40;
    else if (priority === "urgent") score += 30;
    else if (priority === "high") score += 20;
    else if (priority === "medium") score += 10;

    if (t.deadline) {
      const diff = Math.ceil((new Date(t.deadline).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) score += 45; // overdue
      else if (diff === 0) score += 35; // today
      else if (diff === 1) score += 25; // tomorrow
      else if (diff <= 3) score += 15;
    }

    if (t.status === "In Progress") score += 15;
    return { ...t, calculatedScore: score };
  });

  scored.sort((a, b) => b.calculatedScore - a.calculatedScore);

  const doNow: any[] = [];
  const doNext: any[] = [];
  const schedule: any[] = [];
  const delegate: any[] = [];
  const doLater: any[] = [];

  scored.forEach((task, idx) => {
    const isOverdue = task.deadline && new Date(task.deadline).getTime() < new Date(today).getTime();
    if (isOverdue || task.priority === "Critical" || task.priority === "Urgent" || idx === 0) {
      doNow.push({
        taskId: task.id,
        taskTitle: task.title,
        reason: isOverdue ? "Pekerjaan ini sudah melewati deadline, harus segera diselesaikan." : "Memiliki tingkat urgensi tinggi dan dampak langsung pada timeline proyek.",
        suggestedSlot: "Pagi (08:30 - 11:00)",
        priorityScore: task.calculatedScore
      });
    } else if (task.priority === "High" || idx <= 3) {
      doNext.push({
        taskId: task.id,
        taskTitle: task.title,
        reason: "Pekerjaan penting berikutnya dengan estimasi waktu yang siap dieksekusi setelah task utama.",
        suggestedSlot: "Siang (11:00 - 14:00)",
        priorityScore: task.calculatedScore
      });
    } else if (task.deadline || task.category === "Client" || task.category === "Meeting") {
      schedule.push({
        taskId: task.id,
        taskTitle: task.title,
        reason: "Penting namun memiliki ruang waktu. Jadwalkan blok waktu khusus untuk fokus.",
        suggestedSlot: "Sore (14:30 - 16:30)",
        priorityScore: task.calculatedScore
      });
    } else if (task.category === "Administration" || task.category === "Other") {
      delegate.push({
        taskId: task.id,
        taskTitle: task.title,
        reason: "Pekerjaan rutin yang bisa disederhanakan, didelegasikan, atau diselesaikan dalam sesi batching.",
        suggestedSlot: "Menjelang akhir hari",
        priorityScore: task.calculatedScore
      });
    } else {
      doLater.push({
        taskId: task.id,
        taskTitle: task.title,
        reason: "Bisa dikerjakan setelah semua tanggung jawab inti hari ini selesai.",
        suggestedSlot: "Waktu luang / Besok",
        priorityScore: task.calculatedScore
      });
    }
  });

  return [
    { tier: "DO NOW", label: "Kerjakan Sekarang", color: "red", items: doNow },
    { tier: "DO NEXT", label: "Kerjakan Setelah Ini", color: "amber", items: doNext },
    { tier: "SCHEDULE", label: "Bisa Dijadwalkan", color: "blue", items: schedule },
    { tier: "DELEGATE / OPTIONAL", label: "Delegasikan / Opsional", color: "purple", items: delegate },
    { tier: "DO LATER", label: "Bisa Dikerjakan Terakhir", color: "emerald", items: doLater }
  ];
}

function generateAlgorithmicAlerts(tasks: any[], today: string) {
  const alerts: any[] = [];
  const overdueCount = tasks.filter((t: any) => t.status !== "Selesai" && t.deadline && new Date(t.deadline).getTime() < new Date(today).getTime()).length;
  if (overdueCount > 0) {
    alerts.push({
      type: "overdue",
      message: `Ada ${overdueCount} task yang melewati deadline (overdue). Sebaiknya tuntaskan segera.`
    });
  }

  const urgentCount = tasks.filter((t: any) => t.status !== "Selesai" && (t.priority === "Critical" || t.priority === "Urgent")).length;
  if (urgentCount > 2) {
    alerts.push({
      type: "workload",
      message: `Kamu memiliki ${urgentCount} task urgent aktif sekaligus. Hindari multitasking berlebihan.`
    });
  }

  return alerts;
}

function generateAlgorithmicChatReply(message: string, context: any) {
  const lower = (message || "").toLowerCase();
  const tasks = context?.tasks || [];
  const activeTasks = tasks.filter((t: any) => t.status !== "Selesai");

  if (lower.includes("dikerjakan dulu") || lower.includes("mana yang harus") || lower.includes("prioritas")) {
    const top = [...activeTasks].sort((a: any, b: any) => {
      const pMap: any = { Critical: 5, Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 2) - (pMap[a.priority] || 2);
    }).slice(0, 3);

    if (top.length === 0) return "Semua task aktifmu sudah selesai! Kamu bisa merencanakan proyek berikutnya atau beristirahat.";
    return `Berdasarkan analisis deadline dan urgensi, fokus pada urutan berikut:\n\n` +
      top.map((t: any, i: number) => `${i + 1}. **${t.title}** (${t.priority || "Medium"}, Proyek: ${t.project || "-"}) — ${t.deadline ? `Deadline: ${t.deadline}` : "Pekerjaan penting"}`).join("\n") +
      `\n\nSelesaikan nomor 1 terlebih dahulu sebelum beralih ke tugas lain.`;
  }

  if (lower.includes("tunda") || lower.includes("reschedule")) {
    const canDelay = activeTasks.filter((t: any) => t.priority === "Low" || t.priority === "Medium" || !t.deadline).slice(0, 3);
    if (canDelay.length === 0) return "Saat ini hampir semua task aktifmu berstatus prioritas tinggi atau mendekati deadline.";
    return `Pekerjaan yang aman untuk ditunda atau dijadwalkan ulang:\n\n` +
      canDelay.map((t: any, i: number) => `• **${t.title}** (Kategori: ${t.category || "-"}) — Tidak memiliki deadline dekat dan dampaknya tidak langsung memblokir proyek utama.`).join("\n");
  }

  if (lower.includes("produktivitas") || lower.includes("rendah") || lower.includes("evaluasi")) {
    const completed = tasks.filter((t: any) => t.status === "Selesai").length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return `Evaluasi produktivitas:\n\n• Tingkat penyelesaian: **${rate}%** (${completed} selesai dari ${tasks.length} task).\n• Kunci meningkatkan skor: selesaikan task-task kecil yang menggantung untuk membangun momentum, dan pecah task besar berdurasi >2 jam menjadi checklist subtask 30 menitan.`;
  }

  if (lower.includes("project") || lower.includes("waktu") || lower.includes("menyita")) {
    return "Proyek dengan volume task terbanyak saat ini memerlukan alokasi waktu terencana. Periksa tab Projects untuk melihat persentase progres dan rincian jam kerja tiap proyek.";
  }

  return `Saya menganalisis ${activeTasks.length} task aktif yang kamu miliki. Untuk hari ini, rekomendasikan fokus pada pekerjaan berprioritas tinggi di awal hari, gunakan time-blocking 45 menit, dan lakukan End-of-Day Check-in sore ini untuk merekap hasil kerjamu!`;
}

// Development Vite Middleware or Production Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
