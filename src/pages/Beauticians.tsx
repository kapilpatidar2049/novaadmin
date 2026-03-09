import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Scissors, Eye, MoreHorizontal, MapPin, Phone, Star } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { adminApi, type ApiBeautician, type ApiCity, type ApiVendor } from "@/lib/api";

const Beauticians = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beauticians, setBeauticians] = useState<ApiBeautician[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCityId, setNewCityId] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBeauticians = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getBeauticians(1, 100, searchQuery, cityFilter === "all" ? "" : cityFilter);
    if (res.success && res.data?.items) setBeauticians(res.data.items);
    setLoading(false);
  }, [searchQuery, cityFilter]);

  useEffect(() => {
    fetchBeauticians();
  }, [fetchBeauticians]);

  useEffect(() => {
    adminApi.getCities(1, 100).then((res) => {
      if (res.success && res.data?.items) setCities(res.data.items);
    });
    adminApi.getVendors(1, 100).then((res) => {
      if (res.success && res.data?.items) setVendors(res.data.items);
    });
  }, []);

  const cityOptions = cities.map((c) => ({ value: c._id, label: c.name }));
  const filteredBeauticians = beauticians.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesStatus;
  });

  const onlineCount = beauticians.filter((b) => b.status === "online").length;
  const busyCount = beauticians.filter((b) => b.status === "busy").length;
  const avgRating = beauticians.length ? (beauticians.reduce((sum, b) => sum + b.rating, 0) / beauticians.length).toFixed(1) : "0";

  const handleAddBeautician = async () => {
    if (!newName.trim() || !newEmail.trim() || !newVendorId) return;
    setSaving(true);
    try {
      const res = await adminApi.createBeautician({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword || undefined,
        phone: newPhone.trim() || undefined,
        vendorId: newVendorId,
        cityId: newCityId || undefined,
      });
      if (res.success && res.data) {
        setBeauticians((prev) => [res.data!, ...prev]);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewPhone("");
        setNewCityId("");
        setNewVendorId("");
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Beautician Management</h1>
            <p className="page-description">Track and manage all beauticians across cities</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Beautician
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Beautician</DialogTitle>
                <DialogDescription>Add a new beautician. They will appear as offline until they sign in.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="beauticianName">Name</Label>
                  <Input id="beauticianName" placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="beauticianEmail">Email</Label>
                  <Input id="beauticianEmail" type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="beauticianPassword">Password (optional)</Label>
                  <Input id="beauticianPassword" type="password" placeholder="Leave blank for default" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="beauticianPhone">Phone</Label>
                  <Input id="beauticianPhone" placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Vendor / Salon</Label>
                  <Select value={newVendorId} onValueChange={setNewVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v._id} value={v._id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Select value={newCityId} onValueChange={setNewCityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBeautician} disabled={saving}>
                  {saving ? "Adding..." : "Add Beautician"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              </div>
            </div>
          </div>
        </div>

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
              {cityOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
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

        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Beautician</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Location</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Vendor</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Services</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Today</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Rating</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : (
                filteredBeauticians.map((beautician) => (
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
                        {beautician.status === "online" ? "Online" : beautician.status === "busy" ? "In Service" : "Offline"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Beauticians;
