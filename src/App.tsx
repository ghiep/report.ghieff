import React, { useState } from "react";
import { Menu, Plus, Sparkles } from "lucide-react";
import { WorkProvider, useWork } from "./context/WorkContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { DashboardView } from "./components/dashboard/DashboardView";
import { DailyPlannerView } from "./components/planner/DailyPlannerView";
import { TasksView } from "./components/tasks/TasksView";
import { CalendarView } from "./components/calendar/CalendarView";
import { ProjectsView } from "./components/projects/ProjectsView";
import { AnalyticsView } from "./components/analytics/AnalyticsView";
import { AIAssistantView } from "./components/ai/AIAssistantView";
import { ReportsView } from "./components/reports/ReportsView";
import { SettingsView } from "./components/settings/SettingsView";
import { QuickAddModal } from "./components/tasks/QuickAddModal";
import { TaskDetailModal } from "./components/tasks/TaskDetailModal";

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openQuickAdd } = useWork();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile Header Bar if on phone */}
        <div className="flex md:hidden items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            title="Buka Navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-black text-sm italic text-white">P</div>
            <span className="text-sm font-bold tracking-tight text-slate-900">PROD.AI</span>
          </div>
          <button
            onClick={openQuickAdd}
            className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-xs hover:bg-indigo-700"
            title="Tambah Task"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Global Desktop Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === "dashboard" && <DashboardView setCurrentTab={setCurrentTab} />}
            {currentTab === "today" && <DailyPlannerView />}
            {currentTab === "tasks" && (
              <TasksView searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            )}
            {currentTab === "calendar" && <CalendarView />}
            {currentTab === "projects" && <ProjectsView />}
            {currentTab === "analytics" && <AnalyticsView />}
            {currentTab === "ai" && <AIAssistantView />}
            {currentTab === "reports" && <ReportsView />}
            {currentTab === "settings" && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={openQuickAdd}
        className="fixed bottom-5 right-5 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 active:scale-95 sm:hidden"
        title="Tambah Pekerjaan"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Global Modals */}
      <QuickAddModal />
      <TaskDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <WorkProvider>
      <AppContent />
    </WorkProvider>
  );
}
