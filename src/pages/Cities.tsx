import { useState, useEffect, useCallback } from "react";
import { Plus, Search, MapPin, Edit, Trash2, MoreHorizontal, Users, Store, DollarSign } from "lucide-react";
import { GoogleCityAutocomplete } from "@/components/city/GoogleCityAutocomplete";
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
import { cn } from "@/lib/utils";
import { adminApi, type ApiCity } from "@/lib/api";

const Cities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newState, setNewState] = useState("");
  const [placeLat, setPlaceLat] = useState<number | undefined>(undefined);
  const [placeLng, setPlaceLng] = useState<number | undefined>(undefined);
  const [placeId, setPlaceId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getCities(1, 100, searchQuery);
    if (res.success && res.data?.items) setCities(res.data.items);
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleAddCity = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await adminApi.createCity({
      name: newName.trim(),
      state: newState.trim() || undefined,
      ...(placeLat != null && placeLng != null
        ? { latitude: placeLat, longitude: placeLng, googlePlaceId: placeId || undefined }
        : {}),
    });
    setSaving(false);
    if (res.success) {
      setNewName("");
      setNewState("");
      setPlaceLat(undefined);
      setPlaceLng(undefined);
      setPlaceId("");
      setDialogOpen(false);
      fetchCities();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this city?")) return;
    const res = await adminApi.deleteCity(id);
    if (res.success) fetchCities();
  };

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (city.state || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">City Management</h1>
            <p className="page-description">Manage operational cities and their vendor assignments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New City</DialogTitle>
                <DialogDescription>Add a new city to expand your service coverage</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                  <GoogleCityAutocomplete
                    onResolved={(p) => {
                      if (p.name) setNewName(p.name);
                      setPlaceLat(p.lat);
                      setPlaceLng(p.lng);
                      setPlaceId(p.placeId);
                      if (p.state) setNewState(p.state);
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Set <code className="text-xs">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-xs">.env</code> to enable Places search, or enter the city name manually (without coordinates).
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="cityName">City Name</Label>
                  <Input id="cityName" placeholder="Enter city name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Enter state name" value={newState} onChange={(e) => setNewState(e.target.value)} />
                </div>
                {placeLat != null && placeLng != null && (
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {placeLat.toFixed(5)}, {placeLng.toFixed(5)} (saved with city for GPS matching)
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCity} disabled={saving}>{saving ? "Adding..." : "Add City"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Cities</p>
                <p className="text-2xl font-bold text-foreground">{cities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Cities Table */}
        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  City
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  State
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
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : (
                filteredCities.map((city) => (
                  <tr key={city._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{city.name}</p>
                          <p className="text-sm text-muted-foreground">{city.state || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{city.state || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={cn("status-badge", city.isActive !== false ? "online" : "offline")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", city.isActive !== false ? "bg-success" : "bg-muted-foreground")} />
                        {city.isActive !== false ? "Active" : "Inactive"}
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(city._id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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

export default Cities;
