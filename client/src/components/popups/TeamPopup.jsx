import { useState, useEffect } from "react";
import { usersApi } from "../../api/usersApi"; 

const TeamPopup = ({ team }) => {
  const [headName, setHeadName] = useState("Loading...");

  // Fetch the Team Head's name using the new API
  useEffect(() => {
    let isMounted = true;
    
    const fetchHeadName = async () => {
      if (!team.headId) {
        if (isMounted) setHeadName("No head assigned");
        return;
      }
      
      try {
        const res = await usersApi.getUserName(team.headId);
        if (isMounted) {
          if (res.success) {
            // Using the formatted fields returned from our new API
            const name = res.fullName || `${res.firstName} ${res.lastName}`.trim();
            setHeadName(name || "Unknown User");
          } else {
            setHeadName("Unknown Head");
          }
        }
      } catch (error) {
        console.error("Error fetching team head:", error);
        if (isMounted) setHeadName("Error loading name");
      }
    };

    fetchHeadName();

    return () => {
      isMounted = false; 
    };
  }, [team.headId]);

  // Format the time
  const formattedTime = team.updatedAt 
    ? new Date(team.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Unknown';

  // Determine badge styling based on status
  const status = team.status || "UNKNOWN";
  let badgeColor = "bg-bg-secondary text-text-secondary ring-border-light";
  
  if (status === "DEPLOYED") {
    badgeColor = "bg-blue-50 text-blue-700 ring-blue-200/60";
  } else if (status === "STANDBY") {
    badgeColor = "bg-orange-50 text-orange-700 ring-orange-200/60";
  } else if (status === "RESOLVED" || status === "AVAILABLE") {
    badgeColor = "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
  }

  return (
    <div className="w-60 p-2 text-sm font-sans text-text-primary">
      {/* Title */}
      <h3 className="font-semibold wrap-break-word text-base leading-tight">
        {team.teamName || "Response Team"}
      </h3>
      
      {/* Subtitle / Time */}
      <p className="mt-0.5 text-xs text-text-secondary wrap-break-word">
        Last ping: {formattedTime}
      </p>

      {/* Divider */}
      <div className="my-2 border-t border-border-light" />

      {/* Status Badge */}
      <div className="mb-2">
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${badgeColor}`}>
          Status: {status}
        </span>
      </div>

      {/* Team Head */}
      <p className="mb-1 text-xs text-text-secondary wrap-break-word">
        Team Head: <span className="font-medium text-text-primary">{headName}</span>
      </p>

      {/* Personnel Count */}
      <p className="mb-1 text-xs text-text-secondary wrap-break-word">
        Personnel: <span className="font-medium text-text-primary">{team.memberCount || 0} Members</span>
      </p>
    </div>
  );
};

export default TeamPopup;