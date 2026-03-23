import { useState } from "react";
import { useLocationContext } from "../providers/useLocationContext";
import { MapPin } from "lucide-react";

const LocationOnboarding = () => {
  const { setCurrentLocation } = useLocationContext();
  const [isOpen, setIsOpen] = useState(() => {
    const hasAsked = localStorage.getItem("location_asked");
    return !hasAsked; 
  });
  
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowLocation = () => {
    setIsRequesting(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        localStorage.setItem("location_asked", "true");
        setIsOpen(false);
      },
      (error) => {
        console.error(error)
        setIsRequesting(false);
        localStorage.setItem("location_asked", "true"); 
        setIsOpen(false); 
      }
    );
  };

  const handleSkip = () => {
    localStorage.setItem("location_asked", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <MapPin size={32} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            Find Nearest Shelters
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            To instantly route you to safety during an emergency, we need your permission to access your device's location.
          </p>
          
          <button
            onClick={handleAllowLocation}
            disabled={isRequesting}
            className="mb-3 w-full rounded-xl bg-text-primary py-3 font-semibold text-bg-primary transition active:scale-95 disabled:opacity-70"
          >
            {isRequesting ? "Waiting for permission..." : "Enable Location"}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-sm font-medium text-text-muted transition hover:text-text-primary"
          >
            Skip, I'll pin my location manually
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default LocationOnboarding;