"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

type ReadingRow = {
  id: string;
  spreadType: string;
  question: string | null;
  interpretation: string | null;
  createdAt: string;
  userEmail: string | null;
  deckTitle: string | null;
  deckId: string;
};

export default function AdminReadingsPage() {
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [spreadType, setSpreadType] = useState("all");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);
    if (spreadType !== "all") params.set("spreadType", spreadType);

    fetch(`/api/admin/readings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setReadings(data.items);
        setTotal(data.total);
      });
  }, [page, search, spreadType]);

  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-display">Readings</h1>

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Search by email or deck..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Select value={spreadType} onValueChange={(v) => { setSpreadType(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Spread type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All spreads</SelectItem>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="three_card">Three Card</SelectItem>
            <SelectItem value="five_card">Five Card</SelectItem>
            <SelectItem value="celtic_cross">Celtic Cross</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Deck</TableHead>
              <TableHead>Spread</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Interpreted</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs">{r.userEmail ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.deckTitle ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {r.spreadType.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">
                  {r.question ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={r.interpretation ? "default" : "outline"} className="text-xs">
                    {r.interpretation ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  <Link href={`/admin/readings/${r.id}`} className="hover:underline">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {readings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No readings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} total readings</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {page} of {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
