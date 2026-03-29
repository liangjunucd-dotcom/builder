"use client";

import React from "react";
import { StudioNode, getStudiosByIds } from "@/lib/studios-mock";
import { useAccount } from "@/context/AccountContext";
import {
  Cpu,
  Server,
  Activity,
  Clock,
  MapPin,
  Wifi,
  CircleCheck,
  CircleAlert,
  CircleX,
} from "lucide-react";

interface LabHealthViewProps {
  targetStudio: StudioNode | null;
}

export default function LabHealthView({ targetStudio }: LabHealthViewProps) {
  const { currentSpace } = useAccount();
  const studios = targetStudio
    ? [targetStudio]
    : getStudiosByIds(currentSpace?.studioIds || []);

  return (
    <div className="h-full w-full overflow-auto bg-[#0a0a0a] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-100">Health Monitoring</h2>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Normal
          </span>
          <span className="flex items-center gap-1.5 ml-3">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Degraded
          </span>
          <span className="flex items-center gap-1.5 ml-3">
            <span className="h-2 w-2 rounded-full bg-zinc-500"></span> Offline
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {studios.map((studio) => (
          <div
            key={studio.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-zinc-100">
                    {studio.name}
                  </h3>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
                    {studio.model}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin className="h-3 w-3" />
                  {studio.location}
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  studio.status === "online"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : studio.status === "degraded"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-zinc-500/10 text-zinc-500"
                }`}
              >
                {studio.status === "online" ? (
                  <CircleCheck className="h-3.5 w-3.5" />
                ) : studio.status === "degraded" ? (
                  <CircleAlert className="h-3.5 w-3.5" />
                ) : (
                  <CircleX className="h-3.5 w-3.5" />
                )}
                {studio.status === "online"
                  ? "Normal"
                  : studio.status === "degraded"
                    ? "Degraded"
                    : "Offline"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">CPU</span>
                </div>
                <div className="text-xl font-light text-zinc-200">
                  {studio.cpuLoad}%
                </div>
                <div className="mt-1 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${studio.cpuLoad > 80 ? "bg-red-500" : studio.cpuLoad > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${studio.cpuLoad}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                  <Server className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">Memory</span>
                </div>
                <div className="text-xl font-light text-zinc-200">
                  {studio.memoryUsage}%
                </div>
                <div className="mt-1 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${studio.memoryUsage > 80 ? "bg-red-500" : studio.memoryUsage > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${studio.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm mt-auto border-t border-zinc-800 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Logic success rate
                </span>
                <span className="font-medium text-zinc-300">
                  {studio.logicSuccessRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" /> Network latency
                </span>
                <span className="font-medium text-zinc-300">
                  {studio.networkLatency}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last heartbeat
                </span>
                <span className="text-zinc-400 text-xs">{studio.lastSeen}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
