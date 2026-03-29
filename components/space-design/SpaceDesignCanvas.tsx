"use client";

import React, { useState, useId, useCallback } from "react";
import {
  Maximize2,
  Share2,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Undo2,
  Redo2,
  Cpu,
  Eye,
  Layers,
  Sun,
  Moon,
  RotateCcw,
} from "lucide-react";

export type CeOverlayId = "none" | "signal" | "sensor" | "automation" | "status";
export type FloorPlanToolId = "select" | "pan" | "floor" | "wall";

export interface SpaceRoom {
  id: string;
  name: string;
}

interface RoomGeometry {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  wallColor: string;
  floorColor: string;
  devices: { icon: string; label: string; x: number; y: number }[];
  furniture: { icon: string; label: string; x: number; y: number }[];
}

const DEFAULT_ROOMS: SpaceRoom[] = [
  { id: "r1", name: "Living Room" },
  { id: "r2", name: "Dining Room" },
  { id: "r3", name: "Master Bedroom" },
  { id: "r4", name: "Guest Bedroom" },
  { id: "r5", name: "Study" },
  { id: "r6", name: "Kitchen" },
  { id: "r7", name: "Bathroom" },
];

const ROOM_PALETTE: { color: string; wallColor: string; floorColor: string }[] = [
  { color: "rgba(99,102,241,0.15)", wallColor: "rgba(99,102,241,0.4)", floorColor: "rgba(99,102,241,0.08)" },
  { color: "rgba(16,185,129,0.15)", wallColor: "rgba(16,185,129,0.4)", floorColor: "rgba(16,185,129,0.08)" },
  { color: "rgba(245,158,11,0.15)", wallColor: "rgba(245,158,11,0.35)", floorColor: "rgba(245,158,11,0.06)" },
  { color: "rgba(236,72,153,0.12)", wallColor: "rgba(236,72,153,0.35)", floorColor: "rgba(236,72,153,0.06)" },
  { color: "rgba(14,165,233,0.12)", wallColor: "rgba(14,165,233,0.35)", floorColor: "rgba(14,165,233,0.06)" },
  { color: "rgba(168,85,247,0.12)", wallColor: "rgba(168,85,247,0.35)", floorColor: "rgba(168,85,247,0.06)" },
  { color: "rgba(244,63,94,0.12)", wallColor: "rgba(244,63,94,0.35)", floorColor: "rgba(244,63,94,0.06)" },
  { color: "rgba(34,197,94,0.12)", wallColor: "rgba(34,197,94,0.35)", floorColor: "rgba(34,197,94,0.06)" },
];

