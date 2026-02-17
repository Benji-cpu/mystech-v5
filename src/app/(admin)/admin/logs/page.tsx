"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

type LogEntry = {
  id: string;
  userId: string | null;
  deckId: string | null;
  readingId: string | null;
  operationType: string;
  modelUsed: string | null;
  systemPrompt: string | null;
  userPrompt: string | null;
  rawResponse: string | null;
  tokenUsage: unknown;
  durationMs: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  userEmail: string | null;
};

const OPERATION_TYPES = [
  "deck_generation",
  "conversation",
  "card_edit",
  "card_replace",
  "anchor_extraction",
  "image_generation",
  "reading_interpretation",
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [operationType, setOperationType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (operationType !== "all") params.set("operationType", operationType);
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/logs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.items);
        setTotal(data.total);
      });
  }, [page, operationType, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Generation Logs</h1>

      <div className="flex gap-3">
        <Select value={operationType} onValueChange={(v) => { setOperationType(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Operation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All operations</SelectItem>
            {OPERATION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
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
                <TableCell className="text-xs">{log.modelUsed ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <LogDetailDialog log={log} />
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LogDetailDialog({ log }: { log: LogEntry }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {log.operationType.replace(/_/g, " ")} — {new Date(log.createdAt).toLocaleString()}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">User</p>
                <p>{log.userEmail ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Model</p>
                <p>{log.modelUsed ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Duration</p>
                <p>{log.durationMs ? `${(log.durationMs / 1000).toFixed(2)}s` : "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <Badge variant={log.status === "success" ? "default" : "destructive"}>
                  {log.status}
                </Badge>
              </div>
              {log.deckId && (
                <div>
                  <p className="font-medium text-muted-foreground">Deck ID</p>
                  <p className="font-mono text-xs">{log.deckId}</p>
                </div>
              )}
              {log.readingId && (
                <div>
                  <p className="font-medium text-muted-foreground">Reading ID</p>
                  <p className="font-mono text-xs">{log.readingId}</p>
                </div>
              )}
            </div>

            {log.errorMessage && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">Error</p>
                <pre className="bg-destructive/10 text-destructive rounded p-3 text-xs whitespace-pre-wrap">
                  {log.errorMessage}
                </pre>
              </div>
            )}

            {log.systemPrompt && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">System Prompt</p>
                <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono">
                  {log.systemPrompt}
                </pre>
              </div>
            )}

            {log.userPrompt && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">User Prompt</p>
                <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono">
                  {log.userPrompt}
                </pre>
              </div>
            )}

            {log.rawResponse && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">Raw Response</p>
                <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono">
                  {log.rawResponse}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
