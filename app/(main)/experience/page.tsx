"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Clock, Play, Radio, Sparkles, Users, Video } from "lucide-react";

type LiveStatus = "available" | "in_session" | "queue";

export default function ExperiencePage() {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("queue");
  const [queueCount] = useState(3);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800/50 px-6 py-5">
        <h1 className="text-xl font-semibold text-zinc-100">Experience Mode</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Public experience resources (not counted in My Studios): live demo rooms and template sandboxes.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Live Real Space */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300">
                  <Video className="h-3.5 w-3.5" />
                  Live Real Space
                </div>
                <h2 className="mt-3 text-lg font-semibold text-zinc-100">9F Demo Room · M300 Studio</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Connect to real devices with live video feed; only 1 user at a time, using a reservation/queue/time-limit system.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Current status</p>
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {liveStatus === "available" ? "Available" : liveStatus === "in_session" ? "In Session" : "Queue Open"}
                </p>
                {liveStatus === "queue" && <p className="text-xs text-zinc-500 mt-1">{queueCount} people waiting</p>}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveStatus("in_session")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Play className="h-4 w-4" />
                Join Queue
              </button>
              <Link
                href="/studio-live?mode=real"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3.5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/60"
              >
                <Building2 className="h-4 w-4" />
                View Detail
              </Link>
            </div>
          </section>

          {/* Template sandboxes */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-300">Template Sandboxes</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  id: "tpl-home",
                  title: "Template A · Smart Home",
                  desc: "Residential space template with virtual devices + automation scenes",
                },
                {
                  id: "tpl-retail",
                  title: "Template B · Retail / Office",
                  desc: "Retail/office template for configuration and logic verification",
                },
              ].map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-zinc-100">{item.title}</h4>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <Radio className="h-3 w-3" /> Sandbox
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500">{item.desc}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Multi-session</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Session isolated</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/studio-live?mode=simulate&template=${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800/60"
                    >
                      <Play className="h-4 w-4" />
                      Enter Sandbox
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

