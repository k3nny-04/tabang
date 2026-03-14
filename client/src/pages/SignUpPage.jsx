import { useState } from 'react';
import { useAuthContext } from '../providers/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi'; 

const SignupPage = () => {
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNo: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "contactNo" ? value.replace(/\D/g, "") : value,
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, contactNo, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !contactNo || !email || !password || !confirmPassword) {
      return "Please fill in all fields.";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (contactNo.length !== 10) {
      return "Contact number must be exactly 10 digits (e.g., 9123456789).";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (password.length < 6) {
      return "Password should be at least 6 characters long.";
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const { firstName, lastName, contactNo, email, password } = formData;

    try {
      setLoading(true);
      
      const userCredential = await signup(email, password);
      const uid = userCredential?.user?.uid || userCredential?.uid; 

      if (!uid) throw new Error("Could not retrieve user ID from auth.");

      const formattedContactNo = `63${contactNo}`;

      await usersApi.createUser(uid, {
        firstName,
        lastName, 
        contactNo: formattedContactNo,
        email,
        role: "CITIZEN",
      });

      navigate("/map");
      
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("This email is already registered. Please log in.");
          break;
        case 'auth/invalid-email':
          setError("The email address is badly formatted.");
          break;
        case 'auth/weak-password':
          setError("The password provided is too weak.");
          break;
        default:
          setError(err.message || "An error occurred during sign up.");
          console.error("Signup error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-text-primary overflow-hidden">
      
      <div className="flex flex-col items-center justify-center relative pt-8 pb-12 z-10 shrink-0">
        <img 
          src='/edited-logo.png' 
          alt="TABANG Logo" 
          className="h-12 w-auto object-contain drop-shadow-xl mb-3" 
        />
        <h1 className="text-2xl font-black tracking-[0.2em] text-bg-primary drop-shadow-md">
          TABANG
        </h1>
      </div>

      <div className="w-full relative z-20 -mb-1 -mt-16 shrink-0">
        <svg 
          viewBox="0 0 1440 280" 
          className="w-full h-auto block text-surface" 
          fill="currentColor" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,160 C280,320 400,20 720,120 C1040,220 1200,60 1440,100 L1440,280 L0,280 Z"></path>
        </svg>
      </div>

      <div className="flex flex-col flex-1 w-full bg-surface px-8 pt-4 pb-8 z-20 overflow-y-auto">
        
        <h2 className="mb-6 text-center text-3xl font-bold text-text-primary">
          Sign Up
        </h2>

        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <div className="flex flex-col w-1/2">
              <label className="mb-1 ml-1 text-xs font-medium text-text-muted">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Juan"
                className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label className="mb-1 ml-1 text-xs font-medium text-text-muted">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Dela Cruz"
                className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs font-medium text-text-muted">Contact Number</label>
            <div className="flex space-x-2">
              <div className="flex items-center justify-center rounded-xl bg-bg-primary px-4 text-text-muted font-bold border border-transparent">
                +63
              </div>
              <input
                type="tel"
                name="contactNo"
                maxLength="10"
                placeholder="9123456789"
                className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm tracking-wide"
                value={formData.contactNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs font-medium text-text-muted">Email</label>
            <input
              type="email"
              name="email"
              placeholder="juan@example.com"
              className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs font-medium text-text-muted">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm tracking-widest"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs font-medium text-text-muted">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className="w-full rounded-xl bg-bg-primary p-3.5 border-transparent focus:bg-white text-sm tracking-widest"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-text-primary py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-lg"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted pb-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-text-primary hover:underline"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SignupPage;