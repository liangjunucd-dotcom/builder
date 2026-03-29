"use client";

import React, { useState } from "react";
import { StudioNode } from "@/lib/studios-mock";
import { Terminal, Play, Trash2, Download, Search, Filter } from "lucide-react";

interface LabDebugViewProps {
  targetStudio: StudioNode | null;
}

export default function LabDebugView({ targetStudio }: LabDebugViewProps) {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: "10:23:45.123",
      type: "info",
      source: "system",
      message: "Studio initialized successfully.",
    },
    {
      id: 2,
      time: "10:23:46.001",
      type: "info",
      source: "network",
      message: "Connected to cloud platform.",
    },
    {
      id: 3,
      time: "10:24:12.550",
      type: "debug",
      source: "device",
      message: "Received heartbeat from M300-BJ-001.",
    },
    {
      id: 4,
      time: "10:25:01.220",
      type: "warn",
      source: "logic",
      message: "Logic block execution delayed by 50ms.",
    },
    {
      id: 5,
      time: "10:26:33.900",
      type: "error",
      source: "auth",
      message: "Failed to authenticate device token.",
    },
  ]);

  const handleExecute = () => {
    if (!command.trim()) return;

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toISOString().split("T")[1].slice(0, 12),
        type: "info",
        source: "user",
        message: `> ${command}`,
      },
    ]);
    setCommand("");
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter logs..."
              className="w-64 rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
            <Filter className="h-4 w-4" />
            Level
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Log Output */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        <div className="space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 hover:bg-zinc-900/50 px-2 py-1 rounded"
            >
              <span className="text-zinc-500 w-24 flex-shrink-0">
                {log.time}
              </span>
              <span
                className={`w-12 flex-shrink-0 font-semibold ${
                  log.type === "error"
                    ? "text-red-500"
                    : log.type === "warn"
                      ? "text-amber-500"
                      : log.type === "debug"
                        ? "text-zinc-500"
                        : "text-blue-500"
                }`}
              >
                [{log.type.toUpperCase()}]
              </span>
              <span className="text-zinc-400 w-16 flex-shrink-0">
                [{log.source}]
              </span>
              <span
                className={`${
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "warn"
                      ? "text-amber-400"
                      : log.type === "debug"
                        ? "text-zinc-500"
                        : "text-zinc-300"
                }`}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        {targetStudio && (
          <div className="mb-2 text-xs text-zinc-500">
            Current target:{" "}
            <span className="font-medium text-zinc-300">
              {targetStudio.name}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-500">
            <Terminal className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            placeholder="Enter diagnostic command (e.g.: ping, restart, get-status)..."
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleExecute}
            className="flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
