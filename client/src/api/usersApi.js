import { doc, setDoc, getDoc, updateDoc, deleteDoc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config'; 

const USERS_COLLECTION = 'users';

export const usersApi = {
  /**
   * Create a new user document with a specific ID (Auth UID)
   */
  createUser: async (uid, userData) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
      });
      return { success: true, uid };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Get a user document by UID
   */
  getUser: async (uid) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: "User not found" };
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user's data
   */
  updateUser: async (uid, updateData) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Delete a user document
   */
  deleteUser: async (uid) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await deleteDoc(userRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  /**
   * Stream all users with the role 'RESPONDER' 
   */
  streamResponders: (callback) => {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where("role", "==", "RESPONDER")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responders = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      callback(responders);
    }, (error) => {
      console.error("Error streaming responders:", error);
    });

    return unsubscribe;
  }
};