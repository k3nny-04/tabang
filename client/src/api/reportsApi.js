import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase-config";

const REPORTS_COLLECTION = "reports";

export const reportsApi = {
  /**
   * Create a new report
   */
createReport: async (reportData) => {
    try {
      const reportsRef = collection(db, REPORTS_COLLECTION);
      const timestamp = new Date().toISOString();
      const initialStatus = reportData.status || 'PENDING';

      const docRef = await addDoc(reportsRef, {
        ...reportData,
        createdAt: timestamp,
        remarks: [
          {
            comment: "Your report has been submitted and is now pending for review. We will get back to you as soon as possible.",
            dateRemarked: timestamp,
            status: initialStatus
          }
        ]
      });
      return { success: true, reportId: docRef.id };
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },

  /**
   * Get a single report by its ID
   */
  getReport: async (reportId) => {
    try {
      const reportRef = doc(db, REPORTS_COLLECTION, reportId);
      const docSnap = await getDoc(reportRef);

      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, message: "Report not found" };
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  },

  /**
   * Get all reports created by a specific user
   */
  getReportsByUser: async (userId) => {
    try {
      const reportsRef = collection(db, REPORTS_COLLECTION);
      const q = query(reportsRef, where("createdBy", "==", userId));

      const querySnapshot = await getDocs(q);

      const reports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: reports };
    } catch (error) {
      console.error("Error fetching user reports:", error);
      throw error;
    }
  },

  /**
   * Update an existing report
   */
  updateReport: async (reportId, updateData) => {
    try {
      const reportRef = doc(db, REPORTS_COLLECTION, reportId);
      await updateDoc(reportRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  },

  /**
   * Delete a report
   */
  deleteReport: async (reportId) => {
    try {
      const reportRef = doc(db, REPORTS_COLLECTION, reportId);
      await deleteDoc(reportRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  /**
   * Stream ALL reports
   */
  streamAllReports: (callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);

    // onSnapshot listens for changes and pushes them to the callback
    const unsubscribe = onSnapshot(
      reportsRef,
      (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(reports);
      },
      (error) => {
        console.error("Error streaming all reports:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Stream a SINGLE report
   */
  streamReport: (reportId, callback) => {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);

    const unsubscribe = onSnapshot(
      reportRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Document was deleted or doesn't exist
          callback(null);
        }
      },
      (error) => {
        console.error("Error streaming single report:", error);
      },
    );

    return unsubscribe;
  },
};
