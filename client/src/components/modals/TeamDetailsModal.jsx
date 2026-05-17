import { useState, useEffect } from "react";
import { X, UserPlus, UserMinus, Crown } from "lucide-react";
import { teamsApi } from "../../api/teamsApi";
import { usersApi } from "../../api/usersApi";

const TeamDetailsModal = ({ team, onClose }) => {
  const [currentTeam, setCurrentTeam] = useState(team);
  const [allResponders, setAllResponders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all teams and responders
  useEffect(() => {
    const unsubscribeTeams = teamsApi.streamAllTeams((teams) => {
      setTeams(teams);
    });

    const unsubscribeResponders = usersApi.streamResponders((responders) => {
      setAllResponders(responders);
    });

    return () => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeResponders) unsubscribeResponders();
    };
  }, []);

  const isDeployed = currentTeam?.status?.toLowerCase() === "deployed";

  const currentMembers = allResponders.filter(r => r.teamId === currentTeam.id);

  /**
   * Available responders are those who are not on the current team, 
   * and either have no team or are on a team that is not deployed. 
   * Exclude the leader of any other team to prevent transfer issues.
   */
  const availableResponders = allResponders.filter(r => {
    if (r.teamId === currentTeam.id) return false;
    if (!r.teamId) return true;
    const theirTeam = teams.find(t => t.id === r.teamId);
    if (!theirTeam) return false;
    if (theirTeam.status.toLowerCase() === "deployed") return false;
    if (r.id === theirTeam.headId) return false; 
    return true;
  });

  // Update team member count and user's team assignment when adding a member
  const handleAddMember = async (responderId) => {
    if (isDeployed) return;
    setIsSubmitting(true);
    try {
      const newMembers = [...currentMembers.map(m => m.id), responderId];
      await teamsApi.updateTeam(currentTeam.id, { memberCount: newMembers.length });
      await usersApi.updateUser(responderId, { teamId: currentTeam.id });
      setCurrentTeam(prev => ({ ...prev, memberCount: newMembers.length }));
      setError("");
    } catch (err) {
      console.error("Failed to add member:", err);
      setError("Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update team member count and user's team assignment when removing a member
  const handleRemoveMember = async (responderId) => {
    if (isDeployed || responderId === currentTeam.headId) return;
    setIsSubmitting(true);
    try {
      const newMembers = currentMembers.filter(m => m.id !== responderId).map(m => m.id);
      await teamsApi.updateTeam(currentTeam.id, { memberCount: newMembers.length });
      await usersApi.updateUser(responderId, { teamId: null });
      setCurrentTeam(prev => ({ ...prev, memberCount: newMembers.length }));
      setError("");
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("Failed to remove member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleChangeLeader = async (newHeadId) => {
    if (isDeployed) return;
    setIsSubmitting(true);
    try {
      await teamsApi.updateTeam(currentTeam.id, { headId: newHeadId });
      setCurrentTeam(prev => ({ ...prev, headId: newHeadId }));
      setError("");
    } catch (err) {
      console.error("Failed to change leader:", err);
      setError("Failed to change leader.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-light bg-surface-elevated">
          <h2 className="text-lg font-bold text-text-primary">
            Manage Team: {currentTeam.teamName}
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-border-light rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {isDeployed && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
              This team is deployed. No changes can be made.
            </div>
          )}

          <div className="space-y-6">
            {/* Current Members */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                Current Members ({currentMembers.length})
              </label>
              <div className="space-y-2">
                {currentMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-surface-elevated border border-border-light rounded-lg">
                    <div className="flex items-center gap-3">
                      {member.id === currentTeam.headId && <Crown size={16} className="text-yellow-500" />}
                      <div>
                        <p className="text-sm font-bold text-text-primary">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-text-muted font-mono">{member.id}</p>
                      </div>
                    </div>
                    {!isDeployed && member.id !== currentTeam.headId && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isSubmitting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Change Leader */}
            {!isDeployed && (
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Change Team Leader
                </label>
                <select
                  value={currentTeam.headId}
                  onChange={(e) => handleChangeLeader(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-surface border border-border-light rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-medium"
                >
                  {currentMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add Members */}
            {!isDeployed && (
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Add Members
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableResponders.map(responder => (
                    <div key={responder.id} className="flex items-center justify-between p-3 bg-surface-elevated border border-border-light rounded-lg">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{responder.firstName} {responder.lastName}</p>
                        <p className="text-xs text-text-muted font-mono">{responder.id}</p>
                        {responder.teamId && <p className="text-xs text-blue-600">From another team</p>}
                      </div>
                      <button
                        onClick={() => handleAddMember(responder.id)}
                        disabled={isSubmitting}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))}
                  {availableResponders.length === 0 && (
                    <p className="text-sm text-text-muted p-4 text-center">No available responders to add.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-border-light bg-surface-elevated flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default TeamDetailsModal;