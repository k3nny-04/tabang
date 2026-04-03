import { db } from "../firebase-config";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

const COLLECTION_NAME = "teams";
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

  addTeam: async (teamData) => {
    try {
      const payload = {
        ...teamData,
        status: "STANDBY", 
        updatedAt: serverTimestamp()
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
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating team:", error);
      throw error;
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
  }
};