import { useState, useEffect, useRef } from "react";
import { reportsApi } from "../api/reportsApi";
import { usersApi } from "../api/usersApi"; 
import { teamsApi } from "../api/teamsApi"; 
import { getAddressFromCoordinates } from "../utils/geocode"; 
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User,
  Activity,
  Package,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Phone
} from "lucide-react";

const HOLD_DURATION = 1500;

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

const ExpandedReportDetails = ({ report, onViewOnMap }) => {
  const [reporterName, setReporterName] = useState("Loading...");
  const [reporterNumber, setReporterNumber] = useState(null);
  const [address, setAddress] = useState("Fetching address...");

  const [isHolding, setIsHolding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const pressTimer = useRef (null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      // 1. Handle Reporter Name & Number
      if (report.createdBy) {
        if (report.createdBy.startsWith("+63")) {
          if (isMounted) {
            setReporterName("SMS Reporter"); // Cleaner than repeating the number
            setReporterNumber(report.createdBy);
          }
        } else {
          try {
            // Fetch name and number concurrently for better performance
            const [nameRes, numberRes] = await Promise.all([
              usersApi.getUserName(report.createdBy).catch(() => ({ fullName: "Unknown User" })),
              usersApi.getUserNumber(report.createdBy).catch(() => ({ success: false }))
            ]);
            
            if (isMounted) {
              setReporterName(nameRes?.fullName || "Unknown User");
              setReporterNumber(numberRes?.success ? numberRes.contactNo : null);
            }
          } catch (error) {
            console.error("Failed to fetch user details", error);
            if (isMounted) setReporterName("Unknown User");
          }
        }
      } else {
        if (isMounted) setReporterName("Anonymous");
      }

      // 2. Handle Address
      if (report.location) {
        try {
          const addr = await getAddressFromCoordinates(report.location.lat, report.location.lng);
          if (isMounted) setAddress(addr || `${report.location.lat.toFixed(6)}, ${report.location.lng.toFixed(6)}`);
        } catch (error) {
          console.error("Failed to fetch address", error);
          if (isMounted) setAddress(`${report.location.lat.toFixed(6)}, ${report.location.lng.toFixed(6)}`);
        }
      } else {
        if (isMounted) setAddress("Location unavailable");
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [report.createdBy, report.location]);

  const executeResolve = async () => {
    setIsUpdating(true);
    setIsHolding(false); 
    
    try {
      const isoTimestamp = new Date().toISOString();
      const closingRemark = {
        comment: `This report has been addressed and marked as resolved by the responding team.\n\nThank you for your cooperation. Please stay safe, and do not hesitate to submit a new request if further assistance is needed.`,
        dateRemarked: isoTimestamp,
        status: "RESOLVED"
      };

      const reportId = report.id; 
      const existingRemarks = report.remarks || [];
      
      await reportsApi.updateReport(reportId, { 
        status: "RESOLVED",
        remarks: [...existingRemarks, closingRemark]
      });

      const teamId = report.assignedTeam;
      if (teamId) {
        await teamsApi.removeAssignedReport(teamId, reportId);
      }
      
      setIsResolved(true);
      
    } catch (err) {
      console.error(`Failed to update resolution for report ${report.id}:`, err);
    } finally {
      setIsUpdating(false);
    }
  };


  const handlePointerDown = () => {
    if (isUpdating || isResolved) return;
    setIsHolding(true);
    pressTimer.current = setTimeout(() => {
      executeResolve();
    }, HOLD_DURATION);
  };

  const handlePointerUpOrLeave = () => {
    setIsHolding(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="px-4 pb-4 pt-0">
      <div className="border-t border-bg-secondary pt-4 mt-2 space-y-4">
        
        {/* Reporter Info with Contact Buttons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5 text-text-secondary">
            <User size={16} className="mt-0.5 shrink-0 text-text-muted" />
            <div className="flex flex-col">
              <span className="text-xs text-text-muted font-medium mb-0.5">Reported By</span>
              <span className="text-sm font-semibold text-text-primary">{reporterName}</span>
              {reporterNumber && (
                <span className="text-xs text-text-secondary mt-0.5">{reporterNumber}</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons for Contact */}
          {reporterNumber && (
            <div className="flex gap-2 shrink-0">
              <a 
                href={`sms:${reporterNumber}`} 
                className="p-2 bg-surface border border-bg-secondary rounded-lg text-text-secondary hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="Send SMS"
              >
                <MessageSquare size={16} />
              </a>
              <a 
                href={`tel:${reporterNumber}`} 
                className="p-2 bg-surface border border-bg-secondary rounded-lg text-text-secondary hover:text-green-600 hover:border-green-200 transition-colors"
                title="Call Reporter"
              >
                <Phone size={16} />
              </a>
            </div>
          )}
        </div>
        
        {/* Location Info */}
        <div className="flex items-start gap-2.5 text-text-secondary">
          <MapPin size={16} className="mt-0.5 shrink-0 text-text-muted" />
          <div className="flex flex-col">
            <span className="text-xs text-text-muted font-medium mb-0.5">Location</span>
            <span className="text-sm text-text-primary leading-snug pr-2">
              {address}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Fields (SUPPLY / RESCUE) */}
      {(report.reportType === "SUPPLY" || report.reportType === "RESCUE") && (
        <div className="mt-4 pt-4 border-t border-bg-secondary space-y-2">
          
          {report.reportType === "SUPPLY" && report.supplies && report.supplies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Package size={16} className="text-text-primary" />
                <span className="text-xs font-semibold text-text-primary">Requested Supplies</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {report.supplies.map((supply, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface-elevated px-3 py-2 rounded-lg border border-bg-secondary">
                    <span className="text-sm font-medium text-text-secondary truncate pr-2">{supply.item}</span>
                    <span className="text-sm font-semibold text-text-primary">{supply.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.reportType === "RESCUE" && report.numberOfPeople && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Users size={18} />
                <span className="text-sm font-semibold">People in need of rescue</span>
              </div>
              <span className="text-base font-bold text-text-primary">{report.numberOfPeople}</span>
            </div>
          )}
        </div>
      )}

      {/* Description Box (Scrollable) */}
      <div className="mt-4 pt-4 border-t border-bg-secondary">
        <span className="text-xs font-semibold text-text-primary mb-1.5 block">Description</span>
        <div className="max-h-24 overflow-y-auto pr-2 stylish-scrollbar">
          <p className="text-sm text-text-secondary leading-relaxed">
            {report.description || "No additional description provided."}
          </p>
        </div>
      </div>

      {/* Photo Attachment */}
      {report.photo && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={16} className="text-text-muted" />
            <span className="text-xs font-semibold text-text-primary">Attachment</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-bg-secondary bg-surface-elevated">
            <img 
              src={report.photo} 
              alt="Report Attachment" 
              className="w-full max-h-48 object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3 pt-5">
        {/* Long Press Update Button */}
        <button 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUpOrLeave}
          onPointerLeave={handlePointerUpOrLeave}
          disabled={isUpdating || isResolved}
          className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold overflow-hidden transition-colors select-none touch-none
            ${isResolved 
              ? "bg-green-600 text-white cursor-default" 
              : "bg-text-primary text-surface cursor-pointer"
            }
            ${isUpdating ? "opacity-80 cursor-wait" : ""}
          `}
        >
          {/* Animated Progress Bar (Green overlay) */}
          {!isResolved && !isUpdating && (
            <div 
              className={`absolute left-0 top-0 h-full bg-green-500/90 transition-all ${
                isHolding 
                  ? "duration-1500 ease-linear w-full" 
                  : "duration-300 ease-out w-0"
              }`} 
            />
          )}

          {/* Button Text & Icon */}
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isUpdating ? (
              <span className="animate-pulse">Resolving...</span>
            ) : isResolved ? (
              <>
                <CheckCircle size={16} />
                Resolved
              </>
            ) : (
              "Hold to Resolve"
            )}
          </div>
        </button>


        <button 
          className="flex-1 bg-surface border border-bg-secondary text-text-primary hover:bg-surface-hover py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          onClick={() => onViewOnMap(report.location)}
        >
          View on Map
        </button>
      </div>
    </div>
  );
};


// --- Main Component ---
const AssignedReports = ({ teamId, onViewOnMap }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const unsubscribe = reportsApi.streamAssignedReports(teamId, (data) => {
      setReports(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [teamId]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };


  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-bg-tertiary border-t-text-primary"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-text-muted text-sm text-center px-4">
        <AlertTriangle size={24} className="mb-2 opacity-50" />
        <p>You must be assigned to a team to view mission reports.</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-text-muted text-sm text-center px-4">
        <Activity size={24} className="mb-2 opacity-50" />
        <p>No active reports assigned to your team.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {reports.map((report) => {
        const isExpanded = expandedId === report.id;
        const dateString = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown date";
        
        return (
          <div 
            key={report.id} 
            className="bg-surface border border-bg-secondary rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
          >
            {/* CARD HEADER */}
            <div 
              onClick={() => toggleExpand(report.id)}
              className="p-4 flex items-start justify-between cursor-pointer select-none active:bg-surface-hover/50"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center  mb-1.5">
                  {renderPriority(report.prioLevel)}
                </div>
                <h3 className="font-bold text-text-primary truncate text-base uppercase tracking-wide">
                  {report.reportType || "INCIDENT"}
                </h3>
                <div className="flex items-center gap-1.5 text-text-muted text-xs mt-1.5 font-mono">
                  <Clock size={12} />
                  <span className="truncate">{dateString}</span>
                </div>
              </div>
              
              <button className="p-1 text-text-muted shrink-0 flex items-center justify-center rounded-full mt-0.5">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {isExpanded && <ExpandedReportDetails report={report} onViewOnMap={onViewOnMap} />}
          </div>
        );
      })}
    </div>
  );
};

export default AssignedReports;