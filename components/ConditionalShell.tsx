"use client";

import React, { Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { AppShell } from "./AppShell";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function LabOrShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const hasStudio = searchParams.get("studio");

  if (hasStudio) {
    return (
      <div className="flex h-screen w-full flex-col bg-black text-zinc-200">
        <header className="flex h-12 items-center border-b border-zinc-800 bg-zinc-950 px-4">
          <Link
            href="/spaces"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Link>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname?.startsWith("/lab");

  if (isLab) {
    return (
      <Suspense fallback={<AppShell>{children}</AppShell>}>
        <LabOrShell>{children}</LabOrShell>
      </Suspense>
    );
  }

  // /projects and /projects/[id] both use AppShell: list pages have sidebar, detail pages are fullscreen within AppShell
  return <AppShell>{children}</AppShell>;
}
