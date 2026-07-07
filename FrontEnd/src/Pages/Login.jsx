import { useState } from "react";
import { Eye, EyeOff, Truck, ShieldCheck, AlertCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- 🔐 FRONTEND HARDCODED BYPASS LOGIC ---
    if (form.username === "admin" && form.password === "123") {
      const mockResponse = {
        token: "frontend_hardcoded_bypass_token_2026",
        user: {
          id: "hardcoded_admin_id_2026",
          name: "System Administrator",
          role: "admin",
          username: "admin",
          department: "IT DEPARTMENT"
        }
      };

      // 1. Commit mocked payload properties to internal sync state
      localStorage.setItem("token", mockResponse.token);
      setUser(mockResponse.user);
      
      setLoading(false);
      console.log("⚡ Frontend Login Override Successful!");
      
      // 2. Clear view pipeline immediately to step into secure workspace
      navigate("/dashboard");
      return; 
    }
    // ------------------------------------------

    try {
      // 1. Send credentials to your backend API
      const res = await axios.post("http://localhost:5000/api/login", {
        username: form.username,
        password: form.password,
      });

      // 2. Save the JWT token to localStorage for persistent session
      localStorage.setItem("token", res.data.token);

      // 3. Set the user state with data from database (name, role, etc.)
      setUser(res.data.user);

      // 4. Redirect to the dashboard
      navigate("/dashboard");
    } catch (err) {
      // 5. Catch errors like "Username not found" or "Invalid credentials"
      setError(err.response?.data?.message || "Login failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <div className="bg-yellow-500 border-2 border-yellow-500 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md text-slate-900">
        
        <div className="text-center mb-6">
          <div className="bg-slate-900 p-3 rounded-2xl inline-block mb-3 shadow-lg">
            <Truck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">TMS Login</h1>
          <p className="text-xs font-bold opacity-80 mt-1 text-black">Access your transport dashboard</p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="mb-4 p-3 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
            <AlertCircle size={16} className="text-yellow-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 ml-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter system username"
              className="w-full mt-1 px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-yellow-500/30 focus:border-slate-900 focus:bg-white outline-none transition-all font-bold"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 ml-1">Password</label>
            <div className="relative mt-1">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-yellow-500/30 focus:border-slate-900 focus:bg-white outline-none transition-all font-bold"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
          >
            <ShieldCheck size={16} /> {loading ? "Verifying..." : "Sign In System"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-yellow-500/20 text-center">
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
            Database Protected Access
          </p>
        </div>
      </div>
    </div>
  );
}