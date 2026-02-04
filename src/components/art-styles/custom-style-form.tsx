"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ArtStyle } from "@/types";

interface CustomStyleFormProps {
  initialData?: Pick<ArtStyle, "id" | "name" | "description">;
  onSuccess?: (style: ArtStyle) => void;
  redirectOnSuccess?: boolean;
}

export function CustomStyleForm({
  initialData,
  onSuccess,
  redirectOnSuccess = true,
}: CustomStyleFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/art-styles/${initialData.id}`
        : "/api/art-styles";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (onSuccess) {
        onSuccess(data.data);
      }

      if (redirectOnSuccess) {
        router.push(`/art-styles/${data.data.id}`);
        router.refresh();
      }
    } catch {
      setError("Failed to save style. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="style-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="style-name"
          placeholder="e.g. Neon Cyberpunk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="style-description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="style-description"
          placeholder="Describe the visual style you want for your cards. This will be used as the art generation prompt..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          This description will be used as the style prompt for AI image
          generation.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={loading || !name || !description}>
        {loading
          ? isEdit
            ? "Saving..."
            : "Creating..."
          : isEdit
            ? "Save Changes"
            : "Create Style"}
      </Button>
    </form>
  );
}
