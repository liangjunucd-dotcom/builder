"use client";

import Link from "next/link";
import { Clock3, FileText } from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";

function timeAgo(input?: string) {
  if (!input) return "just now";
  const t = Date.now() - new Date(input).getTime();
  const m = Math.floor(t / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RecentsPage() {
  const { currentSpace } = useAccount();
  const { projects } = useProjects();

  const recents = projects
    .filter((p) => p.builderSpaceId === currentSpace?.id)
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 30);

  return (
    <div className="min-h-full bg-[#0f1016] px-6 py-7 text-zinc-200">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-zinc-400" />
          <h1 className="text-2xl font-semibold tracking-tight">Recents</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-500">最近访问与编辑的空间方案。</p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {recents.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.id}?loading=1`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/65"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <p className="text-sm text-zinc-200">{item.name}</p>
                </div>
                <span className="text-xs text-zinc-600">{timeAgo(item.updatedAt)}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{item.creationMethod === "ai_build" ? "My Build" : "Project"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

