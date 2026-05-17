import { useState, useEffect } from "react";
import { useAuthContext } from "../providers/useAuthContext";
import BottomSheet from "../components/BottomSheet";
import ReportTimeline from "../components/ReportTimeline";
import { reportsApi } from "../api/reportsApi";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Clock,
  FolderOpen,
  Filter,
  ArrowDownUp,
  ChevronDown,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Select, MenuItem, FormControl } from "@mui/material";
import { getStatusColor } from "../utils/statusColor";

const STATUS_TABS = ["PENDING", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
const REPORT_TYPES = ["All", "Rescue", "Supply", "Incident"];

const UserReportsPage = () => {
  const { user } = useAuthContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null); 

  // Filters & Sorting State
  const [activeTab, setActiveTab] = useState("PENDING");
  const [sortBy, setSortBy] = useState("newest"); 
  const [filterType, setFilterType] = useState("All");

  // Fetch Reports
  useEffect(() => {
    const fetchMyReports = async () => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const res = await reportsApi.getReportsByUser(user.uid);
        if (res.success) {
          setReports(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [user]);

  // Helper to format Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityLabel = (level) => {
    switch (Number(level)) {
      case 1: return 'Urgent';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      default: return 'Unspecified';
    }
  };

  // Filter and Sort Logic
  const filteredAndSortedReports = reports
    .filter(
      (report) => (report.status || "PENDING").toUpperCase() === activeTab,
    )
    .filter(
      (report) => filterType === "All" || report.reportType === filterType.toUpperCase(),
    )
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="flex h-screen flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-surface shadow-sm z-10 shrink-0">
        <Link
          to="/account"
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
        >
          <ChevronLeft className="text-text-primary" size={24} />
        </Link>
        <h1 className="text-lg font-bold text-text-primary">My Reports</h1>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 space-x-2 bg-surface border-b border-gray-100 shrink-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-text-primary text-white shadow-md"
                : "bg-gray-100 text-text-muted hover:bg-gray-200"
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Filters & Sorting */}
      <div className="flex items-center gap-4 px-4 py-3 shrink-0">
        <MuiThemedSelect
          icon={Filter}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={REPORT_TYPES}
        />

        <MuiThemedSelect
          icon={ArrowDownUp}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' }
          ]}
        />
      </div>

      {/* Report List area */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-4 border-text-muted border-t-text-primary rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-text-muted">
              Loading your reports...
            </p>
          </div>
        ) : filteredAndSortedReports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-10">
            <div className="bg-surface p-6 rounded-full shadow-sm mb-4">
              <FolderOpen
                size={48}
                className="text-text-muted opacity-50"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              No Reports Found
            </h3>
            <p className="text-sm text-text-muted max-w-62.5">
              You don't have any {activeTab.toLowerCase()} reports matching
              these filters right now.
            </p>
          </div>
        ) : (
          /* Report Tiles */
          filteredAndSortedReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="bg-surface rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
            >
              {/* Top Row: Icon, Type, Description & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3 overflow-hidden">
                  
                  <div className="bg-gray-100 p-2 rounded-xl text-text-primary shrink-0 mt-0.5">
                    <FileText size={18} strokeWidth={2.5} />
                  </div>
                  
                  <div className="min-w-0 pr-2"> 
                    <h4 className="font-bold text-text-primary text-sm capitalize truncate">
                      {report.reportType || 'Unknown Incident'}
                    </h4>
                    
                    <p className="text-xs text-text-muted font-medium line-clamp-2 mt-0.5">
                      {report.description || 'No description provided'}
                    </p>
                  </div>
                </div>
                
                <span className={`shrink-0 ml-2 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider border ${getStatusColor(report.status)}`}>
                  {(report.status || 'UPDATE').toUpperCase().replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {/* Location Row */}
                <div className="flex items-start space-x-2 text-text-muted">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-medium truncate">
                    {report.location?.lat && report.location?.lng 
                      ? `${report.location.lat.toFixed(5)}, ${report.location.lng.toFixed(5)}` 
                      : 'Coordinates not available'}
                  </p>
                </div>
                
                {/* Bottom Row: Priority & Time */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  
                  <div className="flex items-center space-x-1.5 text-text-primary">
                    <AlertTriangle size={14} className="shrink-0 text-text-muted" />
                    <span className="text-xs font-bold">
                      {getPriorityLabel(report.prioLevel)} Priority
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-1.5 text-text-muted">
                    <Clock size={14} className="shrink-0" />
                    <p className="text-[11px] font-medium uppercase tracking-wide">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Timeline Bottom Sheet */}
      <BottomSheet
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Report Timeline"
      >
        {selectedReport && (
          <ReportTimeline remarks={selectedReport.remarks} />
        )}
      </BottomSheet>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const MuiThemedSelect = ({ icon: Icon, value, onChange, options }) => {
  return (
    <FormControl size="small">
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        IconComponent={() => (
          <ChevronDown 
            size={16} 
            className="text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
          />
        )}
        renderValue={(selected) => {
          const selectedLabel = typeof options[0] === 'object' 
            ? options.find(opt => opt.value === selected)?.label 
            : selected;

          return (
            <div className="flex items-center gap-2 text-text-primary text-xs font-bold pr-4">
              <Icon size={14} className="text-text-muted shrink-0" />
              <span className="leading-none">{selectedLabel}</span>
            </div>
          );
        }}
        sx={{
          borderRadius: '0.75rem',
          backgroundColor: 'white',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          minWidth: '120px', 
          '.MuiSelect-select': {
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '12px',
            paddingRight: '32px !important',
            display: 'flex',
            alignItems: 'center', 
          },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: '#f3f4f6', 
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e5e7eb',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#111827',
            borderWidth: '1px',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              marginTop: '4px',
            }
          }
        }}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <MenuItem key={val} value={val} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default UserReportsPage;
