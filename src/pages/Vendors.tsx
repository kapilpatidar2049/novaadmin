import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Store, Eye, MoreHorizontal } from "lucide-react";
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
import { adminApi, type ApiVendor, type ApiCity } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";
import { EmbeddedReportsSection } from "@/components/reports/EmbeddedReportsSection";

const Vendors = () => {
  const vendorPanelBaseUrl = import.meta.env.VITE_VENDOR_PANEL_URL || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCityId, setNewCityId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPanelPassword, setNewPanelPassword] = useState("");
  const [newPlatformCommissionPercent, setNewPlatformCommissionPercent] = useState("10");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPanelPassword, setEditPanelPassword] = useState("");
  const [editPlatformCommissionPercent, setEditPlatformCommissionPercent] = useState("10");
  const [editSaving, setEditSaving] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getVendors(page, pageSize, searchQuery, cityFilter === "all" ? "" : cityFilter);
    if (res.success && res.data?.items) {
      setVendors(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [cityFilter, searchQuery, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    adminApi.getCities(1, 100).then((res) => {
      if (res.success && res.data?.items) setCities(res.data.items);
    });
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const vCityId = typeof vendor.city === "object" && vendor.city ? (vendor.city as ApiCity)._id : vendor.city;
    const matchesCity = cityFilter === "all" || vCityId === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleAddVendor = async () => {
    if (!newName.trim() || !newEmail.trim() || !newCityId) return;
    setSaving(true);
    try {
      const res = await adminApi.createVendor({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        city: newCityId,
        address: newAddress.trim() || undefined,
        ...(newPanelPassword.trim().length >= 6 ? { panelPassword: newPanelPassword.trim() } : {}),
        platformCommissionPercent: Math.min(100, Math.max(0, Number(newPlatformCommissionPercent) || 0)),
      });
      if (res.success) {
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewCityId("");
        setNewAddress("");
        setNewPanelPassword("");
        setNewPlatformCommissionPercent("10");
        setDialogOpen(false);
        fetchVendors();
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
            <h1 className="page-title">Vendor Management</h1>
            <p className="page-description">Manage vendor performance, payments, and settlements</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>Register a new vendor/salon. They can then add beauticians.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="vendorName">Name</Label>
                  <Input id="vendorName" placeholder="Vendor / Salon name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorEmail">Email</Label>
                  <Input id="vendorEmail" type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorPhone">Phone</Label>
                  <Input id="vendorPhone" placeholder="+91 ..." value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Select value={newCityId} onValueChange={setNewCityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorAddress">Address (optional)</Label>
                  <Input id="vendorAddress" placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="panelPw">Admin panel password (min 6 chars)</Label>
                  <Input
                    id="panelPw"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave empty to auto-generate"
                    value={newPanelPassword}
                    onChange={(e) => setNewPanelPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Vendor uses this email + password to sign in here (vendor role).</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendorCommission">Platform commission (%)</Label>
                  <Input
                    id="vendorCommission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={newPlatformCommissionPercent}
                    onChange={(e) => setNewPlatformCommissionPercent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For this vendor&apos;s shop / vendor-side revenue (0–100).</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVendor} disabled={saving}>{saving ? "Adding..." : "Add Vendor"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {cities.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable<ApiVendor>
          columns={[
            {
              key: "vendor",
              header: "Vendor",
              render: (vendor) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {vendor.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="font-medium text-foreground">{vendor.name}</span>
                </div>
              ),
            },
            {
              key: "city",
              header: "City",
              render: (vendor) => (
                <span className="text-sm text-muted-foreground">
                  {typeof vendor.city === "object" ? (vendor.city as ApiCity)?.name : vendor.city}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (vendor) => (
                <span className={cn("status-badge", vendor.isActive !== false ? "online" : "offline")}>
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      vendor.isActive !== false ? "bg-success" : "bg-muted-foreground"
                    )}
                  />
                  {vendor.isActive !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              className: "text-right",
              render: (vendor) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditId(vendor._id);
                        setEditName(vendor.name);
                        setEditEmail(vendor.email);
                        setEditPhone(vendor.phone || "");
                        const cid = typeof vendor.city === "object" && vendor.city ? (vendor.city as ApiCity)._id : String(vendor.city || "");
                        setEditCityId(cid);
                        setEditAddress(vendor.address || "");
                        setEditPanelPassword("");
                        setEditPlatformCommissionPercent(String(vendor.platformCommissionPercent ?? 10));
                        setEditOpen(true);
                      }}
                    >
                      Edit vendor & password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          items={filteredVendors}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No vendors found."
        />

        {/* View Vendor Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
              <DialogDescription>Overview of vendor information.</DialogDescription>
            </DialogHeader>
            {selectedVendor && (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {selectedVendor.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedVendor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.email}</p>
                    {selectedVendor.phone && (
                      <p className="text-xs text-muted-foreground">{selectedVendor.phone}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="font-medium text-foreground">
                      {typeof selectedVendor.city === "object"
                        ? selectedVendor.city?.name
                        : selectedVendor.city || "-"}
                    </p>
                  </div>
                  {selectedVendor.address && (
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground break-words">
                        {selectedVendor.address}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">
                      {selectedVendor.isActive !== false ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Platform commission</p>
                    <p className="font-medium text-foreground">
                      {selectedVendor.platformCommissionPercent ?? 10}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vendor Panel</p>
                    {vendorPanelBaseUrl ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => {
                          const url = `${vendorPanelBaseUrl.replace(/\/$/, "")}/?vendor=${selectedVendor._id}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        Open vendor panel
                      </Button>
                    ) : (
                      <p className="font-medium text-foreground">Not configured (`VITE_VENDOR_PANEL_URL`)</p>
                    )}
                  </div>
                </div>
                <EmbeddedReportsSection
                  vendorId={selectedVendor._id}
                  title="Reports"
                  className="border-t border-border pt-4 mt-4"
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit vendor</DialogTitle>
              <DialogDescription>Update business details and admin-panel login password for the vendor user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Email (login)</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>City</Label>
                <Select value={editCityId} onValueChange={setEditCityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>New panel password (optional)</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 6 characters — leave blank to keep current"
                  value={editPanelPassword}
                  onChange={(e) => setEditPanelPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Platform commission (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={editPlatformCommissionPercent}
                  onChange={(e) => setEditPlatformCommissionPercent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={editSaving || !editName.trim() || !editEmail.trim() || !editCityId}
                onClick={async () => {
                  setEditSaving(true);
                  try {
                    const body: Parameters<typeof adminApi.updateVendor>[1] = {
                      name: editName.trim(),
                      email: editEmail.trim(),
                      phone: editPhone.trim() || undefined,
                      city: editCityId,
                      address: editAddress.trim() || undefined,
                    };
                    if (editPanelPassword.trim().length >= 6) body.panelPassword = editPanelPassword.trim();
                    body.platformCommissionPercent = Math.min(100, Math.max(0, Number(editPlatformCommissionPercent) || 0));
                    const res = await adminApi.updateVendor(editId, body);
                    if (res.success) {
                      setEditOpen(false);
                      fetchVendors();
                    }
                  } finally {
                    setEditSaving(false);
                  }
                }}
              >
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Vendors;
