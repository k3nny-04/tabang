import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { FaCrosshairs } from "react-icons/fa";
import { MdLayers } from "react-icons/md";
import { FaHouse, FaTriangleExclamation } from "react-icons/fa6";
import { Shield, Truck, AlertCircle } from "lucide-react"; 
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import { getDistance } from "geolib";

import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import ShelterPopup from "./popups/ShelterPopup";
import IncidentPopup from "./popups/IncidentPopup";

import { sheltersApi } from "../api/sheltersApi"; 
import { teamsApi } from "../api/teamsApi"; 
import { reportsApi } from "../api/reportsApi";
import nagaBoundary from "../data/nagaBoundary.json";

// Context Providers
import { useLocationContext } from "../providers/useLocationContext";
import { useToast } from "../providers/useToastContext";
import { useLayers } from "../providers/useLayersContext";
import { useAuthContext } from "../providers/useAuthContext";

const DEFAULT_LOCATION = { lat: 13.623432, lng: 123.192907 };
const ZOOM = 14;
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ResponderMap = ({ targetCoords = null, zoom = ZOOM }) => {
  const { userDoc } = useAuthContext();
  const {
    currentLocation,
    startLiveTracking,
    stopLiveTracking,
  } = useLocationContext();

  const currentMarkerRef = useRef(null);
  const lastRenderedLocRef = useRef(null); // Ref to store last drawn position
  const { showToast } = useToast();

  // Map States
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const initialized = useRef(false);

  // Layer & Data States
  const evacMarkersRef = useRef([]);
  const incidentMarkersRef = useRef([]);
  const { activeLayers } = useLayers();
  const [layersOpen, setLayersOpen] = useState(false);
  
  // Streams State
  const [myTeam, setMyTeam] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);

  // --- START LIVE TRACKING ON MOUNT ---
  useEffect(() => {
    startLiveTracking();
    return () => stopLiveTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API STREAMS ---
  useEffect(() => {
    const unsubShelters = sheltersApi.streamActiveShelters(setShelters);
    const unsubReports = reportsApi.streamNonResolvedReports(setIncidents);

    let unsubMyTeam = null;
    if (userDoc?.teamId) {
      unsubMyTeam = teamsApi.streamTeam(userDoc.teamId, (data) => {
        setMyTeam(data);
      });
    }

    return () => {
      if (unsubShelters) unsubShelters();
      if (unsubReports) unsubReports();
      if (unsubMyTeam) unsubMyTeam();
    };
  }, [userDoc?.teamId]);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (initialized.current || !mapContainerRef.current) return;
    initialized.current = true;

    const initialCenter = targetCoords || DEFAULT_LOCATION;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: targetCoords ? 16 : zoom,
    });

    mapRef.current.on("load", () => {
      setMapInstance(mapRef.current);

      // Add Boundaries & Hazards...
      if (!mapRef.current.getSource('naga-boundary')) {
        mapRef.current.addSource('naga-boundary', { type: 'geojson', data: nagaBoundary });
        mapRef.current.addLayer({
          id: 'naga-outline', type: 'line', source: 'naga-boundary',
          paint: { 'line-color': '#1c1c1e', 'line-width': 0.2 }
        });
      }
      
      // Flood
      mapRef.current.addSource('noah-flood', { type: 'vector', url: 'mapbox://kenny04.3ap67c3z' });
      mapRef.current.addLayer({
        id: 'camarines-sur-flood-5yr', type: 'fill', source: 'noah-flood', 'source-layer': 'CamarinesSur-2bt53o', 
        layout: { 'visibility': activeLayers.floodMap ? 'visible' : 'none' },
        paint: { 'fill-color': ['match', ['get', 'Var'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'], 'fill-opacity': 0.4 }
      });

      // Landslide
      mapRef.current.addSource('noah-landslide', { type: 'vector', url: 'mapbox://kenny04.c16t211p' });
      mapRef.current.addLayer({
        id: 'camarines-sur-landslide', type: 'fill', source: 'noah-landslide', 'source-layer': 'CamarinesSur_Landslides-2agkdp', 
        layout: { 'visibility': activeLayers.landslide ? 'visible' : 'none' },
        paint: { 'fill-color': ['match', ['get', 'HAZ'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'], 'fill-opacity': 0.4 }
      });

      // Storm Surge
      mapRef.current.addSource('noah-storm-surge', { type: 'vector', url: 'mapbox://kenny04.cbaxvf7y' });
      mapRef.current.addLayer({
        id: 'camarines-sur-storm-surge', type: 'fill', source: 'noah-storm-surge', 'source-layer': 'CamarinesSur_StormSurge-10zspw', 
        layout: { 'visibility': activeLayers.stormSurge ? 'visible' : 'none' },
        paint: { 'fill-color': ['match', ['get', 'HAZ'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'], 'fill-opacity': 0.4 }
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainerRef.current) resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      initialized.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ANTI-JITTER LIVE LOCATION MARKER ---
  useEffect(() => {
    if (!mapInstance || !currentLocation) return;

    // Filter out micro GPS drifts (ignore movements less than 4 meters)
    if (lastRenderedLocRef.current) {
      const distance = getDistance(lastRenderedLocRef.current, currentLocation);
      if (distance < 25) return; // Skip updating the marker visually
    }
    
    // Valid movement detected, update the reference
    lastRenderedLocRef.current = currentLocation;

    if (!currentMarkerRef.current) {
      const el = document.createElement("div");
      // Added transition-all to smoothly glide the marker when it does move
      el.className = "relative flex h-8 w-8 items-center justify-center transition-all duration-700 ease-linear"; 
      
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
    } else {
      currentMarkerRef.current.setLngLat([currentLocation.lng, currentLocation.lat]);
    }

    const heading = currentLocation.heading;
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
      currentMarkerRef.current.setRotation(heading);
    }
  }, [currentLocation, mapInstance]);

  // --- DYNAMIC ZOOMING EFFECT (From Side Panel) ---
  useEffect(() => {
    if (mapInstance && targetCoords) {
      mapInstance.flyTo({
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 16,
        duration: 1500,
      });
    }
  }, [targetCoords, mapInstance]);

  // --- HAZARD LAYERS VISIBILITY TOGGLE ---
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
  }, [mapInstance, activeLayers]);

  // --- MARKERS: EVACUATION SHELTERS ---
  useEffect(() => {
    if (!mapRef.current) return;
    evacMarkersRef.current.forEach((marker) => marker.remove());
    evacMarkersRef.current = [];
    if (!activeLayers.evacShelters) return;

    shelters.forEach((item) => {
      const { lat, lng } = item.location || {};
      if (!lng || !lat) return; 
      const markerEl = document.createElement("div");
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-green-600 border-2 border-white shadow-lg cursor-pointer";
      createRoot(markerEl).render(<FaHouse className="text-white text-sm" />);
      const popupEl = document.createElement("div");
      createRoot(popupEl).render(<ShelterPopup item={item} />); 
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" }).setDOMContent(popupEl);
      const marker = new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(mapRef.current);
      evacMarkersRef.current.push(marker);
    });
  }, [activeLayers.evacShelters, shelters]); 

  // --- MARKERS: INCIDENT REPORTS ---
  useEffect(() => {
    if (!mapRef.current) return;
    incidentMarkersRef.current.forEach((marker) => marker.remove());
    incidentMarkersRef.current = [];
    
    if (!activeLayers.incidentReports && !activeLayers.assignedReports) return;

    let reportsToRender = incidents;
    if (activeLayers.assignedReports) {
      reportsToRender = incidents.filter(report => 
        myTeam?.assignedReports?.includes(report.id) || report.assignedTeam === myTeam?.id
      );
    }

    reportsToRender.forEach((report) => {
      const { lat, lng } = report.location || {};
      if (!lng || !lat) return;
      const markerEl = document.createElement("div");
      // Optional: Change marker color based on assigned status to make it distinct
      const isAssigned = myTeam?.assignedReports?.includes(report.id) || report.assignedTeam === myTeam?.id;
      markerEl.className = `flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer ${
        isAssigned && activeLayers.assignedReports ? "bg-red-500" : "bg-yellow-500"
      }`;
      createRoot(markerEl).render(<FaTriangleExclamation className="text-white text-[15px]" />);
      const popupEl = document.createElement("div");
      createRoot(popupEl).render(<IncidentPopup report={report} />);
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" }).setDOMContent(popupEl);
      const marker = new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(mapRef.current);
      incidentMarkersRef.current.push(marker);
    });
  }, [activeLayers.incidentReports, activeLayers.assignedReports, incidents, myTeam]);

  // --- ACTIONS ---
  const handleRecenter = () => {
    if (!mapRef.current) return;

    if (!navigator.geolocation) {
      showToast("Geolocation is not available", "error");
      return;
    }

    if (currentLocation) {
      mapRef.current.flyTo({
        center: [currentLocation.lng, currentLocation.lat],
        zoom: ZOOM,
        duration: 1200,
      });
    } else {
      showToast("Waiting for live tracking data...", "info"); 
    }
  };

  const renderHazardLegend = () => {
    if (!activeLayers.floodMap && !activeLayers.landslide && !activeLayers.stormSurge) return null;
    let title, highLabel, medLabel, lowLabel;
    if (activeLayers.floodMap) {
      title = "Flood Map"; highLabel = "High (>1.5m)"; medLabel = "Medium (0.5-1.5m)"; lowLabel = "Low (0-0.5m)";
    } else if (activeLayers.stormSurge) {
      title = "Storm Surge Hazard"; highLabel = "High (>1.5m depth/vel)"; medLabel = "Medium (0.5-1.5m depth/vel)"; lowLabel = "Low (0.2-0.5m depth)";
    } else if (activeLayers.landslide) {
      title = "Landslide Hazard"; highLabel = "High (No Dwelling)"; medLabel = "Medium (Intervention Req)"; lowLabel = "Low (Continuous Monitor)";
    }
    return (
      <div className="absolute bottom-25 md:bottom-6 left-4 z-10 rounded-xl bg-surface px-3 py-2 text-xs text-text-primary shadow-xl border border-border-light pointer-events-none min-w-36">
        <h4 className="mb-2 font-bold">{title}</h4>
        <div className="mb-1 flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#dc2626] opacity-75 shrink-0"></span><span>{highLabel}</span></div>
        <div className="mb-1 flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#f97316] opacity-75 shrink-0"></span><span>{medLabel}</span></div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#fde047] opacity-75 shrink-0"></span><span>{lowLabel}</span></div>
        <div className="mt-2 pt-2 border-t border-border-light text-[10px] text-text-muted italic font-medium">Source: PROJECT NOAH</div>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
      
      {/* STYLISH TEAM HEADER */}
      {myTeam && (
        <div className="absolute top-4 left-4 right-4 z-20 md:left-1/2 md:-translate-x-1/2 md:w-[320px]">
          <div className="bg-text-primary rounded-2xl p-4 shadow-md text-surface relative overflow-hidden transition-all duration-300">
            
            {/* Decorative background element (Scaled down) */}
            <div className="absolute -right-4 -top-4 text-surface/5 pointer-events-none">
              {myTeam.status === "DEPLOYED" ? <Truck size={80} /> : <Shield size={80} />}
            </div>
            
            <div className="relative z-10">
              {/* Top Row: Title & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="pr-2">
                  <span className="text-surface/60 text-[9px] font-bold uppercase tracking-wider mb-0.5 block">
                    Mission Control
                  </span>
                  <h2 className="text-lg font-black tracking-wide text-surface leading-tight truncate">
                    {myTeam.teamName || "Unnamed Team"}
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface-elevated text-text-primary shrink-0">
                  {myTeam.status || "STANDBY"}
                </span>
              </div>

              {/* Bottom Row: Detailed Stats Divider (Live Status Removed) */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface/20">
                <div className="flex flex-col">
                  <span className="text-surface/60 text-[10px] font-medium uppercase tracking-wider">
                    Assigned Reports
                  </span>
                  <span className="text-base font-bold flex items-center gap-1.5 text-surface mt-0.5">
                    <AlertCircle 
                      size={14} 
                      className={myTeam.assignedReports?.length > 0 ? "text-yellow-400" : "text-surface/40"} 
                    /> 
                    {myTeam.assignedReports?.length || 0}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* RENDER HAZARD LEGEND */}
      {renderHazardLegend()}

      {/* FLOATING CONTROLS */}
      <div className="absolute right-2 bottom-20 md:bottom-6 z-10 flex flex-col items-end gap-3">
        <button
          onClick={handleRecenter}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label="Recenter"
        >
          {/* Changed color from conditional blue to text-text-primary */}
          <FaCrosshairs className="text-xl text-text-primary" />
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
        height={65} 
      >
        <Layers isResponder={true} />
      </BottomSheet>
    </div>
  );
};

export default ResponderMap;