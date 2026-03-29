"use client";

import React from "react";

export default function AcademyPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Academy</h1>
        <p className="mt-1 text-sm text-zinc-500">Tutorials, documentation, and learning progress to help you get started with Builder and space intelligence</p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <p className="text-zinc-500">Courses and documentation are coming soon. Stay tuned.</p>
      </div>
    </div>
  );
}
