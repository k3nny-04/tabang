import { createContext, useState, useMemo } from "react";

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [pinnedLocation, setPinnedLocation] = useState(undefined);

  const value = useMemo(
    () => ({
      currentLocation,
      setCurrentLocation,
      pinnedLocation,
      setPinnedLocation,
    }),
    [currentLocation, pinnedLocation]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext };