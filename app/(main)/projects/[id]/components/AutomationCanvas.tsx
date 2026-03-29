"use client";

import React from "react";
import { Zap } from "lucide-react";
import { getObjectsByType, type BXMLDocument } from "@/lib/bxml";

export function AutomationCanvas({ isDesignMode, selectedId, onSelect, bxmlDoc }: {
  isDesignMode: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  bxmlDoc?: BXMLDocument | null;
}) {
  const automations = bxmlDoc ? getObjectsByType(bxmlDoc, "automation") : [];
  const hasData = automations.length > 0;

  return (
    <div className="h-full overflow-auto" style={{ background: "radial-gradient(ellipse at 50% 30%, #1a1a26 0%, #111118 100%)" }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(99,102,241,.25) 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
      <div className="relative flex flex-col items-center py-8 px-4 min-h-full">
        {hasData ? (
          <>
            {automations.map((auto, i) => {
              const isSelected = selectedId === auto.id;
              const category = auto.properties.find((p) => p.key === "category")?.value ?? "custom";
              const trigger = auto.properties.find((p) => p.key === "trigger")?.value ?? "";
              const action = auto.properties.find((p) => p.key === "action")?.value ?? "";
              const catColors: Record<string, { bg: string; border: string; badge: string }> = {
                presence: { bg: "bg-blue-500/[0.04]", border: "border-blue-500/20", badge: "IF" },
                safety: { bg: "bg-red-500/[0.04]", border: "border-red-500/20", badge: "!!" },
                comfort: { bg: "bg-amber-500/[0.04]", border: "border-amber-500/20", badge: "⚡" },
                schedule: { bg: "bg-purple-500/[0.04]", border: "border-purple-500/20", badge: "⏰" },
              };
              const style = catColors[category] ?? catColors.comfort;

              return (
                <React.Fragment key={auto.id}>
                  {i > 0 && <div className="flex flex-col items-center py-1"><div className="w-px h-6 bg-zinc-600/40" /></div>}
                  <div onClick={() => isDesignMode && onSelect(isSelected ? null : auto.id)}
                    className={`w-[380px] rounded-xl border px-4 py-3 transition-all ${style.border} ${style.bg} ${isDesignMode ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-indigo-500/50" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60">
                        <span className="text-sm">{auto.icon ?? "⚡"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200">{auto.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Trigger: {trigger}</p>
                      </div>
                      <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 uppercase">{style.badge}</span>
                    </div>
                    <div className="mt-2 ml-11 rounded-lg border border-zinc-700/20 bg-zinc-900/30 px-3 py-2">
                      <p className="text-[11px] text-zinc-400">→ {action}</p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div className="mt-3 text-[10px] text-zinc-600">{automations.length} automation rules · BXML v{bxmlDoc?.revision ?? 0}</div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/8 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-amber-400/40" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">No automations yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">Start an AI Build conversation to generate automation rules, or switch to Design mode to create them manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
