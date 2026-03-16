import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, type ApiCategory, type ApiService } from "@/lib/api";

type LocationState = { service?: ApiService } | null;

const ServiceForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || null;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [includes, setIncludes] = useState("");
  const [experts, setExperts] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    adminApi.getCategories(1, 100, "").then((res) => {
      if (res.success && res.data?.items) setCategories(res.data.items);
    });
  }, []);

  useEffect(() => {
    if (isEdit && state?.service) {
      const service = state.service;
      setName(service.name);
      const cat = service.category;
      setCategory(
        typeof cat === "object" && cat && "_id" in cat ? (cat as ApiCategory)._id : typeof cat === "string" ? cat : ""
      );
      setDesc(service.description || "");
      setIncludes((service.includes || []).join("\n"));
      setExperts((service.experts || []).join("\n"));
      setImagePreview(service.imageUrl || "");
      setPrice(String(service.basePrice));
      setDuration(String(service.durationMinutes));
      setActive(service.isActive !== false);
    }
  }, [isEdit, state]);

  const handleSubmit = async () => {
    const basePrice = Number(price);
    const durationMinutes = Number(duration);
    if (!name.trim() || !basePrice || !durationMinutes) return;
    const includesArr = includes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const expertsArr = experts
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      if (isEdit && id) {
        const payload: Parameters<typeof adminApi.updateService>[1] = {
          name: name.trim(),
          category: category.trim() || undefined,
          description: desc.trim() || undefined,
          includes: includesArr.length ? includesArr : undefined,
          experts: expertsArr.length ? expertsArr : undefined,
          imageFile: imageFile || undefined,
          basePrice,
          durationMinutes,
          isActive: active,
        };
        await adminApi.updateService(id, payload);
      } else {
        await adminApi.createService({
          name: name.trim(),
          category: category.trim() || undefined,
          description: desc.trim() || undefined,
          includes: includesArr.length ? includesArr : undefined,
          experts: expertsArr.length ? expertsArr : undefined,
          imageFile: imageFile || undefined,
          basePrice,
          durationMinutes,
        });
      }
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? "Edit Service" : "Create Service"}</h1>
            <p className="page-description">
              {isEdit ? "Update service details and pricing." : "Create a new service with base pricing."}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="serviceName">Service Name</Label>
            <Input
              id="serviceName"
              placeholder="Enter service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category || "none"} onValueChange={(v) => setCategory(v === "none" ? "" : v)}>
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
            <Input
              id="description"
              placeholder="Short description about this service"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="includes">What's Included (one per line)</Label>
            <textarea
              id="includes"
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={"e.g. Hair styling\nMakeup\nDraping"}
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="experts">Our Experts (one per line)</Label>
            <textarea
              id="experts"
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={"e.g. Senior Makeup Artist\nHair Stylist\nSkin Specialist"}
              value={experts}
              onChange={(e) => setExperts(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Service Image</Label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="h-16 w-16 rounded-md object-cover border"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Base Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Active</span>
            </label>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => navigate("/services")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create service"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ServiceForm;

