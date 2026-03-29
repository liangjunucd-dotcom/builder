import React from "react";
import {
  Box, Zap, Monitor, Settings, LayoutGrid, Cpu, Rocket, BarChart3,
  Shield, Lock, Globe, QrCode,
} from "lucide-react";

export type CanvasView = "space" | "automation" | "app" | "studio";
export type SpaceTool = "select" | "pan" | "draw" | "wall";
export type GenStep = { id: string; label: string; status: "pending" | "running" | "done" };
export type StudioTab = "settings" | "assets" | "capabilities" | "deploy" | "logs";

export const GEN_STEPS: { id: string; label: string; delay: number }[] = [
  { id: "s1", label: "Analyzing space requirements", delay: 600 },
  { id: "s2", label: "Generating floor plan layout", delay: 900 },
  { id: "s3", label: "Placing devices & sensors", delay: 800 },
  { id: "s4", label: "Building automation rules", delay: 700 },
  { id: "s5", label: "Validating spatial ontology", delay: 500 },
  { id: "s6", label: "Finalizing space package", delay: 400 },
];

export const PREVIEW_TABS: { id: CanvasView; icon: React.ElementType; label: string }[] = [
  { id: "space", icon: Box, label: "Space" },
  { id: "automation", icon: Zap, label: "Automation" },
  { id: "app", icon: Monitor, label: "App" },
];

export const STUDIO_SIDEBAR: { id: StudioTab; icon: React.ElementType; label: string }[] = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "assets", icon: LayoutGrid, label: "Entities" },
  { id: "capabilities", icon: Cpu, label: "Capabilities" },
  { id: "deploy", icon: Rocket, label: "Deploy" },
  { id: "logs", icon: BarChart3, label: "Logs" },
];

export type PluginBuildStage = { id: string; label: string; desc: string; status: "pending" | "running" | "done" };

export const PLUGIN_PIPELINE: { id: string; label: string; desc: string; icon: React.ElementType; delay: number }[] = [
  { id: "sandbox", label: "Cloud Sandbox Verification", desc: "Running BXML in isolated sandbox", icon: Shield, delay: 1200 },
  { id: "security", label: "Security Scan", desc: "Checking vulnerabilities & policy compliance", icon: Lock, delay: 1000 },
  { id: "build", label: "Plugin Package Build", desc: "Compiling DSL into installable bundle", icon: Box, delay: 1500 },
  { id: "cdn", label: "CDN Distribution", desc: "Deploying to global CDN edge nodes", icon: Globe, delay: 800 },
  { id: "qr", label: "QR Code Generation", desc: "Generating scannable QR for Aqara Life", icon: QrCode, delay: 500 },
];

export const NODE_COLORS: Record<string, { border: string; bg: string; badge: string }> = {
  trigger: { border: "border-amber-500/50", bg: "bg-amber-500/8", badge: "IF" },
  condition: { border: "border-sky-500/50", bg: "bg-sky-500/8", badge: "WAIT" },
  action: { border: "border-indigo-500/40", bg: "bg-indigo-500/8", badge: "DO" },
};

export const APP_SCREENS = [
  { id: "home", label: "Home", icon: Box },
  { id: "devices", label: "Devices", icon: LayoutGrid },
  { id: "scenes", label: "Scenes", icon: Zap },
  { id: "security", label: "Security", icon: Lock },
];