function buildRoomGeometry(rooms: SpaceRoom[]): RoomGeometry[] {
  const layouts: { x: number; y: number; w: number; h: number }[] = [
    { x: 20, y: 20, w: 220, h: 150 },
    { x: 260, y: 20, w: 140, h: 150 },
    { x: 420, y: 20, w: 130, h: 120 },
    { x: 420, y: 160, w: 130, h: 120 },
    { x: 20, y: 190, w: 130, h: 110 },
    { x: 170, y: 190, w: 130, h: 110 },
    { x: 320, y: 190, w: 110, h: 110 },
    { x: 420, y: 300, w: 130, h: 80 },
  ];

  const deviceSets = [
    [{ icon: "📡", label: "Hub M3", x: 0.15, y: 0.2 }, { icon: "💡", label: "Main Light", x: 0.5, y: 0.5 }, { icon: "👁", label: "Motion Sensor", x: 0.8, y: 0.3 }],
    [{ icon: "💡", label: "Dining Light", x: 0.5, y: 0.5 }, { icon: "🌡", label: "Temp & Humidity", x: 0.2, y: 0.3 }],
    [{ icon: "💡", label: "Bedroom Light", x: 0.5, y: 0.4 }, { icon: "🪟", label: "Curtain Motor", x: 0.9, y: 0.5 }, { icon: "👁", label: "Motion Sensor", x: 0.2, y: 0.7 }],
    [{ icon: "💡", label: "Light", x: 0.5, y: 0.5 }, { icon: "🪟", label: "Curtain Motor", x: 0.9, y: 0.5 }],
    [{ icon: "💡", label: "Study Light", x: 0.5, y: 0.4 }, { icon: "🔌", label: "Smart Plug", x: 0.8, y: 0.7 }],
    [{ icon: "👁", label: "Smoke Alarm", x: 0.3, y: 0.4 }, { icon: "💧", label: "Water Leak Sensor", x: 0.7, y: 0.7 }],
    [{ icon: "💡", label: "Bathroom Light", x: 0.5, y: 0.4 }, { icon: "👁", label: "Motion Sensor", x: 0.3, y: 0.7 }],
    [{ icon: "🌡", label: "Temp & Humidity", x: 0.5, y: 0.5 }],
  ];

  const furnitureSets = [
    [{ icon: "🛋", label: "Sofa", x: 0.3, y: 0.7 }, { icon: "📺", label: "TV", x: 0.7, y: 0.2 }],
    [{ icon: "🪑", label: "Dining Table", x: 0.5, y: 0.5 }],
    [{ icon: "🛏", label: "Master Bed", x: 0.5, y: 0.5 }],
    [{ icon: "🛏", label: "Single Bed", x: 0.5, y: 0.5 }],
    [{ icon: "🪑", label: "Desk", x: 0.5, y: 0.4 }],
    [],
    [],
    [],
  ];

  return rooms.map((room, i) => {
    const layout = layouts[i % layouts.length];
    const palette = ROOM_PALETTE[i % ROOM_PALETTE.length];
    return {
      id: room.id,
      name: room.name,
      ...layout,
      ...palette,
      devices: deviceSets[i % deviceSets.length] ?? [],
      furniture: furnitureSets[i % furnitureSets.length] ?? [],
    };
  });
}

export interface SpaceDesignCanvasProps {
  className?: string;
  rooms?: SpaceRoom[];
  onRoomsChange?: (rooms: SpaceRoom[]) => void;
}

