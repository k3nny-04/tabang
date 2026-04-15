import { useState } from "react";
import { useLocationContext } from "../../providers/useLocationContext";
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
      <div className="w-full max-w-100 rounded-[2.5rem] bg-surface p-8 shadow-2xl">
        
        <div className="flex flex-col items-center text-center">
          
          {/* Icon Container */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary text-text-primary">
            <MapPin size={36} strokeWidth={2.5} />
          </div>
          
          {/* Text Content */}
          <h2 className="text-2xl font-black text-text-primary transition-all duration-500">
            Find Nearest Shelters
          </h2>
          <p className="mt-3 mb-8 text-sm font-medium text-text-muted transition-all duration-500 px-2">
            To instantly route you to safety during an emergency, we need your permission to access your device's location.
          </p>
          
          {/* Bottom Action Buttons */}
          <div className="flex w-full flex-col gap-3">
            <button
              onClick={handleAllowLocation}
              disabled={isRequesting}
              className="w-full rounded-2xl bg-text-primary py-4 text-center text-sm font-bold tracking-wide text-surface shadow-lg transition-transform hover:bg-text-secondary active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isRequesting ? "Waiting for permission..." : "Enable Location"}
            </button>
            
            <button
              onClick={handleSkip}
              disabled={isRequesting}
              className="w-full rounded-2xl bg-bg-secondary py-4 text-center text-sm font-bold tracking-wide text-text-primary transition-transform hover:bg-bg-tertiary active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              Skip, I'll pin it manually
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LocationOnboarding;