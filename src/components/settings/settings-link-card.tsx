import Link from "next/link";
import { Settings, ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

export function SettingsLinkCard() {
  return (
    <Link href="/settings">
      <GlassPanel className="p-4 hover:bg-white/[0.07] transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="h-4 w-4 text-white/50" />
            <span className="text-sm font-medium text-white/80">
              Account & Settings
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>
      </GlassPanel>
    </Link>
  );
}
