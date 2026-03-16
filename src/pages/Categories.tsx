import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ImageIcon, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { adminApi, type ApiCategory } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getCategories(page, pageSize, searchQuery);
    if (res.success && res.data?.items) {
      setCategories(res.data.items);
      setTotal(res.data.meta.total);
    }
    setLoading(false);
  }, [searchQuery, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await adminApi.createCategory({
      name: newName.trim(),
      order: newOrder,
      imageFile: newImageFile || undefined,
    });
    setSaving(false);
    if (res.success) {
      setNewName("");
      setNewOrder(0);
      setNewImageFile(null);
      setNewImagePreview("");
      setDialogOpen(false);
      fetchCategories();
    }
  };

  const openEditDialog = (category: ApiCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditOrder(category.order ?? 0);
    setEditActive(category.isActive !== false);
    setEditImageFile(null);
    setEditImagePreview(category.imageUrl || "");
    setEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      const res = await adminApi.updateCategory(editingCategory._id, {
        name: editName.trim(),
        order: editOrder,
        isActive: editActive,
        imageFile: editImageFile || undefined,
      });
      if (res.success) {
        setEditDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Services using it may need to be updated.")) return;
    const res = await adminApi.deleteCategory(id);
    if (res.success) fetchCategories();
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-description">Manage service categories (name + image) used when creating services</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Category name and image shown in the user app</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="catName">Name</Label>
                  <Input
                    id="catName"
                    placeholder="e.g. Hair, Makeup, Facial"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="catOrder">Order</Label>
                  <Input
                    id="catOrder"
                    type="number"
                    min={0}
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Image (optional)</Label>
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
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCategory} disabled={saving}>
                  {saving ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DataTable<ApiCategory>
          columns={[
            {
              key: "image",
              header: "Category",
              render: (cat) => (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">Order: {cat.order ?? 0}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (cat) => (
                <span className="text-xs font-medium text-foreground">
                  {cat.isActive === false ? "Inactive" : "Active"}
                </span>
              ),
            },
            {
              key: "actions",
              header: <span className="flex justify-end">Actions</span>,
              className: "text-right",
              render: (cat) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(cat)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          items={filtered}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No categories yet. Add one above."
        />

        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingCategory(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update name and image</DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Category name"
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
                    {(editImagePreview || editingCategory.imageUrl) && (
                      <img
                        src={editImagePreview || editingCategory.imageUrl}
                        alt="Preview"
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="editCatActive" checked={editActive} onCheckedChange={setEditActive} />
                  <Label htmlFor="editCatActive">Active (shown in app)</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateCategory} disabled={editSaving}>
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Categories;
