import { useState } from "react";
import { Plus, Search, Scissors, Eye, MoreHorizontal, MapPin, Phone, Star } from "lucide-react";
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

interface Beautician {
  id: string;
  name: string;
  phone: string;
  city: string;
  vendor: string;
  services: number;
  rating: number;
  status: "online" | "busy" | "offline";
  completedToday: number;
}

const beauticiansData: Beautician[] = [
  { id: "1", name: "Priya Sharma", phone: "+91 98765 43210", city: "Mumbai", vendor: "Glamour Studios", services: 342, rating: 4.9, status: "online", completedToday: 4 },
  { id: "2", name: "Anita Patel", phone: "+91 98765 43211", city: "Delhi", vendor: "Beauty Hub", services: 298, rating: 4.8, status: "busy", completedToday: 3 },
  { id: "3", name: "Sneha Reddy", phone: "+91 98765 43212", city: "Bangalore", vendor: "Style Manor", services: 276, rating: 4.7, status: "online", completedToday: 5 },
  { id: "4", name: "Kavita Singh", phone: "+91 98765 43213", city: "Chennai", vendor: "Luxe Beauty", services: 245, rating: 4.6, status: "offline", completedToday: 0 },
  { id: "5", name: "Meera Joshi", phone: "+91 98765 43214", city: "Hyderabad", vendor: "Elite Salon", services: 312, rating: 4.9, status: "online", completedToday: 6 },
  { id: "6", name: "Deepa Nair", phone: "+91 98765 43215", city: "Pune", vendor: "Glow Point", services: 189, rating: 4.5, status: "busy", completedToday: 2 },
  { id: "7", name: "Ritu Verma", phone: "+91 98765 43216", city: "Ahmedabad", vendor: "Beauty Express", services: 167, rating: 4.4, status: "online", completedToday: 3 },
  { id: "8", name: "Sunita Das", phone: "+91 98765 43217", city: "Kolkata", vendor: "Sparkle Salon", services: 198, rating: 4.3, status: "offline", completedToday: 0 },
  { id: "9", name: "Lakshmi Iyer", phone: "+91 98765 43218", city: "Mumbai", vendor: "Glamour Studios", services: 287, rating: 4.7, status: "busy", completedToday: 4 },
  { id: "10", name: "Pooja Gupta", phone: "+91 98765 43219", city: "Delhi", vendor: "Beauty Hub", services: 234, rating: 4.6, status: "online", completedToday: 2 },
];

const Beauticians = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beauticians] = useState<Beautician[]>(beauticiansData);

  const cities = [...new Set(beauticians.map((b) => b.city))];

  const filteredBeauticians = beauticians.filter((beautician) => {
    const matchesSearch =
      beautician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beautician.phone.includes(searchQuery);
    const matchesCity = cityFilter === "all" || beautician.city === cityFilter;
    const matchesStatus = statusFilter === "all" || beautician.status === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });

  const onlineCount = beauticians.filter((b) => b.status === "online").length;
  const busyCount = beauticians.filter((b) => b.status === "busy").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Beautician Management</h1>
            <p className="page-description">Track and manage all beauticians across cities</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Beautician
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Beauticians</p>
                <p className="text-2xl font-bold text-foreground">{beauticians.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <span className="flex h-6 w-6 items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
                </span>
              </div>
              <div>
                <p className="stat-card-label">Online Now</p>
                <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <span className="flex h-6 w-6 items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                </span>
              </div>
              <div>
                <p className="stat-card-label">In Service</p>
                <p className="text-2xl font-bold text-foreground">{busyCount}</p>
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
                  {(beauticians.reduce((sum, b) => sum + b.rating, 0) / beauticians.length).toFixed(1)}
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
              placeholder="Search by name or phone..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="busy">In Service</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Beauticians Table */}
        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Beautician
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Vendor
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Services
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Today
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
              {filteredBeauticians.map((beautician) => (
                <tr key={beautician.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-accent-foreground font-medium text-sm">
                        {beautician.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{beautician.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {beautician.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{beautician.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{beautician.vendor}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{beautician.services}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{beautician.completedToday}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{beautician.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "status-badge",
                        beautician.status === "online" && "online",
                        beautician.status === "busy" && "busy",
                        beautician.status === "offline" && "offline"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          beautician.status === "online" && "bg-success",
                          beautician.status === "busy" && "bg-warning",
                          beautician.status === "offline" && "bg-muted-foreground"
                        )}
                      />
                      {beautician.status === "online"
                        ? "Online"
                        : beautician.status === "busy"
                        ? "In Service"
                        : "Offline"}
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Location
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

export default Beauticians;
