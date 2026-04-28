import { db } from "../firebase-config";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  orderBy,
  where,
  writeBatch,
  getDoc,
  arrayRemove,
} from "firebase/firestore";

const COLLECTION_NAME = "teams";
const USERS_COLLECTION = "users";
const teamsCollection = collection(db, COLLECTION_NAME);

export const teamsApi = {
  streamAllTeams: (callback) => {
    const q = query(teamsCollection, orderBy("teamName", "asc"));
    
    return onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(teams);
    }, (error) => {
      console.error("Error streaming teams:", error);
    });
  },

  /**
   * Get only a team's name 
   */
  getTeamName: async (teamId) => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      const docSnap = await getDoc(teamRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          teamName: data.teamName || ""
        };
      } else {
        return { success: false, message: "Team not found" };
      }
    } catch (error) {
      console.error("Error fetching team name:", error);
      throw error;
    }
  },

  streamDeployedTeams: (callback) => {
    const q = query(teamsCollection, where("status", "==", "DEPLOYED"));
    
    return onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(teams);
    }, (error) => {
      console.error("Error streaming deployed teams:", error);
    });
  },

  addTeam: async (teamData) => {
    try {
      const payload = {
        ...teamData,
        status: "STANDBY", 
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(teamsCollection, payload);
      return docRef.id;
    } catch (error) {
      console.error("Error adding team:", error);
      throw error;
    }
  },

  updateTeam: async (teamId, updatedData) => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      await updateDoc(teamRef, {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating team:", error);
      throw error;
    }
  },

  removeAssignedReport: async (teamId, reportId) => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      await updateDoc(teamRef, {
        assignedReports: arrayRemove(reportId)
      });
      return { success: true };
    } catch (error) {
      console.error("Error removing assigned report from team:", error);
      return { success: false, error };
    }
  },

  deleteTeam: async (teamId) => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      await deleteDoc(teamRef);
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  },

  createTeamWithMembers: async (teamName, headId, memberIds) => {
    try {
      const batch = writeBatch(db);
      const teamRef = doc(teamsCollection); 
      const newTeamId = teamRef.id;

      batch.set(teamRef, {
        teamName,
        headId,
        memberCount: memberIds.length,
        status: "STANDBY",
        assignedReports: [],
        updatedAt: new Date().toISOString()
      });

      memberIds.forEach(responderId => {
        const userRef = doc(db, USERS_COLLECTION, responderId);
        batch.update(userRef, { teamId: newTeamId });
      });

      await batch.commit();
      return newTeamId;
    } catch (error) {
      console.error("Error creating team with members:", error);
      throw error;
    }
  },

  /**
   * Stream the total count of DEPLOYED teams
   */
  streamDeployedTeamsCount: (callback) => {
    const q = query(teamsCollection, where("status", "==", "DEPLOYED"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.error("Error streaming deployed teams count:", error);
      }
    );

    return unsubscribe;
  },
  
  /**
   * Stream a single team's data in real-time
   */
  streamTeam: (teamId, callback) => {
    if (!teamId) {
      console.warn("streamTeam called without a teamId");
      return () => {}; 
    }

    const teamRef = doc(db, COLLECTION_NAME, teamId);
    
    const unsubscribe = onSnapshot(
      teamRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          callback({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          callback(null);
        }
      }, 
      (error) => {
        console.error(`Error streaming team with ID ${teamId}:`, error);
      }
    );

    return unsubscribe;
  },
};