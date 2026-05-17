import { useState, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  Users,
  Truck,
  MapPin,
  CheckCircle2,
  GripVertical,
  Info,
  RotateCcw,
  Send,
  X,
  Clock,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  pointerWithin,
} from "@dnd-kit/core";
import { teamsApi } from "../../api/teamsApi";
import { reportsApi } from "../../api/reportsApi";
import { usersApi } from "../../api/usersApi";
import AddTeamModal from "../../components/modals/AddTeamModal";
import TeamManagementPage from "./TeamManagementPage";

// --- DRAGGABLE REPORT COMPONENT ---
const DraggableReport = ({ report }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: report.id,
    data: report,
  });

  const priorityStyles = {
    1: { label: "URGENT", border: "border-l-red-500", badge: "bg-red-100 text-red-700" },
    2: { label: "HIGH", border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700" },
    3: { label: "MEDIUM", border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
    4: { label: "LOW", border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" }
  };
  const style = priorityStyles[report.prioLevel] || priorityStyles[3];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-surface p-4 rounded-xl border-l-4 shadow-sm border border-border-light flex gap-3 transition-all touch-none
        ${style.border}
        ${isDragging ? "opacity-40 scale-95 z-50 shadow-xl" : "hover:bg-surface-hover cursor-grab"}
      `}
    >
      <div className="mt-1 text-text-muted">
        <GripVertical size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1.5">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate mr-2">
            {report.id}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${style.badge}`}>
            {style.label}
          </span>
        </div>
        
        <h3 className="font-bold text-text-primary text-sm mb-1 truncate">
          {report.reportType}
        </h3>
        
        {report.description && (
          <p className="text-xs text-text-secondary line-clamp-2 mb-2">
            {report.description}
          </p>
        )}
        
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-2 border-t border-border-light pt-2">
          <MapPin size={12} className="shrink-0" /> 
          <span className="truncate">
            {typeof report.location === 'object' 
              ? `${report.location.lat?.toFixed(4)}, ${report.location.lng?.toFixed(4)}` 
              : (report.location || "Location not provided")}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- DROPPABLE TEAM CARD (For Standby Teams) ---
const DroppableTeamCard = ({
  team,
  attachedReports,
  onDeployClick,
  onRemoveReport,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [headName, setHeadName] = useState("Loading...");

  const { isOver, setNodeRef } = useDroppable({
    id: team.id,
    data: team,
  });

  useEffect(() => {
    const fetchHeadName = async () => {
      if (!team.headId) {
        setHeadName("Not assigned");
        return;
      }
      try {
        const result = await usersApi.getUser(team.headId);
        if (result.success && result.data) {
          const { firstName, lastName } = result.data;
          setHeadName(`${firstName || ""} ${lastName || ""}`.trim() || "Unnamed User");
        } else {
          setHeadName("User not found");
        }
      } catch (error) {
        console.error("Error fetching team head name:", error);
        setHeadName("Error loading name");
      }
    };
    fetchHeadName();
  }, [team.headId]);

  return (
    <div className="w-full" style={{ perspective: "1000px" }}>
      <div
        ref={setNodeRef}
        className="w-full transition-transform duration-500 rounded-xl"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* --- FRONT OF CARD --- */}
        <div
          className={`bg-surface p-4 rounded-xl border border-border-light flex flex-col justify-between shadow-sm transition-all
            ${isFlipped ? "absolute inset-0 h-full overflow-hidden" : "relative h-auto"}
            ${isOver ? "ring-2 ring-inset ring-emerald-500 shadow-md border-transparent" : ""}
          `}
          style={{ backfaceVisibility: "hidden" }}
        >
          {isOver && (
            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[1px] z-10 rounded-xl">
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm animate-bounce">
                Drop to Attach
              </span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-text-primary text-sm">
                {team.teamName || "Unnamed Team"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1 rounded hover:bg-surface-hover"
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary mt-2 mb-3">
              <span className="flex items-center gap-1.5">
                <Users size={14} /> {team.memberCount || 0} pax
              </span>
            </div>

            {/* Attached Reports List */}
            {attachedReports.length > 0 && (
              <div className="space-y-1.5 mb-2 mt-4 pt-3 border-t border-border-light">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Attached Reports:
                </p>
                {attachedReports.map((r) => (
                  <div
                    key={r.id}
                    className="text-xs bg-bg-secondary border border-border-light px-2 py-1.5 rounded-lg flex justify-between items-center group transition-colors hover:bg-bg-tertiary"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-text-primary">
                        {r.id}
                      </span>
                      <span className="text-text-secondary truncate max-w-30">
                        {r.reportType}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveReport(team.id, r)}
                      className="text-text-muted hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all cursor-pointer"
                      title="Remove report"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deploy Button */}
          <button
            onClick={() => onDeployClick(team)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-text-primary hover:opacity-90 text-surface text-xs font-bold py-2.5 rounded-lg transition-opacity z-20 cursor-pointer shadow-sm"
          >
            <Send size={14} /> Deploy Team {attachedReports.length > 0 ? `(${attachedReports.length})` : ""}
          </button>
        </div>

        {/* --- BACK OF CARD --- */}
        <div
          className={`bg-surface-elevated p-5 rounded-xl border border-border-medium flex flex-col shadow-sm
            ${isFlipped ? "relative h-auto" : "absolute inset-0 h-full overflow-hidden"}
          `}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-border-medium">
            <div className="flex items-center gap-2">
              <div className="bg-bg-tertiary p-1.5 rounded-lg text-text-primary">
                <Truck size={16} />
              </div>
              <h3 className="font-bold text-sm text-text-primary">
                Team Details
              </h3>
            </div>
            <button
              onClick={() => setIsFlipped(false)}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-border-light"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-surface p-3 rounded-lg border border-border-light shadow-sm">
              <p className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users size={12} /> Team Head
              </p>
              <p className="text-sm font-medium text-text-primary capitalize">
                {headName}
              </p>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border-light shadow-sm">
              <p className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Current Location
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-bg-primary p-2 rounded border border-border-light flex flex-col items-center">
                  <span className="text-[9px] text-text-muted uppercase mb-0.5">Latitude</span>
                  <span className="font-medium text-text-primary">{team.location?.lat?.toFixed(5) || "N/A"}</span>
                </div>
                <div className="bg-bg-primary p-2 rounded border border-border-light flex flex-col items-center">
                  <span className="text-[9px] text-text-muted uppercase mb-0.5">Longitude</span>
                  <span className="font-medium text-text-primary">{team.location?.lng?.toFixed(5) || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DROPPABLE DEPLOYED TEAM CARD ---
const DeployedTeamCard = ({ deployment, teamReports, onResolve, onCancelReport }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: deployment.id,
    data: deployment,
  });

  const hasInProgressReports = teamReports.some(r => r.status === "IN_PROGRESS");

  return (
    <div
      ref={setNodeRef}
      className={`relative bg-surface p-4 rounded-xl shadow-sm border-l-4 border-l-text-primary border transition-all ${
        isOver ? "border-text-primary ring-2 ring-text-primary/30" : "border-border-light"
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 bg-text-primary/10 flex items-center justify-center backdrop-blur-[1px] z-10 rounded-xl">
          <span className="bg-text-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm animate-bounce">
            Drop to Assign Directly
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-text-primary text-sm">
          {deployment.teamName}
        </h3>
      </div>

      <div className="space-y-2 mt-3">
        {teamReports.length === 0 && (
          <p className="text-xs text-text-muted italic py-1">No active reports attached.</p>
        )}
        {teamReports.map((report) => (
          <div
            key={report.id}
            className="bg-bg-secondary p-2.5 rounded-lg border border-border-light flex flex-col gap-2"
          >
             <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-text-primary truncate mr-2">{report.reportType}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                  report.status === "RESOLVED" ? "bg-surface border-border-light text-text-muted" : "bg-surface-elevated border-border-medium text-text-primary"
                }`}>
                  {report.status}
                </span>
             </div>
             <div className="flex justify-between items-center border-t border-border-light pt-2 mt-1">
                <p className="text-[10px] text-text-muted font-mono bg-bg-primary px-2 py-1 rounded border border-border-light">
                  {report.id}
                </p>
                {report.status !== "RESOLVED" && (
                    <button 
                      onClick={() => onCancelReport(report.id, deployment.id)} 
                      className="text-[10px] font-bold text-text-muted hover:text-text-primary bg-surface border border-border-light hover:bg-surface-hover px-2 py-1 rounded transition-colors"
                    >
                        Cancel
                    </button>
                )}
             </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border-light">
        <span className="text-[10px] text-text-muted font-mono">
          Dispatched: {deployment.deployedAt ? new Date(deployment.deployedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown"}
        </span>
        <button
          onClick={() => onResolve(deployment.id)}
          disabled={hasInProgressReports}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
            hasInProgressReports 
              ? "text-text-muted bg-surface border border-border-light cursor-not-allowed opacity-50" 
              : "text-text-primary bg-surface-elevated border border-border-medium hover:bg-text-primary/5 cursor-pointer"
          }`}
          title={hasInProgressReports ? "Resolve all reports before closing deployment" : ""}
        >
          <CheckCircle2 size={14} /> Resolve
        </button>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
const RespondersPage = () => {
  const [liveReports, setLiveReports] = useState([]);
  const [dbTeams, setDbTeams] = useState([]);
  const [attachedReportsMap, setAttachedReportsMap] = useState({});
  const [activeReport, setActiveReport] = useState(null);
  const [deployModal, setDeployModal] = useState({ isOpen: false, team: null });
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState("DISPATCH");

  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribeTeams = teamsApi.streamAllTeams((data) => {
      setDbTeams(data);
    });

    // Stream ALL non-resolved reports 
    const unsubscribeReports = reportsApi.streamNonResolvedReports((data) => {
      setLiveReports(data);
    });

    return () => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeReports) unsubscribeReports();
    };
  }, []);

  const stagedReportIds = Object.values(attachedReportsMap).flat().map(r => r.id);
  
  // Visible unassigned reports = Has no assigned team AND is not currently staged AND is exactly "VERIFIED"
  const visibleUnassignedReports = liveReports.filter(r => 
    !r.assignedTeam && 
    !stagedReportIds.includes(r.id) && 
    r.status === "VERIFIED" 
  );

  const availableTeams = dbTeams.filter((t) => t.status === "STANDBY");
  const deployedTeams = dbTeams.filter((t) => t.status === "DEPLOYED");

  // DRAG AND DROP HANDLERS 
  const handleDragStart = (event) => {
    const { active } = event;
    const report = visibleUnassignedReports.find((r) => r.id === active.id);
    setActiveReport(report);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveReport(null);
    if (!over) return;

    const reportId = active.id;
    const teamId = over.id;
    const reportToAssign = visibleUnassignedReports.find((r) => r.id === reportId);
    
    if (!reportToAssign) return;

    const targetTeam = dbTeams.find(t => t.id === teamId);

    if (targetTeam?.status === "DEPLOYED") {
      // Directly attach to already deployed team
      try {
        const timeDeployed = new Date().toISOString();
        const readableDispatchTime = new Date().toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        });

        let headName = "Assigned Responder";
        if (targetTeam.headId) {
          const userResult = await usersApi.getUser(targetTeam.headId);
          if (userResult.success && userResult.data) {
            const { firstName, lastName } = userResult.data;
            headName = `${firstName || ""} ${lastName || ""}`.trim() || headName;
          }
        }

        const newRemark = {
          comment: `Response team **${targetTeam.teamName || "Unnamed Team"}** has been dispatched to your location.\n\n**Team Head:** **${headName}**\n**Dispatch Time:** **${readableDispatchTime}**\n\nResponders are on the way. Please stay safe and keep your lines open.`,
          dateRemarked: timeDeployed,
          status: "IN_PROGRESS"
        };

        await Promise.all([
          reportsApi.updateReport(reportId, {
            assignedTeam: targetTeam.id,
            status: "IN_PROGRESS",
            remarks: [...(reportToAssign.remarks || []), newRemark]
          }),
          teamsApi.updateTeam(targetTeam.id, {
            assignedReports: [...(targetTeam.assignedReports || []), reportId]
          })
        ]);
      } catch (error) {
        console.error("Failed to assign directly to deployed team:", error);
        alert("Failed to assign report.");
      }
    } else {
      // Stage for Standby Team
      setAttachedReportsMap((prev) => ({
        ...prev,
        [teamId]: [...(prev[teamId] || []), reportToAssign],
      }));
    }
  };

  const handleRemoveAttachedReport = (teamId, reportToRemove) => {
    setAttachedReportsMap((prev) => {
      const currentReports = prev[teamId] || [];
      const updatedReports = currentReports.filter((r) => r.id !== reportToRemove.id);
      return { ...prev, [teamId]: updatedReports };
    });
  };

  const handleConfirmDeploy = async () => {
    const team = deployModal.team;
    const reportsToDeploy = attachedReportsMap[team.id] || [];
    
    setIsDeploying(true);

    try {
      const assignedReportIds = reportsToDeploy.map(r => r.id);
      const timeDeployed = new Date().toISOString();
      const readableDispatchTime = new Date().toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });

      // Update the Team in Firestore: Set to DEPLOYED 
      await teamsApi.updateTeam(team.id, {
        status: "DEPLOYED",
        assignedReports: assignedReportIds,
        deployedAt: timeDeployed
      });

      // Only update reports if there are any attached
      if (reportsToDeploy.length > 0) {
        let headName = "Assigned Responder";
        if (team.headId) {
          try {
            const userResult = await usersApi.getUser(team.headId);
            if (userResult.success && userResult.data) {
              const { firstName, lastName } = userResult.data;
              headName = `${firstName || ""} ${lastName || ""}`.trim() || headName;
            }
          } catch (error) {
            console.error("Could not fetch team head details for remarks:", error);
          }
        }

        await Promise.all(
          reportsToDeploy.map(report => {
            const newRemark = {
              comment: `Response team **${team.teamName || "Unnamed Team"}** has been dispatched to your location.\n\n**Team Head:** **${headName}**\n**Dispatch Time:** **${readableDispatchTime}**\n\nResponders are on the way. Please stay safe and keep your lines open.`,
              dateRemarked: timeDeployed,
              status: "IN_PROGRESS"
            };

            return reportsApi.updateReport(report.id, { 
              assignedTeam: team.id, 
              status: "IN_PROGRESS",
              remarks: [...(report.remarks || []), newRemark] 
            });
          })
        );
      }

      // Clear staged map 
      setAttachedReportsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[team.id];
        return newMap;
      });

      setDeployModal({ isOpen: false, team: null });
      
    } catch (error) {
      console.error("Failed to deploy reports:", error);
      alert("Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleResolveDeployment = async (deployedTeamId) => {
    try {
      //Only update the team to STANDBY, clear assignedReports. Responders handle report resolutions.
      await teamsApi.updateTeam(deployedTeamId, {
        status: "STANDBY",
        assignedReports: []
      });
    } catch (error) {
      console.error("Failed to resolve team:", error);
      alert("Failed to resolve deployment.");
    }
  };

  const handleCancelReportAssignment = async (reportId, teamId) => {
    try {
      //Fetch report, pop last remark, revert to VERIFIED
      const reportToCancel = liveReports.find(r => r.id === reportId);
      if (!reportToCancel) return;

      const remarks = reportToCancel.remarks || [];
      const updatedRemarks = remarks.slice(0, -1); // Remove the dispatch remark

      await reportsApi.updateReport(reportId, {
        assignedTeam: null,
        status: "VERIFIED",
        remarks: updatedRemarks
      });

      // Remove reportId from team's assignedReports array
      const team = dbTeams.find(t => t.id === teamId);
      if (team) {
        const newAssigned = (team.assignedReports || []).filter(id => id !== reportId);
        await teamsApi.updateTeam(teamId, { assignedReports: newAssigned });
      }

    } catch (error) {
      console.error("Failed to cancel report assignment:", error);
      alert("Failed to cancel report assignment.");
    }
  };

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)] min-h-150 space-y-6 w-full">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border-light shrink-0">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-wide">
                {activeTab === "DISPATCH" ? "Dispatch" : "Teams"}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {activeTab === "DISPATCH"
                  ? "Assign reports and deploy teams."
                  : "Browse and manage team records."}
              </p>
            </div>

            {activeTab === "DISPATCH" && (
              <button
                onClick={() => setIsAddTeamModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-text-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-800 transition-all shadow-md"
              >
                <Plus size={18} />
                <span>Create Team</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("DISPATCH")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === "DISPATCH" ? "text-text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Dispatch
              {activeTab === "DISPATCH" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-text-primary rounded-t-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("TEAMS")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === "TEAMS" ? "text-text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Teams
              {activeTab === "TEAMS" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-text-primary rounded-t-full"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "DISPATCH" ? (
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* COLUMN 1: Unassigned Reports */}
            <div className="flex flex-col bg-surface border border-border-light rounded-2xl p-4 overflow-hidden h-full shadow-sm">
              <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border-light pb-3">
                <h2 className="font-bold text-text-primary flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  Unassigned Reports
                </h2>
                <span className="bg-red-100 text-red-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  {visibleUnassignedReports.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-4">
                {visibleUnassignedReports.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-8">
                    No pending reports.
                  </p>
                )}
                {visibleUnassignedReports.map((report) => (
                  <DraggableReport key={report.id} report={report} />
                ))}
              </div>
            </div>

            {/* COLUMN 2: Available Teams */}
            <div className="flex flex-col bg-surface border border-border-light rounded-2xl p-4 overflow-hidden h-full shadow-sm">
              <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border-light pb-3">
                <h2 className="font-bold text-text-primary flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" />
                  Standby Teams
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  {availableTeams.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 pb-4">
                {availableTeams.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-8">
                    No teams available in database.
                  </p>
                )}
                {availableTeams.map((team) => (
                  <DroppableTeamCard
                    key={team.id}
                    team={team}
                    attachedReports={attachedReportsMap[team.id] || []}
                    onDeployClick={(t) =>
                      setDeployModal({ isOpen: true, team: t })
                    }
                    onRemoveReport={handleRemoveAttachedReport}
                  />
                ))}
              </div>
            </div>

            {/* COLUMN 3: Deployed Teams */}
            <div className="flex flex-col bg-surface border border-border-light rounded-2xl p-4 overflow-hidden h-full shadow-sm">
              <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border-light pb-3">
                <h2 className="font-bold text-text-primary flex items-center gap-2">
                  <Truck size={18} className="text-blue-500" />
                  Deployed Teams
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  {deployedTeams.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-4">
                {deployedTeams.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-8">
                    No active deployments.
                  </p>
                )}
                {deployedTeams.map((deployment) => {
                  const teamReports = liveReports.filter(r => r.assignedTeam === deployment.id);
                  
                  return (
                    <DeployedTeamCard 
                      key={deployment.id} 
                      deployment={deployment}
                      teamReports={teamReports}
                      onResolve={handleResolveDeployment}
                      onCancelReport={handleCancelReportAssignment}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        {/* DRAG OVERLAY */}
        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeReport ? (
            <div className="bg-surface p-4 rounded-xl shadow-2xl border border-border-light flex gap-3 rotate-3 cursor-grabbing w-full sm:w-80">
              <div className="mt-1 text-text-muted">
                <GripVertical size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {activeReport.id}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-sm mb-1">
                  {activeReport.reportType}
                </h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>
        
      </DndContext>
        ) : (
          <div className="flex-1 min-h-0">
            <TeamManagementPage />
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {deployModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start px-6 pt-6 pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-4">
                <Send className="text-blue-600" size={24} />
              </div>
              <button
                disabled={isDeploying}
                onClick={() => setDeployModal({ isOpen: false, team: null })}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <h2 className="text-xl font-black text-text-primary mb-2">
                Confirm Deployment
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                You are about to deploy{" "}
                <strong className="text-text-primary">
                  {deployModal.team?.teamName}
                </strong>{" "}
                with
                <strong className="text-blue-600">
                  {" "}
                  {attachedReportsMap[deployModal.team?.id]?.length || 0}{" "}
                </strong>{" "}
                attached report(s). This action will alert the responders.
              </p>

              {(attachedReportsMap[deployModal.team?.id]?.length || 0) > 0 && (
                <div className="mt-4 bg-bg-secondary border border-border-light rounded-lg p-3 flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                  <span className="text-xs text-text-secondary font-mono mb-1">
                    <span className="font-bold text-text-muted uppercase mr-2">
                      Team ID:
                    </span>
                    {deployModal.team?.id}
                  </span>

                  <div className="border-t border-border-light my-1 pt-1"></div>

                  {attachedReportsMap[deployModal.team?.id]?.map((r) => (
                    <span
                      key={r.id}
                      className="text-xs text-text-secondary flex justify-between"
                    >
                      <span className="font-medium pr-2 truncate">{r.reportType}</span>
                      <span className="font-bold text-text-muted font-mono">
                        {r.id}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-light bg-surface-elevated flex items-center gap-3 justify-end">
              <button
                disabled={isDeploying}
                onClick={() => setDeployModal({ isOpen: false, team: null })}
                className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-surface border border-border-light rounded-xl hover:bg-surface-hover hover:text-text-primary transition-colors outline-none focus:ring-2 focus:ring-border-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeploying}
                onClick={handleConfirmDeploy}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 disabled:opacity-70"
              >
                {isDeploying ? "Deploying..." : "Confirm Deploy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEAM MODAL */}
      {isAddTeamModalOpen && (
        <AddTeamModal onClose={() => setIsAddTeamModalOpen(false)} />
      )}
      
    </>
  );
};

export default RespondersPage;