"use client";

import { useEffect, useState, useCallback } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type FeedbackRow = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  email: string | null;
  message: string;
  pageUrl: string;
  screenshotUrl: string | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  userAgent: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reviewed: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  actioned: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  // Legacy rows that still carry the old "resolved" label render with the same colour.
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dismissed: "bg-white/10 text-white/40 border-white/10",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<FeedbackRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const pageSize = 20;

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (statusFilter !== "all") params.set("status", statusFilter);

    const res = await fetch(`/api/admin/feedback?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Marked as ${status}`);
      fetchItems();
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => prev ? { ...prev, status } : null);
      }
    }
  }

  async function saveNotes(id: string) {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes }),
    });
    if (res.ok) {
      toast.success("Notes saved");
      fetchItems();
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm("Delete this feedback?")) return;
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      setSelectedItem(null);
      fetchItems();
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="actioned">Actioned</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead className="w-[140px]">Page</TableHead>
              <TableHead className="w-[120px]">User</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[130px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-white/[0.02]"
                onClick={() => { setSelectedItem(item); setAdminNotes(item.adminNotes ?? ""); }}
              >
                <TableCell className="max-w-[300px] truncate text-sm">
                  {item.message}
                </TableCell>
                <TableCell className="text-xs text-white/40 truncate max-w-[140px]">
                  {item.pageUrl}
                </TableCell>
                <TableCell className="text-sm text-white/60">
                  {item.userName ?? item.email ?? item.userEmail ?? "Anonymous"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[item.status]}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.screenshotUrl && <ImageIcon className="w-4 h-4 text-white/30" />}
                </TableCell>
                <TableCell className="text-xs text-white/40">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/40 py-8">
                  No feedback yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-white/60">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription className="sr-only">
              Feedback detail view
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Message */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-sm whitespace-pre-wrap">{selectedItem.message}</p>
              </div>

              {/* Screenshot */}
              {selectedItem.screenshotUrl && (
                <div>
                  <p className="text-xs text-white/40 mb-1.5">Screenshot</p>
                  <a href={selectedItem.screenshotUrl} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedItem.screenshotUrl}
                      alt="Feedback screenshot"
                      className="rounded-lg border border-white/[0.06] max-h-48 w-full object-cover object-top hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                <div>
                  <span className="text-white/60">Page: </span>
                  {selectedItem.pageUrl}
                </div>
                <div>
                  <span className="text-white/60">User: </span>
                  {selectedItem.userName ?? selectedItem.email ?? selectedItem.userEmail ?? "Anonymous"}
                </div>
                {selectedItem.viewportWidth && (
                  <div>
                    <span className="text-white/60">Viewport: </span>
                    {selectedItem.viewportWidth}x{selectedItem.viewportHeight}
                  </div>
                )}
                <div>
                  <span className="text-white/60">Date: </span>
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Status actions */}
              <div className="flex flex-wrap gap-2">
                {selectedItem.status !== "reviewed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedItem.id, "reviewed")}>
                    Mark Reviewed
                  </Button>
                )}
                {selectedItem.status !== "actioned" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedItem.id, "actioned")}>
                    Mark Actioned
                  </Button>
                )}
                {selectedItem.status !== "dismissed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedItem.id, "dismissed")}>
                    Dismiss
                  </Button>
                )}
                {selectedItem.status !== "new" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedItem.id, "new")}>
                    Reopen
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteFeedback(selectedItem.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Admin notes */}
              <div>
                <p className="text-xs text-white/40 mb-1.5">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="min-h-[60px] resize-none text-sm bg-white/[0.03] border-white/[0.06]"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => saveNotes(selectedItem.id)}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
