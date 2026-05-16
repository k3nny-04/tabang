 import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase-config";

const ITEMS_COLLECTION = "items";

export const itemsApi = {
    /**
     * Create a single new item
     * @param {*} itemData 
     */
    createItem: async (itemData) => {
        try {
            const itemsRef = collection(db, ITEMS_COLLECTION);
            const timestamp = new Date().toISOString();
            
            const docRef = await addDoc(itemsRef, {
                ...itemData,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
            return { success: true, itemId: docRef.id };
        } catch (error) {
            console.error("Error creating item:", error);
            throw error;
        }
    },
   
    /**
     * Get a single item 
     * @param {*} itemId 
     */
    getItem: async (itemId) => {
        try {
            const itemRef = doc(db, ITEMS_COLLECTION, itemId);
            const docSnap = await getDoc(itemRef);

            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            else {
                return { success: false, message: "Item not found" };
            }
        } catch (error) {
            console.error("Error fetching item:", error);
            throw error;
        }
    },
    
    /**
     * Update an item 
     * @param {*} itemId 
     * @param {*} updatedData 
     */
    updateItem: async (itemId, updatedData) => {
        try {
            const itemRef = doc(db, ITEMS_COLLECTION, itemId);
            const timestamp = new Date().toISOString();
            
            await updateDoc(itemRef, {
                ...updatedData,
                updatedAt: timestamp,
            });
            return { success: true };
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    },
    
    /**
     * Delete an item
     * @param {*} itemId 
     */
    deleteItem: async (itemId) => {
        try {
            const itemRef = doc(db, ITEMS_COLLECTION, itemId);
            await deleteDoc(itemRef);
            return { success: true };
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    },
    
    /**
     * Stream all items in real-time
     * @param {*} callback 
     */
    streamAllItems: (callback) => {
        const itemsRef = collection(db, ITEMS_COLLECTION);

        const unsubscribe = onSnapshot(
            itemsRef, 
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(items);
            },
            (error) => {
                console.error("Error streaming items:", error);
            }
        );

        return unsubscribe; 
    },
};