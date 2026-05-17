import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import { teamsApi } from "../../api/teamsApi";
import { usersApi } from "../../api/usersApi";
import { ChevronLeft, ChevronRight, Lock, MapPin, Eye, Trash2 } from "lucide-react";
import ExpandedMapModal from "../../components/modals/ExpandedMapModal";
import DeleteModal from "../../components/modals/DeleteModal";
import TeamDetailsModal from "../../components/modals/TeamDetailsModal";

const ITEMS_PER_PAGE = 10;

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMapCoords, setExpandedMapCoords] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const unsubscribe = teamsApi.streamAllTeams((data) => {
      setTeams(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const columns = [
    {
      key: "id",
      label: "Team ID",
      render: (row) => (
        <span className="text-xs font-mono text-gray-500" title={row.id}>
          {row.id}
        </span>
      ),
    },
    {
      key: "teamName",
      label: "Name",
      render: (row) => (
        <span className="font-bold text-gray-800">{row.teamName}</span>
      ),
    },
    {
      key: "memberCount",
      label: "Members",
      render: (row) => (
        <div className="flex items-center text-sm font-mono whitespace-nowrap">
          <span className="text-gray-800">{row.memberCount || 0}</span>
        </div>
      ),
    },
    {
      key: "headId",
      label: "Team Head ID",
      render: (row) => (
        <span className="text-xs font-mono text-gray-500">{row.headId}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.status || "N/A";
        const isStandby = status.toLowerCase() === "standby";
        const isDeployed = status.toLowerCase() === "deployed";
        
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isStandby
                ? "bg-green-100 text-green-800"
                : isDeployed
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "location",
      label: "Location & Distance",
      render: (row) => {
        if (!row.location || !row.location.lat || !row.location.lng)
          return <span className="text-gray-400">Unknown</span>;

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-mono text-xs">
                {row.location.lat.toFixed(4)}, {row.location.lng.toFixed(4)}
              </span>
              <button
                onClick={() => {
                  setExpandedMapCoords(row.location);
                }}
                title="Pinpoint on Map"
                className="p-1 bg-gray-100 hover:text-text-primary hover:bg-gray-100 text-gray-500 rounded-md transition-colors"
              >
                <MapPin size={14} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => {
        const isDeployed = row.status?.toLowerCase() === "deployed";

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setSelectedTeam(row)}
              className="p-2 text-gray-400 hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDeployed) setTeamToDelete(row);
              }}
              disabled={isDeployed}
              title={isDeployed ? "Cannot delete a deployed team" : "Delete Team"}
              className={`p-2 rounded-lg transition-colors ${
                isDeployed
                  ? "text-blue-500 bg-blue-50 cursor-not-allowed opacity-80"
                  : "text-gray-400 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              {isDeployed ? <Lock size={16} /> : <Trash2 size={16} />}
            </button>
          </div>
        );
      }
    }
  ];

  const handleConfirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const membersResponse = await usersApi.getTeamMembers(teamToDelete.id);
      if (membersResponse.success) {
        const memberUpdates = membersResponse.data.map((member) =>
          usersApi.updateUser(member.id, { teamId: null })
        );
        await Promise.all(memberUpdates);
      }

      await teamsApi.deleteTeam(teamToDelete.id);
    } catch (error) {
      console.error("Failed to delete team and unassign members:", error);
    } finally {
      setTeamToDelete(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(teams.length / ITEMS_PER_PAGE));
  const paginatedTeams = teams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-1 flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={paginatedTeams}
          loading={loading}
          emptyMessage="No teams available yet."
        />

        {!loading && teams.length > 0 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-800">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, teams.length)}
              </span>{" "}
              of <span className="font-bold text-gray-800">{teams.length}</span>{" "}
              teams
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 text-sm font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ExpandedMapModal
        isOpen={Boolean(expandedMapCoords)}
        targetCoords={expandedMapCoords}
        onClose={() => setExpandedMapCoords(null)}
      />

      {teamToDelete && (
        <DeleteModal
            title="Delete Team?"
            itemName={`${teamToDelete.teamName}`} 
            itemId={teamToDelete.id}
            extraDetails={[]}
            onClose={() => setTeamToDelete(null)}
            onConfirm={handleConfirmDeleteTeam}
        />
      )}

      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
};

export default TeamManagementPage;
