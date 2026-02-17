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
import { ScrollArea } from "@/components/ui/scroll-area";

type DeckDetail = {
  deck: {
    id: string;
    title: string;
    description: string | null;
    theme: string | null;
    status: string;
    cardCount: number;
    isPublic: boolean;
    coverImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    userEmail: string | null;
    userName: string | null;
  };
  cards: Array<{
    id: string;
    cardNumber: number;
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt: string | null;
    imageStatus: string;
    imageUrl: string | null;
  }>;
  metadata: {
    extractedAnchors: unknown;
    conversationSummary: string | null;
    generationPrompt: string | null;
    draftCards: unknown;
    isReady: boolean;
  } | null;
  conversations: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  logs: Array<{
    id: string;
    operationType: string;
    modelUsed: string | null;
    durationMs: number | null;
    status: string;
    createdAt: string;
    systemPrompt: string | null;
    userPrompt: string | null;
    rawResponse: string | null;
  }>;
};

export default function AdminDeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const [data, setData] = useState<DeckDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/decks/${deckId}`)
      .then((r) => r.json())
      .then(setData);
  }, [deckId]);

  if (!data) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const { deck, cards, metadata, conversations, logs } = data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{deck.title}</h1>
        <p className="text-sm text-muted-foreground">
          {deck.userEmail} &middot; {new Date(deck.createdAt).toLocaleDateString()} &middot;{" "}
          <Badge variant="outline" className="text-xs">
            {deck.status}
          </Badge>
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cards">Cards ({cards.length})</TabsTrigger>
          <TabsTrigger value="conversation">Conversation ({conversations.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Deck Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Description:</span> {deck.description ?? "—"}</p>
                <p><span className="text-muted-foreground">Theme:</span> {deck.theme ?? "—"}</p>
                <p><span className="text-muted-foreground">Card Count:</span> {deck.cardCount}</p>
                <p><span className="text-muted-foreground">Public:</span> {deck.isPublic ? "Yes" : "No"}</p>
              </CardContent>
            </Card>
            {metadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><span className="text-muted-foreground">Ready:</span> {metadata.isReady ? "Yes" : "No"}</p>
                  <p><span className="text-muted-foreground">Anchors:</span> {Array.isArray(metadata.extractedAnchors) ? (metadata.extractedAnchors as unknown[]).length : 0}</p>
                  {metadata.conversationSummary && (
                    <div>
                      <p className="text-muted-foreground">Conversation Summary:</p>
                      <p className="text-xs mt-1">{metadata.conversationSummary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          {metadata?.generationPrompt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generation Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono max-h-[300px] overflow-auto">
                  {metadata.generationPrompt}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cards">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Guidance</TableHead>
                  <TableHead>Image Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>{card.cardNumber}</TableCell>
                    <TableCell className="font-medium">{card.title}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{card.meaning}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{card.guidance}</TableCell>
                    <TableCell>
                      <Badge
                        variant={card.imageStatus === "completed" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {card.imageStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="conversation">
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="space-y-3">
              {conversations.length === 0 && (
                <p className="text-muted-foreground text-sm">No conversation messages (simple mode deck)</p>
              )}
              {conversations.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary/10 ml-8"
                      : msg.role === "assistant"
                        ? "bg-muted mr-8"
                        : "bg-yellow-500/10 text-center text-xs"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {msg.role} &middot; {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
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
                      No logs for this deck
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
