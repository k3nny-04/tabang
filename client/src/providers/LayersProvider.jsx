import { createContext, useState } from "react";

const LayersContext = createContext(null);

export const LayersProvider = ({ children }) => {
  const [activeLayers, setActiveLayers] = useState({
    // Markers (Multiple allowed)
    evacShelters: true,
    incidentReports: false,
    responseTeams: false,
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