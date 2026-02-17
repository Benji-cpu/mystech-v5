"use client";

import { useCallback, useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptList } from "./prompt-list";
import { toast } from "sonner";
import type { PromptEntry } from "@/types";

type PromptFabProps = {
  promptKeys: string[];
  schemaKeys: string[];
  label: string;
  isAdmin: boolean;
  userEmail?: string | null;
};

export function PromptFab({
  promptKeys,
  schemaKeys,
  label,
  isAdmin,
  userEmail,
}: PromptFabProps) {
  const [open, setOpen] = useState(false);
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prompts");
      if (!res.ok) return;
      const data = await res.json();
      // Filter to only the prompts relevant to this route
      const filtered = (data.prompts as PromptEntry[]).filter((p) =>
        promptKeys.includes(p.key)
      );
      setPrompts(filtered);
    } finally {
      setLoading(false);
    }
  }, [promptKeys]);

  useEffect(() => {
    if (open) {
      fetchPrompts();
    }
  }, [open, fetchPrompts]);

  const hasActiveOverrides = prompts.some((p) => p.override?.isActive);

  async function handleSave(key: string, content: string) {
    const res = await fetch("/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, content }),
    });
    if (res.ok) {
      toast.success("Prompt override saved");
      await fetchPrompts();
    } else {
      toast.error("Failed to save");
    }
  }

  async function handleToggle(key: string, isActive: boolean) {
    const res = await fetch(`/api/admin/prompts/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      toast.success(isActive ? "Override activated" : "Override deactivated");
      await fetchPrompts();
    }
  }

  async function handleRevert(key: string) {
    const res = await fetch(`/api/admin/prompts/${key}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Override removed");
      await fetchPrompts();
    }
  }

  async function handlePublish(key: string, isPublished: boolean) {
    const res = await fetch(`/api/admin/prompts/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    if (res.ok) {
      toast.success(
        isPublished
          ? "Published for all users"
          : "Unpublished (admin-only draft)"
      );
      await fetchPrompts();
    }
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl opacity-70 hover:opacity-100"
        title="Prompt Inspector"
      >
        <Wand2 className="size-5" />
        {hasActiveOverrides && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
        )}
      </button>

      {/* Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl flex flex-col"
        >
          <SheetHeader>
            <SheetTitle>Prompt Inspector</SheetTitle>
            <SheetDescription>{label}</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 overflow-hidden -mx-4 px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading prompts...
              </div>
            ) : (
              <PromptList
                prompts={prompts}
                schemaKeys={schemaKeys}
                isAdmin={isAdmin}
                userEmail={userEmail}
                onSave={handleSave}
                onToggle={handleToggle}
                onRevert={handleRevert}
                onPublish={handlePublish}
              />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
