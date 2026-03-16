import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Scissors, Edit, MoreHorizontal, DollarSign, Clock, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adminApi, type ApiService, type ApiCategory } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIncludes, setNewIncludes] = useState("");
  const [newExperts, setNewExperts] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [saving, setSaving] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ApiService | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIncludes, setEditIncludes] = useState("");
  const [editExperts, setEditExperts] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getServices(page, pageSize, searchQuery);
    if (res.success && res.data?.items) {
      setServices(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [searchQuery, page]);

  const fetchCategories = useCallback(async () => {
    const res = await adminApi.getCategories(1, 100, "");
    if (res.success && res.data?.items) setCategories(res.data.items);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddService = async () => {
    const price = Number(newPrice);
    const duration = Number(newDuration);
    if (!newName.trim() || !price || !duration) return;
    const includes = newIncludes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const experts = newExperts
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setSaving(true);
    const res = await adminApi.createService({
      name: newName.trim(),
      category: newCategory.trim() || undefined,
      description: newDesc.trim() || undefined,
      includes: includes.length ? includes : undefined,
      experts: experts.length ? experts : undefined,
      imageUrl: newImageUrl.trim() || undefined,
      imageFile: newImageFile,
      basePrice: price,
      durationMinutes: duration,
    });
    setSaving(false);
    if (res.success) {
      setNewName("");
      setNewCategory("");
      setNewDesc("");
      setNewIncludes("");
      setNewExperts("");
      setNewImageUrl("");
      setNewImageFile(null);
      setNewPrice("");
      setNewDuration("");
      setDialogOpen(false);
      fetchServices();
    }
  };

  const openEditDialog = (service: ApiService) => {
    setEditingService(service);
    setEditName(service.name);
    const cat = service.category;
    setEditCategory(
      typeof cat === "object" && cat && "_id" in cat ? cat._id : typeof cat === "string" ? cat : ""
    );
    setEditDesc(service.description || "");
    setEditIncludes((service.includes || []).join("\n"));
    setEditExperts((service.experts || []).join("\n"));
    setEditImageUrl(service.imageUrl || "");
    setEditImageFile(null);
    setEditPrice(String(service.basePrice));
    setEditDuration(String(service.durationMinutes));
    setEditActive(service.isActive !== false);
    setEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    const price = editPrice.trim() ? Number(editPrice) : undefined;
    const duration = editDuration.trim() ? Number(editDuration) : undefined;
    if (!editName.trim()) return;
    const includes = editIncludes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const experts = editExperts
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setEditSaving(true);
    try {
      const payload: Parameters<typeof adminApi.updateService>[1] = {
        name: editName.trim(),
        category: editCategory.trim() || undefined,
        description: editDesc.trim() || undefined,
        includes: includes.length ? includes : undefined,
        experts: experts.length ? experts : undefined,
        imageFile: editImageFile || undefined,
        basePrice: price,
        durationMinutes: duration,
        isActive: editActive,
      };
      if (!editImageFile && editImageUrl.trim()) payload.imageUrl = editImageUrl.trim();
      const res = await adminApi.updateService(editingService._id, payload);
      if (res.success) {
        setEditDialogOpen(false);
        setEditingService(null);
        fetchServices();
      }
    } finally {
      setEditSaving(false);
    }
  };

  const filteredServices = services.filter((service) => {
    return service.name.toLowerCase().includes(searchQuery.toLowerCase());
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Input id="serviceName" placeholder="Enter service name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newCategory || "none"} onValueChange={(v) => setNewCategory(v === "none" ? "" : v)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">About</Label>
                  <Input id="description" placeholder="Short description about this service" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="includes">What's Included (one per line)</Label>
                  <textarea
                    id="includes"
                    className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={"e.g. Hair styling\nMakeup\nDraping"}
                    value={newIncludes}
                    onChange={(e) => setNewIncludes(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="experts">Our Experts (one per line)</Label>
                  <textarea
                    id="experts"
                    className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={"e.g. Senior Makeup Artist\nHair Stylist\nSkin Specialist"}
                    value={newExperts}
                    onChange={(e) => setNewExperts(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">Service Image</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setNewImageFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          setNewImageUrl(previewUrl);
                        }}
                      />
                      {newImageUrl && (
                        <img
                          src={newImageUrl}
                          alt="Service preview"
                          className="h-16 w-16 rounded-md object-cover border"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Base Price (₹)</Label>
                    <Input id="price" type="number" placeholder="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input id="duration" type="number" placeholder="0" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddService} disabled={saving}>{saving ? "Adding..." : "Add Service"}</Button>
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
        </div>

        <DataTable<ApiService>
          columns={[
            {
              key: "service",
              header: "Service",
              render: (service) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scissors className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{service.name}</span>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (service) => (
                <span className="text-sm text-muted-foreground">
                  {typeof service.category === "object" &&
                  service.category &&
                  "name" in service.category
                    ? service.category.name
                    : "-"}
                </span>
              ),
            },
            {
              key: "price",
              header: "Base Price",
              render: (service) => (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    ₹{service.basePrice}
                  </span>
                </div>
              ),
            },
            {
              key: "duration",
              header: "Duration",
              render: (service) => (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {service.durationMinutes} min
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (service) => (
                <span
                  className={cn(
                    "status-badge",
                    service.isActive !== false ? "online" : "offline"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      service.isActive !== false ? "bg-success" : "bg-muted-foreground"
                    )}
                  />
                  {service.isActive !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              className: "text-right",
              render: (service) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(service)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          items={filteredServices}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No services found."
        />

        {/* Edit Service Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingService(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>Update service details and pricing</DialogDescription>
            </DialogHeader>
            {editingService && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editServiceName">Service Name</Label>
                  <Input id="editServiceName" placeholder="Enter service name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editCategory">Category</Label>
                  <Select value={editCategory || "none"} onValueChange={(v) => setEditCategory(v === "none" ? "" : v)}>
                    <SelectTrigger id="editCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDescription">About</Label>
                  <Input id="editDescription" placeholder="Short description about this service" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editIncludes">What's Included (one per line)</Label>
                  <textarea
                    id="editIncludes"
                    className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editIncludes}
                    onChange={(e) => setEditIncludes(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editExperts">Our Experts (one per line)</Label>
                  <textarea
                    id="editExperts"
                    className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editExperts}
                    onChange={(e) => setEditExperts(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Service Image</Label>
                  <div className="grid gap-2">
                    <Input placeholder="Image URL (optional)" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} />
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setEditImageFile(file);
                          setEditImageUrl(URL.createObjectURL(file));
                        }}
                      />
                      {(editImageUrl || editingService.imageUrl) && (
                        <img
                          src={editImageUrl || editingService.imageUrl}
                          alt="Service preview"
                          className="h-16 w-16 rounded-md object-cover border"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editPrice">Base Price (₹)</Label>
                    <Input id="editPrice" type="number" placeholder="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editDuration">Duration (mins)</Label>
                    <Input id="editDuration" type="number" placeholder="0" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="editActive" checked={editActive} onCheckedChange={setEditActive} />
                  <Label htmlFor="editActive">Active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateService} disabled={editSaving}>
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Services;
