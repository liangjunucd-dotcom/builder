"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Newspaper,
  Bell,
  Users,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
  Hash,
  Package,
  Plus,
  Box,
  BookOpen,
  GraduationCap,
  FileText,
  PlayCircle,
} from "lucide-react";

type TabId = "feed" | "news" | "messages" | "squad" | "learn";

export default function CollabPage() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");

  const navItems = [
    { id: "feed", label: "Feed", icon: MessageSquare },
    { id: "news", label: "News", icon: Newspaper },
    { id: "messages", label: "Messages", icon: Bell },
    { id: "squad", label: "Find Squad", icon: Users },
    { id: "learn", label: "Learn", icon: BookOpen },
  ];

  return (
    <div className="flex h-full w-full bg-black">
      {/* Left Nav */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-1">
        <div className="mb-6 px-3">
          <h2 className="text-xl font-bold text-zinc-100">Community</h2>
          <p className="mt-1 text-xs text-zinc-500">Browse feeds, news, and find partners for projects</p>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabId)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}

        <div className="mt-8 border-t border-zinc-800 pt-4">
          <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Mine
          </h3>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200">
            <Heart className="h-4 w-4" /> Liked
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200">
            <Bookmark className="h-4 w-4" /> Saved
          </button>
        </div>
      </div>

      {/* Middle Content */}
      <div className="flex-1 overflow-auto border-r border-zinc-800 relative">
        {activeTab === "feed" && (
          <div className="max-w-2xl mx-auto py-6">
            <div className="flex gap-4 border-b border-zinc-800 px-6 pb-4 mb-6">
              <button className="text-sm font-medium text-zinc-100 border-b-2 border-blue-500 pb-1">
                Recommended
              </button>
              <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 pb-1">
                Following
              </button>
              <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 pb-1">
                Showcase
              </button>
              <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 pb-1">
                Driver Dev
              </button>
            </div>

            <div className="space-y-6 px-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 border-b border-zinc-800/50 pb-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-300">
                    U{i}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-zinc-200">
                        User {i}
                      </span>
                      <span className="text-sm text-zinc-500">
                        @user{i} · 2h
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                      Just published a new space intelligence solution combining the latest temp/humidity sensors with AC control logic, effectively reducing energy consumption by 15%. Check it out in the Asset Library! 🚀
                    </p>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-zinc-200">
                            Energy-Saving HVAC Solution v1.0
                          </h4>
                          <p className="text-xs text-zinc-500">
                            Includes 3 devices · 2 logic rules
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-zinc-500">
                      <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4" />{" "}
                        <span className="text-xs">12</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                        <Heart className="h-4 w-4" />{" "}
                        <span className="text-xs">48</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="max-w-2xl mx-auto py-6 px-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-8">
              Industry News
            </h2>

            <div className="relative border-l border-zinc-800 ml-3 space-y-8">
              {[
                {
                  time: "10:00 AM",
                  source: "Matter Alliance",
                  title: "Matter 1.2 Standard Officially Released",
                  summary:
                    "Added support for 9 new device types including robot vacuums, refrigerators, and washing machines, further expanding the smart home interoperability ecosystem.",
                },
                {
                  time: "Yesterday",
                  source: "Aqara Official",
                  title: "Builder Platform Beta Launch",
                  summary:
                    "The space intelligence building platform for developers has officially entered public beta, offering powerful logic orchestration and asset management capabilities.",
                },
                {
                  time: "Oct 20",
                  source: "Industry Trends",
                  title: "AI Large Models in Space Intelligence Applications",
                  summary:
                    "Exploring how large language models can optimize natural language interaction and automation scene generation in smart homes.",
                },
              ].map((news, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-black bg-blue-500"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-500">
                      {news.time}
                    </span>
                    <span className="text-xs text-zinc-500">
                      · {news.source}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-200 mb-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                    {news.summary}
                  </p>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "squad" && (
          <div className="flex h-full">
            <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="font-medium text-zinc-200">Project Squads</h3>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                <button className="w-full flex items-center gap-2 rounded px-3 py-2 text-sm font-medium bg-zinc-800 text-zinc-200">
                  <Hash className="h-4 w-4 text-zinc-400" />
                  Beijing HQ Renovation
                </button>
                <button className="w-full flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Hash className="h-4 w-4 text-zinc-500" />
                  Smart Hotel Solution
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-[#0a0a0a]">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-zinc-500" />
                  <h3 className="font-semibold text-zinc-100">Beijing HQ Renovation</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full border border-black bg-zinc-800"></div>
                    <div className="h-6 w-6 rounded-full border border-black bg-zinc-700"></div>
                    <div className="h-6 w-6 rounded-full border border-black bg-zinc-600"></div>
                  </div>
                  <span className="text-xs text-zinc-500">12 members</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex-shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-200 text-sm">
                        Alice
                      </span>
                      <span className="text-xs text-zinc-500">10:30 AM</span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      Please check the latest space snapshot — I've adjusted the device layout in the meeting room.
                    </p>
                    <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 w-64">
                      <div className="flex items-center gap-2 text-blue-500 mb-2">
                        <Box className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Space Snapshot: Meeting Room v2
                        </span>
                      </div>
                      <button className="w-full rounded bg-zinc-800 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700">
                        Open in Workbench
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Send a message to #Beijing HQ Renovation..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "learn" && (
          <div className="max-w-2xl mx-auto py-6 px-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Learn & Get Started</h2>
            <p className="text-sm text-zinc-500 mb-8">Tutorials, docs, and learning progress — separated from community feeds for focused onboarding</p>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-blue-500" />
                  Getting Started
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { title: "Builder in 5 Minutes", desc: "Create a project, add devices, first automation", status: "Completed" },
                    { title: "Space & Device Modeling", desc: "Floors, rooms, devices, and groups", status: "In Progress" },
                    { title: "Logic Orchestration Basics", desc: "Conditions, actions, and scene chaining", status: "Not Started" },
                    { title: "Asset Publishing & Sharing", desc: "Package solutions, publish to marketplace", status: "Not Started" },
                  ].map((c, i) => (
                    <button
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-200">{c.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{c.desc}</p>
                        <span className="mt-2 inline-block text-xs text-zinc-500">{c.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Docs & References
                </h3>
                <ul className="space-y-2">
                  {["API Reference", "Device Capability Guide", "Matter / Zigbee Integration Guide", "Best Practices"].map((doc, i) => (
                    <li key={i}>
                      <button className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100">
                        {doc}
                        <span className="text-zinc-500">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">My Learning Progress</h3>
                <p className="text-xs text-zinc-500">Getting started tutorials 1/4 completed · Continue learning to earn achievements and credits</p>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-800">
                  <div className="h-2 w-1/4 rounded-full bg-blue-500" style={{ width: "25%" }} />
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel (Widgets) */}
      <div className="w-80 flex-shrink-0 bg-zinc-950 p-6 flex flex-col gap-8">
        <div>
          <button className="w-full rounded-full bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
            Post New Update
          </button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-100 mb-4">Recommended for You</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">
                  Geek Creator Recruitment
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Join the official program for hardware support and revenue sharing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">
                  Matter Developer Conference
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Online livestream next Tuesday, discussing the future of interoperability.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-100 mb-4">Trending Topics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 hover:text-blue-500 cursor-pointer">
                # Energy Saving Solutions
              </span>
              <span className="text-xs text-zinc-600">1.2k posts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 hover:text-blue-500 cursor-pointer">
                # M300 Firmware Update
              </span>
              <span className="text-xs text-zinc-600">856 posts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 hover:text-blue-500 cursor-pointer">
                # Automation Inspiration
              </span>
              <span className="text-xs text-zinc-600">3.4k posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
