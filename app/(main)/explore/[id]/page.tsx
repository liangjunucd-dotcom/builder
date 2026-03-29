"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Eye, GitFork, Share2, Play, Pause,
  Box, MessageSquare, Send, Cpu,
  X, ChevronUp, ChevronDown, ChevronRight,
  ShoppingCart, ExternalLink, Check, Minus, Plus,
  MoreHorizontal,
} from "lucide-react";
import {
  findGalleryItem,
  GALLERY_ITEMS,
  CAT_COLORS,
  CATEGORIES,
  type GalleryItem,
} from "@/lib/gallery-data";

/* ═══════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════ */

const VISIT_ROOMS = [
  { id: "r1", name: "Living Room", x: 30, y: 30, w: 240, h: 160, color: "#6366f1", devices: [{ icon: "📡", label: "Hub M3", x: .15, y: .22 }, { icon: "💡", label: "Main Light", x: .5, y: .5 }, { icon: "👁", label: "FP2", x: .82, y: .28 }] },
  { id: "r2", name: "Dining Room", x: 290, y: 30, w: 150, h: 160, color: "#10b981", devices: [{ icon: "💡", label: "Dining Light", x: .5, y: .5 }] },
  { id: "r3", name: "Master Bedroom", x: 460, y: 30, w: 160, h: 140, color: "#f59e0b", devices: [{ icon: "💡", label: "Bedroom Light", x: .5, y: .38 }, { icon: "🪟", label: "Curtain", x: .88, y: .55 }] },
  { id: "r4", name: "Guest Bedroom", x: 460, y: 190, w: 160, h: 120, color: "#ec4899", devices: [{ icon: "💡", label: "Light", x: .5, y: .5 }] },
  { id: "r5", name: "Study", x: 30, y: 210, w: 150, h: 120, color: "#0ea5e9", devices: [{ icon: "💡", label: "Study Light", x: .5, y: .38 }, { icon: "🔌", label: "Outlet", x: .82, y: .72 }] },
  { id: "r6", name: "Kitchen", x: 200, y: 210, w: 140, h: 120, color: "#a855f7", devices: [{ icon: "🔥", label: "Smoke Detector", x: .35, y: .45 }] },
  { id: "r7", name: "Bathroom", x: 360, y: 210, w: 100, h: 100, color: "#f43f5e", devices: [{ icon: "💧", label: "Water Leak", x: .5, y: .6 }] },
];

const WALKTHROUGH = [
  { time: "18:30", title: "Arriving Home", text: "Fingerprint unlock, door lock plays welcome tone", roomId: null as string | null, icon: "🔒" },
  { time: "18:30", title: "Living Room Lights On", text: "FP2 detects presence in living room, main light auto-turns on at 100%", roomId: "r1", icon: "💡" },
  { time: "18:31", title: "AC Starts Cooling", text: "Room temp 28°C → AC set to 24°C auto mode", roomId: "r1", icon: "❄️" },
  { time: "18:35", title: "Moving to Dining Room", text: "Living room lights dim after 5 min of no presence, dining light turns on", roomId: "r2", icon: "🍽" },
  { time: "20:00", title: "Back to Bedroom", text: "Bedroom light fades to 70%, curtains close automatically", roomId: "r3", icon: "🛏" },
  { time: "22:30", title: "Good Night Mode", text: "Voice trigger \"Good Night\": all lights off, AC sleep mode", roomId: null, icon: "🌙" },
];

const INITIAL_DEVICES = [
  { name: "Aqara Hub M3", qty: 1, price: 69.99, sku: "HM-M3", icon: "📡" },
  { name: "Aqara FP2 Presence Sensor", qty: 2, price: 79.99, sku: "FP-2", icon: "👁" },
  { name: "Aqara LED Bulb T1", qty: 8, price: 16.99, sku: "LED-T1", icon: "💡" },
  { name: "Aqara Curtain Driver E1", qty: 4, price: 89.99, sku: "CD-E1", icon: "🪟" },
  { name: "Aqara Temp & Humidity Sensor", qty: 3, price: 19.99, sku: "TH-S1", icon: "🌡" },
  { name: "Aqara Smart Lock U200", qty: 1, price: 229.99, sku: "DL-U200", icon: "🔒" },
];

