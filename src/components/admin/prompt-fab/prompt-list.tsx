"use client";

import { PromptEditor } from "./prompt-editor";
import { SchemaCard } from "./schema-card";
import { SCHEMA_REGISTRY } from "./schema-reference";
import type { PromptEntry } from "@/types";

type PromptListProps = {
  prompts: PromptEntry[];
  schemaKeys: string[];
  isAdmin: boolean;
  userEmail?: string | null;
  onSave: (key: string, content: string) => Promise<void>;
  onToggle: (key: string, isActive: boolean) => Promise<void>;
  onRevert: (key: string) => Promise<void>;
  onPublish: (key: string, isPublished: boolean) => Promise<void>;
};

export function PromptList({
  prompts,
  schemaKeys,
  isAdmin,
  userEmail,
  onSave,
  onToggle,
  onRevert,
  onPublish,
}: PromptListProps) {
  const schemas = schemaKeys
    .map((k) => SCHEMA_REGISTRY[k])
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Text Prompts */}
      {prompts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Text Prompts
          </h3>
          {prompts.map((prompt) => (
            <PromptEditor
              key={prompt.key}
              prompt={prompt}
              isAdmin={isAdmin}
              userEmail={userEmail}
              onSave={onSave}
              onToggle={onToggle}
              onRevert={onRevert}
              onPublish={onPublish}
            />
          ))}
        </div>
      )}

      {/* Output Schemas */}
      {schemas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Output Schemas
          </h3>
          {schemas.map((schema) => (
            <SchemaCard key={schema.name} schema={schema} />
          ))}
        </div>
      )}
    </div>
  );
}
