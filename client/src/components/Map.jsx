import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs } from "react-icons/fa";
import "mapbox-gl/dist/mapbox-gl.css";

const DEFAULT_LOCATION = { lat: 13.623432, lng: 123.184907 };
const ZOOM = 15;

mapboxgl.accessToken = "pk.eyJ1Ijoia2VubnkwNCIsImEiOiJjbW03dGd5NGwwYnN0MnJzOHF3eDB3NzZ0In0.igXRXuCuaDbtoPbOci8RdQ";

const Map = () => {
  const {
    currentLocation,
    setCurrentLocation,
    pinnedLocation,
    setPinnedLocation,
  } = useLocationContext();

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const pinnedMarkerRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !mapContainerRef.current) return;

    const initialCenter = currentLocation || DEFAULT_LOCATION;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: ZOOM,
    });

    mapRef.current.on("load", () => {
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

    initialized.current = true;
  }, );

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
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Recenter Button */}
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