import { useState, useEffect } from "react";
import { Navigation, Phone, X, Copy, Check, AlertTriangle, MapPin, Clock, User } from "lucide-react";
import { getAddressFromCoordinates } from "../utils/geocode";
import { usersApi } from "../api/usersApi"; 

const renderPriority = (level) => {
  const config = {
    1: { label: "URGENT", style: "bg-red-100 text-red-700" },
    2: { label: "HIGH", style: "bg-orange-100 text-orange-700" },
    3: { label: "MEDIUM", style: "bg-yellow-100 text-yellow-700" },
    4: { label: "LOW", style: "bg-blue-100 text-blue-700" },
  };
  
  const prio = config[level] || {
    label: level ? `LEVEL ${level}` : "NORMAL",
    style: "bg-surface-elevated text-text-primary",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${prio.style}`}>
      {prio.label}
    </span>
  );
};

const IncidentCard = ({ incident, distanceInfo, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("Locating address...");
  
  // Reporter State
  const [reporterName, setReporterName] = useState("");
  const [contactNumber, setContactNumber] = useState(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);

  // Geocode location to address
  useEffect(() => {
    const fetchAddress = async () => {
      if (incident?.location?.lat && incident?.location?.lng) {
        try {
          const addr = await getAddressFromCoordinates(
            incident.location.lat, 
            incident.location.lng
          );
          setAddress(addr || "Address not found");
        } catch (error) {
          setAddress("Address not found");
          console.error("Error fetching address:", error);
        }
      } else {
        setAddress("Location not specified");
      }
    };
    fetchAddress();
  }, [incident]);

  // Fetch Reporter Name & Number 
  useEffect(() => {
    const fetchReporterInfo = async () => {
      setIsLoadingContact(true);
      const createdBy = incident?.createdBy;

      if (!createdBy) {
        setReporterName("Unknown Reporter");
        setContactNumber(null);
        setIsLoadingContact(false);
        return;
      }

      if (createdBy.startsWith("+")) {
        setReporterName("SMS Reporter");
        setContactNumber(createdBy);
        setIsLoadingContact(false);
      } else {
        // It's a UID, fetch from Firestore
        try {
          const [nameRes, numberRes] = await Promise.all([
            usersApi.getUserName(createdBy),
            usersApi.getUserNumber(createdBy)
          ]);

          if (nameRes.success) {
            setReporterName(nameRes.fullName || "Unknown Citizen");
          } else {
            setReporterName("Unknown Citizen");
          }

          if (numberRes.success && numberRes.contactNo) {
            setContactNumber(numberRes.contactNo);
          } else {
            setContactNumber(null);
          }
        } catch (error) {
          console.error("Failed to fetch reporter info:", error);
          setReporterName("Unknown Citizen");
          setContactNumber(null);
        } finally {
          setIsLoadingContact(false);
        }
      }
    };

    fetchReporterInfo();
  }, [incident]);

  if (!incident) return null;

  const type = incident.reportType || "Incident";
  
  const distanceStr = distanceInfo?.distance 
    ? (distanceInfo.distance >= 1000 
        ? `${(distanceInfo.distance / 1000).toFixed(1)} km` 
        : `${Math.round(distanceInfo.distance)} m`) 
    : (typeof distanceInfo === "string" ? distanceInfo : "Calculating...");

  const timeStr = distanceInfo?.duration 
    ? `${Math.ceil(distanceInfo.duration / 60)} min`
    : "--";

  const handleCopy = () => {
    if (contactNumber) {
      navigator.clipboard.writeText(contactNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute bottom-20 md:bottom-6 left-1/2 md:left-4 z-1000 w-[95%] max-w-sm -translate-x-1/2 md:translate-x-0 overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border-light sm:w-96 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light bg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Target Incident
            </h3>
            <span className="text-[10px] font-medium text-text-muted">
              Routing in progress
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary active:scale-95"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        {/* Title, Priority, and Fetched Address */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-lg font-black text-text-primary truncate">
              {type}
            </h4>
            <div className="shrink-0 mt-0.5">
              {renderPriority(incident.prioLevel)}
            </div>
          </div>
          
          <div className="flex items-start gap-1.5 text-sm text-text-secondary mt-1">
             <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
             <p className="line-clamp-2 leading-snug">{address}</p>
          </div>
        </div>

        {/* Distance & Time Block */}
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-surface-elevated p-3 border border-border-light">
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Distance</span>
            <div className="flex items-center gap-1.5 text-text-primary">
                <Navigation size={14} className="text-primary" />
                <span className="text-sm font-bold">
                  {distanceStr}
                </span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-px h-8 bg-border-light"></div>
          
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Est. Time</span>
            <div className="flex items-center gap-1.5 text-text-primary">
                <Clock size={14} className="text-orange-500" />
                <span className="text-sm font-bold">
                  {timeStr}
                </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="pt-2 border-t border-border-light/50">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Reporter Details
          </p>
          
          {isLoadingContact ? (
            <p className="text-sm text-text-muted italic animate-pulse">Loading contact info...</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {/* Display fetched Reporter Name */}
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <User size={14} className="text-text-muted" />
                <span className="truncate">{reporterName}</span>
              </div>

              {/* Display fetched Contact Number */}
              {contactNumber ? (
                <div className="flex items-center justify-between mt-1">
                  <a 
                    href={`tel:${contactNumber}`} 
                    className="inline-flex items-center gap-2 text-base font-bold text-primary hover:underline"
                  >
                    <Phone size={16} />
                    {contactNumber}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm ring-1 ring-border-light transition hover:text-text-primary active:scale-95"
                  >
                    {copied ? (
                      <><Check size={14} className="text-text-primary" /><span className="text-text-primary">Copied</span></>
                    ) : (
                      <><Copy size={14} /><span>Copy</span></>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-text-muted italic mt-1 pl-6">
                  No contact number available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;