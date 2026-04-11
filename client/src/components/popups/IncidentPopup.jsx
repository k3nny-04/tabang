import { useEffect, useState } from "react";
import { getStatusColor } from "../../utils/statusColor";
import { getAddressFromCoordinates } from "../../utils/geocode";

const statusLabel = (value) => {
  switch (value) {
    case 1:
      return "URGENT";
    case 2:
      return "HIGH";
    case 3:
      return "MEDIUM";
    case 4:
      return "LOW";
    default:
      return "UNKNOWN";
  }
};

const IncidentPopup = ({ report }) => {
  const [address, setAddress] = useState(
    report.location?.lat != null && report.location?.lng != null
      ? "Fetching address..."
      : "Location unavailable"
  );

  useEffect(() => {
    let isMounted = true;

    const translateLocation = async () => {
      const lat = report.location?.lat;
      const lng = report.location?.lng;

      if (lat == null || lng == null) {
        setAddress("Location unavailable");
        return;
      }

      try {
        const result = await getAddressFromCoordinates(lat, lng);
        if (!isMounted) return;

        if (result) {
          setAddress(result);
        } else {
          setAddress("Address not found");
        }
      } catch {
        if (isMounted) setAddress("Address not found");
      }
    };

    translateLocation();

    return () => {
      isMounted = false;
    };
  }, [report.location?.lat, report.location?.lng]);

  if (!report) return null;

  const title = report.description || "Incident report";
  const status = report.status || "UNKNOWN";
  const priority = statusLabel(report.prioLevel);
  const createdAt = report.createdAt
    ? new Date(report.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";
  const assignedTeam = report.assignedTeam || "None assigned";

  return (
    <div className="w-60 p-2 text-sm font-sans text-text-primary">
      <h3 className="font-semibold wrap-break-word text-base leading-tight">
        {title}
      </h3>

      <p className="mt-0.5 text-xs text-text-secondary wrap-break-word">
        Reported: {createdAt}
      </p>

      <div className="my-2 border-t border-border-light" />

      <div className="mb-2 flex flex-wrap gap-1">
        <span
          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
        <span className="inline-flex items-center rounded-md border border-border-light bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary">
          {priority}
        </span>
      </div>

      <div className="space-y-1 text-xs text-text-secondary">
        <div>
          <span className="block font-semibold text-text-primary">Location</span>
          <span className="block text-[11px] text-text-secondary wrap-break-word">
            {address}
          </span>
        </div>

        <div>
          <span className="block font-semibold text-text-primary">Assigned Team</span>
          <span className="block text-[11px] text-text-secondary wrap-break-word">
            {assignedTeam}
          </span>
        </div>

        {report.photo ? (
          <div>
            <span className="block font-semibold text-text-primary">Attachment</span>
            <span className="block text-[11px] text-text-secondary">Photo attached</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IncidentPopup;
