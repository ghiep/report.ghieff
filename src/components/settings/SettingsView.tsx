import React, { useState } from "react";
import {
  Settings,
  User,
  Clock,
  Tag,
  Download,
  Upload,
  RotateCcw,
  Plus,
  X,
  Check,
  ShieldCheck
} from "lucide-react";
import { useWork } from "../../context/WorkContext";

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    resetData,
    tasks,
    projects
  } = useWork();

  const [userName, setUserName] = useState(settings.userName);
  const [dailyHoursGoal, setDailyHoursGoal] = useState(settings.dailyHoursGoal);
  const [newCatInput, setNewCatInput] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || "User",
      dailyHoursGoal: Number(dailyHoursGoal) || 7
    });
    setSaveMessage("Pengaturan profil berhasil disimpan!");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setNewCatInput("");
  };

  const handleExportJSON = () => {
    const data = {
      settings,
      categories,
      projects,
      tasks,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WorkFlow_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh isi data workspace? Semua pekerjaan, project, dan catatan harian akan dihapus.")) {
      resetData();
      setSaveMessage("Workspace berhasil dikosongkan. Anda dapat mulai mengisi pekerjaan baru.");
      setTimeout(() => setSaveMessage(""), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
          <Settings className="h-3.5 w-3.5 text-slate-400" />
          <span>System Preferences</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kustomisasi target jam kerja, profil pengguna, daftar kategori pekerjaan, dan manajemen data.
        </p>
      </div>

      {saveMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Profil & Target Jam */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span>Profil & Target Jam Kerja</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pengguna / Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Jam Kerja Harian (Jam)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyHoursGoal}
                onChange={(e) => setDailyHoursGoal(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* Kelola Kategori Pekerjaan */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-400" />
          <span>Kategori Pekerjaan</span>
        </h3>
        <p className="text-xs text-slate-500">
          Kategori digunakan untuk mengklasifikasikan task dan diagram distribusi waktu.
        </p>

        <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah kategori baru (misal: Copywriting, Research)..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
            >
              <span>{cat}</span>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteCategory(cat)}
                  className="text-slate-400 hover:text-rose-600"
                  title="Hapus Kategori"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Reset Data */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span>Manajemen Data & Cadangan</span>
        </h3>
        <p className="text-xs text-slate-500">
          Semua pekerjaan tersimpan di LocalStorage browser secara persisten. Anda dapat mengekspor atau mereset data kapan saja.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Backup Data ke JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Kosongkan Seluruh Data Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
