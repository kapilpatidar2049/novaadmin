import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { adminApi, type ApiBeautician, type ApiCity, type ApiVendor, type LiveBeautician } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";
import { LiveMap } from "@/components/dashboard/LiveMap";

const Beauticians = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beauticians, setBeauticians] = useState<ApiBeautician[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackBeauticians, setTrackBeauticians] = useState<LiveBeautician[]>([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCityId, setNewCityId] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const fetchBeauticians = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getBeauticians(page, pageSize, searchQuery, cityFilter === "all" ? "" : cityFilter);
    if (res.success && res.data?.items) {
      setBeauticians(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [searchQuery, cityFilter, page]);

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

  const handleTrackLocation = async (beauticianId: string) => {
    setTrackLoading(true);
    setTrackBeauticians([]);
    try {
      const res = await adminApi.getDashboard();
      if (res.success && res.data?.liveBeauticians) {
        const match = res.data.liveBeauticians.find((b) => b.id === beauticianId);
        if (match) {
          setTrackBeauticians([match]);
        }
      }
    } finally {
      setTrackLoading(false);
      setTrackOpen(true);
    }
  };

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

        <DataTable<ApiBeautician>
          columns={[
            {
              key: "beautician",
              header: "Beautician",
              render: (b) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-accent-foreground font-medium text-sm">
                    {b.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {b.phone}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "location",
              header: "Location",
              render: (b) => (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{b.city}</span>
                </div>
              ),
            },
            {
              key: "vendor",
              header: "Vendor",
              render: (b) => <span className="text-sm text-muted-foreground">{b.vendor}</span>,
            },
            {
              key: "services",
              header: "Services",
              render: (b) => (
                <span className="text-sm font-medium text-foreground">{b.services}</span>
              ),
            },
            {
              key: "today",
              header: "Today",
              render: (b) => (
                <span className="text-sm text-foreground">{b.completedToday}</span>
              ),
            },
            {
              key: "rating",
              header: "Rating",
              render: (b) => (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-medium text-foreground">{b.rating}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (b) => (
                <span
                  className={cn(
                    "status-badge",
                    b.status === "online" && "online",
                    b.status === "busy" && "busy",
                    b.status === "offline" && "offline"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      b.status === "online" && "bg-success",
                      b.status === "busy" && "bg-warning",
                      b.status === "offline" && "bg-muted-foreground"
                    )}
                  />
                  {b.status === "online" ? "Online" : b.status === "busy" ? "In Service" : "Offline"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              className: "text-right",
              render: (b) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/beauticians/${b.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View full profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTrackLocation(b.id)}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Track Location
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          items={filteredBeauticians}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No beauticians found."
        />

        {/* Track Location dialog */}
        <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Track Beautician Location</DialogTitle>
              <DialogDescription>Live location is available only when beautician is sharing their location.</DialogDescription>
            </DialogHeader>
            {trackLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading live location...</div>
            ) : trackBeauticians.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent location data for this beautician. They need to have an active appointment with location sharing enabled.
              </div>
            ) : (
              <LiveMap beauticians={trackBeauticians} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Beauticians;
