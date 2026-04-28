import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { FaCrosshairs } from "react-icons/fa";
import { MdLayers } from "react-icons/md";
import { FaHouse, FaTriangleExclamation } from "react-icons/fa6";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Shield, Truck, AlertCircle } from "lucide-react";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import { getDistance } from "geolib";
import { getDirections } from "../utils/directions";

import BottomSheet from "./BottomSheet";
import Layers from "./Layers";
import ShelterPopup from "./popups/ShelterPopup";
import IncidentPopup from "./popups/IncidentPopup";
import NearestShelterCard from "./NearestShelterCard";
import IncidentCard from "./IncidentCard";

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
  const { currentLocation, startLiveTracking, stopLiveTracking } =
    useLocationContext();

  const currentMarkerRef = useRef(null);
  const lastRenderedLocRef = useRef(null);
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
  const [routeData, setRouteData] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const lastBroadcastLocationRef = useRef(null);
  const broadcastInProgressRef = useRef(false);

  // --- ROUTING STATES ---
  const [targetShelter, setTargetShelter] = useState(null);
  const [targetIncident, setTargetIncident] = useState(null);

  // --- LIVE ROUTING STATES (ADDED) ---
  const [liveDistanceStr, setLiveDistanceStr] = useState(null);
  const [liveDistanceMeters, setLiveDistanceMeters] = useState(null);
  const lastRouteFetchLocation = useRef(null);

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

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

      if (!mapRef.current.getSource("naga-boundary")) {
        mapRef.current.addSource("naga-boundary", {
          type: "geojson",
          data: nagaBoundary,
        });
        mapRef.current.addLayer({
          id: "naga-outline",
          type: "line",
          source: "naga-boundary",
          paint: { "line-color": "#1c1c1e", "line-width": 0.2 },
        });
      }

      mapRef.current.addSource("noah-flood", {
        type: "vector",
        url: "mapbox://kenny04.3ap67c3z",
      });
      mapRef.current.addLayer({
        id: "camarines-sur-flood-5yr",
        type: "fill",
        source: "noah-flood",
        "source-layer": "CamarinesSur-2bt53o",
        layout: { visibility: activeLayers.floodMap ? "visible" : "none" },
        paint: {
          "fill-color": [
            "match",
            ["get", "Var"],
            1,
            "#fde047",
            2,
            "#f97316",
            3,
            "#dc2626",
            "transparent",
          ],
          "fill-opacity": 0.4,
        },
      });

      mapRef.current.addSource("noah-landslide", {
        type: "vector",
        url: "mapbox://kenny04.c16t211p",
      });
      mapRef.current.addLayer({
        id: "camarines-sur-landslide",
        type: "fill",
        source: "noah-landslide",
        "source-layer": "CamarinesSur_Landslides-2agkdp",
        layout: { visibility: activeLayers.landslide ? "visible" : "none" },
        paint: {
          "fill-color": [
            "match",
            ["get", "HAZ"],
            1,
            "#fde047",
            2,
            "#f97316",
            3,
            "#dc2626",
            "transparent",
          ],
          "fill-opacity": 0.4,
        },
      });

      mapRef.current.addSource("noah-storm-surge", {
        type: "vector",
        url: "mapbox://kenny04.cbaxvf7y",
      });
      mapRef.current.addLayer({
        id: "camarines-sur-storm-surge",
        type: "fill",
        source: "noah-storm-surge",
        "source-layer": "CamarinesSur_StormSurge-10zspw",
        layout: { visibility: activeLayers.stormSurge ? "visible" : "none" },
        paint: {
          "fill-color": [
            "match",
            ["get", "HAZ"],
            1,
            "#fde047",
            2,
            "#f97316",
            3,
            "#dc2626",
            "transparent",
          ],
          "fill-opacity": 0.4,
        },
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainerRef.current)
      resizeObserver.observe(mapContainerRef.current);

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

  // Refs to hold latest handler callbacks — lets marker effects call the
  // current handler without listing it as a dependency (which would cause
  // markers to be torn down and re-created on every GPS tick).
  const handleIncidentRouteRef = useRef(null);
  const handleShelterRouteRef = useRef(null);

  const broadcastTeamLocation = useCallback(
    async (coords) => {
      if (!myTeam?.id || !coords?.lat || !coords?.lng) return;
      if (broadcastInProgressRef.current) return;
      broadcastInProgressRef.current = true;

      try {
        await teamsApi.updateTeam(myTeam.id, {
          location: {
            lat: coords.lat,
            lng: coords.lng,
          },
        });
        lastBroadcastLocationRef.current = coords;
        showToast("Team location broadcasted", "success");
      } catch (error) {
        console.error("Broadcast failed", error);
        showToast("Failed to broadcast location", "error");
      } finally {
        broadcastInProgressRef.current = false;
      }
    },
    [myTeam?.id, showToast],
  );

  const handleStartBroadcast = () => {
    if (!myTeam?.id || myTeam?.status !== "DEPLOYED") {
      showToast("Broadcast is only available for deployed teams", "error");
      return;
    }

    if (!currentLocation) {
      showToast("Waiting for current location...", "error");
      return;
    }

    lastBroadcastLocationRef.current = null;
    setIsBroadcasting(true);
    showToast("Broadcasting team location", "info");
  };

  const handleStopBroadcast = () => {
    setIsBroadcasting(false);
    showToast("Stopped broadcasting location", "info");
  };

  // --- ROUTING HANDLERS ---
  const handleIncidentRoute = useCallback(
    async (report) => {
      if (!currentLocation) {
        showToast("Current location is required to route", "error");
        return;
      }

      const target = report?.location;
      if (!target?.lat || !target?.lng) return;

      try {
        // FIX: Pass objects instead of arrays
        const start = { lat: currentLocation.lat, lng: currentLocation.lng };
        const end = { lat: target.lat, lng: target.lng };
        const route = await getDirections(start, end);

        if (route) {
          setRouteData(route);
          setTargetShelter(null);
          setTargetIncident(report);
          lastRouteFetchLocation.current = {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
          };
          setLayersOpen(false);
        }
      } catch (error) {
        console.error("Failed to calculate incident route", error);
        showToast("Could not generate a route to the incident", "error");
      }
    },
    [currentLocation, showToast],
  );

  const handleShelterRoute = useCallback(
    async (shelter) => {
      if (!currentLocation) {
        showToast("Current location is required to route", "error");
        return;
      }

      const target = shelter?.location;
      if (!target?.lat || !target?.lng) return;

      try {
        // FIX: Pass objects instead of arrays
        const start = { lat: currentLocation.lat, lng: currentLocation.lng };
        const end = { lat: target.lat, lng: target.lng };
        const route = await getDirections(start, end);

        if (route) {
          setRouteData(route);
          setTargetIncident(null);
          setTargetShelter(shelter);
          lastRouteFetchLocation.current = {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
          };
          setLayersOpen(false);
        }
      } catch (error) {
        console.error("Failed to calculate shelter route", error);
        showToast("Could not generate a route to the shelter", "error");
      }
    },
    [currentLocation, showToast],
  );

  // Keep refs current after every render so marker callbacks always call
  // the latest version of these handlers.
  handleIncidentRouteRef.current = handleIncidentRoute;
  handleShelterRouteRef.current = handleShelterRoute;

  const closeRouting = () => {
    setTargetShelter(null);
    setTargetIncident(null);
    setRouteData(null);
    setLiveDistanceStr(null);
    setLiveDistanceMeters(null);
    lastRouteFetchLocation.current = null;
  };

  // --- LIVE ROUTING UPDATES (ADDED) ---
  useEffect(() => {
    const target = targetShelter || targetIncident;
    if (!target || !currentLocation || !routeData) return;

    const currentCoords = {
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
    };

    const targetLoc = target.location || {};
    if (!targetLoc.lat || !targetLoc.lng) return;

    const targetCoords = {
      latitude: targetLoc.lat,
      longitude: targetLoc.lng,
    };

    // 1. Update distance continuously using free local math
    const distanceInMeters = getDistance(currentCoords, targetCoords);
    const formattedDistance =
      distanceInMeters >= 1000
        ? `${(distanceInMeters / 1000).toFixed(1)} km`
        : `${Math.round(distanceInMeters)} meters`;

    setLiveDistanceStr(formattedDistance);
    setLiveDistanceMeters(distanceInMeters);

    // 2. Mapbox API Throttle (Only redraw the blue line if moved 25+ meters)
    if (lastRouteFetchLocation.current) {
      const distanceFromLastFetch = getDistance(
        currentCoords,
        lastRouteFetchLocation.current,
      );
      if (distanceFromLastFetch < 25) return;
    }

    lastRouteFetchLocation.current = currentCoords;

    // 3. Refetch Route
    getDirections(
      { lat: currentCoords.latitude, lng: currentCoords.longitude },
      { lat: targetCoords.latitude, lng: targetCoords.longitude },
    )
      .then((route) => {
        if (route) setRouteData(route);
      })
      .catch((err) => console.error("Live route update failed", err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, targetShelter, targetIncident]);

  useEffect(() => {
    if (!isBroadcasting || !currentLocation || myTeam?.status !== "DEPLOYED")
      return;

    const lastLocation = lastBroadcastLocationRef.current;
    const moved = lastLocation
      ? getDistance(lastLocation, currentLocation)
      : Infinity;
    if (lastLocation && moved < 25) return;

    broadcastTeamLocation(currentLocation);
  }, [broadcastTeamLocation, currentLocation, isBroadcasting, myTeam?.status]);

  // --- ANTI-JITTER LIVE LOCATION MARKER ---
  useEffect(() => {
    if (!mapInstance || !currentLocation) return;

    if (lastRenderedLocRef.current) {
      const distance = getDistance(lastRenderedLocRef.current, currentLocation);
      if (distance < 4) return;
    }

    lastRenderedLocRef.current = currentLocation;

    if (!currentMarkerRef.current) {
      const el = document.createElement("div");
      el.className =
        "relative flex h-8 w-8 items-center justify-center transition-all duration-700 ease-linear";

      el.innerHTML = `
        <div class="absolute top-0 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[6px] border-r-[6px] border-b-8 border-l-transparent border-r-transparent border-b-blue-500 z-10"></div>
        <div class="absolute h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.3)] z-20"></div>
        <div class="absolute h-4 w-4 rounded-full bg-blue-400 animate-ping opacity-75 z-0"></div>
      `;

      currentMarkerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(mapInstance);
    } else {
      currentMarkerRef.current.setLngLat([
        currentLocation.lng,
        currentLocation.lat,
      ]);
    }

    const heading = currentLocation.heading;
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
      currentMarkerRef.current.setRotation(heading);
    }
  }, [currentLocation, mapInstance]);

  // --- DYNAMIC ZOOMING EFFECT ---
  useEffect(() => {
    if (mapInstance && targetCoords) {
      mapInstance.flyTo({
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 16,
        duration: 1500,
      });
    }
  }, [targetCoords, mapInstance]);

  // --- ROUTE DRAWING ---
  useEffect(() => {
    if (!mapInstance) return;

    const sourceId = "responder-route-source";
    const layerId = "responder-route-layer";

    if (!routeData) {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
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
    if (coordinates?.length) {
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
      );
      mapInstance.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  }, [mapInstance, routeData]);

  // --- HAZARD LAYERS VISIBILITY TOGGLE ---
  useEffect(() => {
    if (!mapInstance) return;
    if (mapInstance.getLayer("camarines-sur-flood-5yr")) {
      mapInstance.setLayoutProperty(
        "camarines-sur-flood-5yr",
        "visibility",
        activeLayers.floodMap ? "visible" : "none",
      );
    }
    if (mapInstance.getLayer("camarines-sur-landslide")) {
      mapInstance.setLayoutProperty(
        "camarines-sur-landslide",
        "visibility",
        activeLayers.landslide ? "visible" : "none",
      );
    }
    if (mapInstance.getLayer("camarines-sur-storm-surge")) {
      mapInstance.setLayoutProperty(
        "camarines-sur-storm-surge",
        "visibility",
        activeLayers.stormSurge ? "visible" : "none",
      );
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
      markerEl.className =
        "flex h-9 w-9 items-center justify-center rounded-full bg-green-600 border-2 border-white shadow-lg cursor-pointer";
      createRoot(markerEl).render(<FaHouse className="text-white text-sm" />);
      const popupEl = document.createElement("div");
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" });
      createRoot(popupEl).render(
        <ShelterPopup
          item={item}
          onGoClick={() => {
            handleShelterRouteRef.current(item);
            popup.remove();
          }}
          showGoButton={true}
        />,
      );
      popup.setDOMContent(popupEl);
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);
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
      reportsToRender = incidents.filter(
        (report) =>
          myTeam?.assignedReports?.includes(report.id) ||
          report.assignedTeam === myTeam?.id,
      );
    }

    reportsToRender.forEach((report) => {
      const { lat, lng } = report.location || {};
      if (!lng || !lat) return;
      const markerEl = document.createElement("div");
      const isAssigned = myTeam?.assignedReports?.includes(report.id) || report.assignedTeam === myTeam?.id;
      markerEl.className = `flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer ${
        isAssigned && activeLayers.assignedReports ? "bg-red-500" : "bg-yellow-500"
      }`;
      createRoot(markerEl).render(<FaTriangleExclamation className="text-white text-[15px]" />);
      const popupEl = document.createElement("div");
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" });
      createRoot(popupEl).render(
        <IncidentPopup
          report={report}
          showGoButton={userDoc?.role === "RESPONDER"}
          onGoClick={() => { handleIncidentRouteRef.current(report); popup.remove(); }}
        />
      );
      popup.setDOMContent(popupEl);
      const marker = new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(mapRef.current);
      incidentMarkersRef.current.push(marker);
    });
  }, [
    activeLayers.incidentReports,
    activeLayers.assignedReports,
    incidents,
    myTeam,
    userDoc?.role,
  ]);

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
    if (
      !activeLayers.floodMap &&
      !activeLayers.landslide &&
      !activeLayers.stormSurge
    )
      return null;
    let title, highLabel, medLabel, lowLabel;
    if (activeLayers.floodMap) {
      title = "Flood Map";
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
      <div className="absolute bottom-25 md:bottom-6 left-4 z-10 rounded-xl bg-surface px-3 py-2 text-xs text-text-primary shadow-xl border border-border-light pointer-events-none min-w-36">
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
        <div className="mt-2 pt-2 border-t border-border-light text-[10px] text-text-muted italic font-medium">
          Source: PROJECT NOAH
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
      {/* STYLISH TEAM HEADER */}
      {myTeam && (
        <div className="absolute top-4 left-4 right-4 z-20 md:left-1/2 md:-translate-x-1/2 md:w-[320px]">
          <div className="bg-text-primary rounded-2xl p-4 shadow-md text-surface relative overflow-hidden transition-all duration-300">
            <div className="absolute -right-4 -top-4 text-surface/5 pointer-events-none">
              {myTeam.status === "DEPLOYED" ? (
                <Truck size={80} />
              ) : (
                <Shield size={80} />
              )}
            </div>

            <div className="relative z-10">
              {/* COMPACT TOP ROW (Clickable to Expand/Collapse) */}
              <div
                className="flex justify-between items-center cursor-pointer group"
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              >
                <div className="pr-2">
                  <span className="text-surface/60 text-[9px] font-bold uppercase tracking-wider mb-0.5 block">
                    Mission Control
                  </span>
                  <h2 className="text-lg font-black tracking-wide text-surface leading-tight truncate">
                    {myTeam.teamName || "Unnamed Team"}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface-elevated text-text-primary shrink-0 shadow-sm">
                    {myTeam.status || "STANDBY"}
                  </span>
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-surface/10 text-surface/70 transition-colors group-hover:bg-surface/20 group-hover:text-surface">
                    {isHeaderExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </div>
              </div>

              {/* EXPANDABLE CONTENT */}
              {isHeaderExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface/20">
                    <div className="flex flex-col">
                      <span className="text-surface/60 text-[10px] font-medium uppercase tracking-wider">
                        Assigned Reports
                      </span>
                      <span className="text-base font-bold flex items-center gap-1.5 text-surface mt-0.5">
                        <AlertCircle
                          size={14}
                          className={
                            myTeam.assignedReports?.length > 0
                              ? "text-yellow-400"
                              : "text-surface/40"
                          }
                        />
                        {myTeam.assignedReports?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* CONTRAST FIXED: Changed bg-surface/80 to bg-black/20 */}
                  {myTeam.status === "DEPLOYED" && (
                    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-surface/10 bg-black/20 p-3 shadow-inner">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-surface/60">
                            Location broadcast
                          </p>
                          <p
                            className={`text-xs font-bold mt-0.5 ${isBroadcasting ? "text-emerald-400" : "text-surface/70"}`}
                          >
                            {isBroadcasting
                              ? "Active (25m interval)"
                              : "Broadcast paused"}
                          </p>
                        </div>
                        <button
                          onClick={
                            isBroadcasting
                              ? handleStopBroadcast
                              : handleStartBroadcast
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                            isBroadcasting
                              ? "bg-red-500/90 text-white hover:bg-red-500"
                              : "bg-emerald-500/90 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {isBroadcasting ? "Stop" : "Start"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* RENDER HAZARD LEGEND */}
      {renderHazardLegend()}

      {/* RENDER TARGET CARDS ON BOTTOM */}
      {targetShelter && routeData && (
        <NearestShelterCard
          shelter={targetShelter}
          // Inject the actively updating distance string OR fallback to static mapbox data
          distanceInfo={
            liveDistanceStr || `${(routeData.distance / 1000).toFixed(1)} km`
          }
          onClose={closeRouting}
        />
      )}

      {targetIncident && routeData && (
        <IncidentCard
          incident={targetIncident}
          // Inject dynamically calculated meters into the routeData object so the card can recalculate km automatically
          distanceInfo={{
            ...routeData,
            distance: liveDistanceMeters || routeData.distance,
          }}
          onClose={closeRouting}
        />
      )}

      {/* FLOATING CONTROLS */}
      <div
        className={`absolute right-2 z-10 flex flex-col items-end gap-3 transition-all duration-300 ${targetShelter || targetIncident ? "bottom-64" : "bottom-20 md:bottom-6"}`}
      >
        <button
          onClick={handleRecenter}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label="Recenter"
        >
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
