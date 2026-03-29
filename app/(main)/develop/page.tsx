"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Puzzle,
  Code2,
  Monitor,
  Rocket,
  ExternalLink,
  ArrowRight,
  Cpu,
  Cloud,
  Shield,
  Package,
  Terminal,
  Star,
  Download,
  Plus,
  Lock,
  Coins,
  TrendingUp,
  Activity,
  Settings,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
  FileText,
  TestTube2,
  Layers,
} from "lucide-react";
import { useBilling } from "@/context/BillingContext";

type DevSection = "get_started" | "my_plugins" | "my_apps" | "analytics" | "sdk" | "certifications";

const NAV_ITEMS: { id: DevSection; label: string; icon: React.ReactNode; group?: string }[] = [
  { id: "get_started", label: "Get Started", icon: <Rocket className="h-4 w-4" /> },
  { id: "my_plugins", label: "My Plugins", icon: <Puzzle className="h-4 w-4" />, group: "Build" },
  { id: "my_apps", label: "My Apps", icon: <Monitor className="h-4 w-4" />, group: "Build" },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, group: "Insights" },
  { id: "sdk", label: "SDK & Docs", icon: <BookOpen className="h-4 w-4" />, group: "Resources" },
  { id: "certifications", label: "Certifications", icon: <Award className="h-4 w-4" />, group: "Resources" },
];

const MY_PLUGINS = [
  { id: "mp1", name: "Smart HVAC Controller", type: "System", status: "published" as const, installs: 234, rating: 4.5, revenue: 4680, version: "2.1.0", lastUpdated: "2 days ago" },
  { id: "mp2", name: "Room Occupancy Heatmap", type: "UI", status: "published" as const, installs: 89, rating: 4.7, revenue: 1780, version: "1.3.2", lastUpdated: "1 week ago" },
  { id: "mp3", name: "Energy Anomaly Detector", type: "Cloud", status: "review" as const, installs: 0, rating: 0, revenue: 0, version: "0.9.0", lastUpdated: "3 hours ago" },
];

const CONSOLE_EVENTS = [
  { id: "e1", type: "install" as const, message: "Smart HVAC Controller installed by HotelTech", time: "12 min ago" },
  { id: "e2", type: "review" as const, message: "Room Occupancy Heatmap received ★★★★★ from Alex", time: "2 hours ago" },
  { id: "e3", type: "revenue" as const, message: "+120 Credits earned from Smart HVAC Controller", time: "5 hours ago" },
  { id: "e4", type: "status" as const, message: "Energy Anomaly Detector submitted for review", time: "3 hours ago" },
  { id: "e5", type: "install" as const, message: "Smart HVAC Controller installed by GreenTech", time: "8 hours ago" },
];

const EVENT_ICONS: Record<string, React.ReactNode> = {
  install: <Download className="h-3 w-3 text-blue-400" />,
  review: <Star className="h-3 w-3 text-amber-400" />,
  revenue: <Coins className="h-3 w-3 text-emerald-400" />,
  status: <Layers className="h-3 w-3 text-indigo-400" />,
};

const PLUGIN_TYPES = [
  { type: "System Plugin", icon: <Cpu className="h-5 w-5" />, color: "text-blue-400", bg: "bg-blue-500/10", description: "Protocol adapters, low-level algorithms, and device drivers. Compiled into Studio Native firmware.", tech: "Kotlin / Java → Native", review: "3–7 business days", examples: ["KNX Bridge", "Modbus RTU", "BLE Mesh"] },
  { type: "UI Plugin", icon: <Monitor className="h-5 w-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10", description: "Dashboards, control panels, and app pages. Loaded in WebView sandbox for fast iteration.", tech: "TypeScript + React", review: "1–3 business days", examples: ["Energy Dashboard", "Security Panel", "Scene Cards"] },
  { type: "Cloud Plugin", icon: <Cloud className="h-5 w-5" />, color: "text-purple-400", bg: "bg-purple-500/10", description: "AI models, MCP Servers, and analytics algorithms. Runs in Builder cloud.", tech: "Python / TypeScript / Go", review: "1–2 business days", examples: ["AI Energy Advisor", "Weather MCP", "Usage Analytics"] },
];

