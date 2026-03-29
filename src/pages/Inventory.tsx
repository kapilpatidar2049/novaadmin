import { useCallback, useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Row = {
  _id: string;
  name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  sellingPrice?: number;
  costPrice?: number;
  isActive?: boolean;
  showInShop?: boolean;
  imageUrl?: string;
  description?: string;
  vendor?: { _id: string; name?: string };
};

const emptyForm = {
  vendorId: "",
  name: "",
  sku: "",
  quantity: "0",
  unit: "",
  sellingPrice: "",
  costPrice: "",
  isActive: true,
  showInShop: true,
  description: "",
};

const Inventory = () => {
  const { isVendor } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<Array<{ _id: string; name: string }>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setObjectUrl(null);
      return;
    }
    const u = URL.createObjectURL(imageFile);
    setObjectUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [imageFile]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getInventory(1, 100, search);
    if (res.success && res.data?.items) setRows(res.data.items as Row[]);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isVendor) return;
    adminApi.getVendors(1, 100).then((res) => {
      if (res.success && res.data?.items) {
        setVendors(res.data.items.map((v) => ({ _id: v._id, name: v.name })));
      }
    });
  }, [isVendor]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImageFile(null);
    setExistingImageUrl(null);
    setImageRemoved(false);
    setDialogOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditId(r._id);
    setForm({
      vendorId: r.vendor?._id || "",
      name: r.name,
      sku: r.sku || "",
      quantity: String(r.quantity ?? 0),
      unit: r.unit || "",
      sellingPrice: r.sellingPrice != null ? String(r.sellingPrice) : "",
      costPrice: r.costPrice != null ? String(r.costPrice) : "",
      isActive: r.isActive !== false,
      showInShop: r.showInShop !== false,
      description: r.description || "",
    });
    setImageFile(null);
    setExistingImageUrl(r.imageUrl || null);
    setImageRemoved(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!isVendor && !editId && !form.vendorId) {
      toast.error("Select a vendor");
      return;
    }
    setSaving(true);
    const base = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim(),
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      isActive: form.isActive,
      showInShop: form.showInShop,
      description: form.description.trim(),
    };
    const res = editId
      ? await adminApi.updateInventoryItem(
          editId,
          {
            ...base,
            ...(imageRemoved && !imageFile ? { clearImage: true } : {}),
          },
          imageFile
        )
      : await adminApi.createInventoryItem(
          { ...base, ...(isVendor ? {} : { vendorId: form.vendorId || undefined }) },
          imageFile
        );
    setSaving(false);
    if (res.success) {
      toast.success(editId ? "Updated" : "Created");
      setDialogOpen(false);
      load();
    } else {
      toast.error(res.message || "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory row?")) return;
    const res = await adminApi.deleteInventoryItem(id);
    if (res.success) {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              Inventory
            </h1>
            <p className="page-description">
              Stock for beauticians and the customer shop (same catalog). Set selling price and show in shop.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>
        </div>

        <Input
          placeholder="Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium w-14">Img</th>
                <th className="text-left p-3 font-medium">Name</th>
                {!isVendor && <th className="text-left p-3 font-medium">Vendor</th>}
                <th className="text-right p-3 font-medium">Qty</th>
                <th className="text-right p-3 font-medium">MRP / Sale</th>
                <th className="text-center p-3 font-medium">Shop</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className="border-t border-border">
                    <td className="p-2">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover bg-muted" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted" />
                      )}
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    {!isVendor && <td className="p-3 text-muted-foreground">{r.vendor?.name || "—"}</td>}
                    <td className="p-3 text-right">{r.quantity}</td>
                    <td className="p-3 text-right">
                      ₹{r.costPrice ?? "—"} / ₹{r.sellingPrice ?? "—"}
                    </td>
                    <td className="p-3 text-center">{r.showInShop ? "Yes" : "No"}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {!isVendor && !editId && (
                <div>
                  <Label>Vendor</Label>
                  <Select value={form.vendorId} onValueChange={(v) => setForm((f) => ({ ...f, vendorId: v }))}>
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
              )}
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Quantity</Label>
                  <Input value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="pcs, ml…" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Cost price</Label>
                  <Input value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} />
                </div>
                <div>
                  <Label>Selling price</Label>
                  <Input value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </div>
              <div>
                <Label>Product image</Label>
                <div className="flex flex-col gap-2 mt-1">
                  {(objectUrl || existingImageUrl) && (
                    <img
                      src={objectUrl || existingImageUrl || ""}
                      alt=""
                      className="h-32 w-full max-w-xs rounded-lg object-cover border border-border bg-muted"
                    />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setImageFile(f ?? null);
                      if (f) setImageRemoved(false);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {imageFile || existingImageUrl ? "Change image" : "Upload image"}
                    </Button>
                    {(imageFile || existingImageUrl) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setExistingImageUrl(null);
                          setImageRemoved(true);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 MB. Edit: leave unchanged to keep current photo.</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show in customer shop</Label>
                <Switch checked={form.showInShop} onCheckedChange={(v) => setForm((f) => ({ ...f, showInShop: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Inventory;
