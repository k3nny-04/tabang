import { useState } from "react";
import { Navigation, Phone, X, Copy, Check } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard"; 

const NearestShelterCard = ({ shelter, distanceInfo, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!shelter) return null;

  const name = shelter.Evacuation_Name || "Unnamed Evacuation Center";
  const barangay = shelter.Barangay || "Location not specified";
  const capacity = shelter.Capacity ? `${shelter.Capacity} people` : "Not specified";
  const manager = shelter.Manager || "No manager listed";

  let contactNumber = null;
  if (shelter.Contact) {
    const rawContact = shelter.Contact.toString();
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
            Nearest Evacuation Center
          </p>
          <h3 className="text-xl font-bold leading-tight text-text-primary">
            {name}
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary">
            Brgy. {barangay} • Capacity: {capacity}
          </p>
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