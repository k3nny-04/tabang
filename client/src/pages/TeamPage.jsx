import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../providers/useAuthContext';
import { teamsApi } from '../api/teamsApi';
import { usersApi } from '../api/usersApi';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Phone, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  ArrowLeft, 
  Users, 
  ShieldAlert, 
  Star
} from 'lucide-react';

const TeamPage = () => {
  const navigate = useNavigate();
  const { userDoc } = useAuthContext();

  const teamId = userDoc?.teamId;

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState(null);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const unsubscribe = teamsApi.streamTeam(teamId, async (teamData) => {
      setTeam(teamData);
      
      if (teamData) {
        try {
          const res = await usersApi.getTeamMembers(teamId);
          if (res.success) {
            setMembers(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch members:", error);
        }
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [teamId]);

  const handleCopyPhone = async (phone) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    await copyToClipboard(formattedPhone);
    
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'R';
  };

  // --- RENDER: No Team Assigned / Not Part of a Team ---
  if (!teamId || (!team && !loading)) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-primary px-6 py-8 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-6 p-2 rounded-full  text-text-secondary hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mt-12">
          <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center text-text-muted mb-2">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">No Team Assigned</h2>
          <p className="text-text-muted text-sm max-w-62.5">
            You are not part of a team yet. Please wait for dispatch or contact command.
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER: Loading ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-tertiary border-t-text-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-6 top-0 z-10 bg-bg-primary/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-text-primary tracking-wide">Team Details</h1>
        <div className="w-10"></div> 
      </div>

      <div className="px-6 space-y-6">
        
        {/* TEAM INFO CARD */}
        <div className="bg-text-primary rounded-3xl p-6 shadow-md text-surface relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-surface/5">
            <Users size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black tracking-wide text-surface">{team.teamName}</h2>
                <p className="text-text-muted text-xs font-mono mt-1">ID: {team.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-elevated text-text-primary`}>
                {team.status}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-text-secondary/50">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs font-medium">Total Members</span>
                <span className="text-lg font-bold flex items-center gap-2 text-surface">
                  <Users size={16} /> {team.memberCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MEMBERS LIST */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider pl-1">
            Personnel
          </h3>

          <div className="space-y-3">
            {members.map((member) => {
              const isHead = member.id === team.headId;
              const formattedPhone = member.contactNo?.startsWith('+') ? member.contactNo : `+${member.contactNo}`;

              return (
                <div key={member.id} className="bg-surface rounded-2xl p-4 shadow-sm border border-bg-secondary flex flex-col">
                  
                  {/* Top section: Avatar & Info */}
                  <div className="flex items-center gap-4 relative">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-primary font-black text-lg">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-text-primary truncate">
                          {member.firstName} {member.lastName}
                        </h4>
                        {isHead && (
                          <span className="flex items-center gap-1 bg-text-primary text-surface text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                            Team Head
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-text-secondary tracking-wide mt-0.5">
                        {member.specialization || "GENERAL RESPONDER"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">
                        {formattedPhone}
                      </p>
                    </div>
                  </div>

                  {/* Bottom section: Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-bg-secondary">
                    <a 
                      href={`tel:${formattedPhone}`} 
                      className="flex-1 flex justify-center items-center gap-2 bg-text-primary hover:bg-text-secondary text-surface py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95"
                    >
                      <Phone size={16} /> Call
                    </a>
                    
                    <a 
                      href={`sms:${formattedPhone}`} 
                      className="flex-1 flex justify-center items-center gap-2 bg-surface-elevated hover:bg-surface-hover text-text-primary py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95"
                    >
                      <MessageSquare size={16} /> Text
                    </a>

                    <button 
                      onClick={() => handleCopyPhone(member.contactNo)}
                      className="w-12 flex justify-center items-center bg-surface-elevated hover:bg-surface-hover text-text-secondary py-2.5 rounded-xl transition-all active:scale-95 shrink-0"
                      title="Copy Number"
                    >
                      {copiedPhone === member.contactNo ? (
                        <CheckCircle2 size={18} className="text-text-primary" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamPage;