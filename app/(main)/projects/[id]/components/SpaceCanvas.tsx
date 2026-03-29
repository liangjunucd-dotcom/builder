"use client";

import React, { useState, useMemo } from "react";
import {
  Eye, MousePointer2, Hand, Pencil, Square, Undo2, Redo2, Cpu, X, Plus,
} from "lucide-react";
import {
  countByType,
  type BXMLDocument,
} from "@/lib/bxml";
import type { SpaceTool } from "./constants";

const ROOM_COLORS = [
  { color: "rgba(99,102,241,0.12)", wallColor: "rgba(99,102,241,0.5)" },
  { color: "rgba(16,185,129,0.12)", wallColor: "rgba(16,185,129,0.5)" },
  { color: "rgba(245,158,11,0.12)", wallColor: "rgba(245,158,11,0.5)" },
  { color: "rgba(236,72,153,0.12)", wallColor: "rgba(236,72,153,0.45)" },
  { color: "rgba(14,165,233,0.12)", wallColor: "rgba(14,165,233,0.45)" },
  { color: "rgba(168,85,247,0.12)", wallColor: "rgba(168,85,247,0.45)" },
  { color: "rgba(244,63,94,0.1)", wallColor: "rgba(244,63,94,0.4)" },
  { color: "rgba(34,197,94,0.12)", wallColor: "rgba(34,197,94,0.5)" },
  { color: "rgba(251,146,60,0.12)", wallColor: "rgba(251,146,60,0.5)" },
];

const DEVICE_ICON_MAP: Record<string, string> = {
  Light: "💡", MotionSensor: "👁", ContactSensor: "🚪", AirConditioner: "❄️",
  TempHumiditySensor: "🌡", WaterLeakSensor: "💧", SmokeSensor: "🔥",
  CurtainMotor: "🪟", SmartLock: "🔒", Hub: "📡", Switch: "🔌",
};

