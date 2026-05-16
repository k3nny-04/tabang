 import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase-config";

const SHELTERS_COLLECTION = "shelters";

export const sheltersApi = {
  /**
   * Create a single new shelter
   * @param {*} shelterData
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
   * @param {*} shelterId
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
   * Get all shelters 
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
   * @param {*} shelterId
   * @param {*} updateData
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
   * @param {*} shelterId
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
   * @param {*} callback
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
   * Stream ONLY ACTIVE shelters in real-time
   * @param {*} callback
   */
  streamActiveShelters: (callback) => {
    const sheltersRef = collection(db, SHELTERS_COLLECTION);
    
    // Query to filter at the database level
    const activeQuery = query(sheltersRef, where("status", "==", "ACTIVE"));

    const unsubscribe = onSnapshot(
      activeQuery,
      (snapshot) => {
        const shelters = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(shelters);
      },
      (error) => {
        console.error("Error streaming active shelters:", error);
      }
    );

    return unsubscribe;
  },

  /**
   * SPECIAL: Bulk add an array of shelters
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
        const newShelterRef = doc(sheltersRef); 
        batch.set(newShelterRef, {
          ...shelter,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });

      await batch.commit();
      
      return { 
        success: true, 
        message: `Successfully seeded ${sheltersArray.length} shelters.` 
      };
    } catch (error) {
      console.error("Error bulk adding shelters:", error);
      throw error;
    }
  },

  /**
   * SPECIAL: Bulk update existing shelters to append hotlines based on barangay mapping
   */
  bulkUpdateShelterHotlines: async (barangayHotlines) => {
    if (!Array.isArray(barangayHotlines) || barangayHotlines.length === 0) {
      throw new Error("Invalid or empty barangay hotlines array provided.");
    }

    try {
      const sheltersRef = collection(db, SHELTERS_COLLECTION);
      const querySnapshot = await getDocs(sheltersRef);

      const timestamp = new Date().toISOString();
      let currentBatch = writeBatch(db);
      let batchArray = [];
      let operationCount = 0;
      let totalUpdated = 0;

      querySnapshot.forEach((shelterDoc) => {
        const shelterData = shelterDoc.data();
        const shelterBarangay = shelterData.barangay;

        if (shelterBarangay) {
          const match = barangayHotlines.find(
            (b) => b.barangay.toLowerCase() === shelterBarangay.toLowerCase()
          );

          if (match && match.hotline) {
            currentBatch.update(shelterDoc.ref, {
              hotline: match.hotline,
              updatedAt: timestamp,
            });

            operationCount++;
            totalUpdated++;

            if (operationCount === 490) {
              batchArray.push(currentBatch.commit());
              currentBatch = writeBatch(db);
              operationCount = 0;
            }
          }
        }
      });

      if (operationCount > 0) {
        batchArray.push(currentBatch.commit());
      }

      await Promise.all(batchArray);

      return {
        success: true,
        message: `Successfully updated ${totalUpdated} shelters with assigned hotlines.`,
      };
    } catch (error) {
      console.error("Error bulk updating shelter hotlines:", error);
      throw error;
    }
  },

  /**
   * Stream aggregate occupancy stats for ACTIVE shelters
   * @param {*} callback
   */
  streamShelterOccupancyStats: (callback) => {
    const sheltersRef = collection(db, SHELTERS_COLLECTION);
    
    const activeQuery = query(sheltersRef, where("status", "==", "ACTIVE"));

    const unsubscribe = onSnapshot(
      activeQuery,
      (snapshot) => {
        let totalCurrent = 0;
        let totalMax = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          totalCurrent += Number(data.currentCapacity) || 0;
          totalMax += Number(data.maxCapacity) || 0;
        });

        callback({
          currentOccupancy: totalCurrent,
          maxCapacity: totalMax,
          activeCount: snapshot.size
        });
      },
      (error) => {
        console.error("Error streaming shelter occupancy:", error);
      }
    );

    return unsubscribe;
  },
};