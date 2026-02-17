"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Layers,
  BookOpen,
  ScrollText,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalDecks: number;
  totalCards: number;
  totalReadings: number;
  totalAICalls: number;
  errors24h: number;
  recentLogs: Array<{
    id: string;
    operationType: string;
    status: string;
    durationMs: number | null;
    createdAt: string;
    userEmail: string | null;
  }>;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, href: "/admin/users" },
    { label: "Total Decks", value: stats?.totalDecks, icon: Layers, href: "/admin/decks" },
    { label: "Total Readings", value: stats?.totalReadings, icon: BookOpen, href: "/admin/readings" },
    { label: "Cards Generated", value: stats?.totalCards, icon: Sparkles },
    { label: "Total AI Calls", value: stats?.totalAICalls, icon: ScrollText, href: "/admin/logs" },
    { label: "Errors (24h)", value: stats?.errors24h, icon: AlertCircle, danger: (stats?.errors24h ?? 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const card = (
            <Card
              key={stat.label}
              className={`hover:border-primary/30 transition-colors ${
                stat.danger ? "border-destructive/50" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon
                  className={`h-4 w-4 ${
                    stat.danger ? "text-destructive" : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value !== undefined ? stat.value.toLocaleString() : "—"}
                </div>
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/admin/logs" className="text-sm text-primary hover:underline">
            View all logs
          </Link>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.operationType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{log.userEmail ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "success" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!stats || stats.recentLogs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {stats ? "No recent activity" : "Loading..."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
