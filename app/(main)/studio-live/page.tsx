"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Video,
  Radio,
  Users,
  Clock,
  Zap,
  Lightbulb,
  Thermometer,
  Lock,
  Eye,
  Wifi,
  Heart,
  AlertTriangle,
  Building2,
  Leaf,
  ShoppingBag,
  Baby,
  Activity,
} from "lucide-react";

type StudioMode = "simulate" | "real";
type ChatMessage = { role: "user" | "assistant" | "system"; text: string; timestamp: string };

/* ── Scenario System ── */
interface Scenario {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  devices: { name: string; status: string; icon: string }[];
  quickCommands: { label: string; icon: React.ElementType }[];
  aiResponses: Record<string, string>;
  visualState: {
    default: { emoji: string; bg: string; hint: string };
    active: { emoji: string; bg: string; hint: string };
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: "comfort",
    label: "Home Comfort",
    icon: Heart,
    color: "amber",
    description: "Auto-link temperature, humidity, and lighting for a comfortable living environment",
    devices: [
      { name: "Hub M3", status: "online", icon: "📡" },
      { name: "Living Room Light", status: "off", icon: "💡" },
      { name: "FP2 Presence Sensor", status: "online", icon: "👁" },
      { name: "AC Controller", status: "online", icon: "❄️" },
      { name: "Curtain Motor", status: "closed", icon: "🪟" },
      { name: "Temp & Humidity Sensor", status: "24.5°C", icon: "🌡" },
    ],
    quickCommands: [
      { label: "Turn on living room light", icon: Lightbulb },
      { label: "Set comfort mode", icon: Thermometer },
      { label: "View environment data", icon: Activity },
      { label: "Set AC to 24°C", icon: Thermometer },
    ],
    aiResponses: {
      "Turn on living room light": "💡 Living room light is ON (Brightness 100%, Color temp 4000K).\nCurrent room temp 24.5°C, Humidity 45%, comfortable.",
      "Set comfort mode": "🌿 Comfort Mode activated:\n• Lighting → 70%, 3000K warm\n• AC → 24°C auto\n• Curtains → Half open\n\nFP2 detected 1 person in the sofa area; comfort optimized for that zone.",
      "View environment data": "📊 Current environment data:\n• Temperature 24.5°C (Comfort range 22-26°C ✅)\n• Humidity 45% RH (Comfort range 40-60% ✅)\n• PM2.5 35μg/m³ ✅\n• CO2 520ppm ✅\n• Illuminance 380lux\n\nOverall score: 92 (Excellent)",
      "Set AC to 24°C": "❄️ AC set to 24°C auto mode.\nCurrent room temp 24.5°C → ETA ~3 minutes.",
    },
    visualState: {
      default: { emoji: "🏠", bg: "rgb(9, 9, 15)", hint: "Awaiting commands..." },
      active: { emoji: "💡", bg: "radial-gradient(ellipse at 50% 60%, rgba(250,204,21,0.12) 0%, rgba(9,9,15,1) 70%)", hint: "Comfort mode activated" },
    },
  },
  {
    id: "care",
    label: "Elderly Care",
    icon: Activity,
    color: "rose",
    description: "Fall detection, activity anomaly alerts, and scheduled reminders",
    devices: [
      { name: "Hub M3", status: "online", icon: "📡" },
      { name: "FP2 Presence Sensor", status: "online", icon: "👁" },
      { name: "Emergency Button", status: "standby", icon: "🆘" },
      { name: "Night Light", status: "auto", icon: "🌙" },
      { name: "Door/Window Sensor", status: "closed", icon: "🚪" },
      { name: "Smoke Detector", status: "normal", icon: "🔥" },
    ],
    quickCommands: [
      { label: "View activity status", icon: Eye },
      { label: "Simulate fall detection", icon: AlertTriangle },
      { label: "Enable night care", icon: Lightbulb },
      { label: "Send safety report", icon: Activity },
    ],
    aiResponses: {
      "View activity status": "👤 Activity tracking:\n• Bedroom → Woke up at 7:30\n• Kitchen → Active for 15min at 8:00\n• Living room → 9:00 to now (sofa area)\n• Today's activity index: 76/100 ✅\n\nAnomaly detection: None ✅",
      "Simulate fall detection": "🚨 [Simulated] FP2 detected a suspected fall!\n• Location: Bathroom\n• Time: Just now\n• Auto actions:\n  ① Night light fully on\n  ② Emergency button activated\n  ③ Emergency contact notified (sent)\n  ④ If not cancelled in 30s → Call emergency services\n\nThis is a simulation. Actual deployment will connect to real alarm systems.",
      "Enable night care": "🌙 Night care enabled:\n• Hallway night light → Motion-activated\n• Bathroom light → Auto 30% warm light\n• FP2 → Enhanced monitoring (detect out-of-bed/fall)\n• Front door → Auto-locked, abnormal opening alert",
      "Send safety report": "📋 Today's safety report:\n• Wake up 7:30 · Bedtime --:--\n• Activity index 76/100\n• Medication reminder: 2/3 completed\n• Anomaly events: 0\n• Device status: All normal\n\nReport sent to linked family members.",
    },
    visualState: {
      default: { emoji: "👴", bg: "rgb(9, 9, 15)", hint: "Care monitoring standby" },
      active: { emoji: "🩺", bg: "radial-gradient(ellipse at 50% 60%, rgba(244,63,94,0.1) 0%, rgba(9,9,15,1) 70%)", hint: "Care mode running" },
    },
  },
  {
    id: "security",
    label: "Security Alert",
    icon: AlertTriangle,
    color: "red",
    description: "Intrusion detection, smoke alarm, and water leak alerts",
    devices: [
      { name: "Hub M3", status: "online", icon: "📡" },
      { name: "Smart Door Lock", status: "locked", icon: "🔒" },
      { name: "Camera G3", status: "online", icon: "📹" },
      { name: "Door/Window Sensor × 3", status: "closed", icon: "🚪" },
      { name: "Smoke Detector", status: "normal", icon: "🔥" },
      { name: "Water Leak Sensor", status: "normal", icon: "💧" },
    ],
    quickCommands: [
      { label: "Arm all zones", icon: Lock },
      { label: "Simulate intrusion alert", icon: AlertTriangle },
      { label: "Simulate smoke alarm", icon: AlertTriangle },
      { label: "View security status", icon: Eye },
    ],
    aiResponses: {
      "Arm all zones": "🛡 All zones armed:\n• Door lock → Locked\n• Camera → Motion detection ON\n• Door/window sensors → All monitoring\n• Smoke / water leak → Real-time alerts\n\nAny anomaly will push to App and trigger local alarm.",
      "Simulate intrusion alert": "🚨 [Simulated] Anomaly alert!\n• Front door sensor triggered\n• Camera detected moving target\n• Auto actions:\n  ① All lights flashing\n  ② Siren activated\n  ③ Recording started (30s pre-roll saved)\n  ④ Notification sent to owner + property mgmt",
      "Simulate smoke alarm": "🔥 [Simulated] Kitchen smoke level exceeded!\n• Smoke detector triggered\n• Auto actions:\n  ① All lights ON\n  ② AC turned off (prevent smoke spread)\n  ③ Curtains opened for ventilation\n  ④ Alert pushed to all members\n  ⑤ If not cancelled in 60s → Notify fire dept",
      "View security status": "🔐 Security status overview:\n• Door lock: Locked ✅\n• Camera: Online ✅\n• Door/window sensors: 3/3 closed ✅\n• Smoke: Normal ✅\n• Water leak: Normal ✅\n• Recent alerts: None (24h)",
    },
    visualState: {
      default: { emoji: "🛡", bg: "rgb(9, 9, 15)", hint: "Security standby" },
      active: { emoji: "🚨", bg: "radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.12) 0%, rgba(9,9,15,1) 70%)", hint: "Armed" },
    },
  },
  {
    id: "retail",
    label: "Retail Operations",
    icon: ShoppingBag,
    color: "emerald",
    description: "Store environment management, foot traffic analysis, energy monitoring",
    devices: [
      { name: "Hub M3", status: "online", icon: "📡" },
      { name: "Storefront LED Strip", status: "on", icon: "💡" },
      { name: "FP2 × 2 (Entrance + Interior)", status: "online", icon: "👁" },
      { name: "AC Panel", status: "24°C", icon: "❄️" },
      { name: "Smart Plug (Register)", status: "on", icon: "🔌" },
      { name: "Access Control", status: "open", icon: "🚪" },
    ],
    quickCommands: [
      { label: "Open store mode", icon: Lightbulb },
      { label: "View today's traffic", icon: Users },
      { label: "View energy report", icon: Leaf },
      { label: "Close store mode", icon: Lock },
    ],
    aiResponses: {
      "Open store mode": "🏪 Store open mode enabled:\n• Storefront LED → Full on (brand color)\n• Indoor lighting → 100% neutral white\n• AC → 24°C\n• Background music → Playing\n• Access → Unlocked\n\nBusiness hours today: 09:00 - 21:00",
      "View today's traffic": "📊 Today's foot traffic:\n• 127 visits (as of now)\n• Peak hours: 14:00 - 16:00 (38 visits)\n• Average dwell time: 8.5 min\n• Conversion rate: 23%\n\nCompared to yesterday ↑ 12%",
      "View energy report": "⚡ Today's energy usage:\n• Lighting 4.2 kWh\n• AC 8.7 kWh\n• Other 1.3 kWh\n• Total 14.2 kWh (daily avg 15.8 → saved 10%)\n\nSuggestion: Reduce lighting to 70% during off-peak hours for ~8% more savings.",
      "Close store mode": "🌙 Store closed mode:\n• Indoor lighting → Off\n• Storefront LED → Night mode (dim)\n• AC → Off\n• Access → Locked\n• Camera → Motion detection ON\n• Today's business summary archived",
    },
    visualState: {
      default: { emoji: "🏪", bg: "rgb(9, 9, 15)", hint: "Store standby" },
      active: { emoji: "🛍", bg: "radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.1) 0%, rgba(9,9,15,1) 70%)", hint: "Store operating" },
    },
  },
  {
    id: "building",
    label: "Building Energy",
    icon: Building2,
    color: "blue",
    description: "Central HVAC optimization, lighting strategy, peak load management",
    devices: [
      { name: "Building Gateway", status: "online", icon: "📡" },
      { name: "Floor Lighting × 8", status: "schedule", icon: "💡" },
      { name: "FP2 × 12 (All Floors)", status: "online", icon: "👁" },
      { name: "Central HVAC Control", status: "auto", icon: "❄️" },
      { name: "Power Meter Gateway", status: "online", icon: "⚡" },
      { name: "Elevator Controller", status: "normal", icon: "🛗" },
    ],
    quickCommands: [
      { label: "View building energy", icon: Leaf },
      { label: "Optimize HVAC strategy", icon: Thermometer },
      { label: "Turn off vacant floor lights", icon: Lightbulb },
      { label: "Peak load shaving", icon: Zap },
    ],
    aiResponses: {
      "View building energy": "🏢 Building energy overview (today):\n• Total consumption 342 kWh\n• HVAC 58% (198 kWh)\n• Lighting 24% (82 kWh)\n• Elevator + other 18% (62 kWh)\n\nCompared to last week ↓ 8.5%\nMonthly target achieved 87%",
      "Optimize HVAC strategy": "❄️ AI HVAC optimization suggestions:\n• 3F / 7F currently vacant → Recommend shutdown\n• 5F meeting room has booking at 14:00 → Pre-cool 10min ahead\n• Overall setpoint from 23°C → 24°C (save ~12%)\n\nExecute?",
      "Turn off vacant floor lights": "💡 Vacant floor detection results:\n• 3F — Vacant 30min → Lights off\n• 7F — Vacant 45min → Lights off\n• Other floors have activity\n\nEstimated savings ~3.2 kWh/h",
      "Peak load shaving": "⚡ Peak shaving strategy enabled (14:00 - 17:00):\n• Non-core floors HVAC +1°C\n• Elevator → Energy saving mode (skip floors)\n• Lighting → Smart dimming 80%\n\nEstimated peak electricity cost reduction ~15%",
    },
    visualState: {
      default: { emoji: "🏢", bg: "rgb(9, 9, 15)", hint: "Building standby" },
      active: { emoji: "📊", bg: "radial-gradient(ellipse at 50% 60%, rgba(59,130,246,0.1) 0%, rgba(9,9,15,1) 70%)", hint: "Energy strategy running" },
    },
  },
];

