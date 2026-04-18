import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { FaCrosshairs, FaShieldAlt } from "react-icons/fa";
import { MdLayers } from "react-icons/md";
import { SearchBox } from "@mapbox/search-js-react";
import { FaHouse, FaTriangleExclamation } from "react-icons/fa6";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import { useLayers } from "../providers/useLayersContext";

import ShelterPopup from "./popups/ShelterPopup";
import TeamPopup from "./popups/TeamPopup";
import IncidentPopup from "./popups/IncidentPopup";

import { sheltersApi } from "../api/sheltersApi"; 
import { teamsApi } from "../api/teamsApi"; 
import { reportsApi } from "../api/reportsApi";
import nagaBoundary from "../data/nagaBoundary.json";

const DEFAULT_NAGA_COORDS = { lat: 13.623432, lng: 123.192907 };
const DEFAULT_ZOOM = 13;
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const AdminMap = ({ targetCoords = null, zoom = DEFAULT_ZOOM }) => {
  // Map States
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const initialized = useRef(false);

  // Layer & Data States
  const evacMarkersRef = useRef([]);
  const incidentMarkersRef = useRef([]);
  const teamMarkersRef = useRef({});
  const { activeLayers } = useLayers();
  const [layersOpen, setLayersOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Streams State
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]); 

  // --- API STREAMS ---
  useEffect(() => {
    const unsubShelters = sheltersApi.streamActiveShelters(setShelters);
    const unsubTeams = teamsApi.streamDeployedTeams(setTeams);
    const unsubReports = reportsApi.streamNonResolvedReports(setIncidents);

    return () => {
      if (unsubShelters) unsubShelters();
      if (unsubTeams) unsubTeams();
      if (unsubReports) unsubReports();
    };
  }, []);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (initialized.current || !mapContainerRef.current) return;
    initialized.current = true;

    const initialCenter = targetCoords || DEFAULT_NAGA_COORDS;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: targetCoords ? 15 : zoom,
    });

    mapRef.current.on("load", () => {
      setMapInstance(mapRef.current);

      // --- ADD NAGA BOUNDARY ---
      if (!mapRef.current.getSource('naga-boundary')) {
        mapRef.current.addSource('naga-boundary', {
          type: 'geojson',
          data: nagaBoundary 
        });

        mapRef.current.addLayer({
          id: 'naga-outline',
          type: 'line',
          source: 'naga-boundary',
          paint: {
            'line-color': '#1c1c1e', 
            'line-width': 0.2,
          }
        });
      }
      
      // --- ADD HAZARDS (Flood, Landslide, Storm Surge) ---
      // Flood
      mapRef.current.addSource('noah-flood', { type: 'vector', url: 'mapbox://kenny04.3ap67c3z' });
      mapRef.current.addLayer({
        id: 'camarines-sur-flood-5yr',
        type: 'fill',
        source: 'noah-flood',
        'source-layer': 'CamarinesSur-2bt53o', 
        layout: { 'visibility': activeLayers.floodMap ? 'visible' : 'none' },
        paint: {
          'fill-color': ['match', ['get', 'Var'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'],
          'fill-opacity': 0.4
        }
      });

      // Landslide
      mapRef.current.addSource('noah-landslide', { type: 'vector', url: 'mapbox://kenny04.c16t211p' });
      mapRef.current.addLayer({
        id: 'camarines-sur-landslide',
        type: 'fill',
        source: 'noah-landslide',
        'source-layer': 'CamarinesSur_Landslides-2agkdp', 
        layout: { 'visibility': activeLayers.landslide ? 'visible' : 'none' },
        paint: {
          'fill-color': ['match', ['get', 'HAZ'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'],
          'fill-opacity': 0.4
        }
      });

      // Storm Surge
      mapRef.current.addSource('noah-storm-surge', { type: 'vector', url: 'mapbox://kenny04.cbaxvf7y' });
      mapRef.current.addLayer({
        id: 'camarines-sur-storm-surge',
        type: 'fill',
        source: 'noah-storm-surge',
        'source-layer': 'CamarinesSur_StormSurge-10zspw', 
        layout: { 'visibility': activeLayers.stormSurge ? 'visible' : 'none' },
        paint: {
          'fill-color': ['match', ['get', 'HAZ'], 1, '#fde047', 2, '#f97316', 3, '#dc2626', 'transparent'],
          'fill-opacity': 0.4
        }
      });
    });

    // --- RESIZE OBSERVER TO FIX BLANK SPACES ON SIDEBAR TOGGLE ---
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Cleanup: Extremely important for Mapbox billing
    return () => {
      resizeObserver.disconnect(); // Clean up observer
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      initialized.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- DYNAMIC ZOOMING EFFECT ---
  // If targetCoords changes (e.g. Admin clicks a table row), fly to the new coordinates
  useEffect(() => {
    if (mapInstance && targetCoords) {
      mapInstance.flyTo({
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 16,
        duration: 1500,
      });
    }
  }, [targetCoords, mapInstance]);

  // --- TOGGLE ALL HAZARD LAYERS VISIBILITY ---
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
      createRoot(popupEl).render(<ShelterPopup item={item} />); // Removed routing logic

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

    if (!activeLayers.incidentReports) return;

    incidents.forEach((report) => {
      const { lat, lng } = report.location || {};
      if (!lng || !lat) return;

      const markerEl = document.createElement("div");
      markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500 border-2 border-white shadow-lg cursor-pointer";
      createRoot(markerEl).render(<FaTriangleExclamation className="text-white text-[15px]" />);

      const popupEl = document.createElement("div");
      createRoot(popupEl).render(<IncidentPopup report={report} />);

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" }).setDOMContent(popupEl);
      const marker = new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(mapRef.current);
      incidentMarkersRef.current.push(marker);
    });
  }, [activeLayers.incidentReports, incidents]);

  // --- MARKERS: RESPONSE TEAMS ---
  useEffect(() => {
    if (!mapInstance) return;

    if (!activeLayers.responseTeams) {
      Object.values(teamMarkersRef.current).forEach((m) => m.remove());
      teamMarkersRef.current = {};
      return;
    }

    const currentTeamIds = new Set(teams.map((t) => t.id));
    Object.keys(teamMarkersRef.current).forEach((id) => {
      if (!currentTeamIds.has(id)) {
        teamMarkersRef.current[id].remove();
        delete teamMarkersRef.current[id];
      }
    });

    teams.forEach((team) => {
      const { lat, lng } = team.location || {};
      if (!lng || !lat) return;

      if (teamMarkersRef.current[team.id]) {
        teamMarkersRef.current[team.id].setLngLat([lng, lat]);
      } else {
        const markerEl = document.createElement("div");
        markerEl.className = "flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg transition-transform duration-300 cursor-pointer";
        createRoot(markerEl).render(<FaShieldAlt className="text-white text-[15px]" />);

        const popupEl = document.createElement("div");
        createRoot(popupEl).render(<TeamPopup team={team} />);

        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" }).setDOMContent(popupEl);
        const marker = new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(mapInstance);
        teamMarkersRef.current[team.id] = marker;
      }
    });
  }, [activeLayers.responseTeams, teams, mapInstance]);

  // --- ACTIONS ---
  const handleRecenter = () => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: [DEFAULT_NAGA_COORDS.lng, DEFAULT_NAGA_COORDS.lat],
      zoom: DEFAULT_ZOOM,
      duration: 1200,
    });
  };

  // --- DYNAMIC HAZARD LEGEND COMPONENT ---
  const renderHazardLegend = () => {
    if (!activeLayers.floodMap && !activeLayers.landslide && !activeLayers.stormSurge) return null;

    let title, highLabel, medLabel, lowLabel;

    if (activeLayers.floodMap) {
      title = "Flood Map (100-Year Return)";
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
      <div className="absolute bottom-6 left-4 z-10 rounded-xl bg-white px-3 py-2 text-xs text-gray-800 shadow-xl border border-gray-200/50 pointer-events-none min-w-36">
        <h4 className="mb-2 font-bold">{title}</h4>
        <div className="mb-1 flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#dc2626] opacity-75 shrink-0"></span><span>{highLabel}</span></div>
        <div className="mb-1 flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#f97316] opacity-75 shrink-0"></span><span>{medLabel}</span></div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#fde047] opacity-75 shrink-0"></span><span>{lowLabel}</span></div>
        <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-gray-400 italic font-medium">Source: PROJECT NOAH</div>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
      
      {/* SEARCH BAR (Kept in case Admins need to search up an address) */}
      {mapInstance && (
        <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
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
                colorBackground: '#ffffff', 
                colorText: '#1c1c1e',      
                colorPrimary: '#1c1c1e',   
                borderRadius: '0.5rem',     
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
              },
            }}
          />
        </div>
      )}
      
      {/* MAP CONTAINER - Changed to absolute inset-0 to prevent blank spaces */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* RENDER HAZARD LEGEND */}
      {renderHazardLegend()}

      {/* FLOATING CONTROLS */}
      <div className="absolute right-4 bottom-6 z-10 flex flex-col items-end gap-3">
        {/* RECENTER TO NAGA */}
        <button
          onClick={handleRecenter}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md border border-gray-200 transition hover:bg-gray-50 active:scale-95"
          aria-label="Recenter to Naga"
          title="Recenter to Naga City"
        >
          <FaCrosshairs className="text-lg" />
        </button>
        {/* LAYERS TOGGLE */}
        <button
          onClick={() => setLayersOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md transition hover:opacity-90 active:scale-95"
          aria-label="Map Layers"
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
        <Layers />
      </BottomSheet>
    </div>
  );
};

export default AdminMap;