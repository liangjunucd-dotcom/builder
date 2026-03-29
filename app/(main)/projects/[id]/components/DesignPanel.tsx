"use client";

import React from "react";
import { PenTool, MousePointer2, Plus, Trash2 } from "lucide-react";
import type { CanvasView } from "./constants";

export function DesignPanel({ canvasView, selectedId }: { canvasView: CanvasView; selectedId: string | null }) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <PenTool className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Visual edits</h3>
      </div>

      {!selectedId && (
        <div className="text-center py-8">
          <MousePointer2 className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Select elements to edit</p>
          <p className="text-xs text-zinc-600 mt-1">Click on rooms, nodes, widgets, or components on the canvas to edit properties</p>
        </div>
      )}

      {selectedId && canvasView === "space" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/15 p-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Room</p>
            <div className="space-y-2">
              <div><label className="text-[11px] text-zinc-500">Name</label><input type="text" defaultValue={selectedId} className="w-full mt-0.5 rounded-lg border border-zinc-700/40 bg-zinc-800/20 px-2.5 py-1.5 text-sm text-zinc-200 focus:border-indigo-500/40 focus:outline-none" /></div>
            </div>
          </div>
          <button type="button" className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus className="h-3 w-3" /> Add device</button>
        </div>
      )}

      {selectedId && canvasView === "automation" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/15 p-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Automation Node</p>
            <div className="space-y-2">
              <div><label className="text-[11px] text-zinc-500">Label</label><input type="text" defaultValue={selectedId} className="w-full mt-0.5 rounded-lg border border-zinc-700/40 bg-zinc-800/20 px-2.5 py-1.5 text-sm text-zinc-200 focus:border-indigo-500/40 focus:outline-none" /></div>
              <div><label className="text-[11px] text-zinc-500">Type</label>
                <select className="w-full mt-0.5 rounded-lg border border-zinc-700/40 bg-zinc-800/20 px-2.5 py-1.5 text-sm text-zinc-300"><option>trigger</option><option>condition</option><option>action</option></select>
              </div>
            </div>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400"><Trash2 className="h-3 w-3" /> Delete node</button>
        </div>
      )}
    </div>
  );
}
