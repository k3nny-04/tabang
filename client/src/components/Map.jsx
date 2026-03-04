import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs } from "react-icons/fa";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";

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

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const currentMarkerRef = useRef(null);
  const pinnedMarkerRef = useRef(null);
  const initialized = useRef(false);

  const [inputValue, setInputValue] = useState("");

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

  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    currentMarkerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(mapRef.current);
  }, [currentLocation]);

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

      {/* RECENTER */}
      <div className="absolute right-2 bottom-2 z-10">
        <button
          onClick={handleRecenter}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-primary shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label="Recenter"
        >
          <FaCrosshairs className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Map;