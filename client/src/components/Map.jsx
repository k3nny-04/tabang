import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useLocationContext } from "../providers/useLocationContext";
import { FaCrosshairs, FaShieldAlt } from "react-icons/fa";
import { MdLayers, MdLocationOff } from "react-icons/md";
import { SearchBox } from "@mapbox/search-js-react";
import { FaHouse, FaTriangleExclamation } from "react-icons/fa6";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import { useLayers } from "../providers/useLayersContext";
import { findNearest, getDistance } from "geolib";
import { getDirections } from "../utils/directions";
import NearestShelterCard from "./NearestShelterCard";
import ShelterPopup from "./popups/ShelterPopup";
import TeamPopup from "./popups/TeamPopup";
import IncidentPopup from "./popups/IncidentPopup";
import { sheltersApi } from "../api/sheltersApi"; 
import { teamsApi } from "../api/teamsApi"; 
import { reportsApi } from "../api/reportsApi";

const DEFAULT_LOCATION = { lat: 13.623432, lng: 123.184907 };
const ZOOM = 15;
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  // Location states
  const {
    currentLocation,
    setCurrentLocation,
    pinnedLocation,
    setPinnedLocation,
    startLiveTracking,
    stopLiveTracking,
    isTracking
  } = useLocationContext();
  const latestLocations = useRef({ currentLocation, pinnedLocation});
  const lastRouteFetchLocation = useRef(null);

  // Map States
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const initialized = useRef(false);

  // Pin States
  const currentMarkerRef = useRef(null);
  const pinnedMarkerRef = useRef(null);

  // Layer & Data States
  const evacMarkersRef = useRef([]);
  const incidentMarkersRef = useRef([]);
  const teamMarkersRef = useRef({}); // Use an object map to track moving team markers by ID
  const { activeLayers } = useLayers();
  const [layersOpen, setLayersOpen] = useState(false);
  
  // Live Streams State
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]); // Added teams state

  // Shelter State
  const [nearestShelter, setNearestShelter] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [inputValue, setInputValue] = useState("");

  // Effect to stream shelters
  useEffect(() => {
    const unsubscribe = sheltersApi.streamAllShelters((data) => {
      setShelters(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Effect to stream teams
  useEffect(() => {
    const unsubscribe = teamsApi.streamDeployedTeams((data) => {
      setTeams(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Effect to stream incident reports
  useEffect(() => {
    const unsubscribe = reportsApi.streamIncidentReports((data) => {
      setIncidents(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Effect for updating locations
  useEffect(() => {
    latestLocations.current = { currentLocation, pinnedLocation};
  }, [currentLocation, pinnedLocation]);

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
      
      // --- ADD FLOOD HAZARD DATA ---
      mapRef.current.addSource('noah-flood', {
        type: 'vector',
        url: 'mapbox://kenny04.3ap67c3z' 
      });

      mapRef.current.addLayer({
        id: 'camarines-sur-flood-5yr',
        type: 'fill',
        source: 'noah-flood',
        'source-layer': 'CamarinesSur-2bt53o', 
        layout: { 'visibility': activeLayers.floodMap ? 'visible' : 'none' },
        paint: {
          'fill-color': [
            'match', ['get', 'Var'], 
            1, '#fde047',   // Low
            2, '#f97316',   // Medium
            3, '#dc2626',   // High
            'transparent'
          ],
          'fill-opacity': 0.4
        }
      });

      // --- ADD LANDSLIDE HAZARD DATA ---
      mapRef.current.addSource('noah-landslide', {
        type: 'vector',
        url: 'mapbox://kenny04.c16t211p' 
      });

      mapRef.current.addLayer({
        id: 'camarines-sur-landslide',
        type: 'fill',
        source: 'noah-landslide',
        'source-layer': 'CamarinesSur_Landslides-2agkdp', 
        layout: { 'visibility': activeLayers.landslide ? 'visible' : 'none' },
        paint: {
          'fill-color': [
            'match', ['get', 'HAZ'], 
            1, '#fde047',   // Low
            2, '#f97316',   // Medium
            3, '#dc2626',   // High
            'transparent'
          ],
          'fill-opacity': 0.4
        }
      });

      // --- ADD STORM SURGE HAZARD DATA ---
      mapRef.current.addSource('noah-storm-surge', {
        type: 'vector',
        url: 'mapbox://kenny04.cbaxvf7y' 
      });

      mapRef.current.addLayer({
        id: 'camarines-sur-storm-surge',
        type: 'fill',
        source: 'noah-storm-surge',
        'source-layer': 'CamarinesSur_StormSurge-10zspw', 
        layout: { 'visibility': activeLayers.stormSurge ? 'visible' : 'none' },
        paint: {
          'fill-color': [
            'match', ['get', 'HAZ'], 
            1, '#fde047',   // Low
            2, '#f97316',   // Medium
            3, '#dc2626',   // High
            'transparent'
          ],
          'fill-opacity': 0.4
        }
      });

      if (!currentLocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCurrentLocation(coords);

            mapRef.current.flyTo({
              center: [coords.lng, coords.lat],
              zoom: ZOOM,
              duration: 1200,
            });
          },
          () => {}
        );
      }
    });

    mapRef.current.on("click", (e) => {
      if (e.originalEvent.target.tagName !== 'CANVAS') return; 
      setPinnedLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
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

  // --- EFFECT: TOGGLE ALL HAZARD LAYERS VISIBILITY ---
  useEffect(() => {
    if (!mapInstance) return;

    if (mapInstance.getLayer('camarines-sur-flood-5yr')) {
      mapInstance.setLayoutProperty('camarines-sur-flood-5yr', 'visibility', activeLayers.floodMap ? 'visible' : 'none');
    }
    if (mapInstance.getLayer('camarines-sur-landslide')) {
      mapInstance.setLayoutProperty('camarines-sur-landslide', 'visibility', activeLayers.landslide ? 'visible' : 'none');
    }
    if (mapInstance.getLayer('camarines-sur-storm-surge')) {
      mapInstance.setLayoutProperty('camarines-sur-storm-surge', 'visibility', activeLayers.stormSurge ? 'visible' : 'none');
    }
  }, [mapInstance, activeLayers.floodMap, activeLayers.landslide, activeLayers.stormSurge]);

  // Effect for current location marker
  useEffect(() => {
    if (!mapInstance || !currentLocation) return;

    if (!currentMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "relative flex h-8 w-8 items-center justify-center transition-transform duration-300"; 
      
      el.innerHTML = `
        <div class="absolute top-0 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[6px] border-r-[6px] border-b-8 border-l-transparent border-r-transparent border-b-blue-500 z-10"></div>
        <div class="absolute h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.3)] z-20"></div>
        <div class="absolute h-4 w-4 rounded-full bg-blue-400 animate-ping opacity-75 z-0"></div>
      `;

      currentMarkerRef.current = new mapboxgl.Marker({ 
        element: el,
        rotationAlignment: "map"
      })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(mapInstance);
    } 
    else {
      currentMarkerRef.current.setLngLat([currentLocation.lng, currentLocation.lat]);
    }

    const heading = currentLocation.heading;
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
      currentMarkerRef.current.setRotation(heading);
    }

  }, [currentLocation, mapInstance]);

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

    evacMarkersRef.current.forEach((marker) => marker.remove());
    evacMarkersRef.current = [];

    if (!activeLayers.evacShelters) return;

    shelters.forEach((item) => {
      const lat = item.location?.lat;
      const lng = item.location?.lng;

      if (!lng || !lat) return; 

      const markerEl = document.createElement("div");
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-green-600 border-2 border-white shadow-lg";
      const markerRoot = createRoot(markerEl);
      markerRoot.render(<FaHouse className="text-white text-sm" />);

      const popupEl = document.createElement("div");
      const popupRoot = createRoot(popupEl);
      popupRoot.render(<ShelterPopup item={item} onGoClick={() => handleRouteToSpecificShelter(item)}/>);

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "300px",
        closeButton: false,
      }).setDOMContent(popupEl);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      evacMarkersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayers.evacShelters, shelters]); 

  // Effect for incident report markers
  useEffect(() => {
    if (!mapRef.current) return;

    incidentMarkersRef.current.forEach((marker) => marker.remove());
    incidentMarkersRef.current = [];

    if (!activeLayers.incidentReports) return;

    incidents.forEach((report) => {
      const lat = report.location?.lat;
      const lng = report.location?.lng;

      if (!lng || !lat) return;

      const markerEl = document.createElement("div");
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500 border-2 border-white shadow-lg";
      const markerRoot = createRoot(markerEl);
      markerRoot.render(<FaTriangleExclamation className="text-white text-[15px]" />);

      const popupEl = document.createElement("div");
      const popupRoot = createRoot(popupEl);
      popupRoot.render(<IncidentPopup report={report} />);

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "300px",
        closeButton: false,
      }).setDOMContent(popupEl);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      incidentMarkersRef.current.push(marker);
    });
  }, [activeLayers.incidentReports, incidents]);

  // --- NEW: Effect for Response Team moving markers ---
  useEffect(() => {
    if (!mapInstance) return;

    // If the layer is turned off, clear all team markers from the map
    if (!activeLayers.responseTeams) {
      Object.values(teamMarkersRef.current).forEach((marker) => marker.remove());
      teamMarkersRef.current = {};
      return;
    }

    const currentTeamIds = new Set(teams.map((t) => t.id));

    // Cleanup markers for teams that are no longer in the deployed stream
    Object.keys(teamMarkersRef.current).forEach((id) => {
      if (!currentTeamIds.has(id)) {
        teamMarkersRef.current[id].remove();
        delete teamMarkersRef.current[id];
      }
    });

    // Add new markers or update positions of existing ones
    teams.forEach((team) => {
      const lat = team.location?.lat;
      const lng = team.location?.lng;

      if (!lng || !lat) return;

      if (teamMarkersRef.current[team.id]) {
        // Smoothly move the existing marker without recreating it
        teamMarkersRef.current[team.id].setLngLat([lng, lat]);
      } else {
        // Create a new marker for newly deployed teams
        const markerEl = document.createElement("div");
        markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg transition-transform duration-300";
        const markerRoot = createRoot(markerEl);
        markerRoot.render(<FaShieldAlt className="text-white text-[15px]" />);

        const popupEl = document.createElement("div");
        const popupRoot = createRoot(popupEl);
        popupRoot.render(<TeamPopup team={team} />);

        const popup = new mapboxgl.Popup({
          offset: 25,
          maxWidth: "300px",
          closeButton: false,
          closeOnClick: true,
        }).setDOMContent(popupEl);

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapInstance);

        teamMarkersRef.current[team.id] = marker;
      }
    });
  }, [activeLayers.responseTeams, teams, mapInstance]);
  
  // Effect for drawing the route
  useEffect(() => {
    if (!mapInstance) return;

    const sourceId = "route-source";
    const layerId = "route-layer";

    if (!routeData) {
      if (mapInstance.getSource(sourceId)) {
        mapInstance.getSource(sourceId).setData({ type: "FeatureCollection", features: [] });
      }
      return;
    }

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: routeData.geometry,
    };

    if (mapInstance.getSource(sourceId)) {
      mapInstance.getSource(sourceId).setData(geojson);
    } else {
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

    const coordinates = routeData.geometry.coordinates;
    const bounds = coordinates.reduce((b, coord) => {
      return b.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    mapInstance.fitBounds(bounds, { padding: 60, duration: 1000 });

  }, [mapInstance, routeData]);

  // Effect for Live Routing Updates
  useEffect(() => {
    if (!nearestShelter || !currentLocation || !isTracking || pinnedLocation) return;

    const currentCoords = {
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
    };

    const distanceInMeters = getDistance(currentCoords, nearestShelter);
    const formattedDistance =
      distanceInMeters >= 1000
        ? `${(distanceInMeters / 1000).toFixed(1)} km`
        : `${Math.round(distanceInMeters)} meters`;
        
    setDistanceInfo(formattedDistance);

    if (lastRouteFetchLocation.current) {
      const distanceFromLastFetch = getDistance(currentCoords, lastRouteFetchLocation.current);
      if (distanceFromLastFetch < 25) return; 
    }

    lastRouteFetchLocation.current = currentCoords;
    getDirections(
      { lat: currentCoords.latitude, lng: currentCoords.longitude },
      { lat: nearestShelter.latitude, lng: nearestShelter.longitude }
    )
      .then((route) => setRouteData(route))
      .catch((err) => console.error("Live route update failed", err));

  }, [currentLocation, nearestShelter, isTracking, pinnedLocation]);

  const handleRecenter = () => {
    if (!mapRef.current) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);

        mapRef.current.flyTo({
          center: [coords.lng, coords.lat],
          zoom: ZOOM,
          duration: 1200,
        });
      },
      (error) => {
        console.warn("Unable to get current location", error);
        if (currentLocation) {
          mapRef.current.flyTo({
            center: [currentLocation.lng, currentLocation.lat],
            zoom: ZOOM,
            duration: 1200,
          });
        } else {
          alert("Unable to refresh your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  const handleRouteToSpecificShelter = async (targetShelter) => {
    const { currentLocation: latestCurrent, pinnedLocation: latestPinned } = latestLocations.current;
    const activeLocation = latestPinned || latestCurrent;
    
    if (!activeLocation) {
      alert("Please enable location services or pin your current location on the map.");
      return;
    }

    const currentCoords = {
      latitude: activeLocation.lat,
      longitude: activeLocation.lng,
    };

    const formattedTarget = {
      ...targetShelter,
      latitude: targetShelter.location?.lat,
      longitude: targetShelter.location?.lng,
    };

    if (!formattedTarget.latitude || !formattedTarget.longitude) {
      alert("This shelter is missing location data.");
      return;
    }

    try {
      if (!latestPinned) {
        startLiveTracking();
        lastRouteFetchLocation.current = currentCoords;
      }

      const route = await getDirections(
        { lat: currentCoords.latitude, lng: currentCoords.longitude },
        { lat: formattedTarget.latitude, lng: formattedTarget.longitude }
      );

      const distanceInMeters = getDistance(currentCoords, formattedTarget);
      const formattedDistance =
        distanceInMeters >= 1000
          ? `${(distanceInMeters / 1000).toFixed(1)} km`
          : `${Math.round(distanceInMeters)} meters`;

      setNearestShelter(formattedTarget);
      setDistanceInfo(formattedDistance);
      setRouteData(route);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [formattedTarget.longitude, formattedTarget.latitude],
          zoom: 15,
          duration: 1200,
        });

        const popups = document.getElementsByClassName("mapboxgl-popup");
        if (popups.length > 0) {
          popups[0].remove();
        }
      }
    } catch (error) {
      console.error("Failed to calculate directions", error);
      alert("Could not calculate a route to this shelter. Please try again.");
    }
  };

  const handleFindShelter = async () => {
    const activeLocation = pinnedLocation || currentLocation;
    if(!activeLocation) {
      alert(
        "Please enable location services or pin your current location on the map."
      );
      return;
    }

    if (shelters.length === 0) {
      alert("Loading shelters. Please wait a moment and try again.");
      return;
    }

    const currentCoords = {
      latitude: activeLocation.lat,
      longitude: activeLocation.lng
    };
    
    const formattedEvacData = shelters
      .filter((shelter) => shelter.location?.lat && shelter.location?.lng) 
      .map((shelter) => ({
        ...shelter,
        latitude: shelter.location.lat,
        longitude: shelter.location.lng,
      }));

    if (formattedEvacData.length === 0) {
      alert("No valid shelter locations found.");
      return;
    }

    try {
      if (!pinnedLocation) {
        startLiveTracking();
        lastRouteFetchLocation.current = currentCoords;
      }

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

  // --- DYNAMIC HAZARD LEGEND COMPONENT ---
  const renderHazardLegend = () => {
    if (!activeLayers.floodMap && !activeLayers.landslide && !activeLayers.stormSurge) return null;

    let title = "";
    let highLabel = "";
    let medLabel = "";
    let lowLabel = "";

    if (activeLayers.floodMap) {
      title = "5-Yr Flood Hazard";
      highLabel = "High (>1.5m)";
      medLabel = "Medium (0.5-1.5m)";
      lowLabel = "Low (0-0.5m)";
    } else if (activeLayers.stormSurge) {
      title = "Storm Surge Hazard";
      highLabel = "High (>1.5m depth/vel)";
      medLabel = "Medium (0.5-1.5m depth/vel)";
      lowLabel = "Low (0.2-0.5m depth)";
    } else if (activeLayers.landslide) {
      title = "Landslide Hazard";
      highLabel = "High (No Dwelling)";
      medLabel = "Medium (Intervention Req)";
      lowLabel = "Low (Continuous Monitor)";
    }

    return (
      <div className="absolute bottom-8 left-4 z-10 rounded-xl bg-surface p-3 text-xs text-text-primary shadow-xl border border-gray-200/50 pointer-events-none min-w-42.5">
        <h4 className="mb-2 font-bold">{title}</h4>
        
        <div className="mb-1 flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#dc2626] opacity-75 shrink-0"></span> 
          <span>{highLabel}</span>
        </div>
        
        <div className="mb-1 flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#f97316] opacity-75 shrink-0"></span> 
          <span>{medLabel}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#fde047] opacity-75 shrink-0"></span> 
          <span>{lowLabel}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-gray-400 italic font-medium">
          Source: PROJECT NOAH
        </div>
      </div>
    );
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
      <div className="absolute left-0 right-0 top-15 z-10 flex justify-center md:justify-start px-4 pointer-events-none">
        <button
          onClick={handleFindShelter}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-semibold text-bg-primary shadow-xl ring-4 ring-text-primary/20 transition-all active:scale-95"
        >
          <FaHouse size={18} />
          Find Nearest Shelter
        </button>
      </div>

      <NearestShelterCard 
        shelter={nearestShelter} 
        distanceInfo={distanceInfo} 
        onClose={() => {
          setNearestShelter(null);
          setRouteData(null);
          stopLiveTracking();
          lastRouteFetchLocation.current = null;
        }} 
      />

      {/* RENDER HAZARD LEGEND */}
      {renderHazardLegend()}

      {/* Floating Controls */}
      <div className="absolute right-2 bottom-2 z-10 flex flex-col items-end gap-3">
        {/* REMOVE PIN */}
        {pinnedLocation && (
          <button
            onClick={() => {
              setPinnedLocation(undefined);
              setNearestShelter(null);
              setRouteData(null);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-red-500 shadow-lg transition hover:bg-red-50 hover:text-red-600 active:scale-95"
            aria-label="Remove Pin"
          >
            <MdLocationOff className="text-xl" />
          </button>
        )}
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
        height={50} 
      >
        <Layers />
      </BottomSheet>
    </div>
  );
};

export default Map;