"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPluginById } from "@/lib/plugins-mock";
import { ArrowLeft, Download, ThumbsUp, Share2, ChevronRight } from "lucide-react";

export default function PluginDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const plugin = id ? getPluginById(id) : null;

  if (!plugin) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-zinc-400">Plugin not found</p>
        <Link href="/square" className="text-sm text-blue-500 hover:underline">
          Back to Plugin Square
        </Link>
      </div>
    );
  }

  const priceLabel = plugin.price === "Free" ? "Free" : `$ ${plugin.price}`;

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <Link
          href="/square"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{plugin.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>v{plugin.version}</span>
          <span>·</span>
          <span>{plugin.fileSize}</span>
          <span className="rounded bg-zinc-700/80 px-2 py-0.5 text-zinc-300">{plugin.badge}</span>
          <span className="rounded bg-zinc-700/80 px-2 py-0.5 text-zinc-300">{priceLabel}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-6 w-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-300">
            {plugin.author.charAt(0)}
          </span>
          {plugin.author}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Get Plugins
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
            <Download className="h-4 w-4" />
            {plugin.downloads}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
            <ThumbsUp className="h-4 w-4" />
            {plugin.likes}
          </span>
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* 左侧：Description + 配图占位 */}
          <div className="lg:col-span-3 space-y-6">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Description
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{plugin.description}</p>
            </section>
            <div className="aspect-video rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-600 text-sm">
              Screenshots / Demo
            </div>
          </div>

          {/* 右侧：Adapted Products + Changelog */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Adapted Products
              </h2>
              <ul className="space-y-2">
                {plugin.adaptedProducts.map((prod) => (
                  <li
                    key={prod.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                        Hub
                      </div>
                      <span className="font-medium text-zinc-200">{prod.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">$ {prod.price.toFixed(2)}</span>
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Changelog
              </h2>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm">
                <p className="text-zinc-500">
                  Version: {plugin.changelog.version} · File Size: {plugin.changelog.fileSize} ·
                  Updated: {plugin.changelog.updated}
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-zinc-400">
                  {plugin.changelog.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
