import { createContext, useState, useMemo, useEffect } from "react";
import { getAddressFromCoordinates } from "../utils/geocode";

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [pinnedLocation, setPinnedLocation] = useState(undefined);
  const [pinnedAddress, setPinnedAddress] = useState("");

  useEffect(() => {
    const fetchAddress = async () => {
      if (pinnedLocation?.lat && pinnedLocation?.lng) {
        setPinnedAddress("Locating address..."); 
        const address = await getAddressFromCoordinates(
          pinnedLocation.lat,
          pinnedLocation.lng
        );
        setPinnedAddress(address ?? "Address not found!");
      } else {
        setPinnedAddress(""); 
      }
    };

    fetchAddress();
  }, [pinnedLocation]);

  const value = useMemo(
    () => ({
      currentLocation,
      setCurrentLocation,
      pinnedLocation,
      setPinnedLocation,
      pinnedAddress
    }),
    [currentLocation, pinnedLocation, pinnedAddress]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext };