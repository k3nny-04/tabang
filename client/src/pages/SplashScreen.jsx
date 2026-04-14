import { useState } from "react";
import { Link } from "react-router-dom";
import { WifiOff } from "lucide-react";

const SplashScreen = () => {
  // Carousel Data
  const slides = [
    {
      id: 1,
      image:
        "/rescue.png",
      title: "Rapid disaster response for Naga",
      description:
        "Stay connected when it matters most. Request help and get real-time updates during emergencies",
    },
    {
      id: 2,
      image:
        "/map.png",
      title: "Real-Time Incident Mapping",
      description:
        "Coordinate and view active emergency reports instantly through a live, interactive map",
    },
    {
      id: 3,
      image:
        "/sms.png",
      title: "Offline SMS Reporting",
      description:
        "No internet? No problem. Send emergency requests and receive critical updates via text message",
    },
    {
      id: 4,
      image: "/evac.png",
      title: "Evacuation Shelters",
      description: "Find the nearest active evacuation center and get routes based on your current location"
    },
    {
      id: 5,
      image:
        "/hazard.png",
      title: "Integrated Hazard Maps",
      description:
        "Navigate safely during a crisis. We integrate official hazard maps to help identify dangerous zones for rescue and evacuation",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // Swiped left, go to next slide
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      } else {
        // Swiped right, go to previous slide
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      }
    }
  };

  return (
    // h-dvh ensures it fits exactly within the mobile browser viewport without scrolling
    <div className="relative flex h-dvh w-full flex-col bg-white overflow-hidden md:justify-center md:items-center md:bg-bg-primary">
      {/* Mobile Container limits width on larger screens to simulate app view */}
      <div className="flex h-full w-full flex-col justify-between bg-white md:h-212.5 md:w-100 md:rounded-[2.5rem] md:shadow-2xl md:relative overflow-hidden">
        
        {/* Top Header / Subtle Offline SOS Button */}
        <div className="flex w-full justify-between items-center p-6 z-20 shrink-0">
          <div className="flex items-center gap-1">
            <img
              src="/logo-1c1c1e.png"
              alt="TABANG Logo"
              className="h-6 w-auto"
            />
            <span className="text-md font-black text-text-primary tracking-wide">
              TABANG
            </span>
          </div>
          <Link
            to="/emergency"
            className="flex items-center gap-2 rounded-full border border-border-medium px-3 py-1.5 text-sm font-semibold text-text-muted transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <WifiOff className="h-4.5 w-4.5 opacity-80" />
            Offline Mode
          </Link>
        </div>

        {/* Carousel Section (Grows to take available space) */}
        <div
          className="flex flex-1 flex-col items-center justify-center px-8 w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image */}
          <div className="relative h-56 w-full max-w-70 md:h-64 shrink-0">
            {slides.map((slide, index) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                className={`absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Text Content - FIXED HEIGHT (h-36) prevents layout shifting */}
          <div className="mt-8 h-36 w-full text-center flex flex-col justify-start">
            <h1 className="text-2xl font-black text-text-primary transition-all duration-500">
              {slides[currentSlide].title}
            </h1>
            <p className="mt-3 text-sm font-medium text-text-muted transition-all duration-500 px-2">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Carousel Dots */}
          <div className="mt-2 flex gap-2 shrink-0">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-text-primary"
                    : "w-2.5 bg-border-light"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col gap-3 px-8 pb-10 pt-6 shrink-0 w-full">
          <Link
            to="/login"
            className="w-full rounded-2xl bg-text-primary py-4 text-center text-sm font-bold tracking-wide text-surface shadow-lg transition-transform hover:bg-text-secondary active:scale-[0.98]"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="w-full rounded-2xl bg-bg-secondary py-4 text-center text-sm font-bold tracking-wide text-text-primary transition-transform hover:bg-bg-tertiary active:scale-[0.98]"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;