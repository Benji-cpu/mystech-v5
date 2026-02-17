"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReadingDetail = {
  reading: {
    id: string;
    userId: string;
    deckId: string;
    spreadType: string;
    question: string | null;
    interpretation: string | null;
    shareToken: string | null;
    createdAt: string;
    userEmail: string | null;
    userName: string | null;
    deckTitle: string | null;
  };
  cards: Array<{
    id: string;
    position: number;
    positionName: string;
    cardId: string | null;
    cardTitle: string | null;
    cardMeaning: string | null;
    cardGuidance: string | null;
    cardImagePrompt: string | null;
    cardImageUrl: string | null;
  }>;
  logs: Array<{
    id: string;
    operationType: string;
    modelUsed: string | null;
    durationMs: number | null;
    status: string;
    createdAt: string;
  }>;
};

export default function AdminReadingDetailPage() {
  const { readingId } = useParams<{ readingId: string }>();
  const [data, setData] = useState<ReadingDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/readings/${readingId}`)
      .then((r) => r.json())
      .then(setData);
  }, [readingId]);

  if (!data) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const { reading, cards, logs } = data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {reading.spreadType.replace(/_/g, " ")} Reading
        </h1>
        <p className="text-sm text-muted-foreground">
          {reading.userEmail} &middot; {reading.deckTitle} &middot;{" "}
          {new Date(reading.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cards">Cards Drawn ({cards.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reading Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><span className="text-muted-foreground">User:</span> {reading.userEmail}</p>
                <p><span className="text-muted-foreground">Deck:</span> {reading.deckTitle}</p>
                <p>
                  <span className="text-muted-foreground">Spread:</span>{" "}
                  <Badge variant="outline" className="text-xs">{reading.spreadType.replace(/_/g, " ")}</Badge>
                </p>
                <p><span className="text-muted-foreground">Question:</span> {reading.question ?? "None"}</p>
                <p><span className="text-muted-foreground">Share Token:</span> {reading.shareToken ?? "Not shared"}</p>
              </CardContent>
            </Card>
          </div>
          {reading.interpretation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {reading.interpretation}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cards">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Card Title</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Guidance</TableHead>
                  <TableHead>Image Prompt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{c.positionName}</span>
                        <span className="text-xs text-muted-foreground ml-1">({c.position})</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{c.cardTitle ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px]">{c.cardMeaning ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px]">{c.cardGuidance ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{c.cardImagePrompt ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.operationType.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{log.modelUsed ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No logs for this reading
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
