import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Scissors, Eye, MoreHorizontal, DollarSign, Briefcase } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";
import { adminApi, type ApiUser } from "@/lib/api";

const Users = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getUsers(
      page,
      pageSize,
      searchQuery,
      roleFilter === "all" ? "" : roleFilter
    );
    if (res.success && res.data?.items) {
      setUsers(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [searchQuery, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesRole;
  });

  const customerCount = users.filter((u) => u.role === "customer").length;
  const beauticianCount = users.filter((u) => u.role === "beautician").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Users & Beauticians</h1>
          <p className="page-description">
            View all customers and beauticians with detailed stats
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Customers</p>
                <p className="text-2xl font-bold text-foreground">{customerCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Scissors className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Beauticians</p>
                <p className="text-2xl font-bold text-foreground">{beauticianCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="beautician">Beauticians</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={[
            {
              key: "user",
              header: "User",
              render: (user) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-accent-foreground font-medium text-sm">
                    {user.name.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (user) => (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    user.role === "beautician"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {user.role === "beautician" ? "Beautician" : "Customer"}
                </span>
              ),
            },
            {
              key: "city",
              header: "City",
              render: (user) => <span className="text-sm text-foreground">{user.city || "—"}</span>,
            },
            {
              key: "counts",
              header: "Bookings / Jobs",
              render: (user) => (
                <span className="text-sm font-medium text-foreground">
                  {user.role === "beautician"
                    ? (user.totalJobs ?? "—")
                    : (user.totalBookings ?? 0)}
                </span>
              ),
            },
            {
              key: "money",
              header: "Spent / Earnings",
              render: (user) => (
                <span className="text-sm font-medium text-foreground">
                  {user.role === "beautician"
                    ? user.walletBalance != null
                      ? `₹${user.walletBalance.toLocaleString()}`
                      : "—"
                    : user.totalSpent != null
                      ? `₹${user.totalSpent.toLocaleString()}`
                      : "—"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (user) => (
                <span
                  className={cn(
                    "status-badge",
                    user.isActive !== false ? "online" : "offline"
                  )}
                >
                  {user.isActive !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              className: "text-right",
              render: (user) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          items={filteredUsers}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
};

export default Users;
