"use client";

import React from "react";

export default function ForumPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Forum</h1>
        <p className="mt-1 text-sm text-zinc-500">Discuss, ask questions, and share experiences with other Builder users</p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <p className="text-zinc-500">The forum is coming soon. Stay tuned.</p>
      </div>
    </div>
  );
}
