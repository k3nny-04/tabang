import { useState, useEffect } from "react";
import { X, MapPin, Calendar, User } from "lucide-react";
import { getAddressFromCoordinates } from "../../utils/geocode";
import { getStatusColor } from "../../utils/statusColor";
import { usersApi } from "../../api/usersApi"; // Added API import

const ReportDetailsModal = ({ report, onClose, onUpdateReport }) => {
  const [address, setAddress] = useState("Fetching address...");
  const [isFetchingAddress, setIsFetchingAddress] = useState(true);
  
  // New state for creator name
  const [creatorName, setCreatorName] = useState("Loading...");
  
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState(report.status);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Creator Name
  useEffect(() => {
    let isMounted = true;
    
    const fetchCreatorName = async () => {
      if (!report.createdBy) {
        if (isMounted) setCreatorName("Unknown");
        return;
      }

      // Check if the createdBy is an SMS phone number
      if (String(report.createdBy).startsWith("+63")) {
        if (isMounted) setCreatorName(`${report.createdBy} (From SMS)`);
        return;
      }

      // Otherwise, fetch the user's name from Firestore
      try {
        const res = await usersApi.getUserName(report.createdBy);
        if (isMounted) {
          if (res.success) {
            setCreatorName(res.fullName);
          } else {
            setCreatorName("Unknown Citizen");
          }
        }
      } catch (error) {
        if (isMounted) {
          setCreatorName("Unknown Citizen");
          console.error("Failed to fetch creator name:", error);
        }
      }
    };

    fetchCreatorName();
    return () => { isMounted = false; };
  }, [report.createdBy]);

  // Geocode Address
  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      if (!report.location?.lat || !report.location?.lng) {
        setAddress("Location coordinates unavailable");
        setIsFetchingAddress(false);
        return;
      }

      try {
        const result = await getAddressFromCoordinates(report.location.lat, report.location.lng);
        if (isMounted) {
          setAddress(result || "Address not found");
          setIsFetchingAddress(false);
        }
      } catch (error) {
        if (isMounted) {
          setAddress("Failed to load address");
          setIsFetchingAddress(false);
          console.error(error);
        }
      }
    };

    fetchAddress();
    return () => { isMounted = false; };
  }, [report.location]);

  const renderPriority = (level) => {
    const config = {
      1: { label: "URGENT", style: "text-red-700 font-black" },
      2: { label: "HIGH", style: "text-amber-600 font-bold" },
      3: { label: "MEDIUM", style: "text-yellow-600 font-semibold" },
      4: { label: "LOW", style: "text-slate-500 font-medium" }
    };
    const prio = config[level] || { label: `LEVEL ${level}`, style: "text-gray-700 font-medium" };
    
    return (
      <span className={`flex items-center text-sm tracking-wider ${prio.style}`}>
        {prio.label}
      </span>
    );
  };

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateReport(report.id, { remarks, status });
    setIsSaving(false);
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-gray-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
              Report Details
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${getStatusColor(status)}`}>
                {status}
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">ID: {report.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-3/5 p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-gray-100 space-y-8">
        
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {/* Added Created By Field */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Created By</span>
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <User size={14} className="mr-2 text-gray-400" />
                  <span className="truncate" title={creatorName}>{creatorName}</span>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date Reported</span>
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar size={14} className="mr-2 text-gray-400" />
                  {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="col-span-2 pt-2 mt-2 border-t border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Priority</span>
                {renderPriority(report.prioLevel)}
              </div>

              <div className="col-span-2 pt-2 mt-2 border-t border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                <div className="flex items-start text-sm font-medium text-gray-700">
                  <MapPin size={16} className="mr-2 mt-0.5 text-primary shrink-0" />
                  <span className={isFetchingAddress ? "text-gray-400 animate-pulse" : ""}>
                    {address}
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {report.description || "No description provided."}
              </p>
            </div>

            {/* NUMBER OF PEOPLE*/}
            {report.reportType === "RESCUE" && (
              <div className="pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                  Rescue Details
                </h3>
                
                <div className="flex items-stretch bg-white border border-gray-200 rounded-lg overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] w-full sm:w-2/3">
                  <div className="bg-gray-50 px-6 py-4 border-r border-gray-200 flex flex-col items-center justify-center min-w-20">
                    <span className="font-mono text-3xl font-black text-gray-800 leading-none">
                      {report.numberOfPeople || "?"}
                    </span>
                  </div>
                  <div className="px-5 py-4 flex flex-col justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-0.5">
                      Individuals
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      Reported on-site requiring immediate rescue assistance
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* RESCUE SUPPLIES */}
            {report.reportType === "SUPPLY" && report.supplies && report.supplies.length > 0 && (
              <div className="pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                  Requested Supplies 
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.supplies.map((supply, index) => (
                    <div 
                      key={index} 
                      className="flex items-stretch bg-white border border-gray-200 rounded-lg overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]"
                    >
                      <div className="bg-gray-50 px-4 py-2.5 border-r border-gray-200 flex items-center justify-center min-w-14">
                        <span className="font-mono text-sm font-black text-gray-800">
                          {supply.quantity}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center w-full">
                        <span className="text-sm font-semibold text-gray-700 capitalize tracking-wide">
                          {supply.item}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IMAGE*/}
            {report.photo && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attached Image</h3>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center max-h-64">
                  <img src={report.photo} alt="Report attachment" className="object-contain w-full h-full" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-2/5 flex flex-col bg-gray-50/30">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Status Update */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                <div className="flex flex-col gap-2">
                  {["PENDING", "VERIFIED", "IN_PROGRESS", "RESOLVED"].map((s, index, array) => {
                    const originalStatusIndex = array.indexOf(report.status);
                    const isDisabled = index < originalStatusIndex;

                    return (
                      <label 
                        key={s} 
                        className={`flex items-center p-3 border rounded-xl transition-all ${
                          isDisabled 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' 
                            : status === s 
                              ? 'border-text-primary bg-white shadow-sm cursor-pointer' 
                              : 'border-gray-200 bg-transparent hover:bg-white cursor-pointer' 
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="status" 
                          value={s}
                          checked={status === s}
                          onChange={(e) => setStatus(e.target.value)}
                          disabled={isDisabled}
                          className="w-4 h-4 text-text-primary border-gray-300 focus:ring-text-primary disabled:cursor-not-allowed"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
                          {s.replace('_', ' ')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* REMARKS */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Admin Remarks</h3>
                <textarea
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add internal notes, responder assignments, or updates here..."
                  className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-text-primary/20 focus:border-text-primary outline-none resize-none transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Remarks are only visible to administrators and responders.
                </p>
              </div>
            </div>

            {/* SAVE */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button 
                onClick={handleSave}
                disabled={isSaving || (status === report.status && remarks === report.remarks)}
                className="w-full bg-text-primary text-white py-3 rounded-xl font-semibold shadow-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;