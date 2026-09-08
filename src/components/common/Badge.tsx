import React from "react";
import { TaskPriority, TaskStatus } from "../../types";

export const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case "Critical":
      return {
        bg: "bg-rose-100 text-rose-700 border-rose-200",
        dot: "bg-rose-600",
        label: "Critical"
      };
    case "Urgent":
      return {
        bg: "bg-orange-100 text-orange-700 border-orange-200",
        dot: "bg-orange-500",
        label: "Urgent"
      };
    case "High":
      return {
        bg: "bg-indigo-100 text-indigo-700 border-indigo-200",
        dot: "bg-indigo-500",
        label: "High"
      };
    case "Medium":
      return {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: "Medium"
      };
    case "Low":
    default:
      return {
        bg: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
        label: "Low"
      };
  }
};

export const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case "Selesai":
      return {
        bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        label: "Selesai"
      };
    case "In Progress":
      return {
        bg: "bg-indigo-100 text-indigo-700 border-indigo-200",
        label: "In Progress"
      };
    case "Ditunda":
      return {
        bg: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Ditunda"
      };
    case "Dibatalkan":
      return {
        bg: "bg-slate-100 text-slate-500 border-slate-200 line-through",
        label: "Dibatalkan"
      };
    case "Belum dimulai":
    default:
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        label: "Belum dimulai"
      };
  }
};

export const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    Design: "text-purple-700 bg-purple-50 border-purple-200",
    Client: "text-rose-700 bg-rose-50 border-rose-200",
    "Social Media": "text-pink-700 bg-pink-50 border-pink-200",
    Marketing: "text-amber-700 bg-amber-50 border-amber-200",
    Editing: "text-cyan-700 bg-cyan-50 border-cyan-200",
    Website: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Meeting: "text-blue-700 bg-blue-50 border-blue-200",
    Administration: "text-slate-700 bg-slate-100 border-slate-200",
    Learning: "text-teal-700 bg-teal-50 border-teal-200",
    Personal: "text-indigo-700 bg-indigo-50 border-indigo-200"
  };
  return map[category] || "text-slate-700 bg-slate-100 border-slate-200";
};
