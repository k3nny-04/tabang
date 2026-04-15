import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { teamsApi } from "../../api/teamsApi";
import { usersApi } from "../../api/usersApi";

const AddTeamModal = ({ onClose }) => {
  const [teamName, setTeamName] = useState("");
  const [unassignedResponders, setUnassignedResponders] = useState([]);
  const [selectedResponderIds, setSelectedResponderIds] = useState([]);
  const [headId, setHeadId] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch unassigned responders via stream
  useEffect(() => {
    const unsubscribe = usersApi.streamResponders((responders) => {
      // Filter out responders that already belong to a team
      const unassigned = responders.filter(user => !user.teamId);
      setUnassignedResponders(unassigned);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleResponder = (id) => {
    // 1. Determine if the user is currently selected or not
    const isSelected = selectedResponderIds.includes(id);

    // 2. Calculate the new array of selected IDs
    const newSelection = isSelected 
      ? selectedResponderIds.filter(rId => rId !== id) 
      : [...selectedResponderIds, id];

    // 3. Handle Head ID logic based on the toggle action
    if (isSelected && headId === id) {
      // If we are unchecking the person who is currently the head, clear the head
      setHeadId("");
    } else if (!isSelected && selectedResponderIds.length === 0) {
      // If we are checking the very first person, make them the head by default
      setHeadId(id);
    }

    // 4. Finally, update the state
    setSelectedResponderIds(newSelection);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return setError("Team name is required.");
    if (selectedResponderIds.length === 0) return setError("Select at least one responder.");
    if (!headId) return setError("Please select a Team Head.");

    setIsSubmitting(true);
    setError("");

    try {
      await teamsApi.createTeamWithMembers(teamName.trim(), headId, selectedResponderIds);
      onClose();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError("Failed to create team. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get full objects of selected responders for the Team Head dropdown
  const selectedResponders = unassignedResponders.filter(r => selectedResponderIds.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-light bg-surface-elevated">
          <h2 className="text-lg font-bold text-text-primary">
            Create New Team
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

          <div className="space-y-6">
            {/* Team Name Input */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Alpha Rescue Unit"
                className="w-full bg-surface border border-border-light rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Responder Selection */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-text-muted uppercase mb-2">
                <span>Select Members</span>
                <span className="bg-border-light px-2 py-0.5 rounded-full">{selectedResponderIds.length} Selected</span>
              </label>
              
              <div className="bg-surface-elevated border border-border-light rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <p className="text-sm text-text-muted p-4 text-center">Loading unassigned responders...</p>
                ) : unassignedResponders.length === 0 ? (
                  <p className="text-sm text-text-muted bg-transparent p-4 text-center font-medium">No unassigned responders available.</p>
                ) : (
                  unassignedResponders.map(responder => (
                    <label key={responder.id} className="flex items-center p-3 border-b border-border-light last:border-b-0 hover:bg-surface cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedResponderIds.includes(responder.id)}
                        onChange={() => toggleResponder(responder.id)}
                        className="w-4 h-4 rounded border-border-light text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-bold text-text-primary">{responder.firstName} {responder.lastName}</p>
                        <p className="text-[10px] text-text-muted font-mono">{responder.id}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Team Head Selection */}
            {selectedResponderIds.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Assign Team Head
                </label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full bg-surface border border-border-light rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>Select a leader...</option>
                  {selectedResponders.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.firstName} {r.lastName}
                    </option>
                  ))}
                </select>
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
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedResponderIds.length === 0 || !teamName.trim() || !headId}
            className="px-6 py-2.5 bg-text-primary hover:opacity-90 text-surface text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? "Creating..." : "Create Team"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddTeamModal;