"use client";

import Link from "next/link";

import { Clock3, FileText, PlusSquare, Sparkles, GraduationCap, CalendarDays } from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";


function prettyDate(input?: string) {
  if (!input) return "Recently";
  const d = new Date(input);
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export default function BuilderHomePage() {
  const { account, currentSpace } = useAccount();
  const { projects } = useProjects();

  const recent = projects
    .filter((p) => p.builderSpaceId === currentSpace?.id)
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-full bg-[#0f1016] px-6 py-7 text-zinc-200">
    <div className="mx-auto max-w-[1180px] space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Aqara Builder</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          晚上好呀，{account?.name ?? "Builder"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">从 Home 开始，继续你的空间方案设计与交付。</p>
      </header>

      <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock3 className="h-4 w-4" />
            <p className="text-sm font-medium">最近访问</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recent.length > 0 ? (
              recent.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.id}?loading=1`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/75"
                >
                  <div className="flex items-start justify-between">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="text-[11px] text-zinc-600">{prettyDate(item.updatedAt)}</span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm font-medium text-zinc-200">{item.name}</p>
                </Link>
              ))
            ) : (
              <Link
                href="/"
                className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900/55"
              >
                <PlusSquare className="h-4 w-4 text-zinc-500" />
                <p className="mt-4 text-sm text-zinc-300">新页面</p>
                <p className="mt-1 text-xs text-zinc-600">从 Build AI 创建第一个方案</p>
              </Link>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <GraduationCap className="h-4 w-4" />
            <p className="text-sm font-medium">入门学习</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { title: "什么是空间方案", href: "/academy", icon: "🧱" },
              { title: "创建你的第一个页面", href: "/", icon: "✨" },
              { title: "创建子页面与插件", href: "/marketplace", icon: "🗂️" },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/75"
              >
                <p className="text-lg">{item.icon}</p>
                <p className="mt-3 text-sm font-medium text-zinc-200">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-600">阅读时长约 2 分钟</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarDays className="h-4 w-4" />
            <p className="text-sm font-medium">活动预告</p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/45 p-4">
              <p className="text-sm font-medium text-zinc-200">将 AI 速记与日历事件连接</p>
              <p className="mt-2 text-xs text-zinc-500">在 Builder 中快速沉淀会议纪要、空间任务与交付节点。</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/45 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>今天</span>
                <span>9:00 · 办公室</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">项目进度检查</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-indigo-400">
                <Sparkles className="h-3 w-3" />
                <span>已加入并生成待办</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}