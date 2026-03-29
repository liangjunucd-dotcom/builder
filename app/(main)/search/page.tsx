"use client";

import Link from "next/link";
import { Search as SearchIcon, FileText } from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";
import React from "react";

export default function SearchPage() {
  const { currentSpace } = useAccount();
  const { projects } = useProjects();
  const [q, setQ] = React.useState("");

  const results = React.useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return [];
    return projects
      .filter((p) => p.builderSpaceId === currentSpace?.id)
      .filter((p) => p.name.toLowerCase().includes(k))
      .slice(0, 20);
  }, [q, projects, currentSpace?.id]);

  return (
    <div className="min-h-full bg-[#0f1016] px-6 py-7 text-zinc-200">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <div className="relative mt-4">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, builds, studios..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-zinc-200 outline-none focus:border-zinc-700"
          />
        </div>
        <div className="mt-5 space-y-2">
          {q.trim() === "" && <p className="text-sm text-zinc-500">输入关键词开始搜索。</p>}
          {q.trim() !== "" && results.length === 0 && <p className="text-sm text-zinc-500">未找到相关结果。</p>}
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.id}?loading=1`}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/35 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <FileText className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-sm text-zinc-200">{item.name}</p>
                <p className="text-xs text-zinc-600">{item.creationMethod === "ai_build" ? "My Build" : "Project"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

