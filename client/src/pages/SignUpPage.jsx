import { useState } from 'react';
import { useAuthContext } from '../providers/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi'; 
import { MoveLeft } from 'lucide-react'; 

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
    <div className="relative flex min-h-dvh w-full flex-col bg-surface md:items-center md:justify-center md:py-8 md:bg-bg-primary">
      <div className="relative flex h-full w-full flex-col bg-surface md:h-auto md:w-100 md:rounded-[2.5rem] md:shadow-2xl">
        
        {/* Top Header / Back Button Only */}
        <div className="z-20 flex w-full justify-start p-6 shrink-0">
          
          {/* Back Button */}
          <Link
            to="/" 
            className="flex h-9 w-9 items-center justify-center text-text-primary"
            aria-label="Go back"
          >
            <MoveLeft className="h-5 w-5" />
          </Link>          
        </div>

        {/* Form Section */}
        <div className="flex flex-1 flex-col px-8 pb-12 pt-0 overflow-y-auto">
          
          <div className="mb-6 text-center md:mb-8">
            <h1 className="text-3xl font-black text-text-primary">Register</h1>
            <p className="mt-2 text-sm text-text-muted">Join to get started.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col space-y-4">
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              {/* FIRST NAME */}
              <div className="flex w-1/2 flex-col">
                <label className="mb-1 ml-1 text-sm font-medium text-text-muted">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Juan"
                  className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* LAST NAME */}
              <div className="flex w-1/2 flex-col">
                <label className="mb-1 ml-1 text-sm font-medium text-text-muted">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Dela Cruz"
                  className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* CONTACT NO */}
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-sm font-medium text-text-muted">Contact Number</label>
              <div className="flex space-x-2">
                <div className="flex items-center justify-center rounded-xl border border-border-medium bg-bg-primary px-4 font-bold text-text-muted">
                  +63
                </div>
                <input
                  type="tel"
                  name="contactNo"
                  maxLength="10"
                  placeholder="9123456789"
                  className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                  value={formData.contactNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-sm font-medium text-text-muted">Email</label>
              <input
                type="email"
                name="email"
                placeholder="juan@example.com"
                className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* PASSWORD */}
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-sm font-medium text-text-muted">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-sm font-medium text-text-muted">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-text-primary py-4 text-sm font-bold tracking-wide text-surface shadow-lg transition-transform hover:bg-text-secondary disabled:opacity-50 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pb-4 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-text-primary transition-colors hover:underline"
            >
              Log In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignupPage;