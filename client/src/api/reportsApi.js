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
   * @param {*} reportData
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
          ],
          assignedTeam: null, 
        });
        return { success: true, reportId: docRef.id };
      } catch (error) {
        console.error("Error creating report:", error);
        throw error;
      }
    },

  /**
   * Get a single report by its ID
   * @param {*} reportId
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
   * @param {*} userId
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
   * @param {*} reportId
   * @param {*} updateData
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
   * @param {*} reportId
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
   * @param {*} callback
   */
  streamAllReports: (callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);

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
   * @param {*} reportId
   * @param {*} callback
   */
  streamReport: (reportId, callback) => {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);

    const unsubscribe = onSnapshot(
      reportRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error streaming single report:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Stream UNASSIGNED reports
   * @param {*} callback
   */
  streamUnassignedReports: (callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    
    const q = query(
      reportsRef, 
      where("assignedTeam", "==", null),
      where("status", "==", "VERIFIED")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(reports);
      },
      (error) => {
        console.error("Error streaming unassigned reports:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Stream NON RESOLVED reports
   * @param {*} callback
   */
  streamNonResolvedReports: (callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    
    const q = query(
      reportsRef,
      where("status", "!=", "RESOLVED"),
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(reports);
      },
      (error) => {
        console.error("Error streaming incident reports:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Stream the N most recent NON-RESOLVED reports
   * @param {*} limitCount 
   * @param {*} callback
   */
  streamRecentNonResolvedReports: (limitCount = 5, callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where("status", "!=", "RESOLVED")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        const sortedReports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const topReports = sortedReports.slice(0, limitCount);
        
        callback(topReports);
      },
      (error) => {
        console.error("Error streaming recent non-resolved reports:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Stream the total count of PENDING reports
   * @param {*} callback
   */
  streamPendingReportsCount: (callback) => {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    
    const q = query(
      reportsRef,
      where("status", "==", "PENDING")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.size);
      },
      (error) => {
        console.error("Error streaming pending reports count:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Fetch report analytics formatted for Recharts (One-time fetch)
   * @param {*} timeFrame - "HOUR", "TODAY", "7D", "1M", "YTD", "ALL"
   */
  getChartData: async (timeFrame) => {
    try {
      const reportsRef = collection(db, REPORTS_COLLECTION);
      
      const now = new Date();
      let startDate = null;
      let template = [];

      // Setup buckets and start dates based on timeframe
      switch (timeFrame) {
        case "HOUR":
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          template = ["10m", "20m", "30m", "40m", "50m", "60m"].map(l => ({ label: l, rescue: 0, incident: 0, supply: 0 }));
          break;
        case "TODAY":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          template = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"].map(l => ({ label: l, rescue: 0, incident: 0, supply: 0 }));
          break;
        case "7D":
          startDate = new Date(now.setDate(now.getDate() - 7));
          template = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(l => ({ label: l, rescue: 0, incident: 0, supply: 0 }));
          break;
        case "1M":
          startDate = new Date(now.setDate(now.getDate() - 30));
          template = ["Week 1", "Week 2", "Week 3", "Week 4"].map(l => ({ label: l, rescue: 0, incident: 0, supply: 0 }));
          break;
        case "YTD":
          startDate = new Date(now.getFullYear(), 0, 1);
          template = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(l => ({ label: l, rescue: 0, incident: 0, supply: 0 }));
          break;
        case "ALL":
        default:
          template = []; 
          break;
      }

      let q = query(reportsRef);
      if (startDate) {
        q = query(reportsRef, where("createdAt", ">=", startDate.toISOString()));
      }

      // fetch
      const snapshot = await getDocs(q);
      
      let chartData = JSON.parse(JSON.stringify(template));
      
      const getCategory = (type) => {
        if (!type) return "incident";
        const lower = type.toLowerCase();
        if (lower.includes("rescue")) return "rescue";
        if (lower.includes("supply") || lower.includes("request")) return "supply";
        return "incident";
      };

      // Process each report and increment the appropriate bucket
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt) return;
        
        const date = new Date(data.createdAt);
        const category = getCategory(data.reportType);
        let bucketIndex = -1;

        switch (timeFrame) {
          case "HOUR":
            { const minsAgo = Math.floor((new Date() - date) / 60000);
            bucketIndex = 5 - Math.floor(minsAgo / 10);
            break; }
          case "TODAY":
            bucketIndex = Math.floor(date.getHours() / 4);
            break;
          case "7D":
            bucketIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; 
            break;
          case "1M":
            { const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
            bucketIndex = 3 - Math.floor(daysAgo / 7);
            break; }
          case "YTD":
            bucketIndex = date.getMonth();
            break;
          case "ALL":
            { const year = date.getFullYear().toString();
            let existing = chartData.find(d => d.label === year);
            if (!existing) {
              existing = { label: year, rescue: 0, incident: 0, supply: 0 };
              chartData.push(existing);
            }
            existing[category]++;
            return; }
        }

        if (bucketIndex >= 0 && bucketIndex < chartData.length) {
          chartData[bucketIndex][category]++;
        }
      });

      if (timeFrame === "ALL") {
        chartData.sort((a, b) => parseInt(a.label) - parseInt(b.label));
      }

      return chartData;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  },

  /**
   * Stream reports assigned to a specific team
   * @param {*} teamId
   * @param {*} callback
   */
  streamAssignedReports: (teamId, callback) => {
    if (!teamId) {
      console.warn("streamAssignedReports called without a teamId");
      callback([]);
      return () => {}; 
    }

    const reportsRef = collection(db, REPORTS_COLLECTION);

    const q = query(
      reportsRef,
      where("assignedTeam", "==", teamId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(report => report.status !== "RESOLVED");
        const sortedReports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(sortedReports);
      },
      (error) => {
        console.error("Error streaming assigned reports:", error);
      }
    );

    return unsubscribe;
  }
};
