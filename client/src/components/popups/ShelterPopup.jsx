import { useState } from "react";
import { FaCheck, FaPhone, FaRegCopy } from "react-icons/fa";
import { MdDirections, MdMessage } from "react-icons/md";
import { copyToClipboard } from "../../utils/clipboard";

const ShelterPopup = ({ item, onGoClick }) => {
  const [copied, setCopied] = useState(false);

  const name = item.name || "Unnamed Shelter";
  const barangay = item.barangay || "Location not specified";
  // const manager = item.manager || "No manager listed";

  const currentCapacity = item.currentCapacity || 0;
  const maxCapacity = item.maxCapacity || parseInt(item.capacity) || 0;
  
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
  } else if (item.capacity) {
    capacityText = `Capacity: ${item.capacity}`;
  }

  let contactNumber = null;
  if (item.hotline) {
    const rawContact = item.hotline.toString();
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
    <div className="w-60 p-2 text-sm font-sans text-text-primary">
      {/* Title */}
      <h3 className="font-semibold wrap-break-word text-base leading-tight">
        {name}
      </h3>
      
      {/* Barangay */}
      <p className="mt-0.5 text-xs text-text-secondary wrap-break-word">
        Barangay {barangay}
      </p>

      {/* Divider */}
      <div className="my-2 border-t border-border-light" />

      {/* Capacity Indicator */}
      <div className="mb-2">
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${badgeColor}`}>
          {capacityText}
        </span>
      </div>

      {/* Hotline */}
      <p className="mb-1 text-xs text-text-secondary wrap-break-word">
        <span className="font-bold text-text-primary">{barangay} Hotline</span>
      </p>

      {/* Contact */}
      {contactNumber ? (
        <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">{contactNumber}</span>
          <button
            onClick={handleCopy}
            className="text-text-muted transition hover:text-text-primary"
            title="Copy number"
          >
            {copied ? <FaCheck size={12} className="text-green-500" /> : <FaRegCopy size={12} />}
          </button>
        </div>
      ) : (
        <p className="mt-1 text-[11px] italic text-text-muted">
          No contact number available
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-1.5">
        <a
          href={contactNumber ? `tel:${contactNumber}` : undefined}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition ${
            contactNumber
              ? "bg-text-primary text-bg-primary hover:opacity-90 active:scale-95"
              : "bg-surface-elevated text-text-muted cursor-not-allowed opacity-60"
          }`}
          onClick={(e) => !contactNumber && e.preventDefault()}
        >
          <FaPhone size={10} />
          Call
        </a>

        <a
          href={contactNumber ? `sms:${contactNumber}` : undefined}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md border transition ${
            contactNumber
              ? "border-border-light bg-surface text-text-primary hover:bg-bg-secondary active:scale-95"
              : "border-border-light bg-surface text-text-muted cursor-not-allowed opacity-60"
          }`}
          onClick={(e) => !contactNumber && e.preventDefault()}
        >
          <MdMessage size={12} />
          Text
        </a>

        <button 
          onClick={onGoClick}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border-light bg-surface py-1.5 text-xs font-medium text-text-primary transition hover:bg-bg-secondary active:scale-95"
        >
          <MdDirections size={14} />
          Go
        </button>
      </div>
    </div>
  );
};

export default ShelterPopup;