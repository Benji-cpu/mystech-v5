"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "sonner";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { update: updateSession } = useSession();
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);

  const bioVoice = useVoiceInput({ value: bio, onChange: setBio, maxLength: 500 });

  const initialDisplayName = profile.displayName ?? "";
  const initialBio = profile.bio ?? "";
  const isDirty = displayName !== initialDisplayName || bio !== initialBio;

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update profile");
        return;
      }
      // Refresh JWT so displayName is available in session immediately
      await updateSession();
      toast.success("Profile updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar className="size-20 ring-2 ring-[#c9a94e]/30">
            <AvatarImage src={profile.image ?? undefined} alt={profile.name ?? "User"} />
            <AvatarFallback className="text-2xl bg-[#c9a94e]/10 text-[#c9a94e]">
              {(profile.name ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-white/90">{profile.name ?? "User"}</h3>
          {memberSince && (
            <p className="text-sm text-white/40">Member since {memberSince}</p>
          )}
        </div>
      </div>
      <SectionHeader className="mb-4">Profile</SectionHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-white/60">Display Name</Label>
          <Input
            id="displayName"
            placeholder={profile.name ?? "Enter a display name"}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            className="bg-white/5 border-white/10"
          />
          <p className="text-xs text-white/40">
            This overrides your Google name across the app. Leave blank to use your Google name.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white/60">Bio</Label>
          <div className="relative">
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="bg-white/5 border-white/10 pr-14"
            />
            <div className="absolute right-2 bottom-2">
              <MicrophoneButton onTranscript={bioVoice.handleTranscript} onListeningChange={bioVoice.handleListeningChange} />
            </div>
          </div>
          <p className="text-xs text-white/40 text-right">
            {bio.length}/500
          </p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </GlassPanel>
  );
}
