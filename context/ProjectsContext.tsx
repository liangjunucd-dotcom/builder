"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Project, Site } from "../lib/domain-types";
import type { BXMLDocument } from "@/lib/bxml";

const LS_KEY_PROJECTS = "aqara_builder_projects";
const LS_KEY_SITES = "aqara_builder_sites";
const LS_KEY_STARRED = "starredProjectIds";
const LS_KEY_BXML_PREFIX = "aqara_builder_bxml_";

interface ProjectsContextType {
  projects: Project[];
  sites: Site[];
  starredProjectIds: string[];
  getProjectsByBuilderSpaceId: (spaceId: string | undefined) => Project[];
  getSitesByProjectId: (projectId: string) => Site[];
  isProjectStarred: (projectId: string) => boolean;
  toggleProjectStar: (projectId: string) => void;
  addProject: (project: Project) => void;
  addSite: (site: Site) => void;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  updateSite: (siteId: string, patch: Partial<Site>) => void;
  getBxml: (projectId: string) => BXMLDocument | null;
  saveBxml: (projectId: string, bxml: BXMLDocument) => void;
}

const defaultProjects: Project[] = [
  {
    id: "proj-1",
    name: "Smart Office HQ",
    buildingType: "commercial",
    country: "China",
    siteIds: ["site-1", "site-2"],
    builderSpaceId: "space-1",
    collaborators: [{ email: "john.doe@example.com", role: "owner" }],
    spaceType: "office",
    creationMethod: "manual",
    projectMode: "standard",
    projectType: "standard",
    studioLinked: true,
    selectedStudioId: "studio-1",
    deployedAt: "2026-03-10T08:00:00Z",
    updatedAt: "2026-03-11T10:00:00Z",
    customerId: "cust-1",
  },
  {
    id: "proj-2",
    name: "Shared Project",
    buildingType: "residential",
    country: "US",
    siteIds: [],
    builderSpaceId: "space-2",
    collaborators: [{ email: "john.doe@example.com", role: "viewer" }],
    spaceType: "home",
    creationMethod: "manual",
    projectMode: "standard",
    projectType: "standard",
    studioLinked: true,
    updatedAt: "2026-03-10T14:30:00Z",
    customerId: "cust-2",
  },
];

const defaultSites: Site[] = [
  { id: "site-1", projectId: "proj-1", name: "Floor 1", studioId: "studio-1" },
  { id: "site-2", projectId: "proj-1", name: "Floor 2", studioId: "studio-2" },
];

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed as T;
    }
  } catch { /* ignore */ }
  return fallback;
}

function saveToLS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded — silently fail */ }
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadFromLS(LS_KEY_PROJECTS, defaultProjects));
  const [sites, setSites] = useState<Site[]>(() => loadFromLS(LS_KEY_SITES, defaultSites));
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>(() => loadFromLS(LS_KEY_STARRED, ["proj-1"]));
  const [bxmlCache, setBxmlCache] = useState<Map<string, BXMLDocument>>(new Map());
  const [bxmlLoaded, setBxmlLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cache = new Map<string, BXMLDocument>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LS_KEY_BXML_PREFIX)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const doc = JSON.parse(raw) as BXMLDocument;
            const projId = key.slice(LS_KEY_BXML_PREFIX.length);
            cache.set(projId, doc);
          }
        } catch { /* skip malformed */ }
      }
    }
    setBxmlCache(cache);
    setBxmlLoaded(true);
  }, []);

  useEffect(() => { saveToLS(LS_KEY_PROJECTS, projects); }, [projects]);
  useEffect(() => { saveToLS(LS_KEY_SITES, sites); }, [sites]);
  useEffect(() => { saveToLS(LS_KEY_STARRED, starredProjectIds); }, [starredProjectIds]);

  const getProjectsByBuilderSpaceId = (spaceId: string | undefined) => {
    if (!spaceId) return [];
    return projects.filter(p => p.builderSpaceId === spaceId);
  };

  const getSitesByProjectId = (projectId: string) => sites.filter(s => s.projectId === projectId);
  const isProjectStarred = (projectId: string) => starredProjectIds.includes(projectId);

  const toggleProjectStar = (projectId: string) => {
    setStarredProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const addSite = useCallback((site: Site) => {
    setSites(prev => [...prev, site]);
  }, []);

  const updateProject = useCallback((projectId: string, patch: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...patch } : p));
  }, []);

  const updateSite = useCallback((siteId: string, patch: Partial<Site>) => {
    setSites(prev => prev.map(s => s.id === siteId ? { ...s, ...patch } : s));
  }, []);

  const getBxml = useCallback((projectId: string): BXMLDocument | null => {
    return bxmlCache.get(projectId) ?? null;
  }, [bxmlCache]);

  const saveBxml = useCallback((projectId: string, bxml: BXMLDocument) => {
    setBxmlCache(prev => {
      const next = new Map(prev);
      next.set(projectId, bxml);
      return next;
    });
    saveToLS(`${LS_KEY_BXML_PREFIX}${projectId}`, bxml);
  }, []);

  return (
    <ProjectsContext.Provider value={{
      projects, sites, starredProjectIds,
      getProjectsByBuilderSpaceId, getSitesByProjectId,
      isProjectStarred, toggleProjectStar,
      addProject, addSite, updateProject, updateSite,
      getBxml, saveBxml,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
