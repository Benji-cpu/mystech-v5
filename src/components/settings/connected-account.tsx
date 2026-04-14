import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";

interface ConnectedAccountProps {
  email: string | null;
  image: string | null;
  name: string | null;
}

export function ConnectedAccount({ email, image, name }: ConnectedAccountProps) {
  return (
    <GlassPanel className="p-4">
      <SectionHeader className="mb-1">Connected Account</SectionHeader>
      <p className="text-sm text-white/40 mb-4">Your linked Google account</p>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
          <AvatarFallback className="bg-gold/10 text-gold">
            {(name ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate text-white/90">{name ?? "Google User"}</p>
          <p className="text-sm text-white/40 truncate">{email ?? "No email"}</p>
        </div>
        <span className="border border-green-500/30 bg-green-500/10 text-green-400 rounded-full px-2 py-0.5 text-xs">
          Connected
        </span>
      </div>
    </GlassPanel>
  );
}