const MOCK_COMMENTS = [
  { author: "Builder_Alex", avatar: "A", text: "This solution is so practical! I forked it right away for my 3-bedroom apartment. The FP2 zone setup is really precise.", time: "28 minutes ago", likes: 24 },
  { author: "tralalero_creator", avatar: "T", text: "Who pls can play my steal a brainrot good game :)", time: "5 hours ago", likes: 12 },
  { author: "Charlie", avatar: "C", text: "Can anyone try my new cyber city flight game pls", time: "5 hours ago", likes: 6 },
  { author: "Sammurmom", avatar: "S", text: "See? I told you my attention span isn't that bad", time: "6 hours ago", likes: 45 },
  { author: "KobiMowbray", avatar: "K", text: "Yo", time: "7 hours ago", likes: 3 },
  { author: "GreenTech", avatar: "G", text: "Suggest adding an energy monitoring module for a true energy-saving feedback loop.", time: "1 week ago", likes: 15 },
  { author: "HotelTech", avatar: "H", text: "How much latency does the FP2 presence detection have? Any optimizations for larger living rooms?", time: "2 weeks ago", likes: 8 },
];

const fmtNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/* ═══════════════════════════════════════════════════
   Full-screen Space Canvas
   ═══════════════════════════════════════════════════ */

