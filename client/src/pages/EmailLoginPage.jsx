import { useState } from 'react';
import { useAuthContext } from '../providers/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'; 

const EmailLoginPage = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/map");
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError("The email address is badly formatted.");
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Incorrect email or password. Please try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later.");
          break;
        default:
          setError("An error occurred during login. Please try again.");
          console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-text-primary overflow-hidden">
      
      {/* Top Section - Logo, Title, and Tagline */}
      <div className="flex flex-1 flex-col items-center justify-center relative pb-16 z-10">
        
        <img 
          src={logoImg} 
          alt="TABANG Logo" 
          className="h-64 w-auto object-contain drop-shadow-2xl -mb-13" 
        />
        
        <h1 className="text-4xl font-black tracking-[0.2em] text-bg-primary drop-shadow-md">
          TABANG
        </h1>
        
        <p className="mt-2 text-sm font-light tracking-wider text-bg-tertiary opacity-90 text-center px-6 max-w-xs">
          Disaster Response Coordination & Hazard Incident Reporting
        </p>

      </div>

      {/* Wave Transition */}
      <div className="w-full relative z-20 -mb-1 -mt-20">
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

      {/* Bottom Section - Form */}
      <div className="flex h-[55%] w-full flex-col bg-surface px-8 pt-4 pb-10 z-20">
        
        <form onSubmit={handleLogin} className="flex flex-col space-y-5 flex-1 mt-4">
          
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-sm font-medium text-text-muted">
              Email
            </label>
            <input
              type="email"
              placeholder="juan@example.com"
              className="w-full rounded-xl bg-bg-primary p-4 border-transparent focus:bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-sm font-medium text-text-muted">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl bg-bg-primary p-4 border-transparent focus:bg-white tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-text-primary py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Footer Link */}
        <div className="mt-auto text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-text-primary hover:underline"
          >
            Sign Up
          </Link>
        </div>

      </div>

    </div>
  );
}

export default EmailLoginPage;