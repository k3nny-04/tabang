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
  FaArrowRight,
  FaCarCrash,
  FaCheckCircle
} from "react-icons/fa";
import { RiCriminalFill } from "react-icons/ri";
import { Stepper, Step, StepLabel } from "@mui/material";
import { useLocationContext } from "../providers/useLocationContext";
import { useToast } from "../providers/useToastContext";

const INCIDENT_TYPES = [
  { name: "Flood", icon: FaWater },
  { name: "Fire", icon: FaFire },
  { name: "Earthquake", icon: FaHouseDamage },
  { name: "Medical", icon: FaFirstAid },
  { name: "Crime", icon: RiCriminalFill }, 
  { name: "Accident", icon: FaCarCrash }
];

const PEOPLE_RANGES = ["1-3", "4-7", "8-15", "16+"];

const INCIDENT_QUESTIONS = {
  "Flood": [
    { key: "q1", label: "Water Level", options: ["Ankle/Knee", "Waist", "Neck/Roof"] },
    { key: "q2", label: "Water Status", options: ["Rising", "Stable", "Receding"] },
    { key: "q3", label: "Evacuation Status", options: ["Can Walk Out", "Stranded", "Medical Evac Needed"] }
  ],
  "Fire": [
    { key: "q1", label: "Fire Type", options: ["Building", "Electrical", "Chemical", "Vegetation"] },
    { key: "q2", label: "Spread Rate", options: ["Fast", "Slow/Contained"] },
    { key: "q3", label: "Evacuation Status", options: ["All Clear", "People Still Inside", "Unknown"] }
  ],
  "Earthquake": [
    { key: "q1", label: "Damage", options: ["Minor", "Severe/Collapsed"] },
    { key: "q2", label: "Hazards", options: ["None", "Gas Leak", "Live Wires", "Fire"] },
    { key: "q3", label: "Casualty Status", options: ["Safe", "Trapped Under Debris", "Injured"] }
  ],
  "Medical": [
    { key: "q1", label: "Consciousness", options: ["Awake", "Unconscious"] },
    { key: "q2", label: "Breathing", options: ["Normal", "Struggling", "Stopped"] },
    { key: "q3", label: "Primary Issue", options: ["Bleeding", "Trauma/Head", "Cardiac", "Fracture"] }
  ],
  "Crime": [
    { key: "q1", label: "Incident Type", options: ["Robbery", "Assault", "Intruder", "Suspicious Activity"] },
    { key: "q2", label: "Weapon Present", options: ["Yes", "No", "Unsure"] },
    { key: "q3", label: "Suspect Status", options: ["Fled", "Still Here", "Inside Building"] }
  ],
  "Accident": [
    { key: "q1", label: "Accident Type", options: ["Vehicular", "Industrial", "Other"] },
    { key: "q2", label: "Hazards", options: ["None", "Fire/Fuel Leak", "Blocking Road"] },
    { key: "q3", label: "Casualty Status", options: ["Clear", "Trapped", "Multiple Injured"] }
  ]
};

const EMERGENCY_NUMBER = "+639608029319"; 

