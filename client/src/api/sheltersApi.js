 import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase-config";

const SHELTERS_COLLECTION = "shelters";

export const sheltersApi = {
  /**
   * Create a single new shelter
   */
  createShelter: async (shelterData) => {
    try {
      const sheltersRef = collection(db, SHELTERS_COLLECTION);
      const timestamp = new Date().toISOString();

      const docRef = await addDoc(sheltersRef, {
        ...shelterData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return { success: true, shelterId: docRef.id };
    } catch (error) {
      console.error("Error creating shelter:", error);
      throw error;
    }
  },

  /**
   * Get a single shelter by its ID
   */
  getShelter: async (shelterId) => {
    try {
      const shelterRef = doc(db, SHELTERS_COLLECTION, shelterId);
      const docSnap = await getDoc(shelterRef);

      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, message: "Shelter not found" };
      }
    } catch (error) {
      console.error("Error fetching shelter:", error);
      throw error;
    }
  },

  /**
   * Get all shelters (One-time fetch)
   */
  getAllShelters: async () => {
    try {
      const sheltersRef = collection(db, SHELTERS_COLLECTION);
      const querySnapshot = await getDocs(sheltersRef);

      const shelters = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: shelters };
    } catch (error) {
      console.error("Error fetching all shelters:", error);
      throw error;
    }
  },

  /**
   * Update an existing shelter
   */
  updateShelter: async (shelterId, updateData) => {
    try {
      const shelterRef = doc(db, SHELTERS_COLLECTION, shelterId);
      await updateDoc(shelterRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating shelter:", error);
      throw error;
    }
  },

  /**
   * Delete a shelter
   */
  deleteShelter: async (shelterId) => {
    try {
      const shelterRef = doc(db, SHELTERS_COLLECTION, shelterId);
      await deleteDoc(shelterRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting shelter:", error);
      throw error;
    }
  },

  /**
   * Stream ALL shelters in real-time
   */
  streamAllShelters: (callback) => {
    const sheltersRef = collection(db, SHELTERS_COLLECTION);

    const unsubscribe = onSnapshot(
      sheltersRef,
      (snapshot) => {
        const shelters = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(shelters);
      },
      (error) => {
        console.error("Error streaming all shelters:", error);
      }
    );

    return unsubscribe;
  },

  /**
   * SPECIAL: Bulk add an array of shelters
   * Uses writeBatch for efficiency. Note: Firestore batches have a limit of 500 operations.
   */
  bulkAddShelters: async (sheltersArray) => {
    if (!Array.isArray(sheltersArray) || sheltersArray.length === 0) {
      throw new Error("Invalid or empty shelters array provided.");
    }

    try {
      const batch = writeBatch(db);
      const sheltersRef = collection(db, SHELTERS_COLLECTION);
      const timestamp = new Date().toISOString();

      sheltersArray.forEach((shelter) => {
        // Create a new document reference with an auto-generated ID
        const newShelterRef = doc(sheltersRef); 
        batch.set(newShelterRef, {
          ...shelter,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });

      // Commit the batch to Firestore
      await batch.commit();
      
      return { 
        success: true, 
        message: `Successfully seeded ${sheltersArray.length} shelters.` 
      };
    } catch (error) {
      console.error("Error bulk adding shelters:", error);
      throw error;
    }
  }
};