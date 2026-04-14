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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

type DeckRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  cardCount: number;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  artStyleName: string | null;
};

export default function AdminDecksPage() {
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);

    fetch(`/api/admin/decks?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setDecks(data.items);
        setTotal(data.total);
      });
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "generating": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-display">Decks</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <Input
          placeholder="Search by title or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="secondary" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cards</TableHead>
              <TableHead>Art Style</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {decks.map((deck) => (
              <TableRow key={deck.id}>
                <TableCell>
                  <Link
                    href={`/admin/decks/${deck.id}`}
                    className="font-medium hover:underline"
                  >
                    {deck.title}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{deck.userEmail ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(deck.status)} className="text-xs">
                    {deck.status}
                  </Badge>
                </TableCell>
                <TableCell>{deck.cardCount}</TableCell>
                <TableCell className="text-xs">{deck.artStyleName ?? "—"}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(deck.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {decks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No decks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} total decks</p>
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