function FullScreenSpace({ activeRoomId, commentsOpen }: { activeRoomId: string | null; commentsOpen: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${commentsOpen ? "pr-[360px]" : ""}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.2) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(99,102,241,.15) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <svg viewBox="0 0 660 350" className="w-full max-w-4xl h-auto px-8" style={{ maxHeight: "calc(100vh - 200px)" }} fill="none">
        <defs>
          {VISIT_ROOMS.map((room) => (
            <React.Fragment key={`defs-${room.id}`}>
              <radialGradient id={`g-${room.id}`} cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={room.color} stopOpacity={activeRoomId === room.id ? "0.3" : "0.05"} />
                <stop offset="100%" stopColor={room.color} stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`w-${room.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={room.color} stopOpacity={activeRoomId === room.id ? "0.9" : "0.35"} />
                <stop offset="100%" stopColor={room.color} stopOpacity={activeRoomId === room.id ? "0.5" : "0.1"} />
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>

        {VISIT_ROOMS.map((room) => {
          const hit = activeRoomId === room.id;
          return (
            <g key={room.id} className="transition-all duration-700">
              <ellipse cx={room.x + room.w / 2} cy={room.y + room.h / 2} rx={room.w * 0.75} ry={room.h * 0.75}
                fill={`url(#g-${room.id})`} className="transition-all duration-700" />
              <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="8"
                fill={hit ? `${room.color}18` : `${room.color}06`}
                stroke={hit ? `${room.color}60` : "rgba(55,55,75,0.35)"}
                strokeWidth={hit ? "2" : "1"}
                className="transition-all duration-700" />
              <rect x={room.x} y={room.y} width={room.w} height="3.5" rx="1.5"
                fill={`url(#w-${room.id})`} className="transition-all duration-500" />
              <rect x={room.x} y={room.y} width="3.5" height={room.h} rx="1.5"
                fill={room.color} opacity={hit ? 0.5 : 0.12} className="transition-all duration-500" />
              <text x={room.x + room.w / 2} y={room.y + 24} className="text-[13px] font-bold" textAnchor="middle"
                fill={hit ? "rgb(245,245,255)" : "rgb(100,100,125)"}>{room.name}</text>
              <text x={room.x + room.w / 2} y={room.y + 39} className="text-[9px]" textAnchor="middle"
                fill="rgb(65,65,85)">{room.devices.length} devices</text>
              {room.devices.map((d, di) => {
                const dx = room.x + room.w * d.x;
                const dy = room.y + room.h * d.y;
                return (
                  <g key={`d-${di}`}>
                    {hit && <circle cx={dx} cy={dy} r="22" fill={room.color} opacity="0.07" />}
                    <circle cx={dx} cy={dy} r="14"
                      fill={hit ? "rgba(8,8,18,0.9)" : "rgba(8,8,18,0.5)"}
                      stroke={hit ? `${room.color}88` : "rgba(55,55,75,0.35)"}
                      strokeWidth={hit ? "1.5" : "1"} className="transition-all duration-500" />
                    <text x={dx} y={dy + 5} className="text-[12px]" textAnchor="middle" fill="white">{d.icon}</text>
                    {hit && <text x={dx} y={dy + 28} className="text-[8px] font-semibold" textAnchor="middle" fill={room.color} opacity="0.9">{d.label}</text>}
                    {hit && (
                      <circle cx={dx} cy={dy} r="14" fill="none" stroke={room.color} strokeWidth="1" opacity=".4">
                        <animate attributeName="r" from="14" to="26" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from=".4" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
              {hit && (
                <rect x={room.x - 4} y={room.y - 4} width={room.w + 8} height={room.h + 8}
                  rx="12" fill="none" stroke={room.color} strokeWidth="1.5" opacity=".25" strokeDasharray="8 4">
                  <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="3s" repeatCount="indefinite" />
                </rect>
              )}
            </g>
          );
        })}
        <line x1="34" y1="342" x2="134" y2="342" stroke="rgba(75,75,95,0.3)" strokeWidth="1" strokeDasharray="4 2" />
        <text x="84" y="349" className="text-[7px]" textAnchor="middle" fill="rgba(75,75,95,0.4)">0 — 2m — 4m</text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Right-side Comments Panel (Aippy-style)
   ═══════════════════════════════════════════════════ */

function CommentsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [commentText, setCommentText] = useState("");

  return (
    <div className={`fixed top-0 right-0 bottom-0 z-40 w-[360px] transition-transform duration-400 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="h-full flex flex-col bg-[#1a1a24]/95 backdrop-blur-xl border-l border-white/[.06]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06] shrink-0">
          <h3 className="text-base font-bold text-zinc-100">Comments</h3>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[.06] text-zinc-400 hover:text-white transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
          {MOCK_COMMENTS.map((c, i) => (
            <div key={i} className="flex gap-3 group">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-[11px] font-bold text-zinc-300 ring-1 ring-white/[.04]">
                {c.avatar}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-semibold text-zinc-200 truncate">{c.author}</span>
                  </div>
                  <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[13px] text-zinc-400 leading-relaxed mt-0.5">{c.text}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-zinc-600">{c.time}</span>
                  <button type="button" className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium transition-colors">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-white/[.06] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-[10px] font-bold text-indigo-300">U</span>
            <div className="flex-1 relative">
              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..."
                className="w-full rounded-xl border border-white/[.06] bg-white/[.03] pl-3.5 pr-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/30 focus:outline-none focus:bg-white/[.04] transition-colors" />
              <button type="button" disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-20 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Devices Panel (checkout-style overlay)
   ═══════════════════════════════════════════════════ */

function DevicesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cart, setCart] = useState(() => INITIAL_DEVICES.map((d) => ({ ...d })));

  const updateQty = (sku: string, delta: number) => {
    setCart((prev) => prev.map((d) => d.sku === sku ? { ...d, qty: Math.max(0, d.qty + delta) } : d));
  };

  const total = cart.reduce((s, d) => s + d.price * d.qty, 0);
  const totalItems = cart.reduce((s, d) => s + d.qty, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 rounded-3xl bg-[#14141e] border border-white/[.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[.06]">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" /> Devices
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{totalItems} items in this space</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/[.06] text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Device list */}
        <div className="max-h-[50vh] overflow-auto divide-y divide-white/[.04]">
          {cart.map((d) => (
            <div key={d.sku} className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/[.02] transition-colors">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.04] text-lg">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{d.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">${d.price.toFixed(2)}</p>
              </div>
              {/* Qty stepper */}
              <div className="flex items-center gap-0.5 rounded-xl bg-white/[.04] border border-white/[.06]">
                <button type="button" onClick={() => updateQty(d.sku, -1)}
                  className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-l-xl hover:bg-white/[.04]">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-zinc-100 tabular-nums">{d.qty}</span>
                <button type="button" onClick={() => updateQty(d.sku, 1)}
                  className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-r-xl hover:bg-white/[.04]">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="w-16 text-right text-sm font-semibold text-zinc-200 tabular-nums">${(d.price * d.qty).toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Footer: total + checkout */}
        <div className="px-6 py-5 border-t border-white/[.06] bg-white/[.01]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-zinc-400">Estimated total</span>
            <span className="text-xl font-bold text-white tabular-nums">${total.toFixed(2)}</span>
          </div>
          <button type="button"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-[.98]">
            <ShoppingCart className="h-4 w-4" /> Checkout on Aqara Store
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </button>
          <p className="text-center text-[11px] text-zinc-600 mt-2.5">Adjust quantities above before checkout</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main — Aippy-style full-screen immersive viewer
   ═══════════════════════════════════════════════════ */

export default function SpaceVisitPage() {
  const params = useParams();
  const router = useRouter();
  const item = findGalleryItem(params.id as string);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);

  const [walkStep, setWalkStep] = useState(-1);
  const [isWalking, setIsWalking] = useState(false);

  const allItems = useMemo(() => GALLERY_ITEMS, []);
  const currentIdx = useMemo(() => allItems.findIndex((g) => g.id === item?.id), [allItems, item?.id]);

  useEffect(() => { if (item) setLikeCount(item.likes); }, [item]);

  useEffect(() => {
    if (!isWalking) return;
    const iv = setInterval(() => {
      setWalkStep((prev) => {
        if (prev >= WALKTHROUGH.length - 1) { setIsWalking(false); return prev; }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [isWalking]);

  const play = useCallback(() => { if (walkStep < 0) setWalkStep(0); setIsWalking(true); }, [walkStep]);
  const pause = useCallback(() => setIsWalking(false), []);

  const goPrev = useCallback(() => {
    const prev = currentIdx > 0 ? currentIdx - 1 : allItems.length - 1;
    router.replace(`/explore/${allItems[prev].id}`);
  }, [currentIdx, allItems, router]);

  const goNext = useCallback(() => {
    const next = currentIdx < allItems.length - 1 ? currentIdx + 1 : 0;
    router.replace(`/explore/${allItems[next].id}`);
  }, [currentIdx, allItems, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commentsOpen || devicesOpen) return;
      if (e.key === "ArrowUp") goPrev();
      else if (e.key === "ArrowDown") goNext();
      else if (e.key === "Escape") router.push("/explore");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, commentsOpen, devicesOpen, router]);

  const activeRoomId = walkStep >= 0 ? WALKTHROUGH[walkStep]?.roomId ?? null : null;
  const stepData = walkStep >= 0 ? WALKTHROUGH[walkStep] : null;

  const handleLike = () => { setLiked(!liked); setLikeCount((c) => liked ? c - 1 : c + 1); };
  const handleCopy = () => { navigator.clipboard?.writeText(`https://builder.aqara.com/explore/${item?.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleRemix = () => { router.push(`/projects/new?prompt=${encodeURIComponent(`Customize based on "${item?.title}" solution`)}&loading=1`); };

  const catStyle = item?.category ? (CAT_COLORS[item.category] ?? "") : "";
  const catLabel = item?.category ? CATEGORIES.find((c) => c.id === item.category)?.label : null;
  const mockForks = item ? Math.floor(item.likes * 0.35) : 0;

  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <Box className="h-12 w-12 text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-4">Space not found</p>
          <button type="button" onClick={() => router.push("/explore")} className="text-sm text-indigo-400 hover:text-indigo-300">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#08080f" }}>

      {/* ── Full-screen space canvas ── */}
      <FullScreenSpace activeRoomId={activeRoomId} commentsOpen={commentsOpen} />

      {/* ── Walkthrough step pill (bottom-center, above bar) ── */}
      {stepData && (
        <div className={`absolute bottom-24 z-20 pointer-events-none transition-all duration-500 ${commentsOpen ? "left-[calc(50%-180px)]" : "left-1/2"} -translate-x-1/2`}>
          <div className="flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[.08] px-5 py-3 shadow-2xl pointer-events-auto">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.06] text-lg">{stepData.icon}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{stepData.time}</span>
                <span className="text-sm font-semibold text-white">{stepData.title}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-[280px] truncate">{stepData.text}</p>
            </div>
            <div className="flex flex-col items-center gap-1 ml-2">
              {WALKTHROUGH.map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${i === walkStep ? "w-1.5 h-3 bg-indigo-400" : i < walkStep ? "w-1.5 h-1.5 bg-indigo-500/50" : "w-1.5 h-1.5 bg-white/[.12]"}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Top-left: category badge ── */}
      {catLabel && (
        <div className="absolute top-4 left-5 z-30">
          <span className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm ${catStyle} border border-white/[.04]`}>{catLabel}</span>
        </div>
      )}

      {/* ── Top-right controls ── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button type="button" onClick={handleCopy}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/[.08] text-zinc-400 hover:text-white hover:bg-white/[.08] transition-all"
          title="Copy link">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => router.push("/explore")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/[.08] text-zinc-400 hover:text-white hover:bg-white/[.08] transition-all"
          title="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Right-side action buttons (Aippy-style vertical stack) ── */}
      <div className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 transition-all duration-500 ${commentsOpen ? "right-[376px]" : "right-5"}`}>
        {/* Up */}
        <button type="button" onClick={goPrev}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all active:scale-95"
          title="Previous space">
          <ChevronUp className="h-5 w-5" />
        </button>
        {/* Down */}
        <button type="button" onClick={goNext}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all active:scale-95"
          title="Next space">
          <ChevronDown className="h-5 w-5" />
        </button>

        <div className="h-2" />

        {/* Devices */}
        <button type="button" onClick={() => setDevicesOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 transition-all shadow-lg shadow-emerald-500/10"
          title="View devices">
          <Cpu className="h-5 w-5" />
        </button>
        {/* Walkthrough play/pause */}
        <button type="button" onClick={walkStep < 0 || !isWalking ? play : pause}
          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all shadow-lg ${
            isWalking
              ? "bg-amber-500/15 border-amber-500/25 text-amber-400 hover:bg-amber-500/25 shadow-amber-500/10"
              : "bg-violet-500/15 border-violet-500/25 text-violet-400 hover:bg-violet-500/25 shadow-violet-500/10"
          }`}
          title={isWalking ? "Pause walkthrough" : "Play walkthrough"}>
          {isWalking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        {/* More */}
        <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[.06] border border-white/[.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[.1] transition-all" title="More">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* ── Bottom bar (Aippy-style) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className={`bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-5 transition-all duration-500 ${commentsOpen ? "pr-[380px]" : ""}`}>
          <div className="flex items-center justify-between">
            {/* Left: logo + creator info + stats */}
            <div className="flex items-center gap-3 min-w-0">
              {/* App brand */}
              <Link href="/explore" className="hidden sm:flex items-center gap-1.5 shrink-0 mr-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                  <Box className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-zinc-300">Builder</span>
              </Link>

              {/* Creator */}
              <Link href={`/builders/${encodeURIComponent(item.author)}`} className="shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white ring-2 ring-white/10">{item.avatar}</span>
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate max-w-[180px]">{item.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Link href={`/builders/${encodeURIComponent(item.author)}`} className="text-xs text-zinc-400 hover:text-white transition-colors font-medium">
                    {item.author}
                  </Link>
                  <span className="text-zinc-700">·</span>
                  <span className="text-[11px] text-zinc-500">2 months ago</span>
                </div>
              </div>

              {/* Stats pills */}
              <div className="hidden md:flex items-center gap-1.5 ml-2">
                <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2.5 py-1 text-[11px] text-zinc-400">
                  <Eye className="h-3 w-3" /> {fmtNum(item.views)}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2.5 py-1 text-[11px] text-zinc-400">
                  <GitFork className="h-3 w-3" /> {mockForks}
                </span>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2">
              {/* Share */}
              <button type="button" onClick={handleCopy}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/[.06] border border-white/[.06] text-zinc-300 hover:bg-white/[.1] hover:text-white transition-all">
                <Share2 className="h-4 w-4" />
              </button>
              {/* Comments */}
              <button type="button" onClick={() => setCommentsOpen(!commentsOpen)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 h-10 transition-all border ${
                  commentsOpen ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-300" : "bg-white/[.06] border-white/[.06] text-zinc-300 hover:bg-white/[.1] hover:text-white"
                }`}>
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-medium">{MOCK_COMMENTS.length}</span>
              </button>
              {/* Like */}
              <button type="button" onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-full px-3.5 h-10 text-sm font-medium transition-all border ${
                  liked ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-white/[.06] border-white/[.06] text-zinc-300 hover:bg-white/[.1] hover:text-white"
                }`}>
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{fmtNum(likeCount)}</span>
              </button>
              {/* Remix */}
              <button type="button" onClick={handleRemix}
                className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-5 h-10 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
                <GitFork className="h-4 w-4" /> Remix
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right-side Comments Panel ── */}
      <CommentsPanel open={commentsOpen} onClose={() => setCommentsOpen(false)} />

      {/* ── Devices checkout overlay ── */}
      <DevicesPanel open={devicesOpen} onClose={() => setDevicesOpen(false)} />
    </div>
  );
}
