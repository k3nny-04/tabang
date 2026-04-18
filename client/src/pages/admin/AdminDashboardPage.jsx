import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Home,
  Users,
  Activity,
  ArrowRight,
  Clock,
  UserCheck,
  X,
  Map,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminMap from "../../components/AdminMap";
import { reportsApi } from "../../api/reportsApi";
import { sheltersApi } from "../../api/sheltersApi";
import { teamsApi } from "../../api/teamsApi";
import { usersApi } from "../../api/usersApi";
import { getStatusColor } from "../../utils/statusColor";

const timeFrameOptions = [
  { id: "HOUR", label: "Past Hour" },
  { id: "TODAY", label: "Today" },
  { id: "7D", label: "7 Days" },
  { id: "1M", label: "1 Month" },
  { id: "YTD", label: "YTD" },
  { id: "ALL", label: "All Time" },
];

const formatDateTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const renderPriority = (level) => {
  const config = {
    1: { label: "URGENT", style: "text-red-700 font-black" },
    2: { label: "HIGH", style: "text-amber-600 font-bold" },
    3: { label: "MEDIUM", style: "text-yellow-600 font-semibold" },
    4: { label: "LOW", style: "text-slate-500 font-medium" },
  };
  const prio = config[level] || {
    label: `LEVEL ${level}`,
    style: "text-gray-700 font-medium",
  };

  return (
    <span className={`flex items-center text-sm tracking-wider ${prio.style}`}>
      {prio.label}
    </span>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // Chart States
  const [timeFrame, setTimeFrame] = useState("TODAY");
  const [filters, setFilters] = useState({
    rescue: true,
    incident: true,
    supply: true,
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Map State
  const [selectedCoords, setSelectedCoords] = useState(null);

  // Reports State
  const [recentReports, setRecentReports] = useState([]);
  const [pendingReportCount, setPendingReportCount] = useState(0);

  // Shelters State
  const [shelterStats, setShelterStats] = useState({
    currentOccupancy: 0,
    maxCapacity: 0,
    activeCount: 0,
  });

  // Teams Count State
  const [deployedTeamsCount, setDeployedTeamsCount] = useState(0);

  // Users Count State
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handlers to update state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Create a reusable fetch function
  const fetchChartData = async () => {
    setIsChartLoading(true);
    try {
      const data = await reportsApi.getChartData(timeFrame);
      setCurrentChartData(data);
    } catch (error) {
      console.error("Failed to load chart data:", error);
    } finally {
      setIsChartLoading(false);
    }
  };

  // Run fetch when the component mounts or timeFrame changes
  useEffect(() => {
    fetchChartData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame]);

  // Stream Recent Reports
  useEffect(() => {
    const unsubscribe = reportsApi.streamRecentNonResolvedReports(
      5,
      (reports) => {
        setRecentReports(reports);
      },
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Stream Pending Report Count
  useEffect(() => {
    const unsubscribe = reportsApi.streamPendingReportsCount((count) => {
      setPendingReportCount(count);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Stream Shelter Occupancy Stats
  useEffect(() => {
    const unsubscribe = sheltersApi.streamShelterOccupancyStats((stats) => {
      setShelterStats(stats);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Stream deployed teams count
  useEffect(() => {
    const unsubscribe = teamsApi.streamDeployedTeamsCount((count) => {
      setDeployedTeamsCount(count);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [])

  // Stream citizen users count
  useEffect(() => {
    const unsubscribe = usersApi.streamCitizensCount((count) => {
      setTotalUsersCount(count);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [])

  const handleFilterChange = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleReportClick = (report) => {
    if (report.location?.lat && report.location?.lng) {
      setSelectedCoords({ lat: report.location.lat, lng: report.location.lng });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-wide">
            Tabang Dashboard
          </h1>
          <p className="text-text-muted mt-1 text-sm flex items-center gap-2">
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-800 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-600 font-medium">System Online</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-medium">System Offline (No Connection)</span>
              </>
            )}
          </p>
        </div>
        <LiveClock />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Reports"
          value={pendingReportCount}
          subtitle="Awaiting review or dispatch"
          icon={<AlertTriangle size={22} />}
        />
        <KpiCard
          title="Shelter Occupancy"
          value={shelterStats.currentOccupancy.toLocaleString()}
          capacity={`/ ${shelterStats.maxCapacity.toLocaleString()}`}
          subtitle={`Across ${shelterStats.activeCount} active shelters`}
          icon={<Home size={22} />}
        />
        <KpiCard 
          title="Deployed Teams" 
          value={deployedTeamsCount} 
          subtitle="Active in the field"
          icon={<UserCheck size={22} />} 
        />
        <KpiCard
          title="Total Users"
          value={totalUsersCount}
          subtitle="Registered citizen accounts"
          icon={<Users size={22} />}
        />
      </div>

      {/* MIDDLE SECTION (Map & Reports) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-112.5">
        {/* MAPBOX CONTAINER */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Map size={16} className="text-gray-400" />
              Live Map
            </h2>
          </div>

          <div className="flex-1 w-full relative bg-gray-100">
            <AdminMap targetCoords={selectedCoords} />
          </div>
        </div>

        {/* RECENT REPORTS FEED */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
              Recent Reports
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {recentReports.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400 font-medium mt-4">
                No active reports found.
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-pointer rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      {/* STATUS BADGE */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(report.status)}`}
                      >
                        {report.status || "PENDING"}
                      </span>
                      {/* PRIORITY BADGE */}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gray-100 text-gray-600 border-gray-200">
                        {renderPriority(report.prioLevel)}
                      </span>
                    </div>
                    {/* READABLE DATE TIME */}
                    <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 shrink-0">
                      <Clock size={10} /> {formatDateTime(report.createdAt)}
                    </span>
                  </div>

                  {/* DESC */}
                  <h3 className="font-bold text-gray-800 mt-2 text-sm line-clamp-2">
                    {report.description || "Unknown Incident"}
                  </h3>

                  {/* LOCATION OBJECT */}
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                    <span className="truncate pr-2">
                      {report.location?.lat && report.location?.lng
                        ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
                        : "Location unavailable"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 shrink-0"
                    />
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center shrink-0">
            <button
              onClick={() => navigate("/admin-reports")}
              className="text-sm font-semibold text-gray-600 hover:text-text-primary transition-colors w-full py-1"
            >
              View All Reports
            </button>
          </div>
        </div>
      </div>

{/* BOTTOM SECTION (Interactive Chart) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
              Report Volume Analytics
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Track incoming reports over time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
            {/* NEW: Refresh Button */}
            <button
              onClick={fetchChartData}
              disabled={isChartLoading}
              className="p-1.5 text-gray-500 hover:text-text-primary hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              title="Refresh chart data"
            >
              <RefreshCw
                size={16}
                className={isChartLoading ? "animate-spin" : ""}
              />
            </button>

            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>

            {/* Timeframe Toggle */}
            <div className="flex flex-wrap items-center bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
              {timeFrameOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTimeFrame(option.id)}
                  disabled={isChartLoading}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                    timeFrame === option.id
                      ? "bg-text-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>

            {/* Checkbox Filters */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600">
                <input
                  type="checkbox"
                  checked={filters.rescue}
                  onChange={() => handleFilterChange("rescue")}
                  disabled={isChartLoading}
                  className="w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                />
                Rescue
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sky-500">
                <input
                  type="checkbox"
                  checked={filters.incident}
                  onChange={() => handleFilterChange("incident")}
                  disabled={isChartLoading}
                  className="w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                />
                Incident
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                <input
                  type="checkbox"
                  checked={filters.supply}
                  onChange={() => handleFilterChange("supply")}
                  disabled={isChartLoading}
                  className="w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                />
                Supply
              </label>
            </div>
          </div>
        </div>

        {/* The Chart */}
        <div className="h-70 w-full relative">
          {/* Optional: Add a loading overlay over the chart */}
          {isChartLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                <RefreshCw size={16} className="animate-spin" />
                Loading data...
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRescue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncident" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{ fontWeight: "bold" }}
              />

              {filters.supply && (
                <Area
                  type="monotone"
                  dataKey="supply"
                  name="Supply Reports"
                  stroke="#64748b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSupply)"
                />
              )}
              {filters.incident && (
                <Area
                  type="monotone"
                  dataKey="incident"
                  name="Incidents"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncident)"
                />
              )}
              {filters.rescue && (
                <Area
                  type="monotone"
                  dataKey="rescue"
                  name="Rescue Reports"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRescue)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right hidden sm:block">
      <p className="text-2xl font-bold text-gray-800 font-mono tracking-tight">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
      <p className="text-sm text-gray-500 font-medium">
        {time.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
};

const KpiCard = ({ title, value, capacity, subtitle, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:border-gray-300 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg group-hover:text-text-primary transition-colors">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-gray-800 flex items-baseline gap-1">
        {value}
        {capacity && (
          <span className="text-sm font-medium text-gray-400">{capacity}</span>
        )}
      </h3>
      <p className="text-[11px] text-gray-500 mt-1 font-medium">{subtitle}</p>
    </div>
  </div>
);

export default AdminDashboardPage;
