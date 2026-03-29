"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Send, Plus, PanelLeftClose, PanelLeftOpen,
  Sparkles, Monitor, BarChart3, Layers, Settings, Cpu, Box,
  Smartphone, ChevronRight, Check, Zap, Eye, Share2,
  ToggleLeft, Palette, X, Shield, Globe, Lock, Package, AlertCircle,
  Database, Layout, Sliders, Grid3X3, Clock, MessageSquarePlus, ChevronDown,
} from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; text: string };
type EditorMode = "preview" | "configure" | "studio";
type GenStep = { id: string; label: string; status: "pending" | "running" | "done" };

const GEN_STEPS = [
  { id: "g1", label: "Analyzing app requirements", delay: 600 },
  { id: "g2", label: "Generating UI layout", delay: 800 },
  { id: "g3", label: "Creating components & screens", delay: 900 },
  { id: "g4", label: "Binding data sources", delay: 700 },
  { id: "g5", label: "Generating App Manifest", delay: 500 },
  { id: "g6", label: "Applying default theme", delay: 400 },
];

const MOCK_SCREENS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "rooms", label: "Rooms", icon: "🚪" },
  { id: "scenes", label: "Scenes", icon: "✨" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const STUDIO_OPTIONS = [
  { id: "s1", name: "Living Room Studio", model: "M300", status: "online" as const },
  { id: "s2", name: "Bedroom Studio", model: "M300", status: "online" as const },
  { id: "s3", name: "Office Studio", model: "M200", status: "offline" as const },
  { id: "s4", name: "Cloud Demo Studio", model: "Cloud", status: "online" as const },
];

/* ═══════════════════════════════════════════════════
   App Preview Canvas (Phone Simulator)
   ═══════════════════════════════════════════════════ */

function AppPreviewCanvas({ appType }: { appType: string }) {
  const [activeScreen, setActiveScreen] = useState("home");

  return (
    <div className="h-full flex items-center justify-center p-8" style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #111118 70%)" }}>
      <div className="relative w-[320px] rounded-[2.5rem] border-2 border-zinc-700/40 bg-[#0c0c14] shadow-2xl overflow-hidden" style={{ height: 640 }}>
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-[10px] text-zinc-500 font-medium">9:41</span>
          <div className="flex items-center gap-1"><span className="text-[10px] text-zinc-500">●●●</span></div>
        </div>
        <div className="px-5 pt-2 pb-3">
          <h3 className="text-base font-bold text-zinc-100">
            {appType === "dashboard" ? "Energy Dashboard" : appType === "industry-app" ? "Hotel Room" : "My Home"}
          </h3>
          <p className="text-[11px] text-zinc-500">{MOCK_SCREENS.find((s) => s.id === activeScreen)?.label}</p>
        </div>

        <div className="px-4 flex-1 space-y-3 pb-20 overflow-auto" style={{ maxHeight: 460 }}>
          {activeScreen === "home" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 border border-indigo-500/10 p-3">
                  <span className="text-lg">🌡</span>
                  <p className="text-lg font-bold text-zinc-100 mt-1">24°C</p>
                  <p className="text-[10px] text-zinc-500">Living Room</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/10 p-3">
                  <span className="text-lg">💡</span>
                  <p className="text-lg font-bold text-zinc-100 mt-1">6 On</p>
                  <p className="text-[10px] text-zinc-500">Active Lights</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 mb-2">Quick Scenes</p>
                <div className="flex gap-2">
                  {["🌅 Morning", "🌙 Night", "🎬 Movie", "🏠 Away"].map((s) => (
                    <button key={s} type="button" className="flex-1 rounded-xl bg-zinc-800/40 border border-zinc-700/20 py-2.5 text-center text-[10px] text-zinc-300 hover:bg-zinc-700/40 transition-colors">{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 mb-2">Devices</p>
                <div className="space-y-2">
                  {[
                    { name: "Main Light", status: "On · 80%", icon: "💡", active: true },
                    { name: "Air Conditioner", status: "24°C · Cool", icon: "❄️", active: true },
                    { name: "Curtain", status: "Open", icon: "🪟", active: false },
                    { name: "FP2 Sensor", status: "2 people", icon: "👁", active: true },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-3 rounded-xl bg-zinc-800/20 border border-zinc-700/15 px-3 py-2.5">
                      <span className="text-base">{d.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-zinc-200">{d.name}</p>
                        <p className="text-[10px] text-zinc-500">{d.status}</p>
                      </div>
                      <div className={`h-5 w-9 rounded-full relative ${d.active ? "bg-indigo-500" : "bg-zinc-700"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${d.active ? "left-[18px]" : "left-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeScreen === "rooms" && (
            <div className="space-y-2">
              {["Living Room · 8 devices", "Bedroom · 5 devices", "Kitchen · 3 devices", "Bathroom · 2 devices"].map((r) => (
                <div key={r} className="flex items-center gap-3 rounded-xl bg-zinc-800/20 border border-zinc-700/15 px-4 py-3">
                  <span className="text-base">🚪</span><span className="text-xs text-zinc-200 flex-1">{r}</span><ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              ))}
            </div>
          )}
          {activeScreen === "scenes" && (
            <div className="grid grid-cols-2 gap-2">
              {["🌅 Morning", "🌙 Night", "🎬 Movie", "🏠 Away", "🎉 Party", "📖 Reading"].map((s) => (
                <button key={s} type="button" className="rounded-xl bg-zinc-800/30 border border-zinc-700/15 p-4 text-left hover:bg-zinc-700/30 transition-colors">
                  <span className="text-xl">{s.split(" ")[0]}</span>
                  <p className="text-[11px] text-zinc-300 mt-2">{s.split(" ").slice(1).join(" ")}</p>
                </button>
              ))}
            </div>
          )}
          {activeScreen === "settings" && (
            <div className="space-y-2">
              {["Studio Connection", "Theme", "Notifications", "Privacy", "About"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl bg-zinc-800/20 border border-zinc-700/15 px-4 py-3">
                  <span className="text-xs text-zinc-200">{item}</span><ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around bg-[#0c0c14]/95 backdrop-blur border-t border-zinc-700/20 py-2 px-2">
          {MOCK_SCREENS.map((s) => (
            <button key={s.id} type="button" onClick={() => setActiveScreen(s.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${activeScreen === s.id ? "text-indigo-400" : "text-zinc-600 hover:text-zinc-400"}`}>
              <span className="text-sm">{s.icon}</span><span className="text-[9px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Configure Panel (App Manifest + Data Bindings)
   ═══════════════════════════════════════════════════ */

function ConfigurePanel() {
  const [injectWidget, setInjectWidget] = useState(true);
  const [registerTab, setRegisterTab] = useState(false);
  const [themeOverride, setThemeOverride] = useState<"none" | "optional" | "required">("optional");
  const [bgService, setBgService] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private" | "oem">("public");

  return (
    <div className="h-full overflow-auto p-6" style={{ background: "#111118" }}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* ── App Manifest ── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-100">App Manifest</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-5">Define what your app can do inside Aqara Life. These capabilities determine how Life App integrates your app.</p>

          <div className="space-y-3">
            {/* Inject Home Widget */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-700/30 bg-zinc-800/15 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10"><Grid3X3 className="h-4 w-4 text-cyan-400" /></div>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Inject Home Widget</p>
                  <p className="text-[10px] text-zinc-500">Add a summary card to Life App&apos;s Home page</p>
                </div>
              </div>
              <button type="button" onClick={() => setInjectWidget(!injectWidget)} className={`h-6 w-11 rounded-full relative transition-colors ${injectWidget ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${injectWidget ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* Register Tab */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-700/30 bg-zinc-800/15 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10"><Layout className="h-4 w-4 text-violet-400" /></div>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Register as Tab</p>
                  <p className="text-[10px] text-zinc-500">Appear as a dedicated tab in Life App&apos;s bottom navigation</p>
                </div>
              </div>
              <button type="button" onClick={() => setRegisterTab(!registerTab)} className={`h-6 w-11 rounded-full relative transition-colors ${registerTab ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${registerTab ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* Theme Override */}
            <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/15 px-4 py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10"><Palette className="h-4 w-4 text-pink-400" /></div>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Theme Override</p>
                  <p className="text-[10px] text-zinc-500">Can this app change Life App&apos;s visual theme?</p>
                </div>
              </div>
              <div className="flex gap-2 ml-11">
                {([["none", "None"], ["optional", "Optional"], ["required", "Required"]] as const).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setThemeOverride(v)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-colors ${themeOverride === v ? "border-pink-500/30 bg-pink-500/10 text-pink-300" : "border-zinc-700/30 text-zinc-500 hover:text-zinc-300"}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Background Service */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-700/30 bg-zinc-800/15 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"><Zap className="h-4 w-4 text-amber-400" /></div>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Background Service</p>
                  <p className="text-[10px] text-zinc-500">Run data processing in the background (e.g. energy analytics)</p>
                </div>
              </div>
              <button type="button" onClick={() => setBgService(!bgService)} className={`h-6 w-11 rounded-full relative transition-colors ${bgService ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${bgService ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Data Requirements ── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Data Requirements</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Declare what spatial data your app needs. Life App will map these to the actual Studio devices.</p>

          <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/15 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-700/20 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Required Data Bindings</span>
              <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">+ Add binding</button>
            </div>
            <div className="divide-y divide-zinc-700/15">
              {[
                { binding: "spaces.rooms.*", type: "Space", desc: "All room definitions and hierarchy", status: "required" },
                { binding: "devices.light.*", type: "Device", desc: "Lighting devices — brightness, color, on/off", status: "required" },
                { binding: "devices.sensor.temperature", type: "Device", desc: "Temperature sensors per room", status: "required" },
                { binding: "devices.sensor.presence", type: "Device", desc: "Presence detection (FP2 zones)", status: "optional" },
                { binding: "automations.scenes.*", type: "Automation", desc: "Scene definitions for quick triggers", status: "required" },
                { binding: "devices.climate.*", type: "Device", desc: "HVAC / AC controls", status: "optional" },
              ].map((b) => (
                <div key={b.binding} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[.01] transition-colors">
                  <code className="text-[10px] text-indigo-300 font-mono bg-indigo-500/8 rounded px-1.5 py-0.5 shrink-0">{b.binding}</code>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-400 truncate">{b.desc}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium shrink-0 ${b.status === "required" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-700/30 text-zinc-500"}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-300/70 leading-relaxed">When deployed to a Studio, Life App will automatically map these declarations to actual devices using spatial ontology semantics. Users can also adjust the mapping manually.</p>
          </div>
        </section>

        {/* ── Visibility & Distribution ── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-zinc-100">Visibility & Distribution</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Choose how your app is distributed to users.</p>

          <div className="space-y-2">
            {([
              { id: "public" as const, label: "Public on Marketplace", desc: "Anyone can discover, install, and use this app in Aqara Life", icon: <Globe className="h-4 w-4 text-emerald-400" />, iconBg: "bg-emerald-500/10" },
              { id: "private" as const, label: "Private to My Studios", desc: "Only available on Studios you own — not listed in Marketplace", icon: <Lock className="h-4 w-4 text-amber-400" />, iconBg: "bg-amber-500/10" },
              { id: "oem" as const, label: "OEM White-Label", desc: "Available for partner branding — appears in OEM apps with their brand", icon: <Layers className="h-4 w-4 text-violet-400" />, iconBg: "bg-violet-500/10" },
            ]).map((opt) => (
              <label key={opt.id} onClick={() => setVisibility(opt.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-all ${
                  visibility === opt.id ? "border-indigo-500/30 bg-indigo-500/5" : "border-zinc-700/30 bg-zinc-800/15 hover:border-zinc-600"
                }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${opt.iconBg} shrink-0`}>{opt.icon}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-200">{opt.label}</p>
                  <p className="text-[10px] text-zinc-500">{opt.desc}</p>
                </div>
                {visibility === opt.id && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
              </label>
            ))}
          </div>
        </section>

        {/* ── Manifest Preview ── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100">Manifest Preview</h3>
          </div>
          <div className="rounded-xl border border-zinc-700/30 bg-zinc-950/50 p-4 font-mono text-[11px] text-zinc-400 leading-relaxed overflow-auto max-h-48">
            <pre>{JSON.stringify({
              app_id: "com.builder.my-app",
              type: "control-app",
              capabilities: { inject_home_widget: injectWidget, register_tab: registerTab, theme_override: themeOverride, background_service: bgService },
              data_requirements: { devices: ["light.*", "sensor.temperature", "sensor.presence", "climate.*"], spaces: ["rooms.*"], automations: ["scenes.*"] },
              visibility,
            }, null, 2)}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Studio Panel (Deploy + Life App Journey)
   ═══════════════════════════════════════════════════ */

function StudioPanel({ linkedStudio, onLink }: { linkedStudio: string | null; onLink: (id: string) => void }) {
  const [setAsDefault, setSetAsDefault] = useState(false);

  return (
    <div className="h-full overflow-auto p-6" style={{ background: "#111118" }}>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Deploy to Studio</h3>
          <p className="text-xs text-zinc-500">Assign this app to a Studio to make it available in Aqara Life.</p>
        </div>

        {/* Flow */}
        <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
          {[
            { label: "Build", doneCls: "bg-violet-500/10 border-violet-500/15 text-violet-400", done: true },
            { label: "Configure", doneCls: "bg-indigo-500/10 border-indigo-500/15 text-indigo-400", done: true },
            { label: "Assign Studio", doneCls: "bg-cyan-500/10 border-cyan-500/15 text-cyan-400", done: !!linkedStudio },
            { label: "Life App Ready", doneCls: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400", done: false },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
              <span className={`rounded-lg border px-2 py-1 font-semibold ${
                s.done ? s.doneCls : "bg-zinc-800/30 border-zinc-700/30 text-zinc-600"
              }`}>{s.label}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Select Studio */}
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Select Studio</p>
          {STUDIO_OPTIONS.map((studio) => {
            const isLinked = linkedStudio === studio.id;
            return (
              <button key={studio.id} type="button" onClick={() => onLink(studio.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all text-left ${
                  isLinked ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-700/30 bg-zinc-800/15 hover:border-zinc-600"
                }`}>
                <Cpu className="h-4 w-4 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{studio.name}</p>
                  <p className="text-[10px] text-zinc-600">{studio.model}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${studio.status === "online" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700/30 text-zinc-500"}`}>{studio.status}</span>
                {isLinked && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {linkedStudio && (
          <>
            {/* Default App option */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-700/30 bg-zinc-800/15 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-violet-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-200">Set as Default App</p>
                  <p className="text-[10px] text-zinc-500">First app users see when they connect to this Studio in Life</p>
                </div>
              </div>
              <button type="button" onClick={() => setSetAsDefault(!setAsDefault)} className={`h-6 w-11 rounded-full relative transition-colors ${setAsDefault ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${setAsDefault ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* Data binding mapping preview */}
            <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/10 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-zinc-700/20 flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Auto-mapped Data Bindings</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {[
                  { declared: "devices.light.*", mapped: "💡 Main Light, Bedroom Light, Study Light", count: 3 },
                  { declared: "devices.sensor.temperature", mapped: "🌡 Living Room Sensor, Bedroom Sensor", count: 2 },
                  { declared: "automations.scenes.*", mapped: "✨ Morning, Night, Movie, Away", count: 4 },
                  { declared: "spaces.rooms.*", mapped: "🚪 Living Room, Bedroom, Kitchen, Study, Bathroom", count: 5 },
                ].map((m) => (
                  <div key={m.declared} className="flex items-start gap-2 text-[11px]">
                    <code className="text-indigo-300 font-mono bg-indigo-500/8 rounded px-1 py-0.5 shrink-0 text-[9px]">{m.declared}</code>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-400 flex-1 truncate">{m.mapped}</span>
                    <span className="text-zinc-600 shrink-0">{m.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Life App user journey */}
            <div className="rounded-xl border border-violet-500/15 bg-violet-950/10 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-100">User Journey in Aqara Life</p>
              <div className="space-y-2">
                {[
                  { step: "1", text: "User downloads Aqara Life App (App Store / Google Play)", icon: "📲" },
                  { step: "2", text: "Adds Studio via LAN scan or QR code", icon: "🔗" },
                  { step: "3", text: "Life gets spatial ontology data from Studio (rooms, devices, automations)", icon: "📡" },
                  { step: "4", text: setAsDefault ? "Your app loads as the Default Home experience" : "Your app appears in Studio's 'Installed Apps' list", icon: setAsDefault ? "🏠" : "📱" },
                  { step: "5", text: "User interacts with your app — live data from Studio devices", icon: "✨" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[9px] font-bold text-violet-400">{s.step}</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-sm shrink-0">{s.icon}</span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/15">
              Deploy & Publish
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main App Editor Page
   ═══════════════════════════════════════════════════ */

export default function AppEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appType = searchParams.get("type") || "control";

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSteps, setGenSteps] = useState<GenStep[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [linkedStudio, setLinkedStudio] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const appTypeLabel = appType === "dashboard" ? "Dashboard" : appType === "industry-app" ? "Industry App" : "Control App";

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isGenerating) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);

    if (!hasGenerated) {
      setIsGenerating(true);
      setGenSteps(GEN_STEPS.map((s) => ({ id: s.id, label: s.label, status: "pending" })));
      let totalDelay = 300;
      GEN_STEPS.forEach((step, i) => {
        setTimeout(() => setGenSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "running" } : s)), totalDelay);
        totalDelay += step.delay;
        setTimeout(() => {
          setGenSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "done" } : s));
          if (i === GEN_STEPS.length - 1) {
            setTimeout(() => {
              setIsGenerating(false);
              setHasGenerated(true);
              setMessages((prev) => [...prev, {
                role: "assistant",
                text: `Your ${appTypeLabel} is ready!\n\n✅ 4 screens generated (Home, Rooms, Scenes, Settings)\n✅ 6 UI components with data bindings\n✅ App Manifest auto-configured\n✅ Default theme applied\n\nPreview your app on the right. Then:\n\n📋 Switch to **Configure** to review the App Manifest — data requirements, Life App capabilities, and distribution.\n\n🚀 Switch to **Studio** to deploy and go live.`
              }]);
            }, 200);
          }
        }, totalDelay);
      });
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", text: `Updated! The ${appTypeLabel} preview has been refreshed with your changes.` }]);
      }, 800);
    }
  }, [input, isGenerating, hasGenerated, appTypeLabel]);

  const handleStudioLink = useCallback((studioId: string) => {
    setLinkedStudio(studioId);
    const studioName = STUDIO_OPTIONS.find((s) => s.id === studioId)?.name;
    setMessages((prev) => [...prev,
      { role: "user", text: `Deploy to "${studioName}"` },
    ]);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: `✅ Deployed to ${studioName}!\n\n📡 Data bindings auto-mapped to Studio devices\n📱 App is now available in Aqara Life\n\nWhen a user adds this Studio in Life App, they'll see your app ${linkedStudio ? "in the Apps list" : "as the default experience"}.`
      }]);
    }, 1500);
  }, [linkedStudio]);

  const leftW = leftCollapsed ? 0 : 380;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#111118]">
      {/* ── Unified Top Bar (consistent with project editor) ── */}
      <div className="flex items-center justify-between border-b border-zinc-700/30 px-2 h-12 shrink-0 bg-[#16161e]/95">
        {/* Left: sidebar toggle, history, new chat, breadcrumb */}
        <div className="flex items-center gap-1 min-w-0">
          <button type="button" onClick={() => setLeftCollapsed(!leftCollapsed)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors">
            {leftCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setHistorySidebarOpen(!historySidebarOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors" title="Chat history">
            <Clock className="h-4 w-4" />
          </button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors" title="New chat">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-zinc-700/30 mx-1" />
          <button type="button" onClick={() => router.push("/develop")} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Dev Console
          </button>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="text-sm font-medium text-zinc-100 truncate max-w-[200px]">New {appTypeLabel}</span>
        </div>

        {/* Center: mode tabs */}
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-0.5">
          {([
            { id: "preview" as const, icon: <Eye className="h-3.5 w-3.5" />, label: "Preview" },
            { id: "configure" as const, icon: <Sliders className="h-3.5 w-3.5" />, label: "Configure" },
            { id: "studio" as const, icon: <Cpu className="h-3.5 w-3.5" />, label: "Studio" },
          ]).map((tab) => (
            <button key={tab.id} type="button" onClick={() => setEditorMode(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                editorMode === tab.id ? "bg-zinc-700/60 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Saved, Share, Publish */}
        <div className="flex items-center gap-2">
          {hasGenerated && <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 mr-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Saved</span>}
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors">
            <Globe className="h-3 w-3" /> Publish
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel with history sidebar */}
        {!leftCollapsed && (
          <div className="flex shrink-0" style={{ width: `${leftW + (historySidebarOpen ? 200 : 0)}px` }}>
            {historySidebarOpen && (
              <div className="w-[200px] border-r border-zinc-700/30 overflow-auto bg-[#13131b]">
                <div className="px-3 pt-3 pb-2">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Chat History</p>
                </div>
                <div className="space-y-0.5 px-1.5">
                  {["Smart home panel concept", "Hotel room control app", "Energy monitoring dashboard"].map((h, i) => (
                    <button key={i} type="button" className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${i === 0 ? "bg-zinc-800/50 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"}`}>
                      <p className="truncate">{h}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{i === 0 ? "Just now" : i === 1 ? "2h ago" : "Yesterday"}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 border-r border-zinc-700/30 flex flex-col" style={{ width: leftW, minWidth: leftW }}>
              <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
                {messages.length === 0 && !isGenerating && (
                  <div className="text-center pt-16 space-y-4">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10">
                      <Monitor className="h-7 w-7 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">Create your {appTypeLabel}</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                        Describe what your app should do. AI generates screens, components, data bindings, and the App Manifest.
                      </p>
                    </div>
                    <div className="space-y-2 text-left max-w-[280px] mx-auto">
                      {[
                        "A smart home panel with scene shortcuts and room overview",
                        "An energy dashboard showing power usage and cost trends",
                        "A hotel guest app for room control and service requests",
                      ].map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                          className="w-full rounded-xl border border-zinc-700/30 bg-zinc-800/20 px-3 py-2.5 text-xs text-zinc-400 text-left hover:border-zinc-600 hover:text-zinc-200 transition-all leading-relaxed">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-indigo-600/20 text-indigo-100 border border-indigo-500/15" : "bg-zinc-800/30 text-zinc-300 border border-zinc-700/20"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && genSteps.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/15 p-4 space-y-2">
                    <p className="text-xs font-medium text-zinc-400 mb-2">Building your app...</p>
                    {genSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3 text-xs">
                        {step.status === "done" ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : step.status === "running" ? <span className="h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin shrink-0" /> : <span className="h-4 w-4 rounded-full border border-zinc-700 shrink-0" />}
                        <span className={step.status === "done" ? "text-zinc-300" : step.status === "running" ? "text-indigo-400" : "text-zinc-600"}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="shrink-0 border-t border-zinc-700/30 p-3">
                <div className="flex items-end gap-2">
                  <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-700/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"><Plus className="h-4 w-4" /></button>
                  <div className="flex-1 relative">
                    <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      rows={1} placeholder={hasGenerated ? "Ask me to make changes..." : `Describe your ${appTypeLabel}...`}
                      className="w-full rounded-xl border border-zinc-700/40 bg-zinc-800/20 py-2.5 pl-3.5 pr-10 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/30 focus:outline-none resize-none" />
                    <button type="button" onClick={handleSend} disabled={!input.trim() || isGenerating}
                      className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-lg text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-20 transition-colors"><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Canvas / Configure / Studio */}
        <div className="flex-1 min-w-0 relative">
          {!hasGenerated && !isGenerating ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 max-w-sm">
                <Monitor className="h-12 w-12 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-500">Describe your app in the chat to get started.</p>
                <p className="text-xs text-zinc-600">AI will generate a live preview here.</p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/10">
                  <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
                </div>
                <p className="text-sm text-zinc-300">Your {appTypeLabel} is Coming Together...</p>
                <div className="h-1.5 w-48 mx-auto overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(genSteps.filter((s) => s.status === "done").length / genSteps.length) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : editorMode === "preview" ? (
            <AppPreviewCanvas appType={appType} />
          ) : editorMode === "configure" ? (
            <ConfigurePanel />
          ) : (
            <StudioPanel linkedStudio={linkedStudio} onLink={handleStudioLink} />
          )}
        </div>
      </div>
    </div>
  );
}