const EmergencyModePage = ({ onSuccess, handleReset: parentReset, onBack }) => {
  const { currentLocation, setCurrentLocation } = useLocationContext();
  const { showToast } = useToast();
  const [locating, setLocating] = useState(false);
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    contactName: "", 
    incidentType: "",
    numberOfPeople: "",
    details: {} 
  });

  useEffect(() => {
    if (!currentLocation) handleGetLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by this browser.", "error");
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        showToast("Location failed. Please enable GPS.", "error");
        setLocating(false);
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleReset = () => {
    setForm({ contactName: "", incidentType: "", numberOfPeople: "", details: {} });
    setStep(1);
    if (parentReset) parentReset();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.contactName.trim()) return showToast("Please provide a contact name.", "error");
      if (!form.numberOfPeople) return showToast("Please select the number of people.", "error");
    }
    if (step === 2) {
      if (!form.incidentType) return showToast("Please select an incident type.", "error");
    }
    if (step === 3) {
      const requiredQuestions = INCIDENT_QUESTIONS[form.incidentType].length;
      const answeredQuestions = Object.keys(form.details).length;
      if (answeredQuestions < requiredQuestions) return showToast("Please answer all details.", "error");
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const selectIncident = (type) => {
    if (form.incidentType !== type) {
      setForm({ ...form, incidentType: type, details: {} });
    }
  };

  const updateDetail = (key, value) => {
    setForm(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));
  };

  const handleSubmit = () => {
    if (!currentLocation) return showToast("No location acquired. Please ensure GPS is active.", "error");

    const locString = `${currentLocation.lat.toFixed(5)},${currentLocation.lng.toFixed(5)}`;
    const name = form.contactName.trim().toUpperCase();
    const type = `${form.incidentType.toUpperCase()}-${name}`;
    
    const detailsArray = INCIDENT_QUESTIONS[form.incidentType].map(q => form.details[q.key]);
    const detailsString = detailsArray.join(",");

    const smsMessage = `SOS|${type}|${form.numberOfPeople}|${detailsString}|${locString}`;
    const smsLink = `sms:${EMERGENCY_NUMBER}?body=${encodeURIComponent(smsMessage)}`;

    window.location.href = smsLink;
    
    handleReset();
    showToast("Emergency sent. Please stay safe!", "success");
    if (onSuccess) onSuccess();
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-bg-primary text-text-primary">
      <div className="flex flex-1 flex-col px-6 py-8 pb-32 max-w-md mx-auto w-full">
        
        {/* Full-width Stepper Container */}
        <div className="mb-10 -mx-6 sm:mx-0">
          <Stepper 
            activeStep={step - 1} 
            alternativeLabel
            sx={{
              "& .MuiStepIcon-root.Mui-active": { color: "var(--color-text-primary, #1c1c1e)" },
              "& .MuiStepIcon-root.Mui-completed": { color: "var(--color-text-primary, #1c1c1e)" },
              "& .MuiStepConnector-line": { borderColor: "var(--color-border-medium, #c2c2c5)" },
              "& .MuiStepIcon-text": { fill: "var(--color-surface, #fafafa)", fontWeight: "bold" }
            }}
          >
            {[1, 2, 3, 4].map((label) => (
              <Step key={label}>
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {/* STEP 1: LOCATION, CONTACT, PEOPLE */}
        {step === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
            
            {/* Location Display */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-muted">Current location</label>
              <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FaMapMarkerAlt className="text-text-muted shrink-0" />
                  <span className="truncate text-[15px] font-bold text-text-primary">
                    {locating ? "Acquiring..." : currentLocation ? `${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°` : "Unavailable"}
                  </span>
                </div>
                <button 
                  onClick={handleGetLocation} 
                  disabled={locating} 
                  className="p-1 text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
                  aria-label="Refresh location"
                >
                  <FaSyncAlt className={locating ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-muted">
                Contact person
              </label>
              <div className="relative flex w-full items-center rounded-xl bg-surface shadow-sm">
                <FaUser className="absolute left-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full rounded-xl bg-transparent py-4 pl-12 pr-6 text-[15px] font-bold text-text-primary placeholder:font-medium placeholder:text-text-muted focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Number of People */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-muted">Number of People in emergency</label>
            <div className="grid grid-cols-2 gap-3">
                {PEOPLE_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setForm({ ...form, numberOfPeople: range })}
                    className={`flex h-32 items-center justify-center rounded-xl p-2 transition-all active:scale-[0.98] ${
                      form.numberOfPeople === range 
                        ? "bg-text-primary text-surface shadow-md" 
                        : "bg-surface text-text-primary hover:bg-surface-hover shadow-sm"
                    }`}
                  >
                    <span className="text-xl font-black">{range}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INCIDENT TYPE */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
            <label className="text-sm font-semibold text-text-muted">Select incident type</label>
            <div className="grid grid-cols-2 gap-4">
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type.name}
                  onClick={() => selectIncident(type.name)}
                  className={`flex h-36 flex-col items-center justify-center gap-4 rounded-xl transition-all active:scale-[0.98] ${
                    form.incidentType === type.name 
                      ? "bg-text-primary text-surface shadow-md" 
                      : "bg-surface text-text-primary hover:bg-surface-hover shadow-sm"
                  }`}
                >
                  <type.icon className="text-4xl" />
                  <span className="text-xs">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SPECIFIC DETAILS */}
        {step === 3 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 border-border-light">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-primary text-surface">
                {INCIDENT_TYPES.find(t => t.name === form.incidentType)?.icon({ className: "text-xl" })}
              </div>
              <div>
                <h2 className="text-lg font-black text-text-primary">{form.incidentType} details</h2>
                <p className="text-xs font-medium text-text-muted">Tap to select status</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {INCIDENT_QUESTIONS[form.incidentType].map((q) => (
                <div key={q.key} className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-text-muted">{q.label}</label>
                  {/* Changed to flex-col with gap-2.5 for a clean, non-cramped list */}
                  <div className="flex flex-col gap-2.5">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateDetail(q.key, opt)}
                        className={`w-full rounded-xl px-4 py-4 text-center text-[13px] font-bold transition-all active:scale-[0.98] ${
                          form.details[q.key] === opt 
                            ? "bg-text-primary text-surface shadow-md" 
                            : "bg-surface text-text-primary shadow-sm ring-1 ring-inset ring-border-light hover:bg-surface-hover"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SEND */}
        {step === 4 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
            
            {/* Summary */}
            <div className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-sm">
              <h3 className="text-xs font-bold text-text-muted border-b border-border-light pb-2 mb-2">Report summary</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-text-muted font-medium text-xs">Contact</div>
                <div className="font-black text-right">{form.contactName}</div>
                
                <div className="text-text-muted font-medium text-xs">Emergency</div>
                <div className="font-black text-right text-text-primary">{form.incidentType}</div>
                
                <div className="text-text-muted font-medium text-xs">People</div>
                <div className="font-black text-right">{form.numberOfPeople}</div>
              </div>
              
              <div className="mt-2 pt-3 border-t border-border-light flex flex-col gap-2">
                {INCIDENT_QUESTIONS[form.incidentType].map(q => (
                  <div key={q.key} className="flex justify-between text-xs items-center gap-4">
                    <span className="text-text-muted font-medium">{q.label}</span>
                    <span className="font-black bg-bg-secondary text-text-primary px-2 py-1 rounded text-right">{form.details[q.key]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-surface-elevated p-4 text-text-primary shadow-sm">
              <FaCheckCircle className="text-2xl shrink-0 text-green-700" />
              <p className="text-xs font-medium leading-tight">Your request is ready. It will be converted into an SMS format on the next screen.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 z-10 w-full  bg-surface px-6 py-5 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex w-full max-w-md gap-3">
          
          {/* Left Button: Exit (Step 1) or Back (Steps 2-4) */}
          {step === 1 ? (
            <button
              onClick={onBack}
              className="flex flex-1 items-center justify-center rounded-xl border border-text-primary bg-transparent py-4 text-sm font-bold text-text-primary transition-all hover:bg-surface-hover active:scale-[0.98]"
            >
              Exit
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="flex flex-1 items-center justify-center rounded-xl border border-text-primary bg-transparent py-4 text-sm font-bold text-text-primary transition-all hover:bg-surface-hover active:scale-[0.98]"
            >
              Back
            </button>
          )}
          
          {/* Right Button: Next (Steps 1-3) or Send (Step 4) */}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-text-primary py-4 text-sm font-bold text-surface shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-text-primary py-4 text-sm font-bold text-surface shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <FaPaperPlane className="text-lg" /> Send via SMS
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default EmergencyModePage;