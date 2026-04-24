"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailSignInFormProps {
  callbackUrl?: string;
}

export function EmailSignInForm({ callbackUrl = "/home" }: EmailSignInFormProps = {}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        toast.error("Couldn't send the link. Check the address and try again.");
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-white/80">
        <p className="mb-1 font-medium text-primary">Check your inbox ✦</p>
        <p className="text-white/60">
          We sent a sign-in link to <span className="text-white/90">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <label className="block text-xs uppercase tracking-wider text-white/50">
        Or sign in with email
      </label>
      <Input
        type="email"
        placeholder="you@wherever.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <Button type="submit" variant="outline" className="w-full" disabled={loading || !email}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" /> Email me a sign-in link
          </>
        )}
      </Button>
    </form>
  );
}
