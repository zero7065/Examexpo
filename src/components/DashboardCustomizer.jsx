// src/components/DashboardCustomizer.jsx
import React, { useState, useEffect } from "react";
import { X, Settings, GripVertical, Eye, EyeOff } from "lucide-react";

export const DEFAULT_WIDGETS = [
  { id: "stats", label: "My Stats", enabled: true },
  { id: "streak", label: "Study Streak", enabled: true },
  { id: "todayChallenge", label: "Today's Challenge", enabled: true },
  { id: "recentSessions", label: "Recent Sessions", enabled: true },
  { id: "predictions", label: "Likely Exam Topics", enabled: true },
  { id: "studyPlan", label: "My Study Plan", enabled: false },
  { id: "friends", label: "Friend Activity", enabled: false },
];

export default function DashboardCustomizer({ isOpen, onClose, onUpdate }) {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem("ep-dashboard-widgets");
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  const toggleWidget = (id) => {
    const newWidgets = widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(newWidgets);
    localStorage.setItem("ep-dashboard-widgets", JSON.stringify(newWidgets));
    onUpdate(newWidgets);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface h-full shadow-2xl animate-in slide-in-from-right duration-300 p-8 border-l border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Settings size={24} className="text-primary" />
            Customise Dashboard
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Toggle the widgets you want to see on your dashboard. Some widgets require a Pro subscription.
        </p>

        <div className="space-y-4">
          {widgets.map((widget) => (
            <div 
              key={widget.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                widget.enabled ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-surface-2 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <GripVertical size={20} className="text-slate-600" />
                <span className="font-bold">{widget.label}</span>
              </div>
              <button 
                onClick={() => toggleWidget(widget.id)}
                className={`p-2 rounded-lg transition-colors ${
                  widget.enabled ? 'text-primary bg-primary/10' : 'text-slate-500 bg-white/5'
                }`}
              >
                {widget.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <button 
            onClick={onClose}
            className="btn-primary w-full"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
