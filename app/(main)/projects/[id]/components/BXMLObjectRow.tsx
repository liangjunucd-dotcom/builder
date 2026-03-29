"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { getChildren, type BXMLDocument, type BXMLObject } from "@/lib/bxml";

export function BXMLObjectRow({ obj, doc }: { obj: BXMLObject; doc: BXMLDocument }) {
  const [expanded, setExpanded] = useState(false);
  const children = getChildren(doc, obj.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-zinc-800/30 transition-colors"
      >
        {hasChildren ? (
          <ChevronRight className={`h-3 w-3 text-zinc-600 transition-transform ${expanded ? "rotate-90" : ""}`} />
        ) : (
          <span className="w-3" />
        )}
        <span className="text-sm shrink-0">{obj.icon ?? "📦"}</span>
        <span className="text-xs text-zinc-200 truncate flex-1">{obj.name}</span>
        <span className="text-[10px] text-zinc-600 shrink-0">{obj.id}</span>
      </button>
      {expanded && children.length > 0 && (
        <div className="ml-5 border-l border-zinc-800/50 pl-2">
          {children.map((child) => (<BXMLObjectRow key={child.id} obj={child} doc={doc} />))}
        </div>
      )}
      {expanded && obj.properties.length > 0 && (
        <div className="ml-8 mb-1">
          {obj.properties.map((p) => (
            <div key={p.key} className="flex items-center gap-1 text-[10px] px-1 py-0.5">
              <span className="text-zinc-600">{p.key}:</span>
              <span className="text-zinc-400">{p.value}{p.unit ? ` ${p.unit}` : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
