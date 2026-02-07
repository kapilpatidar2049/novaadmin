import { useState } from "react";
import { Plus, Search, Scissors, Edit, MoreHorizontal, DollarSign, Clock } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  duration: number;
  status: "active" | "inactive";
  cityPricing: { city: string; price: number }[];
}

const servicesData: Service[] = [
  { id: "1", name: "Hair Cut - Women", category: "Hair", basePrice: 500, duration: 45, status: "active", cityPricing: [{ city: "Mumbai", price: 600 }, { city: "Delhi", price: 550 }, { city: "Bangalore", price: 580 }] },
  { id: "2", name: "Hair Coloring", category: "Hair", basePrice: 2500, duration: 120, status: "active", cityPricing: [{ city: "Mumbai", price: 3000 }, { city: "Delhi", price: 2800 }, { city: "Bangalore", price: 2900 }] },
  { id: "3", name: "Bridal Makeup", category: "Makeup", basePrice: 15000, duration: 180, status: "active", cityPricing: [{ city: "Mumbai", price: 18000 }, { city: "Delhi", price: 16000 }, { city: "Bangalore", price: 17000 }] },
  { id: "4", name: "Party Makeup", category: "Makeup", basePrice: 3000, duration: 60, status: "active", cityPricing: [{ city: "Mumbai", price: 3500 }, { city: "Delhi", price: 3200 }, { city: "Bangalore", price: 3400 }] },
  { id: "5", name: "Facial - Gold", category: "Skin Care", basePrice: 1500, duration: 60, status: "active", cityPricing: [{ city: "Mumbai", price: 1800 }, { city: "Delhi", price: 1600 }, { city: "Bangalore", price: 1700 }] },
  { id: "6", name: "Manicure", category: "Nails", basePrice: 400, duration: 30, status: "active", cityPricing: [{ city: "Mumbai", price: 500 }, { city: "Delhi", price: 450 }, { city: "Bangalore", price: 480 }] },
  { id: "7", name: "Pedicure", category: "Nails", basePrice: 500, duration: 45, status: "active", cityPricing: [{ city: "Mumbai", price: 600 }, { city: "Delhi", price: 550 }, { city: "Bangalore", price: 580 }] },
  { id: "8", name: "Threading - Full Face", category: "Hair Removal", basePrice: 150, duration: 15, status: "inactive", cityPricing: [{ city: "Mumbai", price: 200 }, { city: "Delhi", price: 180 }, { city: "Bangalore", price: 170 }] },
];

const categories = ["Hair", "Makeup", "Skin Care", "Nails", "Hair Removal"];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [services] = useState<Service[]>(servicesData);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Service & Pricing Control</h1>
            <p className="page-description">Manage global services and city-wise pricing rules</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Create a new service with base pricing</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceName">Service Name</Label>
                  <Input id="serviceName" placeholder="Enter service name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Base Price (₹)</Label>
                    <Input id="price" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input id="duration" type="number" placeholder="0" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Add Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Services</p>
                <p className="text-2xl font-bold text-foreground">{services.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <span className="flex h-6 w-6 items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-success" />
                </span>
              </div>
              <div>
                <p className="stat-card-label">Active Services</p>
                <p className="text-2xl font-bold text-foreground">
                  {services.filter((s) => s.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Avg Base Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Math.round(services.reduce((sum, s) => sum + s.basePrice, 0) / services.length)}
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
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Table */}
        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Service
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Base Price
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Duration
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  City Pricing
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
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Scissors className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">₹{service.basePrice}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{service.duration} min</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {service.cityPricing.slice(0, 2).map((cp) => (
                        <span
                          key={cp.city}
                          className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                        >
                          {cp.city}: ₹{cp.price}
                        </span>
                      ))}
                      {service.cityPricing.length > 2 && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                          +{service.cityPricing.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "status-badge",
                        service.status === "active" ? "online" : "offline"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          service.status === "active" ? "bg-success" : "bg-muted-foreground"
                        )}
                      />
                      {service.status === "active" ? "Active" : "Inactive"}
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
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Manage Pricing
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

export default Services;
