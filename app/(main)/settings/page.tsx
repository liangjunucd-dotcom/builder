import React from "react";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col bg-black">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Account & Preferences</p>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400">Settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}
