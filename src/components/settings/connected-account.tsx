import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectedAccountProps {
  email: string | null;
  image: string | null;
  name: string | null;
}

export function ConnectedAccount({ email, image, name }: ConnectedAccountProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Account</CardTitle>
        <CardDescription>Your linked Google account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback>
              {(name ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{name ?? "Google User"}</p>
            <p className="text-sm text-muted-foreground truncate">{email ?? "No email"}</p>
          </div>
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            Connected
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
