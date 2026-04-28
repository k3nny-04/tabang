import { useEffect, useState } from "react";
import { getStatusColor } from "../../utils/statusColor";
import { getAddressFromCoordinates } from "../../utils/geocode";
import { teamsApi } from "../../api/teamsApi";
import { MdDirections } from "react-icons/md";

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

const IncidentPopup = ({ report, showGoButton = false, onGoClick }) => {
  const [address, setAddress] = useState(
    report?.location?.lat != null && report?.location?.lng != null
      ? "Fetching address..."
      : "Location unavailable"
  );
  const [assignedTeamName, setAssignedTeamName] = useState(
    report?.assignedTeam ? "Fetching team..." : "None assigned"
  );

  useEffect(() => {
    let isMounted = true;

    const translateLocation = async () => {
      const lat = report?.location?.lat;
      const lng = report?.location?.lng;

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
  }, [report?.location?.lat, report?.location?.lng]);

  useEffect(() => {
    let isMounted = true;

    const fetchTeamName = async () => {
      const assignedTeamId = report?.assignedTeam;

      if (!assignedTeamId) {
        setAssignedTeamName("None assigned");
        return;
      }

      setAssignedTeamName("Fetching team...");

      try {
        const result = await teamsApi.getTeamName(assignedTeamId);
        if (!isMounted) return;

        if (result.success) {
          setAssignedTeamName(result.teamName || "Unknown team");
        } else {
          setAssignedTeamName("Unknown team");
        }
      } catch {
        if (isMounted) setAssignedTeamName("Unknown team");
      }
    };

    fetchTeamName();

    return () => {
      isMounted = false;
    };
  }, [report?.assignedTeam]);

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
  const assignedTeam = assignedTeamName;

  return (
    <div className="w-60 p-2 text-sm font-sans text-text-primary">
      <h3 className="font-semibold wrap-break-word text-base leading-tight line-clamp-5 whitespace-pre-wrap">
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
          {status.toUpperCase().replace(/_/g, ' ')}
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
            <img 
              src={report.photo} 
              alt="Incident photo" 
              className="mt-1 max-w-full h-auto rounded border border-border-light" 
              style={{ maxHeight: '100px' }} 
            />
          </div>
        ) : null}
      </div>

      {showGoButton && onGoClick ? (
        <div className="mt-3 flex justify-start">
          <button
            onClick={onGoClick}
            className="inline-flex items-center gap-1 rounded-md border border-border-light bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-bg-secondary active:scale-95"
          >
            <MdDirections size={14} />
            Go
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default IncidentPopup;
