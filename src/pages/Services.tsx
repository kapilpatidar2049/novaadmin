import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Scissors, Edit, MoreHorizontal, DollarSign, Clock, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

const Services = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [activeTotal, setActiveTotal] = useState(0);
  const [avgBasePrice, setAvgBasePrice] = useState(0);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getServices(page, pageSize, searchQuery);
    if (res.success && res.data?.items) {
      setServices(res.data.items);
      const m = res.data.meta;
      setTotal(m.total);
      setActiveTotal(typeof m.activeTotal === "number" ? m.activeTotal : 0);
      setAvgBasePrice(typeof m.avgBasePrice === "number" ? m.avgBasePrice : 0);
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

  const filteredServices = services.filter((service) => {
    return service.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeleteService = async (service: ApiService) => {
    if (!confirm(`Delete "${service.name}" service?`)) return;
    try {
      await adminApi.deleteService(service._id);
      toast.success("Service deleted");
      fetchServices();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete service");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Service & Pricing Control</h1>
            <p className="page-description">Manage global services and city-wise pricing rules</p>
          </div>
          <Button onClick={() => navigate("/services/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
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
                <p className="text-2xl font-bold text-foreground">{total}</p>
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
                <p className="text-2xl font-bold text-foreground">{activeTotal}</p>
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
                  ₹{total > 0 ? avgBasePrice : "—"}
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
                    <DropdownMenuItem onClick={() => navigate(`/services/${service._id}/edit`, { state: { service } })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Service
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Service
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

      </div>
    </AdminLayout>
  );
};

export default Services;
