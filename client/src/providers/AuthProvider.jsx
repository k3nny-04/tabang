import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { usersApi } from "../api/usersApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // --- Email / Password Methods ---
  const signup = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // --- Phone Auth Methods ---
  const setupRecaptcha = (buttonId) => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved");
      }
    });
  };

  const sendOTP = async (phoneNumber) => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      return result;
    } catch (error) {
      console.error("Send OTP error:", error);
      throw error;
    }
  };

  const verifyOTP = async (code) => {
    if (!confirmationResult) throw new Error("No OTP request found");
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  // --- Listen for Auth State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      if (currentUser) {
        try {
          const res = await usersApi.getUser(currentUser.uid);
          if (res.success) {
            setUserDoc(res.data);
          } else {
            console.warn("User document not found in Firestore.");
            setUserDoc(null);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setUserDoc(null);
        }
        setUser(currentUser);
      } else {
        setUser(null)
        setUserDoc(null);
      }
      setLoading(false); 
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userDoc,
    loading,
    login,
    signup,
    logout,
    setupRecaptcha,
    sendOTP,
    verifyOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };