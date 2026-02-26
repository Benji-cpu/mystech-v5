import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LYRA_DASHBOARD } from "@/components/guide/lyra-constants";

const actions = [
  {
    icon: Plus,
    title: "Create New Deck",
    description: LYRA_DASHBOARD.quickActions.createDeck,
    href: "/decks/new",
  },
  {
    icon: BookOpen,
    title: "Start a Reading",
    description: LYRA_DASHBOARD.quickActions.startReading,
    href: "/readings/new",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <GlassPanel className="flex items-center gap-4 p-4 hover:border-[#c9a94e]/30 transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a94e]/10">
              <action.icon className="h-5 w-5 text-[#c9a94e]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white/90">{action.title}</p>
              <p className="text-sm text-white/40">
                {action.description}
              </p>
            </div>
          </GlassPanel>
        </Link>
      ))}
    </div>
  );
}