function getTimeStr() {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function SpaceLabPage() {
  const [mode, setMode] = useState<StudioMode>("simulate");
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queuePosition] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sceneActive, setSceneActive] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat when switching scenarios
  const switchScenario = (s: Scenario) => {
    setActiveScenario(s);
    setSceneActive(false);
    setMessages([{
      role: "system",
      text: `Switched to "${s.label}" scenario\n${s.description}\n\nClick a quick command below to get started, or type a command directly.`,
      timestamp: getTimeStr(),
    }]);
  };

  useEffect(() => {
    setMessages([{
      role: "system",
      text: `Welcome to Space Lab! Select a scenario to experience real space intelligence.\n\nCurrent scenario: ${activeScenario.label} — ${activeScenario.description}`,
      timestamp: getTimeStr(),
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = (text?: string) => {
    const msg = (text ?? chatInput).trim();
    if (!msg) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg, timestamp: getTimeStr() }]);
    setIsTyping(true);

    setSceneActive(true);

    setTimeout(() => {
      setIsTyping(false);
      const matchKey = Object.keys(activeScenario.aiResponses).find((k) => msg.includes(k));
      const reply = matchKey
        ? activeScenario.aiResponses[matchKey]
        : `Command "${msg}" received. Executing via OpenClaw Agent...\n✅ Operation complete.`;
      setMessages((prev) => [...prev, { role: "assistant", text: reply, timestamp: getTimeStr() }]);
    }, 600 + Math.random() * 600);
  };

  const handleSwitchMode = () => {
    if (mode === "real") {
      setMode("simulate");
      setMessages((prev) => [...prev, { role: "system", text: "Switched to simulate mode.", timestamp: getTimeStr() }]);
    } else {
      setMode("real");
      setMessages((prev) => [...prev, { role: "system", text: `Joined real Studio queue. ${queuePosition} people ahead, estimated wait ~${queuePosition * 3} minutes.`, timestamp: getTimeStr() }]);
    }
  };

  const vis = sceneActive ? activeScenario.visualState.active : activeScenario.visualState.default;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between shrink-0" style={{ background: "rgba(9, 9, 18, 0.8)" }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-zinc-100">Space Lab</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              {mode === "real" ? "Real Studio" : "Simulate"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">Experience real space intelligence scenarios — control simulated or real devices via AI Agent</p>
        </div>
        <button
          type="button"
          onClick={handleSwitchMode}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
            mode === "real"
              ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15"
              : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15"
          }`}
        >
          <Video className="h-4 w-4" />
          {mode === "real" ? "Switch to Simulate" : "Connect Real Studio"}
        </button>
      </div>

      {/* Scenario Tabs */}
      <div className="border-b border-zinc-800/40 px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0" style={{ background: "rgba(9, 9, 18, 0.6)" }}>
        {SCENARIOS.map((s) => {
          const isActive = activeScenario.id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium shrink-0 transition-all ${
                isActive
                  ? `${COLOR_MAP[s.color]} border`
                  : "border-zinc-800/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Visual + Devices */}
        <div className="w-[400px] flex-shrink-0 border-r border-zinc-800/60 flex flex-col overflow-hidden">
          {/* Visual Panel */}
          <div className="relative aspect-video flex-shrink-0 border-b border-zinc-800/60">
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: vis.bg }}>
              {mode === "simulate" ? (
                <div className="text-center">
                  <div className={`text-5xl mb-2 transition-all duration-500 ${sceneActive ? "opacity-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "opacity-30"}`}>
                    {vis.emoji}
                  </div>
                  <p className="text-xs text-zinc-500">{vis.hint}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 mb-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-zinc-300">In queue... {queuePosition} ahead</span>
                  </div>
                  <p className="text-xs text-zinc-500">Estimated wait ~{queuePosition * 3} min</p>
                </div>
              )}
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1">
              <span className={`h-2 w-2 rounded-full ${mode === "real" ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-[11px] text-zinc-300 font-medium">{activeScenario.label}</span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] text-zinc-400">{activeScenario.devices.length} devices</span>
            </div>
          </div>

          {/* Device List */}
          <div className="flex-1 overflow-auto p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2.5">Device Status</p>
            <div className="space-y-1.5">
              {activeScenario.devices.map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-lg bg-zinc-900/30 px-3 py-2 border border-zinc-800/40">
                  <span className="text-sm">{d.icon}</span>
                  <span className="flex-1 text-sm text-zinc-200 truncate">{d.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    d.status === "online" || d.status === "on" ? "bg-emerald-500/10 text-emerald-400"
                    : d.status === "normal" || d.status === "auto" || d.status === "schedule" ? "bg-blue-500/10 text-blue-400"
                    : d.status === "locked" || d.status === "closed" || d.status === "standby" ? "bg-indigo-500/10 text-indigo-400"
                    : d.status === "off" || d.status === "open" ? "bg-zinc-700/50 text-zinc-400"
                    : "bg-zinc-700/30 text-zinc-400"
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto p-5 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-indigo-600/15 border border-indigo-500/15 text-zinc-100"
                    : msg.role === "system"
                      ? "bg-zinc-800/20 border border-zinc-800/30 text-zinc-400"
                      : "bg-zinc-900/50 border border-zinc-800/40 text-zinc-200"
                }`}>
                  {msg.role === "assistant" && (
                    <p className="text-[10px] font-semibold text-indigo-400 mb-1">OpenClaw Agent</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/40 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Commands */}
          <div className="border-t border-zinc-800/40 px-5 py-2.5 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto">
              {activeScenario.quickCommands.map((cmd) => (
                <button
                  key={cmd.label}
                  type="button"
                  onClick={() => handleSend(cmd.label)}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                >
                  <cmd.icon className="h-3 w-3" /> {cmd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800/40 p-4 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                placeholder={`Type a command... e.g., ${activeScenario.quickCommands[0]?.label}`}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!chatInput.trim()}
                className="shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