function getDeviceIcon(templateRef?: string): string {
  if (!templateRef) return "📦";
  for (const [key, icon] of Object.entries(DEVICE_ICON_MAP)) {
    if (templateRef.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "📦";
}

interface RoomCard {
  id: string;
  name: string;
  devices: { id: string; name: string; icon: string }[];
  area: number;
  col: number;
  row: number;
  colorIdx: number;
}

export function SpaceCanvas({ isDesignMode, selectedId, onSelect, bxmlDoc }: {
  isDesignMode: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  bxmlDoc?: BXMLDocument | null;
}) {
  const [tool, setTool] = useState<SpaceTool>("select");
  const [showDevices, setShowDevices] = useState(true);
  const [devicePanelOpen, setDevicePanelOpen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "day" | "evening" | "night">("day");
  const [activeScene, setActiveScene] = useState<string | null>(null);

  const TIME_OPTIONS = [
    { id: "morning" as const, label: "🌅", tip: "Morning 7:00" },
    { id: "day" as const, label: "☀️", tip: "Day 14:00" },
    { id: "evening" as const, label: "🌇", tip: "Evening 18:00" },
    { id: "night" as const, label: "🌙", tip: "Night 23:00" },
  ];
  const SCENE_TRIGGERS = [
    { id: "come_home", label: "Home", icon: "🏠" },
    { id: "leave_home", label: "Away", icon: "🚪" },
    { id: "sleep", label: "Sleep", icon: "😴" },
    { id: "movie", label: "Movie", icon: "🎬" },
  ];

  const roomCards: RoomCard[] = useMemo(() => {
    if (!bxmlDoc) return [];
    const spaces = bxmlDoc.objects.filter(o => o.type === "space");
    const devices = bxmlDoc.objects.filter(o => o.type === "device");
    const cols = Math.max(3, Math.ceil(Math.sqrt(spaces.length)));
    return spaces.map((space, i) => {
      const childDevices = devices.filter(d => d.parentId === space.id);
      const area = parseInt(space.properties.find(p => p.key === "area")?.value ?? "0");
      return {
        id: space.id,
        name: space.name,
        devices: childDevices.map(d => ({
          id: d.id,
          name: d.name,
          icon: getDeviceIcon(d.properties.find(p => p.key === "model")?.value ?? d.name),
        })),
        area,
        col: i % cols,
        row: Math.floor(i / cols),
        colorIdx: i % ROOM_COLORS.length,
      };
    });
  }, [bxmlDoc]);

  const timeOverlay = timeOfDay === "night" ? "rgba(10,10,30,0.25)" : timeOfDay === "evening" ? "rgba(30,15,5,0.15)" : timeOfDay === "morning" ? "rgba(30,25,10,0.1)" : "transparent";

  const hasData = roomCards.length > 0;
  const totalSpaces = bxmlDoc ? countByType(bxmlDoc, "space") : 0;
  const totalDevices = bxmlDoc ? countByType(bxmlDoc, "device") : 0;
  const totalArea = bxmlDoc
    ? bxmlDoc.objects.filter(o => o.type === "space").reduce((s, o) => s + parseInt(o.properties.find(p => p.key === "area")?.value ?? "0"), 0)
    : 0;

  const CARD_W = 180;
  const CARD_H = 140;
  const GAP = 16;

  return (
    <div className="relative h-full flex">
      <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #14141e 0%, #111118 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(99,102,241,.2) 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
        <div className="absolute inset-0 pointer-events-none transition-colors duration-700" style={{ background: timeOverlay }} />

        {/* Toolbar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-xl border border-zinc-700/60 bg-[#1a1a24]/95 backdrop-blur-md px-1.5 py-1 shadow-xl">
          <button type="button" onClick={() => setShowDevices(!showDevices)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${showDevices ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent"}`}>
            <Eye className="h-3 w-3" /> Devices
          </button>
          {isDesignMode && (
            <>
              <span className="w-px h-5 bg-zinc-700/40" />
              {([
                { id: "select" as SpaceTool, icon: MousePointer2, tip: "Select" },
                { id: "pan" as SpaceTool, icon: Hand, tip: "Pan" },
                { id: "draw" as SpaceTool, icon: Pencil, tip: "Draw" },
                { id: "wall" as SpaceTool, icon: Square, tip: "Wall" },
              ]).map((t) => (
                <button key={t.id} type="button" onClick={() => setTool(t.id)} className={`rounded-lg border p-1.5 transition-colors ${tool === t.id ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"}`}>
                  <t.icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <span className="w-px h-5 bg-zinc-700/40" />
              <button type="button" className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300"><Redo2 className="h-3.5 w-3.5" /></button>
              <span className="w-px h-5 bg-zinc-700/40" />
              <button type="button" onClick={() => setDevicePanelOpen(!devicePanelOpen)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${devicePanelOpen ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-zinc-500 hover:text-zinc-300 border border-transparent"}`}>
                <Cpu className="h-3 w-3" /> Place
              </button>
            </>
          )}
          {!isDesignMode && (
            <>
              <span className="w-px h-5 bg-zinc-700/40" />
              <div className="flex items-center gap-0.5">
                {TIME_OPTIONS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTimeOfDay(t.id)} title={t.tip}
                    className={`rounded-lg px-1.5 py-1 text-sm transition-all ${timeOfDay === t.id ? "bg-zinc-700/50 scale-110" : "opacity-50 hover:opacity-80"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scene trigger bar */}
        {!isDesignMode && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-xl border border-zinc-700/50 bg-[#1a1a24]/90 backdrop-blur-md px-2 py-1.5 shadow-xl">
            <span className="text-[10px] text-zinc-500 mr-1">Scenes</span>
            {SCENE_TRIGGERS.map((s) => (
              <button key={s.id} type="button" onClick={() => setActiveScene(activeScene === s.id ? null : s.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  activeScene === s.id ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10" : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-700/30"
                }`}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Canvas content: BXML-driven room cards */}
        <div className="absolute inset-0 flex items-center justify-center p-8 pt-16">
          {hasData ? (
            <svg
              viewBox={`0 0 ${Math.max(600, (Math.max(...roomCards.map(r => r.col)) + 1) * (CARD_W + GAP))} ${Math.max(320, (Math.max(...roomCards.map(r => r.row)) + 1) * (CARD_H + GAP))}`}
              className="w-full max-w-4xl h-full max-h-[500px]"
              fill="none"
            >
              <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.3" /></filter>
              </defs>
              {roomCards.map((room) => {
                const rc = ROOM_COLORS[room.colorIdx];
                const x = room.col * (CARD_W + GAP) + 10;
                const y = room.row * (CARD_H + GAP) + 10;
                const isSelected = selectedId === room.id;
                const isHovered = hoveredRoom === room.id;
                const active = isSelected || isHovered;
                return (
                  <g key={room.id}
                    className={`${isDesignMode ? "cursor-pointer" : "cursor-default"} transition-all`}
                    onClick={() => isDesignMode && onSelect(isSelected ? null : room.id)}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{ filter: active ? "url(#shadow)" : undefined }}
                  >
                    <rect x={x} y={y} width={CARD_W} height={CARD_H} rx="6"
                      fill={active ? rc.color.replace(/[\d.]+\)$/, "0.22)") : rc.color}
                      stroke={active ? rc.wallColor : "rgb(50,50,60)"}
                      strokeWidth={active ? "2" : "1"} />
                    <rect x={x} y={y} width={CARD_W} height="3" rx="1.5" fill={rc.wallColor} opacity={active ? 1 : 0.7} />
                    <rect x={x} y={y} width="3" height={CARD_H} rx="1.5" fill={rc.wallColor} opacity={active ? 0.6 : 0.3} />
                    <text x={x + CARD_W / 2} y={y + 20} className="text-[11px] font-semibold" textAnchor="middle"
                      fill={active ? "rgb(240,240,245)" : "rgb(130,130,145)"}>{room.name}</text>
                    <text x={x + CARD_W / 2} y={y + 34} className="text-[8px]" textAnchor="middle" fill="rgb(80,80,95)">
                      {room.devices.length} devices{room.area > 0 ? ` · ${room.area}m²` : ""}
                    </text>
                    {showDevices && room.devices.slice(0, 6).map((d, di) => {
                      const cols = Math.min(room.devices.length, 3);
                      const dcol = di % cols;
                      const drow = Math.floor(di / cols);
                      const dx = x + 30 + dcol * 50;
                      const dy = y + 55 + drow * 38;
                      return (
                        <g key={d.id}>
                          {active && <circle cx={dx} cy={dy} r="16" fill={rc.wallColor.replace(/[\d.]+\)$/, "0.08)")} />}
                          <circle cx={dx} cy={dy} r="11" fill="rgba(15,15,25,0.7)" stroke={active ? rc.wallColor : "rgba(80,80,100,0.4)"} strokeWidth={active ? "1.5" : "1"} />
                          <text x={dx} y={dy + 4} className="text-[10px]" textAnchor="middle" fill="white">{d.icon}</text>
                          {active && <text x={dx} y={dy + 22} className="text-[7px]" textAnchor="middle" fill="rgb(140,140,160)">{d.name.length > 10 ? d.name.slice(0, 9) + "…" : d.name}</text>}
                        </g>
                      );
                    })}
                    {isDesignMode && isSelected && (
                      <rect x={x - 3} y={y - 3} width={CARD_W + 6} height={CARD_H + 6} rx="8" fill="none" stroke={rc.wallColor} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6">
                        <animate attributeName="stroke-dashoffset" from="0" to="18" dur="1.5s" repeatCount="indefinite" />
                      </rect>
                    )}
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/8 flex items-center justify-center mx-auto mb-4">
                <Cpu className="h-8 w-8 text-indigo-400/40" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">No spaces yet</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs">Start an AI Build conversation to generate your space layout, or switch to Design mode to draw manually.</p>
            </div>
          )}
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="rounded-lg border border-zinc-700/40 bg-[#1a1a24]/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] text-zinc-500">
            {bxmlDoc ? (
              <>
                <span className="text-zinc-300 font-medium">{totalSpaces}</span> rooms ·{" "}
                <span className="text-zinc-300 font-medium">{totalDevices}</span> devices
                {totalArea > 0 && <> · <span className="text-zinc-300 font-medium">{totalArea}</span>m²</>}
              </>
            ) : (
              <span className="text-zinc-600">Waiting for BXML…</span>
            )}
          </div>
          {bxmlDoc && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[10px] text-emerald-400">BXML v{bxmlDoc.revision}</div>}
        </div>
      </div>

      {/* Device placement sidebar */}
      {isDesignMode && devicePanelOpen && (
        <aside className="w-56 shrink-0 border-l border-zinc-700/30 bg-[#14141c] overflow-auto p-3">
          <div className="flex items-center justify-between mb-3"><p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Devices</p><button type="button" onClick={() => setDevicePanelOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button></div>
          <p className="text-[11px] text-zinc-600 mb-3">Drag to place on canvas</p>
          {[{ name: "Hub M3", icon: "📡" }, { name: "Presence Sensor", icon: "👁" }, { name: "Smart Light", icon: "💡" }, { name: "AC Controller", icon: "❄️" }, { name: "Curtain Motor", icon: "🪟" }, { name: "Door Lock", icon: "🔒" }, { name: "Smart Outlet", icon: "🔌" }, { name: "Temp & Humidity", icon: "🌡" }, { name: "Smoke Detector", icon: "🔥" }].map((item) => (
            <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-zinc-700/50 bg-zinc-800/20 px-3 py-2 text-sm text-zinc-300 cursor-grab hover:border-indigo-500/30 hover:bg-indigo-500/5 active:cursor-grabbing transition-colors mb-1.5">
              <span className="text-base">{item.icon}</span>{item.name}
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}
