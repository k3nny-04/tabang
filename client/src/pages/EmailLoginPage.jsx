import { useState } from 'react';
import { useAuthContext } from '../providers/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi';

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
      const userCredential = await login(email, password);
      const uid = userCredential.user.uid;
      const res = await usersApi.getUser(uid);
      
      if (res.success && res.data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/map");
      }
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
    <div className="relative flex min-h-screen flex-col md:flex-row overflow-hidden bg-text-primary md:bg-surface">
      
      {/* Branding Section */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center bg-text-primary p-8 pb-16 md:w-1/2 md:flex-none md:pb-8 md:shadow-[10px_0_20px_rgba(0,0,0,0.1)]">
        <img 
          src='/edited-logo.png' 
          alt="TABANG Logo" 
          className="mb-8 h-28 w-auto object-contain drop-shadow-2xl md:h-40" 
        />
        
        <h1 className="text-4xl font-black tracking-[0.2em] text-bg-primary drop-shadow-md md:text-5xl">
          TABANG
        </h1>
        
        <p className="mt-2 max-w-xs text-center text-sm font-light tracking-wider text-bg-tertiary opacity-90 md:max-w-sm md:text-base">
          Disaster Response Coordination & Hazard Incident Reporting
        </p>
      </div>

      {/* Wave Transition (Mobile Only) */}
      <div className="relative z-20 -mb-1 -mt-20 w-full md:hidden">
        <svg 
          viewBox="0 0 1440 280" 
          className="block h-auto w-full text-surface" 
          fill="currentColor" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,160 C280,320 400,20 720,120 C1040,220 1200,60 1440,100 L1440,280 L0,280 Z"></path>
        </svg>
      </div>

      {/* Form Section */}
      <div className="z-20 flex flex-1 w-full flex-col items-center bg-surface px-8 pt-4 pb-10 md:w-1/2 md:flex-none md:justify-center md:p-12">
        <div className="flex h-full w-full max-w-md flex-col md:h-auto">
          
          {/* Desktop-Only Header */}
          <div className="hidden text-center md:block md:mb-4">
            <h2 className="text-3xl font-bold text-text-primary">Sign In</h2>
          </div>

          <form onSubmit={handleLogin} className="mt-4 flex flex-1 flex-col space-y-5 md:flex-none">
            
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
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
                className="w-full rounded-xl border border-gray-200 bg-bg-primary p-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
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
                className="w-full rounded-xl border border-gray-200 bg-bg-primary p-4 tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-text-primary py-4 font-semibold text-white shadow-lg transition-all hover:bg-neutral-800 hover:shadow-xl disabled:opacity-50 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>

          </form>
          {/* Divider */}
          <div className="relative mt-4 flex items-center py-2 text-sm text-text-muted">
            <div className="grow border-t border-gray-200"></div>
            <span className="mx-4 shrink-0 bg-surface px-2 text-xs font-bold uppercase tracking-widest text-text-muted">
              OR
            </span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          {/* Emergency Mode Button */}
          <Link
            to="/emergency"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black border border-text-primary text-primary"
          >
            Offline Emergency Mode
          </Link>

          {/* Footer Link */}
          <div className="mt-auto pt-8 text-center text-sm text-text-muted md:mt-6 md:pt-0">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-text-primary transition-colors hover:text-blue-600 hover:underline"
            >
              Signup
            </Link>
          </div>
        </div>
        
      </div>

    </div>
  );
}

export default EmailLoginPage;