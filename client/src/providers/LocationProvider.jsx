import { createContext, useState, useMemo, useEffect, useRef } from "react";
import { getAddressFromCoordinates } from "../utils/geocode";

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [pinnedLocation, setPinnedLocation] = useState(undefined);
  const [pinnedAddress, setPinnedAddress] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

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

  const startLiveTracking = () => {
    if (!navigator.geolocation) return;

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading, 
          speed: pos.coords.speed,    
        });
      },
      (error) => {
        console.warn("Live tracking lost", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true, 
        maximumAge: 0,            
        timeout: 5000,           
      }
    );
  };

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const value = useMemo(
    () => ({
      currentLocation,
      setCurrentLocation,
      pinnedLocation,
      setPinnedLocation,
      pinnedAddress,
      isTracking,
      startLiveTracking,
      stopLiveTracking,
    }),
    [currentLocation, pinnedLocation, pinnedAddress, isTracking]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext };