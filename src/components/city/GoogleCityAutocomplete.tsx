import { useRef } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const libraries: ("places")[] = ["places"];

type Props = {
  onResolved: (p: {
    name: string;
    lat: number;
    lng: number;
    placeId: string;
    state?: string;
  }) => void;
};

export function GoogleCityAutocomplete({ onResolved }: Props) {
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onPlaceChanged = () => {
    const ac = acRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const loc = place.geometry?.location;
    if (!loc) return;
    const name =
      place.name ||
      place.address_components?.find((c) => c.types.includes("locality"))?.long_name ||
      "";
    const region = place.address_components?.find((c) => c.types.includes("administrative_area_level_1"));
    onResolved({
      name: name || "",
      lat: loc.lat(),
      lng: loc.lng(),
      placeId: place.place_id || "",
      state: region?.long_name,
    });
  };

  if (loadError) {
    return <p className="text-sm text-destructive">Could not load Google Maps. Check API key and Places API.</p>;
  }
  if (!isLoaded) {
    return <Input disabled placeholder="Loading Google Places..." />;
  }

  return (
    <div className="grid gap-2">
      <Label>Search city (Google)</Label>
      <Autocomplete onLoad={(a) => { acRef.current = a; }} onPlaceChanged={onPlaceChanged}>
        <Input placeholder="Type to search — saves center lat/lng for location matching" />
      </Autocomplete>
      <p className="text-xs text-muted-foreground">{`After you pick a place, name and coordinates are filled. You can edit the name below.`}</p>
    </div>
  );
}
