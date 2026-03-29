"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Sofa,
  Monitor,
  Lightbulb,
  Thermometer,
  Wind,
  Grid,
} from "lucide-react";

export default function LabSpaceView() {
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    living: true,
  });

  const toggleRoom = (id: string) => {
    setExpandedRooms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Panel: Space Structure */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search spaces/devices/furniture..."
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-200">
              All
            </button>
            <button className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
              Configured
            </button>
            <button className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
              Not configured
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {/* Tree View */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 rounded px-2 py-1.5 hover:bg-zinc-900 cursor-pointer text-zinc-300">
              <ChevronDown className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">My Home</span>
            </div>

            <div className="pl-4 space-y-1">
              {/* Living Room */}
              <div>
                <div
                  className="flex items-center gap-1 rounded px-2 py-1.5 hover:bg-zinc-900 cursor-pointer text-zinc-300"
                  onClick={() => toggleRoom("living")}
                >
                  {expandedRooms["living"] ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  )}
                  <span className="text-sm">Living Room</span>
                </div>
                {expandedRooms["living"] && (
                  <div className="pl-6 space-y-1 mt-1">
                    <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-900 cursor-pointer text-zinc-400">
                      <Sofa className="h-3.5 w-3.5" />
                      <span className="text-xs">Three-seater sofa</span>
                    </div>
                    <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-900 cursor-pointer text-zinc-400">
                      <Monitor className="h-3.5 w-3.5" />
                      <span className="text-xs">TV stand</span>
                    </div>
                    <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-900 cursor-pointer text-zinc-400">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500/70" />
                      <span className="text-xs text-zinc-300">
                        Ceiling light (Configured)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Bedroom */}
              <div>
                <div
                  className="flex items-center gap-1 rounded px-2 py-1.5 hover:bg-zinc-900 cursor-pointer text-zinc-300"
                  onClick={() => toggleRoom("master")}
                >
                  {expandedRooms["master"] ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  )}
                  <span className="text-sm">Master Bedroom</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 p-3 text-xs text-zinc-500 text-center">
          19 objects · 8 relations
        </div>
      </div>

      {/* Middle Panel: Component Library */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-200">Component Library</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Drag icons to the floor plan to configure
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Furniture
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <Sofa className="h-5 w-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">Sofa</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <div className="h-5 w-5 border-2 border-zinc-400 rounded-sm" />
                <span className="text-[10px] text-zinc-400">Bed</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <div className="h-5 w-5 border-t-2 border-zinc-400" />
                <span className="text-[10px] text-zinc-400">Table</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Devices
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <Lightbulb className="h-5 w-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">Lights</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <Thermometer className="h-5 w-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">Sensors</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-2 cursor-grab hover:border-zinc-700">
                <Wind className="h-5 w-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">AC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Floor Plan View */}
      <div className="flex-1 bg-[#0a0a0a] relative flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="flex rounded-md border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-1">
            <button className="rounded bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200">
              Room
            </button>
            <button className="rounded px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200">
              Ceiling
            </button>
            <button className="rounded px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200">
              Floor
            </button>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button className="rounded-md border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">
            Generate spatial relations
          </button>
          <button className="rounded-md border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">
            Re-upload & recognize
          </button>
        </div>

        {/* Canvas Area (Mock) */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="relative w-full max-w-3xl aspect-[4/3] border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center bg-zinc-900/20">
            <Grid
              className="absolute inset-0 w-full h-full text-zinc-800/20"
              strokeWidth={0.5}
            />

            {/* Mock Floor Plan */}
            <div className="absolute inset-10 border-2 border-zinc-700 flex">
              <div className="w-2/3 border-r-2 border-zinc-700 flex flex-col">
                <div className="h-2/3 border-b-2 border-zinc-700 relative group">
                  <span className="absolute top-2 left-2 text-xs text-zinc-500 font-medium">
                    Living Room
                  </span>
                  {/* Placed Item */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 border border-blue-500/50 bg-blue-500/10 rounded flex items-center justify-center">
                    <Sofa className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full border border-amber-500/50 bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="h-3 w-3 text-amber-400" />
                  </div>
                </div>
                <div className="h-1/3 relative">
                  <span className="absolute top-2 left-2 text-xs text-zinc-500 font-medium">
                    Kitchen
                  </span>
                </div>
              </div>
              <div className="w-1/3 relative">
                <span className="absolute top-2 left-2 text-xs text-zinc-500 font-medium">
                  Master Bedroom
                </span>
              </div>
            </div>

            <p className="text-zinc-500 text-sm z-10 bg-[#0a0a0a] px-4 py-2 rounded-full border border-zinc-800">
              Drag components here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
