import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { copyToClipboard } from "../utils/clipboard";
import { FaPhone, FaRegCopy } from "react-icons/fa";
import { MdDirections, MdMessage } from "react-icons/md";

const ShelterPopup = ({ item }) => {
  const [copied, setCopied] = useState(false);

  const name = item.Evacuation_Name || "Unnamed Shelter";
  const barangay = item.Barangay || "Location not specified";
  const capacity = item.Capacity ? `${item.Capacity}` : "N/A";
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
    <div className="flex w-56 flex-col p-1 font-sans">
      {/* Header Info */}
      <div className="mb-3">
        <h3 className="text-[15px] font-bold leading-tight text-text-primary">
          {name}
        </h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          Brgy. {barangay} • Cap: {capacity}
        </p>
      </div>

      {/* Manager & Contact Card */}
      <div className="mb-4 rounded-lg bg-bg-secondary p-2.5 shadow-sm ring-1 ring-border-light/50">
        <p className="text-xs text-text-secondary truncate mb-1">
          Mgr: <span className="font-medium text-text-primary">{manager}</span>
        </p>
        
        {contactNumber ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide text-text-primary">
              {contactNumber}
            </span>
            <button
              onClick={handleCopy}
              className="text-text-muted transition hover:text-text-primary"
              title="Copy number"
            >
              {copied ? <FaCheck size={12} className="text-green-500" /> : <FaRegCopy size={12} />}
            </button>
          </div>
        ) : (
          <p className="text-[10px] italic text-text-muted">No contact available</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <a
          href={contactNumber ? `tel:${contactNumber}` : undefined}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition ${
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

        {/* You can attach your routing logic to this Go button later */}
        <button className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border-light bg-surface py-1.5 text-xs font-semibold text-text-primary transition hover:bg-bg-secondary active:scale-95">
          <MdDirections size={14} />
          Go
        </button>
      </div>
    </div>
  );
};

export default ShelterPopup