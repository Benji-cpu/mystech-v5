"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SCHEMA_REGISTRY } from "./schema-reference";

type SchemaInfo = (typeof SCHEMA_REGISTRY)[string];

export function SchemaCard({ schema }: { schema: SchemaInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0" />
        ) : (
          <ChevronRight className="size-4 shrink-0" />
        )}
        <span className="truncate">{schema.label}</span>
        <span className="ml-auto text-xs text-muted-foreground font-normal">
          {schema.fields.length} fields
        </span>
      </button>
      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-medium pb-1.5 pr-3">Field</th>
                <th className="text-left font-medium pb-1.5 pr-3">Type</th>
                <th className="text-left font-medium pb-1.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map((field) => (
                <tr
                  key={field.name}
                  className={cn(
                    "border-t border-border/50"
                  )}
                >
                  <td className="py-1.5 pr-3 font-mono text-foreground">
                    {field.name}
                  </td>
                  <td className="py-1.5 pr-3 text-muted-foreground">
                    {field.type}
                  </td>
                  <td className="py-1.5 text-muted-foreground">
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
