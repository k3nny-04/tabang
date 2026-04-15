import { useState, useEffect, useMemo } from "react";
import DataTable from "../../components/DataTable";
import { useLocationContext } from "../../providers/useLocationContext";
import { MapPin, Eye, History, X, Trash2 } from "lucide-react";
import { getDistance } from "geolib";
import { reportsApi } from "../../api/reportsApi";
import { getStatusColor } from "../../utils/statusColor"; 
import ReportDetailsModal from "../../components/modals/ReportDetailsModal";
import ReportTimeline from "../../components/ReportTimeline";
import DeleteModal from "../../components/modals/DeleteModal";

const ReportsPage = () => {
  const {currentLocation, setCurrentLocation} = useLocationContext();
  const [loading, setLoading] = useState(true);

  // Reports
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [timelineReport, setTimelineReport] = useState(null);
  
  // Deletion State
  const [reportToDelete, setReportToDelete] = useState(null);

  // Filters & Sorting
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("recency");
  const [showResolved, setShowResolved] = useState(false);

  // Reports Stream
  useEffect(() => {
    const unsubscribe = reportsApi.streamAllReports((realTimeReports) => {
      setReports(realTimeReports);
      setLoading(false); 
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Filtering Function
  const processedReports = useMemo(() => {
    let filtered = [...reports];

    if (!showResolved) {
      filtered = filtered.filter(r => r.status !== "RESOLVED");
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter(r => r.reportType === filterType);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === "recency") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } 
      else if (sortBy === "priority") {
        return a.prioLevel - b.prioLevel;
      } 
      else if (sortBy === "distance") {
        if (!currentLocation) return 0;
        if (!a.location) return 1;
        if (!b.location) return -1;

        const distA = getDistance(currentLocation, a.location);
        const distB = getDistance(currentLocation, b.location);
        
        return distA - distB; 
      }
      return 0;
    });

    return filtered;
  }, [reports, filterType, filterStatus, sortBy, currentLocation, showResolved]);

  // Action Handlers for Deletion
  const handleDelete = (report) => {
    setReportToDelete(report);
  };

  const handleConfirmDelete = async (reportId) => {
    try {
      await reportsApi.deleteReport(reportId);
      setReportToDelete(null);
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error; 
    }
  };

  // Table Columns
  const columns = [
    { 
      key: "createdAt", 
      label: "Date Reported", 
      render: (row) => (
        <span className="text-gray-600 font-medium">
          {new Date(row.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    { 
      key: "reportType", 
      label: "Type", 
      render: (row) => (
        <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-gray-50 text-gray-700 border-gray-200">
          {row.reportType}
        </span>
      )
    },
    { 
      key: "prioLevel", 
      label: "Priority",
      render: (row) => {
        const priorityConfig = {
          1: { 
            label: "URGENT", 
            textStyle: "text-red-700 font-black", 
          },
          2: { 
            label: "HIGH", 
            textStyle: "text-amber-500 font-bold", 
          },
          3: { 
            label: "MEDIUM", 
            textStyle: "text-yellow-400 font-semibold", 
          },
          4: { 
            label: "LOW", 
            textStyle: "text-slate-400 font-medium", 
          }
        };

        const prio = priorityConfig[row.prioLevel] || { 
          label: `LEVEL ${row.prioLevel}`, 
          textStyle: "text-gray-700 font-medium",
          dot: "bg-gray-400"
        };

        return (
          <span className={`text-xs tracking-wider flex items-center gap-1.5 ${prio.textStyle}`}>
            {prio.label}
          </span>
        );
      }
    },
    { 
      key: "status", 
      label: "Status & History",  
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(row.status)}`}>
            {row.status}
          </span>
          
          {row.remarks && row.remarks.length > 0 && (
            <button 
              onClick={() => setTimelineReport(row)}
              title="View Update History"
              className="p-1.5 text-gray-400 bg-gray-50 hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
            >
              <History size={14} />
            </button>
          )}
        </div>
      )
    },
    { 
      key: "location", 
      label: "Location & Distance", 
      render: (row) => {
        if (!row.location || !row.location.lat || !row.location.lng) return <span className="text-gray-400">Unknown</span>;
        
        let distanceText = "Distance unknown";
        if (currentLocation) {
          const distInMeters = getDistance(currentLocation, row.location);
          const distInKm = (distInMeters / 1000).toFixed(1);
          distanceText = `${distInKm} km away`;
        }
        
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-mono text-xs">
                {row.location.lat.toFixed(4)}, {row.location.lng.toFixed(4)}
              </span>
              <button 
                onClick={() => {
                  console.log("View on map:", row.location);
                }}
                title="Pinpoint on Map"
                className="p-1 bg-gray-100 hover:text-text-primary hover:bg-gray-100 text-gray-500 rounded-md transition-colors"
              >
                <MapPin size={14} />
              </button>
            </div>
            <span className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wide">
              {distanceText}
            </span>
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => {
              setSelectedReport(row)
            }}
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            title="Delete Report"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleUpdateReport = async (reportId, updatedData) => {
    try {
      const { remarks: newComment, status: newStatus } = updatedData;
      const existingRemarks = selectedReport.remarks || [];
      let updatedRemarks = [...existingRemarks];
      
      if (newComment.trim() !== "" || newStatus !== selectedReport.status) {
        updatedRemarks.push({
          comment: newComment.trim() || `Status updated to ${newStatus.replace('_', ' ')}`,
          dateRemarked: new Date().toISOString(),
          status: newStatus
        });
      }

      const payload = {
        status: newStatus,
        remarks: updatedRemarks
      };

      console.log("Updating report", reportId, "with payload:", payload);

      await reportsApi.updateReport(reportId, payload);
      setSelectedReport(null); 
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Headers*/}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-wide">Reports Management</h1>
          <p className="text-text-muted text-sm mt-1">Review and prioritize incoming reports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Resolved Toggle  */}
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-text-primary/20"
          >
            <div 
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                showResolved ? 'bg-text-primary' : 'bg-gray-300'
              }`}
            >
              <div 
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                  showResolved ? 'translate-x-3.5' : 'translate-x-0'
                }`} 
              />
            </div>
            <span>Show Resolved</span>
          </button>

          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-text-primary/20 cursor-pointer">
            <option value="ALL">All Types</option>
            <option value="RESCUE">Rescue</option>
            <option value="SUPPLY">Supply</option>
            <option value="INCIDENT">Incident</option>
          </select>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-text-primary/20 cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-text-primary text-white border border-transparent font-semibold text-sm rounded-xl px-4 py-2 outline-none cursor-pointer shadow-md">
            <option value="recency">Sort: Newest First</option>
            <option value="priority">Sort: Highest Priority</option>
            <option value="distance">Sort: Closest First</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={processedReports} loading={loading} emptyMessage="No reports match your current filters." />

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)}
          onUpdateReport={handleUpdateReport}
        />
      )}

      {/* Remarks Timeline Modal */}
      {timelineReport && (
        <div className="fixed inset-0 z-105 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-gray-200">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/80">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <History size={18} className="text-gray-500" />
                Update History
              </h3>
              <button 
                onClick={() => setTimelineReport(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
              <ReportTimeline remarks={timelineReport.remarks} />
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Delete Modal */}
      {reportToDelete && (
        <DeleteModal
          title="Delete Report?"
          itemName={`${reportToDelete.reportType} Report`}
          itemId={reportToDelete.id}
          extraDetails={[
            { label: "Type", value: reportToDelete.reportType },
            { label: "Current Status", value: reportToDelete.status }
          ]}
          onClose={() => setReportToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ReportsPage;