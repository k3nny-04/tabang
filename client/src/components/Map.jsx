import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs } from "react-icons/fa";
import { MdLayers } from "react-icons/md";
import { SearchBox } from "@mapbox/search-js-react";
import { FaHouse } from "react-icons/fa6";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import evacData from "../data/evac_data";
import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import { useLayers } from "../providers/useLayersContext";
import { Tent } from "lucide-react";
import { findNearest, getDistance } from "geolib";
import { getDirections } from "../utils/directions";
import NearestShelterCard from "./NearestShelterCard";
import ShelterPopup from "./ShelterPopup";

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

  // Shelter State
  const [nearestShelter, setNearestShelter] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState("");
  const [routeData, setRouteData] = useState(null);

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
      pinnedMarkerRef.current = new mapboxgl.Marker({ color: "#1c1c1e "})
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
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-green-600 border-2 border-white shadow-lg";
      const markerRoot = createRoot(markerEl);
      markerRoot.render(<FaHouse className="text-white text-sm" />);

      // Popup
      const popupEl = document.createElement("div");
      const popupRoot = createRoot(popupEl);
      popupRoot.render(<ShelterPopup item={item}/>);

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "300px",
        closeButton: false,
      }).setDOMContent(popupEl);
      /* ---------- Marker Instance ---------- */

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([item.Long, item.Lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      evacMarkersRef.current.push(marker);
    });
  }, [activeLayers.evacShelters]);
  
  // Effect for drawing the route
  useEffect(() => {
    if (!mapInstance) return;

    const sourceId = "route-source";
    const layerId = "route-layer";

    // If we clear the route (e.g., closing the shelter popup)
    if (!routeData) {
      if (mapInstance.getSource(sourceId)) {
        // Empty the line data to hide it
        mapInstance.getSource(sourceId).setData({ type: "FeatureCollection", features: [] });
      }
      return;
    }

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: routeData.geometry,
    };

    // If the layer already exists, just update the data (fast)
    if (mapInstance.getSource(sourceId)) {
      mapInstance.getSource(sourceId).setData(geojson);
    } else {
      // Otherwise, add the source and the visual layer rules
      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      mapInstance.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3a3a3d", 
          "line-width": 6,
          "line-opacity": 0.8,
        },
      });
    }

    // Automatically zoom and pan the map so the entire route fits on the screen perfectly
    const coordinates = routeData.geometry.coordinates;
    const bounds = coordinates.reduce((b, coord) => {
      return b.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    mapInstance.fitBounds(bounds, { padding: 60, duration: 1000 });

  }, [mapInstance, routeData]);


  const handleRecenter = () => {
    if (!mapRef.current) return;

    const target = currentLocation || DEFAULT_LOCATION;

    mapRef.current.flyTo({
      center: [target.lng, target.lat],
      zoom: ZOOM,
      duration: 1200,
    });
  };

  const handleFindShelter = async () => {
    const activeLocation = pinnedLocation || currentLocation;
    if(!activeLocation) {
      alert(
        "Please enable location services or pin your current location on the map."
      );
      return;
    }

    const currentCoords = {
      latitude: activeLocation.lat,
      longitude: activeLocation.lng
    };
    
    const formattedEvacData = evacData.map((shelter) => ({
      ...shelter,
      latitude: shelter.Lat,
      longitude: shelter.Long,
    }))

    try {
      const nearest = findNearest(currentCoords, formattedEvacData);
      const route = await getDirections(
        { lat: currentCoords.latitude, lng: currentCoords.longitude },
        { lat: nearest.latitude, lng: nearest.longitude }
      );

      const distanceInMeters = getDistance(currentCoords, nearest); 
      const formattedDistance =
        distanceInMeters >= 1000
          ? `${(distanceInMeters / 1000).toFixed(1)} km`
          : `${distanceInMeters} meters`

      setNearestShelter(nearest);
      setDistanceInfo(formattedDistance);
      setRouteData(route);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [nearest.longitude, nearest.latitude],
          zoom: 15,
          duration: 1200,
        });
      }
      
    } catch (error) {
      console.error("Failed to calculate directions", error);
      alert("Could not calculate a route to the nearest shelter. Please try again.");
    }
  }

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
                borderRadius: '0.5rem',     
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
              },
            }}
          />
        </div>
      )}
      {/* MAP */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* FIND NEAREST EVAC */}
      <div className="absolute left-0 right-0 top-15 z-10 flex justify-center px-4 pointer-events-none">
        <button
          onClick={handleFindShelter}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-semibold text-bg-primary shadow-xl ring-4 ring-text-primary/20 transition-all active:scale-95"
        >
          <Tent size={18} />
          Find Nearest Shelter
        </button>
      </div>

      <NearestShelterCard 
        shelter={nearestShelter} 
        distanceInfo={distanceInfo} 
        onClose={() => {
          setNearestShelter(null);
          setRouteData(null);
        }} 
      />

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
        height={35}
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