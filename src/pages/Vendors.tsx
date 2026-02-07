import { useState } from "react";
import { Plus, Search, Store, Eye, MoreHorizontal, TrendingUp, DollarSign, Scissors, Star } from "lucide-react";
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

interface Vendor {
  id: string;
  name: string;
  city: string;
  beauticians: number;
  revenue: number;
  pendingSettlement: number;
  rating: number;
  status: "active" | "pending" | "suspended";
}

const vendorsData: Vendor[] = [
  { id: "1", name: "Glamour Studios", city: "Mumbai", beauticians: 24, revenue: 458000, pendingSettlement: 45000, rating: 4.8, status: "active" },
  { id: "2", name: "Beauty Hub", city: "Delhi", beauticians: 18, revenue: 387000, pendingSettlement: 32000, rating: 4.6, status: "active" },
  { id: "3", name: "Style Manor", city: "Bangalore", beauticians: 15, revenue: 324000, pendingSettlement: 28000, rating: 4.7, status: "active" },
  { id: "4", name: "Luxe Beauty", city: "Chennai", beauticians: 12, revenue: 256000, pendingSettlement: 0, rating: 4.5, status: "active" },
  { id: "5", name: "Elite Salon", city: "Hyderabad", beauticians: 14, revenue: 298000, pendingSettlement: 15000, rating: 4.9, status: "active" },
  { id: "6", name: "Glow Point", city: "Pune", beauticians: 10, revenue: 215000, pendingSettlement: 22000, rating: 4.4, status: "pending" },
  { id: "7", name: "Beauty Express", city: "Ahmedabad", beauticians: 8, revenue: 178000, pendingSettlement: 0, rating: 4.3, status: "active" },
  { id: "8", name: "Sparkle Salon", city: "Kolkata", beauticians: 9, revenue: 198000, pendingSettlement: 8000, rating: 4.1, status: "suspended" },
];

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [vendors] = useState<Vendor[]>(vendorsData);

  const cities = [...new Set(vendors.map((v) => v.city))];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || vendor.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Vendor Management</h1>
            <p className="page-description">Manage vendor performance, payments, and settlements</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Vendors</p>
                <p className="text-2xl font-bold text-foreground">{vendors.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{(vendors.reduce((sum, v) => sum + v.revenue, 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="stat-card-label">Pending Settlements</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{(vendors.reduce((sum, v) => sum + v.pendingSettlement, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vendors Table */}
        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Vendor
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  City
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Beauticians
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Revenue
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Pending
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Rating
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm">
                        {vendor.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{vendor.city}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{vendor.beauticians}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">
                      ₹{(vendor.revenue / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        vendor.pendingSettlement > 0 ? "text-warning" : "text-muted-foreground"
                      )}
                    >
                      {vendor.pendingSettlement > 0
                        ? `₹${(vendor.pendingSettlement / 1000).toFixed(0)}K`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{vendor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "status-badge",
                        vendor.status === "active" && "online",
                        vendor.status === "pending" && "busy",
                        vendor.status === "suspended" && "alert"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          vendor.status === "active" && "bg-success",
                          vendor.status === "pending" && "bg-warning",
                          vendor.status === "suspended" && "bg-destructive"
                        )}
                      />
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Process Settlement
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Vendors;
