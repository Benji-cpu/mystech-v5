"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MASTER_EMAIL } from "@/lib/constants";
import type { PromptEntry } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  deck: "Deck Generation",
  conversation: "Conversation",
  journey: "Journey Cards",
  reading: "Reading Interpretation",
};

const CATEGORY_ORDER = ["deck", "conversation", "journey", "reading"];

export default function AdminPromptsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isMaster = session?.user?.email === MASTER_EMAIL;
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/prompts")
      .then((r) => r.json())
      .then((data) => {
        setPrompts(data.prompts);
        if (data.prompts.length > 0 && !selectedKey) {
          setSelectedKey(data.prompts[0].key);
        }
      });
  }, []);

  const selected = prompts.find((p) => p.key === selectedKey);

  useEffect(() => {
    if (selected) {
      setEditContent(selected.override?.content ?? selected.defaultValue);
      setTestResult(null);
    }
  }, [selectedKey]);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: prompts.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selected.key, content: editContent }),
      });
      if (res.ok) {
        toast.success("Prompt override saved");
        // Refresh prompts
        const data = await fetch("/api/admin/prompts").then((r) => r.json());
        setPrompts(data.prompts);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(isActive: boolean) {
    if (!selected) return;
    const res = await fetch(`/api/admin/prompts/${selected.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      toast.success(isActive ? "Override activated" : "Override deactivated");
      const data = await fetch("/api/admin/prompts").then((r) => r.json());
      setPrompts(data.prompts);
    }
  }

  async function handleRevert() {
    if (!selected) return;
    const res = await fetch(`/api/admin/prompts/${selected.key}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Override removed");
      const data = await fetch("/api/admin/prompts").then((r) => r.json());
      setPrompts(data.prompts);
      setEditContent(selected.defaultValue);
    }
  }

  async function handlePublish(publish: boolean) {
    if (!selected) return;
    const res = await fetch(`/api/admin/prompts/${selected.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: publish }),
    });
    if (res.ok) {
      toast.success(publish ? "Published for all users" : "Unpublished (admin-only draft)");
      const data = await fetch("/api/admin/prompts").then((r) => r.json());
      setPrompts(data.prompts);
    }
  }

  async function handleTest() {
    if (!selected) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/prompts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: selected.isTemplate ? undefined : editContent,
          userPrompt: selected.isTemplate ? editContent : `Use the system prompt to generate a sample response. Theme: "personal growth". Cards: 3.`,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setTestResult(`Response (${data.durationMs}ms):\n\n${data.text}`);
      } else {
        setTestResult(`Error: ${data.error}`);
      }
    } catch {
      setTestResult("Test failed — network error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left panel — prompt list */}
      <div className="w-[260px] shrink-0 rounded-md border">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-3">
            {grouped.map((group) => (
              <div key={group.category}>
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    className={cn(
                      "w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors",
                      selectedKey === item.key
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{item.name}</span>
                      {item.override?.isActive && (
                        <Badge variant="default" className="text-[10px] px-1 py-0 h-4">
                          {item.override.isPublished ? "published" : "draft"}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 rounded-md border">
        {selected ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold">{selected.name}</h2>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[selected.category]}
                </Badge>
                {selected.isTemplate && (
                  <Badge variant="secondary" className="text-xs">
                    Template
                  </Badge>
                )}
                {!isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    View Only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              {selected.isTemplate && selected.templateParams && (
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {selected.templateParams.map((p) => `{${p}}`).join(", ")}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Code Default</p>
                    <Textarea
                      value={selected.defaultValue}
                      readOnly
                      className="h-[300px] font-mono text-xs resize-none bg-muted"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Override</p>
                      {selected.override && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Active</span>
                          <Switch
                            checked={selected.override.isActive}
                            onCheckedChange={handleToggle}
                          />
                        </div>
                      )}
                    </div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="h-[300px] font-mono text-xs resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button onClick={handleSave} disabled={saving} size="sm">
                        {saving ? "Saving..." : "Save Override"}
                      </Button>
                      {selected.override && (
                        <Button onClick={handleRevert} variant="outline" size="sm">
                          Revert to Default
                        </Button>
                      )}
                      <Button
                        onClick={handleTest}
                        variant="secondary"
                        size="sm"
                        disabled={testing}
                      >
                        {testing ? "Testing..." : "Test Prompt"}
                      </Button>
                      {selected.override?.isActive && isMaster && (
                        <Button
                          onClick={() => handlePublish(!selected.override?.isPublished)}
                          variant={selected.override.isPublished ? "outline" : "default"}
                          size="sm"
                        >
                          {selected.override.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {selected.override?.isActive ? "Active Override" : "Code Default"}
                  </p>
                  <Textarea
                    value={
                      selected.override?.isActive
                        ? selected.override.content
                        : selected.defaultValue
                    }
                    readOnly
                    className="h-[400px] font-mono text-xs resize-none bg-muted"
                  />
                </div>
              )}

              {testResult && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Test Result</p>
                  <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono max-h-[200px] overflow-auto">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a prompt from the left panel
          </div>
        )}
      </div>
    </div>
  );
}
