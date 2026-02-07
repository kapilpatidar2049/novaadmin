import { useState } from "react";
import { Plus, Search, MapPin, Edit, Trash2, MoreHorizontal, Users, Store, DollarSign } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface City {
  id: string;
  name: string;
  state: string;
  vendors: number;
  beauticians: number;
  revenue: number;
  status: "active" | "inactive";
}

const citiesData: City[] = [
  { id: "1", name: "Mumbai", state: "Maharashtra", vendors: 24, beauticians: 186, revenue: 458000, status: "active" },
  { id: "2", name: "Delhi", state: "Delhi NCR", vendors: 18, beauticians: 142, revenue: 387000, status: "active" },
  { id: "3", name: "Bangalore", state: "Karnataka", vendors: 15, beauticians: 128, revenue: 324000, status: "active" },
  { id: "4", name: "Chennai", state: "Tamil Nadu", vendors: 12, beauticians: 98, revenue: 256000, status: "active" },
  { id: "5", name: "Hyderabad", state: "Telangana", vendors: 14, beauticians: 112, revenue: 298000, status: "active" },
  { id: "6", name: "Pune", state: "Maharashtra", vendors: 10, beauticians: 86, revenue: 215000, status: "active" },
  { id: "7", name: "Ahmedabad", state: "Gujarat", vendors: 8, beauticians: 64, revenue: 178000, status: "active" },
  { id: "8", name: "Kolkata", state: "West Bengal", vendors: 9, beauticians: 72, revenue: 198000, status: "inactive" },
];

const Cities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cities] = useState<City[]>(citiesData);

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">City Management</h1>
            <p className="page-description">Manage operational cities and their vendor assignments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New City</DialogTitle>
                <DialogDescription>Add a new city to expand your service coverage</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cityName">City Name</Label>
                  <Input id="cityName" placeholder="Enter city name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Enter state name" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Add City</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Cities</p>
                <p className="text-2xl font-bold text-foreground">{cities.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Store className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Total Vendors</p>
                <p className="text-2xl font-bold text-foreground">
                  {cities.reduce((sum, city) => sum + city.vendors, 0)}
                </p>
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
                  ₹{(cities.reduce((sum, city) => sum + city.revenue, 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Cities Table */}
        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  City
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Vendors
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Beauticians
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Revenue
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
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{city.name}</p>
                        <p className="text-sm text-muted-foreground">{city.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{city.vendors}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{city.beauticians}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">
                      ₹{(city.revenue / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "status-badge",
                        city.status === "active" ? "online" : "offline"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          city.status === "active" ? "bg-success" : "bg-muted-foreground"
                        )}
                      />
                      {city.status === "active" ? "Active" : "Inactive"}
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
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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

export default Cities;
