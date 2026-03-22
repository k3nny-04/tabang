import { useState } from "react";
import { FaCheck, FaPhone, FaRegCopy } from "react-icons/fa";
import { MdDirections, MdMessage } from "react-icons/md";
import { copyToClipboard } from "../utils/clipboard";

const ShelterPopup = ({ item, onGoClick }) => {
  const [copied, setCopied] = useState(false);

  const name = item.Evacuation_Name || "Unnamed Shelter";
  const barangay = item.Barangay || "Location not specified";
  const capacity = item.Capacity ? item.Capacity : "Not specified";
  const manager = item.Manager || "No manager listed";

  let contactNumber = null;
  if (item.Contact) {
    const rawContact = item.Contact.toString();
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

      {/* Capacity */}
      <p className="mb-1 text-xs text-text-secondary wrap-break-word">
        Capacity: <span className="font-medium text-text-primary">{capacity}</span>
      </p>

      {/* Manager */}
      <p className="mb-1 text-xs text-text-secondary wrap-break-word">
        Manager: <span className="font-medium text-text-primary">{manager}</span>
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