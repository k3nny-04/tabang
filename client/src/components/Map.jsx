import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs } from "react-icons/fa";
import { MdLayers } from "react-icons/md";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";
import evacData from "../data/evac_data";
import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import { useLayers } from "../providers/useLayersContext";

const DEFAULT_LOCATION = { lat: 13.623432, lng: 123.184907 };
const ZOOM = 15;
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const {
    currentLocation,
    setCurrentLocation,
    pinnedLocation,
    setPinnedLocation,
  } = useLocationContext();

  // Map States
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const initialized = useRef(false);

  // Pin States
  const currentMarkerRef = useRef(null);
  const pinnedMarkerRef = useRef(null);

  // Search State
  const [inputValue, setInputValue] = useState("");

  // Layer States
  const evacMarkersRef = useRef([]);
  const { activeLayers, toggleLayer } = useLayers();
  const [layersOpen, setLayersOpen] = useState(false);

  // Effect for initializing the map
  useEffect(() => {
    if (initialized.current || !mapContainerRef.current) return;
    initialized.current = true;

    const initialCenter = currentLocation || DEFAULT_LOCATION;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: ZOOM,
    });

    mapRef.current.on("load", () => {
      setMapInstance(mapRef.current);
      if (!currentLocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setCurrentLocation(coords);

            mapRef.current.flyTo({
              center: [coords.lng, coords.lat],
              zoom: ZOOM,
              duration: 1200,
            });
          },
          () => {
            alert(
              "Please enable location services to get your current location."
            );
          }
        );
      }
    });

    mapRef.current.on("click", (e) => {
      setPinnedLocation({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      initialized.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for current location marker
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    currentMarkerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(mapRef.current);
  }, [currentLocation]);

  // Effect for pinned location marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pinnedMarkerRef.current) {
      pinnedMarkerRef.current.remove();
      pinnedMarkerRef.current = null;
    }

    if (pinnedLocation) {
      pinnedMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([pinnedLocation.lng, pinnedLocation.lat])
        .addTo(mapRef.current);
    }
  }, [pinnedLocation]);

  // Effect for evacuation shelter markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers first
    evacMarkersRef.current.forEach((marker) => marker.remove());
    evacMarkersRef.current = [];

    if (!activeLayers.evacShelters) return;

    // Deduplicate
    const unique = [];
    const seen = new Set();

    evacData.forEach((item) => {
      const key = `${item.Evacuation_Name}-${item.Lat}-${item.Long}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    // Create markers
    unique.forEach((item) => {
      const marker = new mapboxgl.Marker({ color: "#4f46e5" }) 
        .setLngLat([item.Long, item.Lat])
        .addTo(mapRef.current);

      evacMarkersRef.current.push(marker);
    });
  }, [activeLayers.evacShelters]);

  const handleRecenter = () => {
    if (!mapRef.current) return;

    const target = currentLocation || DEFAULT_LOCATION;

    mapRef.current.flyTo({
      center: [target.lng, target.lat],
      zoom: ZOOM,
      duration: 1200,
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* SEARCH */}
      {mapInstance && (
        <div className="absolute top-4 left-4 z-20 w-100 max-w-[calc(100vw-2rem)]">
          <SearchBox 
            accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            map={mapInstance}
            mapboxgl={mapboxgl}
            value={inputValue}
            onChange={(val) => setInputValue(val)}
            marker
            theme={{
              variables: {
                fontFamily: 'Roboto, sans-serif',
                colorBackground: '#fafafa', 
                colorText: '#1c1c1e',      
                colorPrimary: '#1c1c1e',    
                // border: '1px solid #000000', 
                borderRadius: '0.5rem',     
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' // Tailwind shadow-lg
              },
            }}
          />
        </div>
      )}
      {/* MAP */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Controls */}
      <div className="absolute right-2 bottom-2 z-10 flex flex-col items-end gap-3">
        {/* RECENTER */}
        <button
          onClick={handleRecenter}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-primary shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label="Recenter"
        >
          <FaCrosshairs className="text-lg" />
        </button>
        {/* LAYERS */}
        <button
          onClick={() => setLayersOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label="Layers"
        >
          <MdLayers className="text-lg" />
        </button>

      </div>

      <BottomSheet
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        title="Map Layers"
      >
        <Layers
          activeLayers={activeLayers}
          toggleLayer={toggleLayer}
        />
      </BottomSheet>
    </div>
  );
};

export default Map;