import { useState } from 'react';
import { useAuthContext } from '../providers/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { WifiOff, MoveLeft } from 'lucide-react'; 

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
    // h-dvh ensures it fits exactly within the mobile browser viewport
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface md:items-center md:justify-center md:bg-bg-primary">
      
      {/* Mobile Container limits width on larger screens to simulate app view */}
      <div className="relative flex h-full w-full flex-col bg-surface md:h-auto md:min-h-150 md:w-100 md:rounded-[2.5rem] md:shadow-2xl">
        
        {/* Top Header / Back & Offline SOS Button */}
        <div className="z-20 flex w-full justify-between items-center p-6 shrink-0">
          
          {/* Back Button */}
          <Link
            to="/" 
            className="flex h-9 w-9 items-center justify-center text-text-primary"
            aria-label="Go back"
          >
            <MoveLeft className="h-5 w-5" />
          </Link>

          {/* Offline Mode Button */}
          <Link
            to="/emergency"
            className="flex items-center gap-2 rounded-full border border-border-medium px-3 py-1.5 text-sm font-semibold text-text-muted transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <WifiOff className="h-4.5 w-4.5 opacity-80" />
            Offline Mode
          </Link>
          
        </div>

        {/* Form Section */}
        <div className="flex flex-1 flex-col justify-center px-8 pb-12 pt-4">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-text-primary">Log In</h1>
            <p className="mt-2 text-sm text-text-muted">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
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
                className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
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
                className="w-full rounded-xl border border-border-medium bg-bg-primary p-4 text-text-primary tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-text-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-text-primary py-4 text-sm font-bold tracking-wide text-surface shadow-lg transition-transform hover:bg-text-secondary disabled:opacity-50 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-text-muted">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-text-primary transition-colors hover:underline"
            >
              Register
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default EmailLoginPage;