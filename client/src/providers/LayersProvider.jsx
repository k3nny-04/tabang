import { createContext, useState } from "react";

const LayersContext = createContext(null);

export const LayersProvider = ({ children }) => {
  const [activeLayers, setActiveLayers] = useState({
    // Markers (Multiple allowed)
    evacShelters: true,
    incidentReports: true,
    responseTeams: true,
    assignedReports: false,
    // Hazards (Mutually exclusive)
    floodMap: false,
    landslide: false,
    stormSurge: false,
  });

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => {
      const hazards = ["floodMap", "landslide", "stormSurge"];
      const isHazard = hazards.includes(layer);

      if (isHazard) {
        const turningOn = !prev[layer];
        if (turningOn) {
          return {
            ...prev,
            floodMap: layer === "floodMap",
            landslide: layer === "landslide",
            stormSurge: layer === "stormSurge",
          };
        }
      }

      if (layer === "assignedReports" && !prev.assignedReports) {
        return { ...prev, assignedReports: true, incidentReports: false };
      }
      if (layer === "incidentReports" && !prev.incidentReports) {
        return { ...prev, incidentReports: true, assignedReports: false };
      }

      return {
        ...prev,
        [layer]: !prev[layer],
      };
    });
  };

  return (
    <LayersContext.Provider value={{ activeLayers, toggleLayer }}>
      {children}
    </LayersContext.Provider>
  );
};

export { LayersContext };