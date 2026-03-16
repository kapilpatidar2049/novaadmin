import { useState, useEffect, useCallback } from "react";
import { Plus, ImageIcon, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { adminApi, type ApiBanner } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

const Banners = () => {
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ApiBanner | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getBanners(page, pageSize);
    if (res.success && res.data?.items) {
      setBanners(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleAddBanner = async () => {
    if (!newTitle.trim()) return;
    if (!newImageFile && !newImagePreview) {
      alert("Please select an image for the banner.");
      return;
    }
    setSaving(true);
    const res = await adminApi.createBanner({
      title: newTitle.trim(),
      link: newLink.trim() || undefined,
      order: newOrder,
      imageFile: newImageFile || undefined,
    });
    setSaving(false);
    if (res.success) {
      setNewTitle("");
      setNewLink("");
      setNewOrder(0);
      setNewImageFile(null);
      setNewImagePreview("");
      setDialogOpen(false);
      fetchBanners();
    }
  };

  const openEditDialog = (banner: ApiBanner) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditLink(banner.link || "");
    setEditOrder(banner.order ?? 0);
    setEditActive(banner.isActive !== false);
    setEditImageFile(null);
    setEditImagePreview(banner.imageUrl || "");
    setEditDialogOpen(true);
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner) return;
    if (!editTitle.trim()) return;
    setEditSaving(true);
    try {
      const res = await adminApi.updateBanner(editingBanner._id, {
        title: editTitle.trim(),
        link: editLink.trim() || undefined,
        order: editOrder,
        isActive: editActive,
        imageFile: editImageFile || undefined,
      });
      if (res.success) {
        setEditDialogOpen(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const res = await adminApi.deleteBanner(id);
    if (res.success) fetchBanners();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Banners</h1>
            <p className="page-description">Manage home screen banners shown in the user app</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Banner</DialogTitle>
                <DialogDescription>Banner image and title shown on the user app home screen</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bannerTitle">Title</Label>
                  <Input
                    id="bannerTitle"
                    placeholder="e.g. Special Offer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bannerLink">Link (optional)</Label>
                  <Input
                    id="bannerLink"
                    placeholder="https://..."
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bannerOrder">Order</Label>
                  <Input
                    id="bannerOrder"
                    type="number"
                    min={0}
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Banner Image (required)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewImageFile(file);
                          setNewImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {newImagePreview && (
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        className="h-20 w-32 rounded-md object-cover border"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBanner} disabled={saving}>
                  {saving ? "Adding..." : "Add Banner"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable<ApiBanner>
          columns={[
            {
              key: "image",
              header: "Banner",
              render: (banner) => (
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{banner.title}</p>
                    <p className="text-xs text-muted-foreground">Order: {banner.order ?? 0}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "link",
              header: "Link",
              render: (banner) => (
                <span className="text-xs text-muted-foreground break-all">
                  {banner.link || "—"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (banner) => (
                <span className="text-xs font-medium text-foreground">
                  {banner.isActive === false ? "Inactive" : "Active"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              render: (banner) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(banner)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(banner._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
              className: "text-right",
            },
          ]}
          items={banners}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No banners yet. Add one above."
        />

        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingBanner(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Banner</DialogTitle>
              <DialogDescription>Update banner title, link and image</DialogDescription>
            </DialogHeader>
            {editingBanner && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Banner title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Link (optional)</Label>
                  <Input
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditImageFile(file);
                          setEditImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {(editImagePreview || editingBanner.imageUrl) && (
                      <img
                        src={editImagePreview || editingBanner.imageUrl}
                        alt="Preview"
                        className="h-20 w-32 rounded-md object-cover border"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="editActive" checked={editActive} onCheckedChange={setEditActive} />
                  <Label htmlFor="editActive">Active (shown in app)</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateBanner} disabled={editSaving}>
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Banners;
