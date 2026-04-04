import { useState } from "react";
import { Navigation, Phone, X, Copy, Check } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard"; 

const NearestShelterCard = ({ shelter, distanceInfo, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!shelter) return null;

  const name = shelter.name || "Unnamed Evacuation Center";
  const barangay = shelter.barangay || "Location not specified";
  const manager = shelter.manager || "No manager listed";

  const currentCapacity = shelter.currentCapacity || 0;
  const maxCapacity = shelter.maxCapacity || parseInt(shelter.capacity) || 0;
  
  let capacityText = "Capacity: Not specified";
  let badgeColor = "bg-bg-secondary text-text-secondary ring-border-light";

  if (maxCapacity > 0) {
    const percentage = currentCapacity / maxCapacity;
    capacityText = `${currentCapacity} / ${maxCapacity} Occupied`;
    
    if (percentage >= 1) {
      capacityText = `${currentCapacity} / ${maxCapacity} (FULL)`;
      badgeColor = "bg-red-50 text-red-700 ring-red-200/60";
    } else if (percentage >= 0.8) {
      badgeColor = "bg-orange-50 text-orange-700 ring-orange-200/60";
    } else {
      badgeColor = "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
    }
  } else if (shelter.Capacity) {
    capacityText = `Capacity: ${shelter.Capacity}`;
  }

  let contactNumber = null;
  if (shelter.contact) {
    const rawContact = shelter.contact.toString();
    contactNumber = rawContact.startsWith("0") ? rawContact : `0${rawContact}`;
  }

  const handleCopy = async () => {
    if (contactNumber) {
      await copyToClipboard(contactNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    }
  };

  return (
    <div className="absolute bottom-8 left-4 right-4 z-20 overflow-hidden rounded-2xl bg-surface p-5 shadow-2xl ring-1 ring-border-light animate-in slide-in-from-bottom-10 fade-in duration-300">

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Evacuation Center
          </p>
          <h3 className="text-xl font-bold leading-tight text-text-primary">
            {name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-text-secondary">
              Brgy. {barangay}
            </p>
            {/* --- NEW CAPACITY BADGE --- */}
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${badgeColor}`}>
              {capacityText}
            </span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="shrink-0 rounded-full bg-bg-secondary p-2 text-text-muted transition hover:bg-border-light hover:text-text-primary"
          aria-label="Close shelter info"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        
        <div className="flex items-center gap-2.5 text-text-primary">
          <Navigation size={18} className="text-primary" />
          <span className="font-semibold">
            {distanceInfo || "Calculating distance..."} away
          </span>
        </div>

        <div className="rounded-xl bg-bg-secondary p-4 ring-1 ring-border-light/50">
          <p className="mb-2 text-sm text-text-secondary">
            Manager: <span className="font-medium text-text-primary">{manager}</span>
          </p>
          
          {contactNumber ? (
            <div className="flex items-center justify-between">
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
                title="Copy number"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-text-primary" />
                    <span className="text-text-primary">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">
              No contact number available
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default NearestShelterCard;