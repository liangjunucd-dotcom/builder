"use client";

import React, { useState, useMemo } from "react";
import {
  Plus, Sparkles, QrCode, Pencil, Trash2, ChevronRight,
  Package, Users, Shield, Clock, Check, X, ExternalLink, Download,
} from "lucide-react";
import { getObjectsByType, type BXMLDocument } from "@/lib/bxml";
import type { RolePluginConfig } from "@/lib/domain-types";

const THEMES = [
  { id: "home-warm", label: "家居温暖", emoji: "🏠" },
  { id: "minimal-white", label: "极简白", emoji: "⬜" },
  { id: "midnight", label: "深夜黑", emoji: "🌑" },
  { id: "nature-green", label: "自然绿", emoji: "🌿" },
  { id: "ocean-blue", label: "海洋蓝", emoji: "🌊" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  published: { label: "已激活", color: "text-emerald-400", dot: "bg-emerald-400" },
  draft:     { label: "待扫码", color: "text-amber-400",  dot: "bg-amber-400 animate-pulse" },
};

export type BomItem = { key: string; name: string; qty: number };

export function AppCanvas({
  bxmlDoc,
  rolePluginConfigs = [],
  bomItems = [],
  onAddRole,
  onEditRole,
  onDeleteRole,
  onGenerateQr,
  onExportBxml,
}: {
  isDesignMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  bxmlDoc?: BXMLDocument | null;
  rolePluginCount?: number;
  onGeneratePlugin?: () => void;
  onOpenBom?: () => void;
  onPreviewLifeApp?: () => void;
  onExportBxml?: () => void;
  rolePluginConfigs?: RolePluginConfig[];
  bomItems?: BomItem[];
  onAddRole?: () => void;
  onEditRole?: (cfg: RolePluginConfig) => void;
  onDeleteRole?: (id: string) => void;
  onGenerateQr?: (cfg: RolePluginConfig) => void;
}) {
  const bxmlDevices = bxmlDoc ? getObjectsByType(bxmlDoc, "device") : [];
  const bxmlSpaces  = bxmlDoc ? getObjectsByType(bxmlDoc, "space")  : [];
  const bxmlScenes  = bxmlDoc ? getObjectsByType(bxmlDoc, "scene")  : [];

  const totalEstimate = useMemo(() => {
    const UNIT_PRICES: Record<string, number> = {
      "Hub M3": 699, "Hub M2": 499, "Smart Switch": 199, "Smart Bulb": 89,
      "Door Lock": 1299, "Motion Sensor": 129, "Door Sensor": 99,
      "Thermostat": 599, "Curtain Motor": 799, "Camera G3": 399,
    };
    return bomItems.reduce((sum, item) => {
      const price = UNIT_PRICES[item.name] ?? 199;
      return sum + price * item.qty;
    }, 0);
  }, [bomItems]);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#111118" }}>

      {/* ── Left: Plugin Management ── */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">App 插件管理</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              为不同角色构建专属 Life App 控制界面，生成扫码安装的 Plugin
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bxmlDoc && (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-700/30 bg-zinc-800/30 px-3 py-1.5 text-[11px] text-zinc-500">
                <span>{bxmlSpaces.length} 空间</span>
                <span className="text-zinc-700">·</span>
                <span>{bxmlDevices.length} 设备</span>
                <span className="text-zinc-700">·</span>
                <span>{bxmlScenes.length} 场景</span>
              </div>
            )}
            {onExportBxml && (
              <button
                type="button"
                onClick={onExportBxml}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> 导出 BXML
              </button>
            )}
          </div>
        </div>

        {/* Role Plugin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolePluginConfigs.map((cfg) => {
            const theme = THEMES.find((t) => t.id === cfg.theme) ?? THEMES[0];
            const statusCfg = STATUS_CONFIG[cfg.status] ?? STATUS_CONFIG.draft;
            return (
              <div
                key={cfg.id}
                className="group rounded-xl border border-zinc-700/40 bg-zinc-900/60 p-5 flex flex-col gap-3 hover:border-zinc-600/60 transition-all"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                      <Users className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-zinc-100">{cfg.roleName}</p>
                        {cfg.status === "published" && (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">默认</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                        {cfg.roleName === "业主 (Owner)" ? "拥有全部空间与设备的控制权" :
                         cfg.roleName === "访客 (Guest)" ? "仅限客厅、客房及公共区域" :
                         "自定义权限范围"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteRole?.(cfg.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Config rows */}
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">UI 主题</span>
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <span>{theme.emoji}</span>
                      {theme.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">有效期</span>
                    <span className="text-zinc-300">
                      {cfg.ttlHours ? `${cfg.ttlHours} 小时` : "永久"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">状态</span>
                    <span className={`flex items-center gap-1.5 ${statusCfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  {cfg.studioId && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Studio</span>
                      <span className="text-zinc-400 font-mono text-[10px] truncate max-w-[120px]">{cfg.studioId}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => onEditRole?.(cfg)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700/40 py-2 text-xs text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> 编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => onGenerateQr?.(cfg)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    <QrCode className="h-3 w-3" /> 生成 QR
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new role card */}
          <button
            type="button"
            onClick={() => onAddRole?.()}
            className="rounded-xl border border-dashed border-zinc-700/40 bg-transparent p-5 flex flex-col items-center justify-center gap-3 hover:border-zinc-500/60 hover:bg-zinc-800/20 transition-all group min-h-[180px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/40 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all">
              <Plus className="h-5 w-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">新建角色配置</p>
              <p className="text-[11px] text-zinc-700 mt-0.5">为保洁、长辈等创建专属视角</p>
            </div>
          </button>
        </div>

        {/* Empty state if no BXML */}
        {!bxmlDoc && rolePluginConfigs.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-700/30 bg-zinc-900/20 p-10 text-center">
            <Sparkles className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-400">尚未生成空间方案</p>
            <p className="text-xs text-zinc-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
              先在 Space 标签页通过 AI 生成 BXML 方案，再回来构建角色插件。
            </p>
          </div>
        )}

        {/* Plugin flow tips */}
        {rolePluginConfigs.length === 0 && bxmlDoc && (
          <div className="mt-6 rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-300 mb-1">快速开始</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  点击「新建角色配置」添加业主 / 访客等角色，为每个角色设置主题和权限范围，然后生成专属 QR Code 供扫码安装。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: BOM List ── */}
      <div className="w-64 shrink-0 border-l border-zinc-800/50 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-zinc-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-zinc-400" />
              <p className="text-[13px] font-semibold text-zinc-200">BOM 清单</p>
            </div>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{bomItems.length} 型号</span>
          </div>
          {bomItems.length > 0 && (
            <p className="mt-1.5 text-[11px] text-zinc-500">
              合计 {bomItems.reduce((s, i) => s + i.qty, 0)} 台 · 预估 ¥{totalEstimate.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {bomItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-7 w-7 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500">暂无设备</p>
              <p className="text-[10px] text-zinc-700 mt-1">生成空间方案后自动填充</p>
            </div>
          ) : (
            bomItems.map((item, idx) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-zinc-800/40 bg-zinc-800/20 px-3 py-2.5 gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-zinc-200 truncate">{item.name}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">{item.key}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[11px] font-medium text-zinc-300">×{item.qty}</span>
              </div>
            ))
          )}
        </div>

        {/* BOM summary footer */}
        {bomItems.length > 0 && (
          <div className="px-3 py-3 border-t border-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-zinc-500">设备总数</span>
              <span className="text-zinc-200 font-semibold">{bomItems.reduce((s, i) => s + i.qty, 0)} 台</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-zinc-500">预估总价</span>
              <span className="text-amber-400 font-semibold">¥{totalEstimate.toLocaleString()}</span>
            </div>
            <button
              type="button"
              className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700/40 py-2 text-xs text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            >
              <Download className="h-3 w-3" /> 导出 Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
