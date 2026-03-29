"use client";

import React, { useState } from "react";
import { X, Check, Copy, Mail } from "lucide-react";

export function ShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://builder.aqara.com/provision/${Date.now().toString(36)}`;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[480px] rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3"><h3 className="text-base font-semibold text-zinc-100">Provision Site</h3><button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button></div>
        <div className="px-6 pb-2"><p className="text-sm text-zinc-400 leading-relaxed">Share an installation guide and setup link with your installers to automatically deploy this project.</p></div>
        <div className="px-6 py-3">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Provisioning Link</label>
          <div className="flex gap-2"><input type="text" readOnly value={shareUrl} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-300 font-mono" /><button type="button" onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors">{copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button></div>
        </div>
        <div className="px-6 pb-5">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Invite by Email</label>
          <div className="flex gap-2"><div className="relative flex-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 pl-9 pr-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none" /></div><button type="button" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">Send</button></div>
        </div>
      </div>
    </div>
  );
}
