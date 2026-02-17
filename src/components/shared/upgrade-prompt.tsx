"use client";

import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_UPGRADE_MESSAGES } from "@/components/guide/lyra-constants";

type LimitType = "credits" | "readings" | "spreads";

const PRO_BENEFITS = [
  "50 credits per month",
  "5 readings per day",
  "All spread types",
  "Master Oracle AI model",
];

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: LimitType;
}

export function UpgradePrompt({ open, onOpenChange, limitType }: UpgradePromptProps) {
  const message = LYRA_UPGRADE_MESSAGES[limitType];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LyraSigil size="sm" state="attentive" />
            {message.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {message.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-semibold">Pro Benefits</p>
          <ul className="space-y-1.5 text-sm">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/settings/billing">
              Upgrade to Pro — $4.99/mo
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
