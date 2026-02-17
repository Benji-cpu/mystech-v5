"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MASTER_EMAIL } from "@/lib/constants";
import type { PromptEntry } from "@/types";

type PromptEditorProps = {
  prompt: PromptEntry;
  isAdmin: boolean;
  userEmail?: string | null;
  onSave: (key: string, content: string) => Promise<void>;
  onToggle: (key: string, isActive: boolean) => Promise<void>;
  onRevert: (key: string) => Promise<void>;
  onPublish: (key: string, isPublished: boolean) => Promise<void>;
};

export function PromptEditor({
  prompt,
  isAdmin,
  userEmail,
  onSave,
  onToggle,
  onRevert,
  onPublish,
}: PromptEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [editContent, setEditContent] = useState(
    prompt.override?.content ?? prompt.defaultValue
  );
  const [saving, setSaving] = useState(false);

  const hasOverride = !!prompt.override;
  const isActive = prompt.override?.isActive ?? false;
  const isPublished = prompt.override?.isPublished ?? false;
  const isDirty = editContent !== (prompt.override?.content ?? prompt.defaultValue);
  const isMaster = userEmail === MASTER_EMAIL;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(prompt.key, editContent);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-md border">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0" />
        ) : (
          <ChevronRight className="size-4 shrink-0" />
        )}
        <span className="truncate">{prompt.name}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {prompt.isTemplate && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              Template
            </Badge>
          )}
          {hasOverride && isActive && (
            <Badge
              variant={isPublished ? "default" : "outline"}
              className="text-[10px] px-1 py-0 h-4"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t p-3 space-y-3">
          <p className="text-xs text-muted-foreground">{prompt.description}</p>

          <Tabs defaultValue={isAdmin ? "custom" : "original"}>
            <TabsList className="h-8">
              <TabsTrigger value="original" className="text-xs px-3 h-7">
                Original
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs px-3 h-7">
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original">
              <Textarea
                value={prompt.defaultValue}
                readOnly
                className="h-[200px] font-mono text-xs resize-none bg-muted mt-2"
              />
            </TabsContent>

            <TabsContent value="custom">
              {isAdmin ? (
                <>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-[200px] font-mono text-xs resize-none mt-2"
                  />

                  {/* Controls */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                      onClick={handleSave}
                      disabled={saving || !isDirty}
                      size="sm"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>

                    {hasOverride && (
                      <>
                        <Button
                          onClick={() => onRevert(prompt.key)}
                          variant="outline"
                          size="sm"
                        >
                          Revert
                        </Button>
                        {isMaster && (
                          <Button
                            onClick={() => onPublish(prompt.key, !isPublished)}
                            variant={isPublished ? "outline" : "default"}
                            size="sm"
                          >
                            {isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-muted-foreground">
                            Active
                          </span>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              onToggle(prompt.key, checked)
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Textarea
                  value={
                    hasOverride && isActive
                      ? prompt.override!.content
                      : prompt.defaultValue
                  }
                  readOnly
                  className="h-[200px] font-mono text-xs resize-none bg-muted mt-2"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
