"use client";

import React from "react";
import { DoorOpen, Lightbulb } from "lucide-react";

export interface AutomationDesignPanelProps {
  /** Right content area: placeholder for project pages, AI conversation for creation pages, etc. */
  children: React.ReactNode;
  className?: string;
}

/** Layout consistent with the project automation tab: flow chart on the left, slot on the right */
export function AutomationDesignPanel({ children, className }: AutomationDesignPanelProps) {
  return (
    <div className={`flex flex-1 min-h-0 ${className ?? ""}`}>
      <div className="w-1/2 border-r border-zinc-800 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">Automation Flow</div>
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <DoorOpen className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-200">Person enters Living Room</span>
            </div>
            <div className="text-center text-zinc-500 text-xs">↓</div>
            <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-zinc-200">Turn on Living Room Main Light</span>
            </div>
            <div className="text-center text-zinc-500 text-xs">↓</div>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800/50 px-3 py-2">
              <span className="text-sm text-zinc-400">Delay 5 min · No presence</span>
            </div>
            <div className="text-center text-zinc-500 text-xs">↓</div>
            <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-zinc-200">Turn off Living Room Main Light</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