const ONBOARDING_STEPS = [
  { step: 1, title: "Create a Plugin", desc: "Define your plugin type, name, and metadata. Choose System, UI, or Cloud.", icon: <Plus className="h-5 w-5" />, action: "Create Plugin", href: "#" },
  { step: 2, title: "Develop & Test", desc: "Use the Studio CLI to scaffold, develop locally, and test in the simulator.", icon: <Code2 className="h-5 w-5" />, action: "Open Simulator", href: "#" },
  { step: 3, title: "Get Certified", desc: "Submit for review. Our team verifies security, performance, and compatibility.", icon: <Award className="h-5 w-5" />, action: "Submit for Review", href: "#" },
];

const SDK_STEPS = [
  { step: 1, title: "Setup Environment", desc: "Install Studio CLI and SDK", code: "npm install -g @aqara/studio-cli" },
  { step: 2, title: "Create Plugin", desc: "Scaffold from a template", code: "studio create my-plugin --type=ui" },
  { step: 3, title: "Develop & Test", desc: "Develop locally and debug in the simulator", code: "studio dev --simulator" },
  { step: 4, title: "Publish", desc: "Submit for review and publish to Marketplace", code: "studio publish" },
];

const SDK_RESOURCES = [
  { title: "API Reference", description: "Complete Studio SDK API documentation", icon: <Code2 className="h-4 w-4" />, href: "#" },
  { title: "Plugin Examples", description: "Official example plugin source code", icon: <Package className="h-4 w-4" />, href: "#" },
  { title: "Security Guidelines", description: "Plugin security development and review standards", icon: <Shield className="h-4 w-4" />, href: "#" },
  { title: "UI Plugin Framework", description: "TypeScript + React component development guide", icon: <Monitor className="h-4 w-4" />, href: "#" },
  { title: "Cloud Functions", description: "Serverless cloud plugin development guide", icon: <Cloud className="h-4 w-4" />, href: "#" },
  { title: "Review Checklist", description: "Pre-submission review checklist", icon: <CheckCircle2 className="h-4 w-4" />, href: "#" },
];

const DASHBOARD_STATS = [
  { label: "Total Installs", value: "323", delta: "+28", icon: <Download className="h-4 w-4" />, color: "text-blue-400" },
  { label: "Revenue", value: "6,460", delta: "+1,240", icon: <Coins className="h-4 w-4" />, color: "text-emerald-400", suffix: " Cr" },
  { label: "Active Plugins", value: "2", delta: "1 review", icon: <Puzzle className="h-4 w-4" />, color: "text-indigo-400" },
  { label: "Avg Rating", value: "4.6", delta: "★★★★★", icon: <Star className="h-4 w-4" />, color: "text-amber-400" },
];

const MY_APPS = [
  { name: "Smart Home Dashboard", type: "Dashboard", status: "published" as const, installs: 156, version: "1.2.0", updated: "3 days ago", color: "#06b6d4", studios: 2, capabilities: ["inject_home_widget", "background_service"] },
  { name: "Hotel Room Controller", type: "Industry App", status: "review" as const, installs: 0, version: "0.9.0", updated: "1 day ago", color: "#f59e0b", studios: 0, capabilities: ["register_tab", "theme_override"] },
  { name: "Kids Learning Space", type: "Control App", status: "draft" as const, installs: 0, version: "0.1.0", updated: "2 hours ago", color: "#6366f1", studios: 1, capabilities: ["inject_home_widget"] },
];

const APP_TYPES = [
  { type: "Dashboard", desc: "Data visualization & energy monitors — injects widgets into Life Home", icon: <BarChart3 className="h-5 w-5" />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/15", manifest: "inject_home_widget + background_service" },
  { type: "Control App", desc: "Interactive device panels & scene controls for Aqara Life users", icon: <Monitor className="h-5 w-5" />, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/15", manifest: "register_tab + theme_override" },
  { type: "Industry App", desc: "Hospitality, education, eldercare — ready for OEM white-label", icon: <Layers className="h-5 w-5" />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15", manifest: "full manifest + OEM branding" },
];

function AppLaunchpadSection() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">My Apps</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Build apps with AI, deploy to Studio, go live in Aqara Life.</p>
        </div>
      </div>

      {/* How it works — concise lifecycle */}
      <section className="mb-6">
        <div className="rounded-xl border border-zinc-700/25 bg-zinc-900/20 px-5 py-3.5">
          <div className="flex items-center gap-2 text-[10px] flex-wrap">
            <span className="rounded-lg bg-violet-500/10 border border-violet-500/15 px-2.5 py-1.5 text-violet-400 font-semibold">Create with AI</span>
            <ChevronRight className="h-3 w-3 text-zinc-700 shrink-0" />
            <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1.5 text-indigo-400 font-semibold">Configure</span>
            <ChevronRight className="h-3 w-3 text-zinc-700 shrink-0" />
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/15 px-2.5 py-1.5 text-cyan-400 font-semibold">Deploy to Studio</span>
            <ChevronRight className="h-3 w-3 text-zinc-700 shrink-0" />
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1.5 text-emerald-400 font-semibold">Live in Aqara Life</span>
          </div>
        </div>
      </section>

      {/* Create new app — type cards (simplified) */}
      <section className="mb-6">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Create New</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {APP_TYPES.map((t) => {
            const slug = t.type.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link key={t.type} href={`/develop/apps/new?type=${slug}`}
                className={`rounded-xl border ${t.border} bg-zinc-900/15 p-4 hover:bg-zinc-900/40 transition-all group`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg} ${t.color}`}>{t.icon}</div>
                  <h4 className="text-sm font-semibold text-zinc-100">{t.type}</h4>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">{t.desc}</p>
                <span className={`text-xs font-medium ${t.color} opacity-60 group-hover:opacity-100 transition-opacity`}>+ Create with AI →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* App list */}
      {MY_APPS.length > 0 ? (
        <section className="mb-8">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">My Apps</p>
          <div className="space-y-3">
            {MY_APPS.map((app) => {
              const sc = {
                published: { label: "Published", cls: "bg-emerald-500/10 text-emerald-400" },
                review: { label: "In Review", cls: "bg-amber-500/10 text-amber-400" },
                draft: { label: "Draft", cls: "bg-zinc-700/30 text-zinc-400" },
              }[app.status];
              return (
                <div key={app.name} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 hover:border-zinc-700/60 transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${app.color}15`, border: `1px solid ${app.color}25` }}>
                      <Monitor className="h-5 w-5" style={{ color: app.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-zinc-100">{app.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.cls}`}>{sc.label}</span>
                        <span className="text-[10px] text-zinc-600">{app.type}</span>
                        <span className="text-[10px] text-zinc-700 font-mono">v{app.version}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500 flex-wrap">
                        {app.installs > 0 && <span className="flex items-center gap-1"><Download className="h-3 w-3" />{app.installs} installs</span>}
                        {app.studios > 0 && <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{app.studios} studios</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {app.updated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"><BarChart3 className="h-3.5 w-3.5" /></button>
                      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"><Settings className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 mb-8">
          <Monitor className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No apps yet. Create your first app to get started.</p>
        </div>
      )}

      {/* Concise guide */}
      <section>
        <div className="rounded-xl border border-zinc-700/25 bg-zinc-900/15 p-4">
          <p className="text-xs font-semibold text-zinc-300 mb-2">How Apps Work</p>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Apps run inside <strong className="text-zinc-300">Aqara Life</strong> — the end-user mobile app. When a user adds a Studio, your app appears automatically. Apps receive real-time spatial data (rooms, devices, automations) from Studio via the Spatial Ontology API. You can also publish apps for OEM white-label distribution.
          </p>
        </div>
      </section>
    </>
  );
}

export default function DevelopPage() {
  const [activeSection, setActiveSection] = useState<DevSection>("get_started");
  const { currentMembership } = useBilling();
  const isDeveloper = currentMembership.tier !== "free";

  return (
    <div className="flex h-full" style={{ minHeight: "100%" }}>
      {/* ── Left Sub-Navigation ── */}
      <aside className="w-52 shrink-0 border-r border-zinc-800/40 flex flex-col" style={{ background: "rgba(9, 9, 18, 0.5)" }}>
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <Terminal className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Dev Hub</p>
              <p className="text-[10px] text-zinc-600">Aqara Studio</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map((item, i) => {
            const prevGroup = i > 0 ? NAV_ITEMS[i - 1].group : undefined;
            const showDivider = item.group && item.group !== prevGroup;
            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <>
                    <div className="h-px bg-zinc-800/40 !my-2" />
                    <p className="px-3 pb-0.5 pt-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.group}</p>
                  </>
                )}
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all ${
                    activeSection === item.id
                      ? "bg-indigo-500/10 text-indigo-400 font-medium"
                      : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-800/40">
          <p className="text-[11px] text-zinc-600 px-1">Developer Console</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 max-w-5xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Developer Hub</h1>
              <p className="mt-1 text-sm leading-6 text-zinc-500">Build plugins and apps, extend Studio capabilities, earn from the Marketplace.</p>
            </div>
            {isDeveloper ? (
              activeSection === "my_plugins" ? (
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shrink-0">
                  <Plus className="h-3.5 w-3.5" /> New Plugin
                </button>
              ) : activeSection === "my_apps" ? (
                <Link href="/develop/apps/new?type=control" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shrink-0">
                  <Plus className="h-3.5 w-3.5" /> New App
                </Link>
              ) : null
            ) : (
              <Link href="/plans" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shrink-0">
                <Lock className="h-3.5 w-3.5" /> Upgrade to develop
              </Link>
            )}
          </div>

          {/* ── Get Started ── */}
          {activeSection === "get_started" && (
            <>
              {/* Welcome Banner */}
              <div className="rounded-xl border border-indigo-500/15 bg-gradient-to-r from-indigo-950/30 via-indigo-950/10 to-transparent p-6 mb-6">
                <h2 className="text-lg font-semibold text-zinc-100">Welcome to the Developer Hub</h2>
                <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Two paths to create and earn: build <strong className="text-zinc-200">Plugins</strong> that extend Studio capabilities, or design <strong className="text-zinc-200">Apps</strong> (dashboards, control panels, industry solutions) using AI-assisted creation. Everything you publish reaches the global Aqara ecosystem.
                </p>
              </div>

              {/* Two creation tracks */}
              <section className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Choose Your Path</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Plugin track */}
                  <button type="button" onClick={() => setActiveSection("my_plugins")}
                    className="rounded-xl border border-blue-500/15 bg-blue-950/10 p-5 text-left hover:border-blue-500/30 hover:bg-blue-950/20 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Puzzle className="h-5 w-5" /></div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">Plugin Development</h4>
                        <p className="text-[11px] text-zinc-500">Extend Studio&apos;s core capabilities</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                      Create protocol adapters, automation logic, AI skills, and UI widgets. Plugins run inside Studio and are installed via the Marketplace.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {["System Plugin", "UI Plugin", "Cloud Plugin"].map((t) => <span key={t} className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{t}</span>)}
                    </div>
                    <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300">Go to My Plugins →</span>
                  </button>

                  {/* App track */}
                  <button type="button" onClick={() => setActiveSection("my_apps")}
                    className="rounded-xl border border-violet-500/15 bg-violet-950/10 p-5 text-left hover:border-violet-500/30 hover:bg-violet-950/20 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400"><Monitor className="h-5 w-5" /></div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">App Launchpad</h4>
                        <p className="text-[11px] text-zinc-500">Build apps with AI-assisted design</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                      Design dashboards, control panels, and industry apps using natural language. Published apps appear in Aqara Life and can be white-labeled for OEM partners.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {["Dashboard", "Control App", "Industry App"].map((t) => <span key={t} className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{t}</span>)}
                    </div>
                    <span className="text-xs font-medium text-violet-400 group-hover:text-violet-300">Go to My Apps →</span>
                  </button>
                </div>
              </section>

              {/* Plugin Types */}
              <section className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Plugin Types</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {PLUGIN_TYPES.map((pt) => (
                    <div key={pt.type} className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 hover:border-zinc-700/60 transition-colors">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${pt.bg} ${pt.color}`}>{pt.icon}</div>
                        <h3 className="text-sm font-semibold text-zinc-100">{pt.type}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed mb-3">{pt.description}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between"><span className="text-zinc-600">Tech Stack</span><span className="text-zinc-300">{pt.tech}</span></div>
                        <div className="flex items-center justify-between"><span className="text-zinc-600">Review</span><span className="text-zinc-300">{pt.review}</span></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pt.examples.map((ex) => <span key={ex} className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{ex}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Simulator CTA */}
              <section>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <TestTube2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">Studio Simulator</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Test plugins and preview apps in a simulated Studio environment — no hardware needed.</p>
                  </div>
                  {isDeveloper ? (
                    <button className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">Launch Simulator</button>
                  ) : (
                    <Link href="/plans" className="shrink-0 rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-950/30 transition-colors">Upgrade to access</Link>
                  )}
                </div>
              </section>
            </>
          )}

          {/* ── My Plugins ── */}
          {activeSection === "my_plugins" && (
            !isDeveloper ? (
              <div className="text-center py-20">
                <Lock className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">Pro+ Plan required</h3>
                <p className="text-sm text-zinc-500 mt-1">Upgrade to Pro or higher to unlock plugin development</p>
                <Link href="/plans" className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">View Plans <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-zinc-100 mb-5">My Plugins</h2>
                <div className="space-y-3">
                  {MY_PLUGINS.map((plugin) => {
                    const sc = {
                      published: { label: "Published", icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-500/10 text-emerald-400" },
                      review: { label: "In Review", icon: <Clock className="h-3 w-3" />, cls: "bg-amber-500/10 text-amber-400" },
                      rejected: { label: "Rejected", icon: <AlertCircle className="h-3 w-3" />, cls: "bg-red-500/10 text-red-400" },
                    }[plugin.status] ?? { label: plugin.status, icon: null, cls: "bg-zinc-800 text-zinc-400" };
                    return (
                      <div key={plugin.id} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 hover:border-zinc-700/60 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/60"><Puzzle className="h-5 w-5 text-zinc-400" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-zinc-100">{plugin.name}</p>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.cls}`}>{sc.icon} {sc.label}</span>
                              <span className="text-[10px] text-zinc-600">{plugin.type}</span>
                              <span className="text-[10px] text-zinc-700">v{plugin.version}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                              {plugin.installs > 0 && <span className="flex items-center gap-1"><Download className="h-3 w-3" />{plugin.installs} installs</span>}
                              {plugin.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400/70" />{plugin.rating}</span>}
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {plugin.lastUpdated}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {plugin.revenue > 0 && (
                              <div className="text-right mr-2">
                                <p className="text-sm font-semibold text-emerald-400 tabular-nums">+{plugin.revenue.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-600">Credits</p>
                              </div>
                            )}
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors" title="Analytics"><BarChart3 className="h-3.5 w-3.5" /></button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors" title="Settings"><Settings className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          )}

          {/* ── My Apps (App Launchpad) ── */}
          {activeSection === "my_apps" && (
            !isDeveloper ? (
              <div className="text-center py-20">
                <Lock className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">Builder+ Plan required</h3>
                <p className="text-sm text-zinc-500 mt-1">Upgrade to create and publish applications</p>
                <Link href="/plans" className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">View Plans <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : (
              <AppLaunchpadSection />
            )
          )}

          {/* ── Analytics ── */}
          {activeSection === "analytics" && (
            !isDeveloper ? (
              <div className="text-center py-20">
                <Lock className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">Upgrade to view analytics</h3>
                <Link href="/plans" className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">View Plans <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-zinc-100 mb-5">Analytics Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {DASHBOARD_STATS.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-600">{stat.label}</span>
                        <span className={stat.color}>{stat.icon}</span>
                      </div>
                      <p className="text-xl font-bold text-zinc-100 tabular-nums">{stat.value}{stat.suffix && <span className="text-sm font-normal text-zinc-500">{stat.suffix}</span>}</p>
                      <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> {stat.delta} this month</p>
                    </div>
                  ))}
                </div>

                {/* Console */}
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 overflow-hidden font-mono mb-6">
                  <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800/40">
                    <span className="h-2 w-2 rounded-full bg-red-500/60" />
                    <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    <span className="ml-3 text-[11px] text-zinc-600">activity-feed</span>
                  </div>
                  <div className="p-3 space-y-1.5 max-h-52 overflow-auto">
                    {CONSOLE_EVENTS.map((event) => (
                      <div key={event.id} className="flex items-start gap-2.5 text-[12px]">
                        <span className="mt-0.5 shrink-0">{EVENT_ICONS[event.type]}</span>
                        <span className="text-zinc-400 flex-1">{event.message}</span>
                        <span className="text-zinc-700 shrink-0 tabular-nums">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Stats */}
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Ecosystem</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Active Plugins", value: "1,240+", sub: "Community plugins" },
                    { label: "Total Installs", value: "89K+", sub: "Cumulative installs" },
                    { label: "Plugin Developers", value: "320+", sub: "Active developers" },
                    { label: "Marketplace Revenue", value: "¥2.1M", sub: "Total developer earnings" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 text-center">
                      <p className="text-xl font-bold text-zinc-100 tabular-nums">{stat.value}</p>
                      <p className="text-xs text-zinc-500 mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </>
            )
          )}

          {/* ── SDK & Docs ── */}
          {activeSection === "sdk" && (
            <>
              <h2 className="text-lg font-semibold text-zinc-100 mb-5">SDK & Documentation</h2>

              {/* Quick Start */}
              <section className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Start</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {SDK_STEPS.map((s, i) => (
                    <div key={s.step} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 relative">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-[11px] font-bold text-indigo-400">{s.step}</span>
                        <h4 className="text-sm font-medium text-zinc-100">{s.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">{s.desc}</p>
                      <code className="block rounded-lg bg-zinc-950/80 px-3 py-2 text-[11px] text-indigo-300 font-mono">{s.code}</code>
                      {i < SDK_STEPS.length - 1 && <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />}
                    </div>
                  ))}
                </div>
              </section>

              {/* Docs Grid */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Documentation</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SDK_RESOURCES.map((res) => (
                    <a key={res.title} href={res.href} className="group rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 hover:border-zinc-700/60 hover:bg-zinc-900/40 transition-all">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 group-hover:text-zinc-200">{res.icon}</div>
                        <h4 className="text-sm font-medium text-zinc-100 group-hover:text-white">{res.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{res.description}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300">Read docs <ExternalLink className="h-3 w-3" /></div>
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── Certifications ── */}
          {activeSection === "certifications" && (
            <>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Plugin Certification</h2>
              <p className="text-sm text-zinc-500 mb-6 max-w-xl">
                Submit your plugin for review to earn the <span className="text-indigo-400">Works with Aqara Studio</span> certification. Certified plugins get priority placement in the Marketplace.
              </p>

              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                {[
                  { title: "Security Review", desc: "Code security scanning (SAST/DAST), permission checks, and data privacy compliance", icon: <Shield className="h-5 w-5 text-blue-400" />, status: "Required" },
                  { title: "Compatibility Test", desc: "Multi-version Studio compatibility testing and device adaptation verification", icon: <TestTube2 className="h-5 w-5 text-emerald-400" />, status: "Required" },
                  { title: "Performance Audit", desc: "Memory, CPU, and startup time benchmarking", icon: <Activity className="h-5 w-5 text-amber-400" />, status: "Recommended" },
                ].map((cert) => (
                  <div key={cert.title} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/60">{cert.icon}</div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">{cert.title}</h3>
                        <span className={`text-[10px] font-medium ${cert.status === "Required" ? "text-amber-400" : "text-zinc-600"}`}>{cert.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{cert.desc}</p>
                  </div>
                ))}
              </div>

              {/* Plugin Submission Status */}
              {isDeveloper && MY_PLUGINS.some((p) => p.status === "review") && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-5">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">Pending Review</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        <span className="text-amber-400">Energy Anomaly Detector</span> — submitted 3 hours ago. Estimated review time: 1–2 business days.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
