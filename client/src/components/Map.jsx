import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs, FaPhone, FaRegCopy } from "react-icons/fa";
import { MdLayers, MdDirections, MdMessage } from "react-icons/md";
import { SearchBox } from "@mapbox/search-js-react";
import { FaHouse } from "react-icons/fa6";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import evacData from "../data/evac_data";
import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import { useLayers } from "../providers/useLayersContext";
import { copyToClipboard } from "../utils/clipboard";

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

    // Create markers
    evacData.forEach((item) => {
      // Marker
      const markerEl = document.createElement("div");
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 border-2 border-white shadow-lg";
      const markerRoot = createRoot(markerEl);
      markerRoot.render(<FaHouse className="text-white text-sm" />);

      // Popup
      const popupEl = document.createElement("div");
      const popupRoot = createRoot(popupEl);
      const hasContact = !!item.Contact;

      popupRoot.render(
        <div className="p-3 text-text-primary font-sans text-sm">

          {/* Title */}
          <h3 className="font-semibold wrap-break-word">
            {item.Evacuation_Name || "Unnamed Shelter"}
          </h3>
          {/* Barangay */}
          {item.Barangay && (
            <p className="text-xs text-text-secondary wrap-break-word">
              Barangay {item.Barangay}
            </p>
          )}
          {/* Divider */}
          <div className="my-2 border-t border-border-light" />
          {/* Capacity */}
          {item.Capacity && (
            <p className="text-xs text-text-secondary wrap-break-word">
              Capacity: <span className="font-medium">{item.Capacity}</span>
            </p>
          )}
          {/* Manager */}
          {item.Manager && (
            <p className="text-xs text-text-secondary wrap-break-word">
              Manager: <span className="font-medium">{item.Manager}</span>
            </p>
          )}
          {/* Contact */}
          {hasContact && (
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
              <span className="font-medium">{item.Contact}</span>
              <button
                onClick={() => copyToClipboard(item.Contact.toString())}
                className="text-text-muted hover:text-text-primary transition"
                title="Copy number"
              >
                <FaRegCopy size={12} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-xs hover:bg-surface-hover">
              <FaPhone size={12} />
              Call
            </button>

            <button className="flex flex-1 items-center justify-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-xs hover:bg-surface-hover">
              <MdMessage size={13} />
              Message
            </button>

            <button className="flex flex-1 items-center justify-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-xs hover:bg-surface-hover">
              <MdDirections size={13} />
              Go
            </button>
          </div>
        </div>
      );

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "300px",
        closeButton: false
      }).setDOMContent(popupEl);
      /* ---------- Marker Instance ---------- */

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([item.Long, item.Lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      evacMarkersRef.current.push(marker);
    });
    console.log("Evac Shelter number:", evacMarkersRef.current.length);
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