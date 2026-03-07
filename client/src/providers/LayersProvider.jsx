import { createContext, useState } from "react";

const LayersContext = createContext(null);

export const LayersProvider = ({ children }) => {
  const [activeLayers, setActiveLayers] = useState({
    evacShelters: false,
  });

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  return (
    <LayersContext.Provider
      value={{ activeLayers, toggleLayer }}
    >
      {children}
    </LayersContext.Provider>
  );
};

export { LayersContext };