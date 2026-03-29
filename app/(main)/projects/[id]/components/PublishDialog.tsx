"use client";

import React, { useState } from "react";
import { X, Globe, Eye, Lock, ChevronRight } from "lucide-react";

export function PublishDialog({ open, onClose, projectName }: { open: boolean; onClose: () => void; projectName: string }) {
  const [visibility, setVisibility] = useState<"public_remix" | "public_view" | "private">("public_remix");
  const [showUpgrade, setShowUpgrade] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[520px] rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3"><h3 className="text-base font-semibold text-zinc-100">Publish to Community</h3><button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button></div>
        <div className="px-6 pb-4 space-y-4">
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 p-4"><p className="text-sm font-medium text-zinc-200">{projectName}</p><p className="text-xs text-zinc-500 mt-1">Space Package</p></div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Visibility</label>
            <div className="space-y-2">
              {([
                { id: "public_remix" as const, label: "Public & Remixable", desc: "Anyone can view and remix", icon: Globe, free: true },
                { id: "public_view" as const, label: "Public & View Only", desc: "Anyone can view, no remix", icon: Eye, free: true },
                { id: "private" as const, label: "Private", desc: "Only friends with link you share can view", icon: Lock, free: false },
              ]).map((v) => (
                <button key={v.id} type="button" onClick={() => { if (!v.free) { setShowUpgrade(true); return; } setVisibility(v.id); setShowUpgrade(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors ${visibility === v.id ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-700/40 bg-zinc-800/15 hover:border-zinc-600"}`}>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${visibility === v.id ? "border-indigo-500" : "border-zinc-600"}`}>
                    {visibility === v.id && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                  </div>
                  <v.icon className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div className="flex-1"><p className="text-sm font-medium text-zinc-200">{v.label}</p><p className="text-[11px] text-zinc-500">{v.desc}</p></div>
                  {!v.free && <span className="rounded border border-amber-500/30 bg-amber-500/8 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 uppercase">Builder+</span>}
                </button>
              ))}
            </div>
          </div>
          {showUpgrade && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium text-amber-300 mb-1">Upgrade to unlock Private mode</p>
              <p className="text-xs text-zinc-500 mb-3">Private projects require a Builder plan or above. Post in private mode, get more credits, and unlock advanced features.</p>
              <a href="/plans" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/25 transition-colors">View Plans <ChevronRight className="h-3 w-3" /></a>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-800/60 px-6 py-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800">Cancel</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Publish</button>
        </div>
      </div>
    </div>
  );
}
