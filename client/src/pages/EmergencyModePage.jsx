import { useState, useEffect } from "react";
import { 
  FaMapMarkerAlt, 
  FaUser, 
  FaWater,
  FaFire,
  FaHouseDamage,
  FaFirstAid,
  FaPaperPlane,
  FaSyncAlt,
  FaArrowLeft,
  FaCarCrash
} from "react-icons/fa";
import { RiCriminalFill } from "react-icons/ri";
import { useLocationContext } from "../providers/useLocationContext";
import { useToast } from "../providers/useToastContext";

const INCIDENT_TYPES = [
  { name: "Flood", icon: FaWater },
  { name: "Fire", icon: FaFire },
  { name: "Earthquake", icon: FaHouseDamage },
  { name: "Medical", icon: FaFirstAid },
  { name: "Crime", icon:  RiCriminalFill}, 
  { name: "Accident", icon: FaCarCrash }
];

const PEOPLE_RANGES = [
  { val: "1-3", label: "Person" },
  { val: "4-7", label: "People" },
  { val: "8-15", label: "Group" },
  { val: "16+", label: "Mass" }
];

const EMERGENCY_NUMBER = "+639260087068"; 

const EmergencyModePage = ({ onSuccess, handleReset: parentReset, onBack }) => {
  const { currentLocation, setCurrentLocation } = useLocationContext();
  const { showToast } = useToast();
  const [locating, setLocating] = useState(false);
  
  const [form, setForm] = useState({
    reportType: "RESCUE",
    description: "", 
    numberOfPeople: "",
    contactName: "", 
  });

  useEffect(() => {
    if (!currentLocation) {
      handleGetLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        });
        setLocating(false);
      },
      (err) => {
        console.warn("Location failed", err);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleReset = () => {
    setForm({ reportType: "RESCUE", description: "", numberOfPeople: "", contactName: "" });
    if (parentReset) parentReset();
  };

  const handleSubmit = () => {
    if (!currentLocation) return showToast("No location acquired. Please ensure GPS is active.", "error");
    if (!form.contactName.trim()) return showToast("Please provide a contact name.", "error");
    if (!form.description) return showToast("Please select an incident type.", "error");
    if (!form.numberOfPeople) return showToast("Please select the number of people.", "error");

    const locString = `${currentLocation.lat.toFixed(5)},${currentLocation.lng.toFixed(5)}`;
    
    const name = form.contactName.trim().toUpperCase();
    const incidentType = `${form.description.toUpperCase()}-${name}`;
    const peopleCount = form.numberOfPeople;
    
    const smsMessage = `SOS|${incidentType}|${peopleCount}|${locString}`;
    
    const smsLink = `sms:${EMERGENCY_NUMBER}?body=${encodeURIComponent(smsMessage)}`;

    window.location.href = smsLink;
    
    handleReset();
    showToast("Emergency sent. Please keep communication lines open. Stay safe, help is on the way!", "success");
    if (onSuccess) onSuccess();
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-surface font-sans text-[#222]">
      
      <div className="flex flex-1 flex-col gap-8 px-6 py-8 pb-32 max-w-md mx-auto w-full">
        
        {/* Back Button */}
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black tracking-widest text-[#666] uppercase transition-colors hover:text-[#222]"
          >
            <FaArrowLeft className="text-base" />
            Back to Login
          </button>
        </div>

        {/* Banner */}
        {/* <div className="flex flex-col gap-1 rounded-xl bg-red-50 p-5 text-red-600 border border-red-500 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black tracking-widest uppercase">
            <FaShieldAlt className="text-lg" />
            Offline Emergency Mode
          </div>
          <p className="text-[13px] font-medium leading-snug text-red-600">
            Your request will be converted into an SMS and sent directly to local responders. Please stay calm and conserve battery.
          </p>
        </div> */}

        {/* Location Display */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black tracking-widest text-[#666] uppercase">
              Current Location
            </label>
            <button 
              onClick={handleGetLocation} 
              disabled={locating}
              className="flex items-center gap-1 text-[10px] font-black tracking-widest text-primary hover:opacity-80 disabled:opacity-50 uppercase"
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>
          <div className="flex w-full items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-sm">
            <FaMapMarkerAlt className="text-2xl text-primary" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold tracking-widest text-[#888] uppercase">Coordinates</span>
              <span className="truncate text-lg font-black text-[#222]">
                {locating 
                  ? "Acquiring..." 
                  : currentLocation 
                    ? `${currentLocation.lat.toFixed(4)}° N, ${currentLocation.lng.toFixed(4)}° W` 
                    : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black  text-[#666] uppercase">
            Contact Person
          </label>
          <div className="relative flex w-full items-center rounded-full bg-white shadow-sm">
            <FaUser className="absolute left-5 text-[#888]" />
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="w-full rounded-xl bg-white py-4 pl-12 pr-6 text-[15px] font-bold text-[#222] placeholder:font-medium placeholder:text-[#aaa] focus:outline-none"
            />
          </div>
        </div>

        {/* Incident Type Grid */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black tracking-widest text-[#666] uppercase">
            Incident Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INCIDENT_TYPES.map((type) => (
              <button
                key={type.name}
                onClick={() => setForm({ ...form, description: type.name })}
                className={`flex flex-col items-center justify-center gap-3 rounded-xl py-6 transition-all active:scale-[0.98] ${
                  form.description === type.name
                    ? "bg-[#2d2d2d] text-white shadow-md"
                    : "bg-white text-[#222] shadow-sm hover:bg-[#f9f9f9]"
                }`}
              >
                <type.icon className={`text-3xl ${form.description === type.name ? 'text-primary' : 'text-primary'}`} />
                <span className="text-[11px] font-black tracking-widest uppercase">
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of People */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black tracking-widest text-[#666] uppercase">
            Number of People In Emergency
          </label>
          <div className="flex flex-wrap gap-2">
            {PEOPLE_RANGES.map((range) => (
              <button
                key={range.val}
                onClick={() => setForm({ ...form, numberOfPeople: range.val })}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-3 transition-all active:scale-[0.98] ${
                  form.numberOfPeople === range.val
                    ? "bg-[#2d2d2d] text-white shadow-md"
                    : "bg-white text-[#222] shadow-sm hover:bg-[#f9f9f9]"
                }`}
              >
                <span className="text-xl font-black">{range.val}</span>
                {/* <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">
                  {range.label}
                </span> */}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-elevated px-6 py-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-text-primary py-4 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-[#a00d12] active:scale-[0.98]"
          >
            <FaPaperPlane className="text-lg" />
            Send via SMS
          </button>
        </div>
      </div>

    </div>
  );
};

export default EmergencyModePage;