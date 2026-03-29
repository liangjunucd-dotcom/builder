"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Cloud,
  LayoutGrid,
  MapPinned,
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import type { PluginBundle, PluginDeviceCard, PluginSceneDef } from "@/lib/agent/compiler";

type LifeTab = "life" | "market" | "store" | "me";
type LifeSurface = "overview" | "rooms" | "scenes" | "missing";

const DEVICE_ICONS: Record<string, string> = {
  light: "💡",
  ceiling: "💡",
  down: "💡",
  ac: "❄️",
  airconditioner: "❄️",
  thermostat: "🌡️",
  motion: "👁",
  presence: "👁",
  contact: "🔑",
  door: "🚪",
  window: "🪟",
  curtain: "🪟",
  roller: "🪟",
  smoke: "🔥",
  lock: "🔒",
  hub: "📡",
  camera: "📷",
  socket: "🔌",
  switch: "🔘",
};

function deviceIcon(name: string, model: string): string {
  const source = `${name} ${model}`.toLowerCase();
  for (const [key, icon] of Object.entries(DEVICE_ICONS)) {
    if (source.includes(key)) return icon;
  }
  return "📦";
}

function bindingBadge(status: string) {
  if (status === "mapped") {
    return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">已绑定</span>;
  }
  if (status === "conflicted") {
    return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">冲突</span>;
  }
  return <span className="rounded-full bg-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">未绑定</span>;
}

function DeviceCard({
  card,
  onCommand,
}: {
  card: PluginDeviceCard;
  onCommand: (deviceId: string, command: string, params?: Record<string, unknown>) => void;
}) {
  const [on, setOn] = useState(false);
  const [level, setLevel] = useState(100);
  const [temp, setTemp] = useState(26);
  const icon = deviceIcon(card.name, card.model);
  const model = card.model.toLowerCase();
  const isLight = model.includes("light") || model.includes("ceiling") || model.includes("down");
  const isAc = model.includes("ac") || model.includes("airconditioner") || model.includes("thermostat");

  const toggle = () => {
    if (!card.controllable) return;
    const next = !on;
    setOn(next);
    onCommand(card.id, "OnOff.toggle", { targetState: next });
  };

  if (!card.controllable) {
    return (
      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 opacity-75">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl grayscale">{icon}</span>
            <div>
              <p className="text-sm font-medium text-zinc-300">{card.name}</p>
              {card.spaceName && <p className="text-xs text-zinc-600">{card.spaceName}</p>}
            </div>
          </div>
          {bindingBadge(card.bindingStatus)}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs leading-6 text-zinc-500">{card.missingReason ?? "设备未绑定"}</p>
          {card.purchaseUrl && (
            <a
              href={card.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200"
            >
              去购买
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[24px] border p-4 transition-all ${on ? "border-sky-400/25 bg-sky-500/10" : "border-white/8 bg-white/[0.03]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-medium text-zinc-100">{card.name}</p>
            {card.spaceName && <p className="text-xs text-zinc-500">{card.spaceName}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-sky-400" : "bg-zinc-700"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5.5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {on && isLight && (
        <div className="mt-4 flex items-center gap-2">
          <span className="w-5 text-xs text-zinc-500">☀️</span>
          <input
            type="range"
            min={10}
            max={100}
            value={level}
            onChange={(event) => {
              const next = Number(event.target.value);
              setLevel(next);
              onCommand(card.id, "SetLevel", { level: next });
            }}
            className="flex-1 accent-sky-400"
          />
          <span className="w-8 text-right text-xs text-zinc-300">{level}%</span>
        </div>
      )}

      {on && isAc && (
        <div className="mt-4 flex items-center justify-between rounded-[18px] bg-black/20 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              const next = temp - 1;
              setTemp(next);
              onCommand(card.id, "SetTemperature", { temperature: next });
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            -
          </button>
          <span className="text-sm font-medium text-zinc-100">{temp}°C</span>
          <button
            type="button"
            onClick={() => {
              const next = temp + 1;
              setTemp(next);
              onCommand(card.id, "SetTemperature", { temperature: next });
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

function SceneButton({ scene, onTrigger }: { scene: PluginSceneDef; onTrigger: (sceneId: string) => void }) {
  const [triggered, setTriggered] = useState(false);

  const fire = () => {
    setTriggered(true);
    onTrigger(scene.id);
    setTimeout(() => setTriggered(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={fire}
      className={`rounded-[22px] border p-4 text-left transition-all ${
        triggered ? "border-sky-400/25 bg-sky-500/10" : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <div className="text-2xl">{scene.icon}</div>
      <p className="mt-4 text-sm font-semibold text-zinc-100">{scene.name}</p>
      <p className="mt-1 text-xs leading-6 text-zinc-500">
        {triggered ? "场景已触发" : "Trigger the packaged automation path."}
      </p>
    </button>
  );
}

function MissingDevicesPanel({ cards }: { cards: PluginDeviceCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-[26px] border border-emerald-400/15 bg-emerald-500/10 px-4 py-12 text-center">
        <p className="text-sm font-semibold text-emerald-100">所有设备均已绑定</p>
        <p className="mt-2 text-xs leading-6 text-emerald-100/70">This plugin can already control every packaged device in the current space.</p>
      </div>
    );
  }

  const grouped = cards.reduce<Record<string, PluginDeviceCard[]>>((accumulator, card) => {
    const key = card.spaceName ?? "未分配";
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(card);
    return accumulator;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-amber-400/15 bg-amber-500/10 p-4">
        <p className="text-sm font-semibold text-amber-50">{cards.length} 个设备仍未绑定</p>
        <p className="mt-2 text-xs leading-6 text-amber-100/75">
          缺失设备不会阻塞预览模式，但会影响实控体验。Aqara Life 的商城与 Builder 的 BOM 推荐应该协同完成这一步转化。
        </p>
      </div>

      {Object.entries(grouped).map(([spaceName, spaceCards]) => (
        <div key={spaceName} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">{spaceName}</p>
          <div className="mt-3 space-y-2">
            {spaceCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg grayscale opacity-70">{deviceIcon(card.name, card.model)}</span>
                  <div>
                    <p className="text-sm text-zinc-300">{card.name}</p>
                    <p className="text-xs text-zinc-600">{card.missingReason ?? "等待设备补齐"}</p>
                  </div>
                </div>
                {card.purchaseUrl && (
                  <a
                    href={card.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200"
                  >
                    商城
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PluginPage() {
  const { id: pluginId } = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<PluginBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LifeTab>("life");
  const [lifeSurface, setLifeSurface] = useState<LifeSurface>("overview");
  const [onlineStudioId, setOnlineStudioId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOnlineStudioId(params.get("studio"));
  }, []);

  useEffect(() => {
    if (!pluginId) return;
    fetch(`/api/plugin/${pluginId}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Plugin not found (${response.status})`);
        return response.json() as Promise<PluginBundle>;
      })
      .then((nextBundle) => {
        setBundle(nextBundle);
        setLoading(false);
      })
      .catch((nextError: Error) => {
        setError(nextError.message);
        setLoading(false);
      });
  }, [pluginId]);

  const sendCommand = useCallback(
    async (deviceId: string, command: string, params?: Record<string, unknown>) => {
      await fetch(`/api/plugin/${pluginId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "device_command",
          onlineStudioId,
          deviceId,
          command,
          params,
        }),
      }).catch(() => undefined);
    },
    [onlineStudioId, pluginId],
  );

  const triggerScene = useCallback(
    async (sceneId: string) => {
      const scene = bundle?.sceneDefs.find((item) => item.id === sceneId);
      if (!scene) return;
      for (const action of scene.actions) {
        const normalizedAction = action as { deviceId?: string; command?: string };
        if (normalizedAction.deviceId) {
          await sendCommand(normalizedAction.deviceId, normalizedAction.command ?? "execute");
        }
      }
    },
    [bundle, sendCommand],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b12] text-zinc-100">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <p className="text-sm text-zinc-400">正在加载 Aqara Life 插件…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-[#060b12] text-zinc-100">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <div className="space-y-4 text-center">
            <p className="text-4xl">❌</p>
            <p className="text-sm font-medium text-zinc-300">无法加载插件</p>
            <p className="text-xs leading-6 text-zinc-500">{error ?? "未知错误"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { manifest, deviceCards, sceneDefs, bindingStats } = bundle;
  const missingCards = deviceCards.filter((card) => card.bindingStatus !== "mapped");
  const controllableCards = deviceCards.filter((card) => card.controllable);
  const spaceGroups = controllableCards.reduce<Record<string, { spaceName: string; cards: PluginDeviceCard[] }>>((accumulator, card) => {
    const key = card.spaceId ?? card.spaceName ?? "未分配";
    if (!accumulator[key]) {
      accumulator[key] = {
        spaceName: card.spaceName ?? "未分配",
        cards: [],
      };
    }
    accumulator[key].cards.push(card);
    return accumulator;
  }, {});

  const connectionState = onlineStudioId
    ? {
        label: "Cloud Studio",
        hint: onlineStudioId,
        pill: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      }
    : {
        label: "Preview Mode",
        hint: "No runtime bound yet",
        pill: "border-sky-400/20 bg-sky-500/10 text-sky-300",
      };

  const marketCards = [
    {
      title: "标准三居室 · 空间插件",
      body: "适合已经有 Aqara 设备的个人用户，直接进入 Personal Workspace 聚合路径。",
    },
    {
      title: "酒店客房 · 访客插件",
      body: "扫码即可进入，无需 Aqara 账号，适合 B2B2C Token 模式。",
    },
    {
      title: "办公室节能 · 角色模板",
      body: "用协作 Workspace 管理楼层管理员、员工、访客与会议室权限。",
    },
  ];

  const storeCards = missingCards.slice(0, 3).map((card) => ({
    title: card.name,
    body: card.missingReason ?? "Complete the package with the missing hardware.",
    action: "加入商城",
    href: card.purchaseUrl,
  }));

  if (storeCards.length === 0) {
    storeCards.push(
      {
        title: "M300 本地大脑",
        body: "从 Cloud Studio 迁移到本地 Runtime，获得更低延迟、断网可用与长期持有能力。",
        action: "升级硬件",
        href: "https://www.aqara.com",
      },
      {
        title: "全屋补齐套装",
        body: "按当前 BXML 推荐门锁、存在感应器、窗帘电机与灯光设备，一次补齐方案缺口。",
        action: "查看套装",
        href: "https://www.aqara.com",
      },
    );
  }

  const bottomTabs: Array<{ id: LifeTab; label: string; icon: React.ElementType }> = [
    { id: "life", label: "生活", icon: LayoutGrid },
    { id: "market", label: "市场", icon: ScanSearch },
    { id: "store", label: "商城", icon: ShoppingBag },
    { id: "me", label: "我", icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#060b12] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-white/6 bg-[radial-gradient(circle_at_top,_rgba(70,180,255,0.12),_transparent_28%),linear-gradient(180deg,#060b12_0%,#09101a_100%)]">
        <header className="sticky top-0 z-20 border-b border-white/6 bg-black/20 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">Aqara Life</p>
              <p className="mt-2 text-base font-semibold text-zinc-50">{manifest.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {bindingStats.mapped}/{bindingStats.total} 设备已进入当前空间视图
              </p>
            </div>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-zinc-400">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          {activeTab === "life" && (
            <div className="space-y-4 pb-6">
              <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0d141f]">
                <div className="h-24 bg-[radial-gradient(circle_at_top_left,_rgba(70,180,255,0.20),_transparent_40%),linear-gradient(180deg,rgba(70,180,255,0.08),transparent)]" />
                <div className="-mt-10 px-4 pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-black/30 text-2xl backdrop-blur">
                    🏠
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${connectionState.pill}`}>
                      {connectionState.label}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                      {sceneDefs.length} scenes
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-zinc-50">我的家空间插件</p>
                  <p className="mt-1 text-xs leading-6 text-zinc-500">
                    {onlineStudioId
                      ? "Builder 已经把这个方案部署到 Cloud Studio，Life 直接承接真实控制与商城扩展。"
                      : "当前处于预览模式：用户无需硬件即可看到完整空间界面，确认后再部署到 Studio。"}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: "空间", value: Object.keys(spaceGroups).length || 1 },
                      { label: "设备", value: bindingStats.total },
                      { label: "缺失", value: missingCards.length },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                        <p className="text-lg font-semibold text-zinc-100">{item.value}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: "overview", label: "空间", count: undefined },
                  { id: "rooms", label: "房间", count: Object.keys(spaceGroups).length },
                  { id: "scenes", label: "场景", count: sceneDefs.length },
                  { id: "missing", label: "缺失", count: missingCards.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLifeSurface(item.id as LifeSurface)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      lifeSurface === item.id
                        ? "border-sky-400/20 bg-sky-500/10 text-sky-200"
                        : "border-white/8 bg-white/5 text-zinc-400"
                    }`}
                  >
                    {item.label}
                    {item.count !== undefined && <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{item.count}</span>}
                  </button>
                ))}
              </div>

              {lifeSurface === "overview" && (
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-zinc-500" />
                      <p className="text-sm font-semibold text-zinc-100">空间总览</p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {Object.values(spaceGroups).slice(0, 3).map((group) => (
                        <div key={group.spaceName} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{group.spaceName}</p>
                            <p className="text-xs text-zinc-600">{group.cards.length} controllable devices</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {sceneDefs.length > 0 && (
                    <div>
                      <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-600">快捷场景</p>
                      <div className="grid grid-cols-2 gap-3">
                        {sceneDefs.slice(0, 4).map((scene) => (
                          <SceneButton key={scene.id} scene={scene} onTrigger={triggerScene} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                      <p className="text-sm font-semibold text-zinc-100">Life aggregation note</p>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-zinc-500">
                      这个空间默认属于“生活”主内容区。未来若用户只拥有协作 Workspace 权限，也必须通过护栏规则让相应空间在 Life 中可见，但不必暴露 Workspace 名词。
                    </p>
                  </div>
                </div>
              )}

              {lifeSurface === "rooms" && (
                <div className="space-y-4">
                  {Object.values(spaceGroups).length > 0 ? (
                    Object.values(spaceGroups).map((group) => (
                      <section key={group.spaceName}>
                        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-600">{group.spaceName}</p>
                        <div className="space-y-3">
                          {group.cards.map((card) => (
                            <DeviceCard key={card.id} card={card} onCommand={sendCommand} />
                          ))}
                        </div>
                      </section>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-white/8 px-4 py-12 text-center">
                      <p className="text-sm font-medium text-zinc-300">没有可控设备</p>
                      <p className="mt-2 text-xs leading-6 text-zinc-600">请先将 Builder 方案绑定到 Studio Runtime。</p>
                    </div>
                  )}
                </div>
              )}

              {lifeSurface === "scenes" && (
                <div className="grid grid-cols-2 gap-3">
                  {sceneDefs.length > 0 ? (
                    sceneDefs.map((scene) => <SceneButton key={scene.id} scene={scene} onTrigger={triggerScene} />)
                  ) : (
                    <div className="col-span-2 rounded-[24px] border border-dashed border-white/8 px-4 py-12 text-center">
                      <p className="text-sm font-medium text-zinc-300">暂无场景</p>
                      <p className="mt-2 text-xs leading-6 text-zinc-600">Scene entry points will appear after Builder packages automations into the plugin surface.</p>
                    </div>
                  )}
                </div>
              )}

              {lifeSurface === "missing" && <MissingDevicesPanel cards={missingCards} />}
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-4 pb-6">
              <div className="rounded-[28px] border border-white/8 bg-[#0d141f] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">市场</p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">插件与空间方案发现</h2>
                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  这里不是设备商城，而是公开方案、角色插件与 Creator 作品的入口。目标是让浏览即体验，体验即转化。
                </p>
              </div>

              {marketCards.map((card) => (
                <div key={card.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-zinc-100">{card.title}</p>
                  <p className="mt-2 text-xs leading-6 text-zinc-500">{card.body}</p>
                  <button type="button" className="mt-4 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300">
                    进入预览
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-4 pb-6">
              <div className="rounded-[28px] border border-amber-400/15 bg-amber-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-amber-100/70">商城</p>
                <h2 className="mt-2 text-lg font-semibold text-amber-50">硬件与升级路径</h2>
                <p className="mt-2 text-xs leading-6 text-amber-100/75">
                  商城负责设备、M300 与配件套装，不承担方案发现。它的任务是沿着当前空间上下文完成补齐和转化。
                </p>
              </div>

              {storeCards.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-semibold text-zinc-100">{card.title}</p>
                  <p className="mt-2 text-xs leading-6 text-zinc-500">{card.body}</p>
                  <span className="mt-4 inline-flex rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200">
                    {card.action}
                  </span>
                </a>
              ))}
            </div>
          )}

          {activeTab === "me" && (
            <div className="space-y-4 pb-6">
              <div className="rounded-[28px] border border-white/8 bg-[#0d141f] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">我</p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">账号、Studio 列表与权限护栏</h2>
                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  Aqara Life 的“我”承接账号、已购方案、Studio 来源与订阅管理。Workspace 默认不直出，只在需要时渐进披露。
                </p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-zinc-100">Current runtime source</p>
                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  {onlineStudioId
                    ? `This plugin is currently attached to ${onlineStudioId}. In a real account flow, Life would discover it through Personal aggregation, cloud registry, or a collaborative visibility guardrail.`
                    : "This package is being shown in preview mode. It can already demonstrate the future App interface before any Studio exists."}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-zinc-100">Permission posture</p>
                <div className="mt-3 space-y-2">
                  {[
                    "Default personal path: Personal Workspace + LAN + installed plugins.",
                    "Collaborative guardrail: if Personal is empty, authorized shared runtimes must still appear.",
                    "Guest and hotel flows: plugin token can bypass account login but not Studio-side ACL.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      <p className="text-xs leading-6 text-zinc-500">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <nav className="sticky bottom-0 grid grid-cols-4 gap-1 border-t border-white/6 bg-black/20 px-2 py-2 backdrop-blur-xl">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 rounded-[18px] px-2 py-2.5 transition-colors ${
                activeTab === tab.id ? "bg-white/8 text-zinc-100" : "text-zinc-500"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
