"use client";

import { useEffect, useState } from "react";
import { Shield, Search, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
  _count: {
    recipes: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ADMIN_USERS_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let adminUsersCache: {
  key: string;
  users: User[];
  pagination: Pagination | null;
  timestamp: number;
} | null = null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const usersData = data.users || [];
      const paginationData = data.pagination || null;
      setUsers(usersData);
      setPagination(paginationData);
      adminUsersCache = {
        key: `${page}-${search}-${roleFilter}`,
        users: usersData,
        pagination: paginationData,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheKey = `${page}-${search}-${roleFilter}`;
    const cached =
      adminUsersCache &&
      adminUsersCache.key === cacheKey &&
      Date.now() - adminUsersCache.timestamp < ADMIN_USERS_CACHE_DURATION_MS;
    if (cached && adminUsersCache) {
      setUsers(adminUsersCache.users);
      setPagination(adminUsersCache.pagination);
      setLoading(false);
    } else {
      fetchUsers();
    }
  }, [page, search, roleFilter]);

  const updateUserRole = async (userId: string, newRole: "USER" | "SUPER_ADMIN") => {
    try {
      setUpdating(userId);
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to update user role");
        return;
      }

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <Card className="mb-6 border-0 px-0 py-4 shadow-none">
        <CardHeader className="px-0 pb-2 pt-0">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full pl-10"
                />
              </div>
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">Users</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 mb-6">
            {users.map((user) => (
              <Card key={user.id} className="py-4">
                <CardContent className="p-4">
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <div className="shrink-0">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="rounded-lg text-lg">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-semibold text-foreground">
                            {user.name || "No name"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              user.role === "SUPER_ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role === "SUPER_ADMIN" ? "Super Admin" : "User"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap mt-2">
                        <span className="text-xs text-muted-foreground">
                          {user._count.recipes} recipes
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Button
                          variant={
                            user.role === "SUPER_ADMIN" ? "outline" : "default"
                          }
                          size="sm"
                          onClick={() =>
                            updateUserRole(
                              user.id,
                              user.role === "SUPER_ADMIN" ? "USER" : "SUPER_ADMIN"
                            )
                          }
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : user.role === "SUPER_ADMIN" ? (
                            "Remove Admin"
                          ) : (
                            "Make Admin"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