export function SpaceDesignCanvas({ className, rooms: controlledRooms, onRoomsChange }: SpaceDesignCanvasProps) {
  const uid = useId().replace(/:/g, "");
  const [floorPlanView, setFloorPlanView] = useState<"2d" | "3d">("2d");
  const [placeDevicesOpen, setPlaceDevicesOpen] = useState(false);
  const [ceOverlay, setCeOverlay] = useState<CeOverlayId>("none");
  const [floorPlanTool, setFloorPlanTool] = useState<FloorPlanToolId>("select");
  const [showDeviceLabels, setShowDeviceLabels] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [view3DRotate, setView3DRotate] = useState({ x: -30, y: 35 });
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [internalRooms, setInternalRooms] = useState<SpaceRoom[]>(DEFAULT_ROOMS);
  const rooms = controlledRooms ?? internalRooms;
  const setRooms = onRoomsChange ?? setInternalRooms;

  const roomGeos = buildRoomGeometry(rooms);

  const handleReset3D = useCallback(() => {
    setView3DRotate({ x: -30, y: 35 });
  }, []);

  const roomFill = `roomFill-${uid}`;
  const grid2d = `grid2d-${uid}`;
  const roomShadow = `roomShadow-${uid}`;
  const signalGrad1 = `signalGrad1-${uid}`;
  const signalGrad2 = `signalGrad2-${uid}`;
  const sensorGrad1 = `sensorGrad1-${uid}`;
  const automationGlow = `automationGlow-${uid}`;

  const WALL_HEIGHT = 40;

  const render2DView = () => (
    <svg viewBox="0 0 580 400" className="w-full max-w-4xl h-full max-h-[440px]" fill="none">
      <defs>
        <linearGradient id={roomFill} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(39, 39, 42)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(24, 24, 27)" stopOpacity="0.98" />
        </linearGradient>
        <pattern id={grid2d} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(63, 63, 70)" strokeWidth="0.3" strokeOpacity="0.5" />
        </pattern>
        <filter id={roomShadow} x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgb(0,0,0)" floodOpacity="0.3" />
        </filter>
        <radialGradient id={signalGrad1} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.45" />
          <stop offset="70%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={signalGrad2} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={sensorGrad1} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0" />
        </linearGradient>
        <filter id={automationGlow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="580" height="400" fill="rgb(15, 15, 18)" />
      <rect x="0" y="0" width="580" height="400" fill={`url(#${grid2d})`} />

      {roomGeos.map((room) => (
        <g key={room.id}>
          <rect
            x={room.x} y={room.y} width={room.w} height={room.h} rx="4"
            fill={selectedRoomId === room.id ? room.color.replace(/[\d.]+\)$/, "0.3)") : room.floorColor}
            stroke={selectedRoomId === room.id ? room.wallColor : "rgb(63, 63, 70)"}
            strokeWidth={selectedRoomId === room.id ? "2.5" : "1.5"}
            filter={`url(#${roomShadow})`}
            className="cursor-pointer transition-all"
            onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
          />
          <line
            x1={room.x} y1={room.y} x2={room.x + room.w} y2={room.y}
            stroke={room.wallColor} strokeWidth="3" strokeLinecap="round"
          />
          <text
            x={room.x + room.w / 2} y={room.y + 18}
            className="text-[11px] font-semibold" textAnchor="middle"
            fill={selectedRoomId === room.id ? "rgb(229, 231, 235)" : "rgb(161, 161, 170)"}
          >
            {room.name}
          </text>

          {showDeviceLabels && room.devices.map((d, di) => (
            <g key={`d-${di}`}>
              <circle
                cx={room.x + room.w * d.x} cy={room.y + room.h * d.y} r="10"
                fill="rgba(0,0,0,0.5)" stroke="rgba(99,102,241,0.5)" strokeWidth="1"
              />
              <text
                x={room.x + room.w * d.x} y={room.y + room.h * d.y + 4}
                className="text-[9px]" textAnchor="middle" fill="white"
              >
                {d.icon}
              </text>
              <text
                x={room.x + room.w * d.x} y={room.y + room.h * d.y + 18}
                className="text-[7px]" textAnchor="middle" fill="rgb(113, 113, 122)"
              >
                {d.label}
              </text>
            </g>
          ))}

          {showDeviceLabels && room.furniture.map((f, fi) => (
            <g key={`f-${fi}`}>
              <text
                x={room.x + room.w * f.x} y={room.y + room.h * f.y + 4}
                className="text-[11px]" textAnchor="middle" fill="rgba(161,161,170,0.6)"
              >
                {f.icon}
              </text>
            </g>
          ))}
        </g>
      ))}

      {ceOverlay === "signal" && (
        <>
          <ellipse cx="145" cy="85" rx="100" ry="60" fill={`url(#${signalGrad1})`} />
          <circle cx="145" cy="85" r="20" fill="rgb(59, 130, 246)" fillOpacity="0.5" stroke="rgb(96, 165, 250)" strokeWidth="2" />
          <ellipse cx="330" cy="90" rx="55" ry="45" fill={`url(#${signalGrad2})`} />
          <circle cx="330" cy="90" r="15" fill="rgb(59, 130, 246)" fillOpacity="0.5" stroke="rgb(96, 165, 250)" strokeWidth="1.5" />
        </>
      )}
      {ceOverlay === "sensor" && (
        <>
          <path d="M 160 160 L 60 70 L 220 70 Z" fill={`url(#${sensorGrad1})`} stroke="rgb(251, 191, 36)" strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx="160" cy="120" r="7" fill="rgb(251, 191, 36)" fillOpacity="0.9" />
        </>
      )}
      {ceOverlay === "automation" && (
        <>
          <rect x="25" y="25" width="210" height="140" rx="8" fill="rgb(16, 185, 129)" fillOpacity="0.1" stroke="rgb(52, 211, 153)" strokeWidth="2.5" strokeOpacity="0.7" filter={`url(#${automationGlow})`} />
          <text x="130" y="100" className="text-xs font-medium" textAnchor="middle" fill="rgba(52,211,153,0.8)">Trigger Zone</text>
        </>
      )}
      {ceOverlay === "status" && (
        <>
          {roomGeos.slice(0, 3).map((room, i) => (
            <circle key={`status-${i}`} cx={room.x + room.w * 0.15} cy={room.y + room.h * 0.25} r={i === 1 ? 12 : 14} className={i === 1 ? "fill-zinc-500/40 stroke-zinc-400" : "fill-emerald-500/40 stroke-emerald-400"} strokeWidth="2">
              {i !== 1 && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />}
            </circle>
          ))}
        </>
      )}

      <line x1="24" y1="380" x2="124" y2="380" stroke="rgb(82, 82, 91)" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="74" y="394" className="text-[9px]" textAnchor="middle" fill="rgb(82, 82, 91)">0 — 2m — 4m</text>
    </svg>
  );

  const render3DView = () => {
    const svgW = 700;
    const svgH = 500;

    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgb(20,20,28) 0%, rgb(10,10,14) 100%)" }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          setIsDragging3D(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          if (!isDragging3D) return;
          setView3DRotate((prev) => ({
            x: Math.max(-60, Math.min(5, prev.x + (e.clientY - dragStart.y) * 0.4)),
            y: prev.y + (e.clientX - dragStart.x) * 0.4,
          }));
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseUp={() => setIsDragging3D(false)}
        onMouseLeave={() => setIsDragging3D(false)}
      >
        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1600px" }}>
          <div
            style={{
              width: "min(92%, 780px)",
              aspectRatio: `${svgW}/${svgH}`,
              maxHeight: "480px",
              transform: `rotateX(${view3DRotate.x}deg) rotateY(${view3DRotate.y}deg)`,
              transformStyle: "preserve-3d",
              transition: isDragging3D ? "none" : "transform 0.3s ease-out",
            }}
          >
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-full block"
              fill="none"
              style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
            >
              <defs>
                <pattern id={`grid3d-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(40, 40, 50)" strokeWidth="0.4" />
                </pattern>
                <linearGradient id={`floor3d-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(22, 22, 28)" />
                  <stop offset="100%" stopColor="rgb(16, 16, 20)" />
                </linearGradient>
                <filter id={`innerGlow-${uid}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect x="0" y="60" width={svgW} height={svgH - 60} fill={`url(#floor3d-${uid})`} rx="8" />
              <rect x="0" y="60" width={svgW} height={svgH - 60} fill={`url(#grid3d-${uid})`} rx="8" opacity="0.6" />

              {roomGeos.map((room, i) => {
                const scale = 1.15;
                const ox = 50;
                const oy = 80;
                const rx = room.x * scale + ox;
                const ry = room.y * scale + oy;
                const rw = room.w * scale;
                const rh = room.h * scale;
                const wh = WALL_HEIGHT;
                const isSelected = selectedRoomId === room.id;

                return (
                  <g key={room.id} className="cursor-pointer" onClick={() => setSelectedRoomId(isSelected ? null : room.id)}>
                    <rect
                      x={rx} y={ry} width={rw} height={rh} rx="3"
                      fill={isSelected ? room.color.replace(/[\d.]+\)$/, "0.25)") : room.floorColor}
                      stroke={isSelected ? room.wallColor : "rgb(50, 50, 60)"}
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    <rect
                      x={rx} y={ry - wh} width={rw} height={wh} rx="2"
                      fill={room.wallColor.replace(/[\d.]+\)$/, "0.15)")}
                      stroke={room.wallColor.replace(/[\d.]+\)$/, "0.6)")}
                      strokeWidth="1"
                    />
                    <line x1={rx} y1={ry} x2={rx} y2={ry - wh} stroke={room.wallColor.replace(/[\d.]+\)$/, "0.5)")} strokeWidth="1" />
                    <line x1={rx + rw} y1={ry} x2={rx + rw} y2={ry - wh} stroke={room.wallColor.replace(/[\d.]+\)$/, "0.3)")} strokeWidth="1" />

                    <rect
                      x={rx} y={ry - wh} width={3} height={wh} rx="1"
                      fill={room.wallColor.replace(/[\d.]+\)$/, "0.5)")}
                    />
                    <rect
                      x={rx + rw - 3} y={ry - wh} width={3} height={wh} rx="1"
                      fill={room.wallColor.replace(/[\d.]+\)$/, "0.3)")}
                    />

                    <text
                      x={rx + rw / 2} y={ry - wh / 2 + 4}
                      className="text-[11px] font-semibold"
                      textAnchor="middle"
                      fill={isSelected ? "rgb(255,255,255)" : "rgb(180, 180, 190)"}
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      {room.name}
                    </text>

                    {room.devices.map((d, di) => (
                      <g key={`3d-d-${di}`}>
                        <circle
                          cx={rx + rw * d.x} cy={ry + rh * d.y} r="11"
                          fill="rgba(0,0,0,0.6)" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5"
                        />
                        <text
                          x={rx + rw * d.x} y={ry + rh * d.y + 4}
                          className="text-[10px]" textAnchor="middle" fill="white"
                        >
                          {d.icon}
                        </text>
                      </g>
                    ))}

                    {room.furniture.map((f, fi) => (
                      <g key={`3d-f-${fi}`}>
                        <text
                          x={rx + rw * f.x} y={ry + rh * f.y + 5}
                          className="text-[13px]" textAnchor="middle" fill="rgba(180,180,190,0.5)"
                        >
                          {f.icon}
                        </text>
                      </g>
                    ))}

                    {isSelected && (
                      <rect
                        x={rx - 2} y={ry - wh - 2} width={rw + 4} height={rh + wh + 4} rx="5"
                        fill="none" stroke={room.wallColor} strokeWidth="2" strokeDasharray="6 3" opacity="0.6"
                      />
                    )}
                  </g>
                );
              })}

              <line x1="60" y1={svgH - 20} x2="160" y2={svgH - 20} stroke="rgb(70, 70, 80)" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="110" y={svgH - 8} className="text-[8px]" textAnchor="middle" fill="rgb(70, 70, 80)">0 — 2m — 4m</text>
            </svg>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <span className="text-[11px] text-zinc-500">Drag to rotate 3D view</span>
            <button
              type="button"
              onClick={handleReset3D}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 backdrop-blur"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset View
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <select className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200">
            <option>3-Bed 2-Living</option>
            <option>Floor 2</option>
          </select>
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => setFloorPlanView("2d")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${floorPlanView === "2d" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => setFloorPlanView("3d")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${floorPlanView === "3d" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              3D
            </button>
          </div>
          <span className="w-px h-5 bg-zinc-700" />
          <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"><Maximize2 className="h-4 w-4" /></button>
          <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"><ZoomIn className="h-4 w-4" /></button>
          <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"><ZoomOut className="h-4 w-4" /></button>
          <span className="w-px h-5 bg-zinc-700" />
          <button
            type="button"
            onClick={() => setShowDeviceLabels((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${showDeviceLabels ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" : "border-zinc-700 bg-zinc-800 text-zinc-500"}`}
          >
            <Eye className="h-3.5 w-3.5" /> Device Labels
          </button>
        </div>
        <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700">
          <Share2 className="h-4 w-4 inline mr-1" />Share
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/60 overflow-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-zinc-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Space Layout</p>
              </div>
              <button type="button" className="text-zinc-500 hover:text-zinc-300 text-lg leading-none" title="Add Room">+</button>
            </div>
            <ul className="space-y-0.5">
              {roomGeos.map((room) => {
                const isActive = selectedRoomId === room.id;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRoomId(isActive ? null : room.id)}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all ${
                        isActive ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: room.wallColor }}
                      />
                      <span className="flex-1 text-left truncate">{room.name}</span>
                      <span className="text-[10px] text-zinc-600">{room.devices.length} devices</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="border-t border-zinc-800 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Summary</p>
            <div className="space-y-1.5 text-xs text-zinc-500">
              <div className="flex justify-between">
                <span>Rooms</span>
                <span className="text-zinc-300">{rooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Devices</span>
                <span className="text-zinc-300">{roomGeos.reduce((s, r) => s + r.devices.length, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Furniture</span>
                <span className="text-zinc-300">{roomGeos.reduce((s, r) => s + r.furniture.length, 0)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* CE Overlay toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-md px-1.5 py-1 shadow-2xl">
            {(
              [
                { id: "signal" as const, label: "Signal Coverage", icon: "📡" },
                { id: "sensor" as const, label: "Sensor Range", icon: "👁" },
                { id: "automation" as const, label: "Trigger Zone", icon: "⚡" },
                { id: "status" as const, label: "Device Status", icon: "●" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCeOverlay(ceOverlay === tab.id ? "none" : tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  ceOverlay === tab.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 border border-transparent"
                }`}
              >
                <span className="opacity-80">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2D View */}
          {floorPlanView === "2d" && (
            <div className="absolute inset-0 flex items-center justify-center p-6 pt-14" style={{ background: "radial-gradient(ellipse at 50% 50%, rgb(20,20,26) 0%, rgb(12,12,15) 100%)" }}>
              {render2DView()}
            </div>
          )}

          {/* 3D View */}
          {floorPlanView === "3d" && render3DView()}

          {/* Floor plan tools */}
          {floorPlanView === "2d" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-md px-2 py-1.5 shadow-2xl">
              {([
                { id: "select" as FloorPlanToolId, icon: MousePointer2, label: "Select" },
                { id: "pan" as FloorPlanToolId, icon: Hand, label: "Pan" },
                { id: "floor" as FloorPlanToolId, icon: Pencil, label: "Draw Floor" },
                { id: "wall" as FloorPlanToolId, icon: Square, label: "Wall" },
              ]).map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setFloorPlanTool(tool.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    floorPlanTool === tool.id
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  <tool.icon className="h-4 w-4" /> {tool.label}
                </button>
              ))}
              <span className="w-px h-5 bg-zinc-700 mx-0.5" />
              <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700"><Undo2 className="h-4 w-4" /></button>
              <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700"><Redo2 className="h-4 w-4" /></button>
              <span className="w-px h-5 bg-zinc-700 mx-0.5" />
              <button
                type="button"
                onClick={() => setPlaceDevicesOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  placeDevicesOpen
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                <Cpu className="h-4 w-4" /> Place Devices
              </button>
            </div>
          )}
        </main>

        {/* Place Devices sidebar */}
        {placeDevicesOpen && (
          <aside className="w-64 flex-shrink-0 border-l border-zinc-800 bg-zinc-950/60 overflow-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Place Devices</p>
                <button type="button" onClick={() => setPlaceDevicesOpen(false)} className="text-zinc-500 hover:text-zinc-300">×</button>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Drag onto floor plan to place</p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Smart Devices</p>
              <div className="space-y-1.5 mb-5">
                {[
                  { name: "Hub M3", icon: "📡" },
                  { name: "Motion Sensor", icon: "👁" },
                  { name: "Smart Light", icon: "💡" },
                  { name: "AC Controller", icon: "❄️" },
                  { name: "Curtain Motor", icon: "🪟" },
                  { name: "Smart Lock", icon: "🔒" },
                  { name: "Smart Plug", icon: "🔌" },
                  { name: "Temp & Humidity Sensor", icon: "🌡" },
                  { name: "Smoke Detector", icon: "🔥" },
                  { name: "Camera", icon: "📹" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-zinc-700/80 bg-zinc-800/40 px-3 py-2.5 text-sm text-zinc-300 cursor-grab hover:border-zinc-600 hover:bg-zinc-800/60 active:cursor-grabbing transition-colors">
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Furniture</p>
              <div className="space-y-1.5">
                {[
                  { name: "Sofa", icon: "🛋" },
                  { name: "Bed", icon: "🛏" },
                  { name: "Dining Table", icon: "🪑" },
                  { name: "Desk", icon: "📝" },
                  { name: "Wardrobe", icon: "🗄" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-zinc-700/80 bg-zinc-800/40 px-3 py-2.5 text-sm text-zinc-300 cursor-grab hover:border-zinc-600 hover:bg-zinc-800/60 active:cursor-grabbing transition-colors">
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
