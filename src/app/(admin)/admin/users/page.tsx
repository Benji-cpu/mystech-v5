"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  deckCount: number;
  readingCount: number;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleChange, setRoleChange] = useState<{
    userId: string;
    name: string;
    oldRole: string;
    newRole: string;
  } | null>(null);
  const pageSize = 20;

  function fetchUsers() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.items);
        setTotal(data.total);
      });
  }

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function confirmRoleChange() {
    if (!roleChange) return;
    const res = await fetch(`/api/admin/users/${roleChange.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleChange.newRole }),
    });
    if (res.ok) {
      toast.success(`Role changed to ${roleChange.newRole}`);
      fetchUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to change role");
    }
    setRoleChange(null);
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default" as const;
      case "tester": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-display">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <Input
          placeholder="Search by name or email..."
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Decks</TableHead>
              <TableHead>Readings</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {u.image ? (
                        <Image
                          src={u.image}
                          alt={u.name ?? ""}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="text-[10px]">
                          {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">{u.name ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell>
                  {isAdmin && u.id !== session?.user?.id ? (
                    <Select
                      value={u.role}
                      onValueChange={(newRole) => {
                        if (newRole !== u.role) {
                          setRoleChange({
                            userId: u.id,
                            name: u.name ?? u.email ?? "this user",
                            oldRole: u.role,
                            newRole,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="tester">tester</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={roleBadgeVariant(u.role)} className="text-xs">
                      {u.role}
                      {u.id === session?.user?.id && " (you)"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{u.deckCount}</TableCell>
                <TableCell>{u.readingCount}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isAdmin && (
        <p className="text-xs text-muted-foreground">
          Role changes take effect on the user&apos;s next sign-in.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} total users</p>
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

      <AlertDialog open={!!roleChange} onOpenChange={() => setRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change {roleChange?.name}&apos;s role from <strong>{roleChange?.oldRole}</strong> to{" "}
              <strong>{roleChange?.newRole}</strong>? This takes effect on their next sign-in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
