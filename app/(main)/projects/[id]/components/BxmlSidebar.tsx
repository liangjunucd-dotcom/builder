"use client";

import React from "react";
import { X, LayoutGrid } from "lucide-react";
import { countByType, type BXMLDocument } from "@/lib/bxml";
import { BXMLObjectRow } from "./BXMLObjectRow";

export function BxmlSidebar({ bxmlDoc, onClose }: { bxmlDoc: BXMLDocument; onClose: () => void }) {
  return (
    <div className="fixed top-12 right-0 bottom-0 w-[340px] z-30 border-l border-zinc-700/30 bg-[#111118] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-700/25 px-4 py-3 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-blue-400" /> BXML Document</h3>
          <p className="text-[10px] text-zinc-600 mt-0.5">v{bxmlDoc.version} · {bxmlDoc.objects.length} objects · {bxmlDoc.relations.length} relations</p>
        </div>
        <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { type: "space" as const, icon: "🏠", label: "Spaces" },
            { type: "device" as const, icon: "📡", label: "Devices" },
            { type: "scene" as const, icon: "🎬", label: "Scenes" },
            { type: "automation" as const, icon: "⚡", label: "Rules" },
          ]).map((s) => (
            <div key={s.type} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-2 text-center">
              <span className="text-sm">{s.icon}</span>
              <p className="text-sm font-bold text-zinc-100 tabular-nums mt-0.5">{countByType(bxmlDoc, s.type)}</p>
              <p className="text-[9px] text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>
        {(["space", "device", "scene", "automation"] as const).map((type) => {
          const items = bxmlDoc.objects.filter((o) => o.type === type);
          if (items.length === 0) return null;
          const typeLabel = type === "space" ? "Spaces" : type === "device" ? "Devices" : type === "scene" ? "Scenes" : "Automations";
          return (
            <div key={type}>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">{typeLabel}</p>
              <div className="space-y-0.5">
                {items.map((obj) => (<BXMLObjectRow key={obj.id} obj={obj} doc={bxmlDoc} />))}
              </div>
            </div>
          );
        })}
        <div>
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">Relations ({bxmlDoc.relations.length})</p>
          <div className="space-y-0.5 max-h-[200px] overflow-auto">
            {bxmlDoc.relations.slice(0, 20).map((rel) => {
              const src = bxmlDoc.objects.find((o) => o.id === rel.sourceId);
              const tgt = bxmlDoc.objects.find((o) => o.id === rel.targetId);
              return (
                <div key={rel.id} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] hover:bg-zinc-800/30">
                  <span className="text-zinc-300 truncate">{src?.name ?? rel.sourceId}</span>
                  <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${
                    rel.type === "contains" ? "bg-blue-500/15 text-blue-400" :
                    rel.type === "triggers" ? "bg-amber-500/15 text-amber-400" :
                    rel.type === "controls" ? "bg-emerald-500/15 text-emerald-400" :
                    "bg-zinc-700 text-zinc-400"
                  }`}>{rel.type}</span>
                  <span className="text-zinc-300 truncate">{tgt?.name ?? rel.targetId}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
