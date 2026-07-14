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

      localStorage.setItem("token", mockResponse.token);
      setUser(mockResponse.user);
      
      setLoading(false);
      console.log("⚡ Frontend Login Override Successful!");
      
      navigate("/dashboard");
      return; 
    }
    // ------------------------------------------

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🎯 FIXED: Forced clean sans-serif font family and removed standard shadow pipelines
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" style={{ fontFamily: "sans-serif" }}>
      {/* 🎯 FIXED: Swapped background to premium #BA8E23, removed all shadow-2xl elements and forced flat clean border layout */}
      <div className="bg-[#eeaf12] border border-[#f0bd3c] rounded-[2.5rem] p-10 w-full max-w-md text-slate-900">
        
        <div className="text-center mb-8">
          {/* 🎯 FIXED: Shadow-lg removed from the icon container box view */}
          <div className="bg-slate-900 p-3.5 rounded-2xl inline-block mb-4">
            <Truck size={28} className="text-white" />
          </div>
          {/* 🎯 FIXED: Enlarged text size (text-2.5xl) and normalized uppercase to dynamic standard case */}
          <h1 className="text-2.5xl font-medium tracking-tight text-slate-900">Transport login</h1>
          <p className="text-xs font-medium opacity-75 mt-2 text-slate-900/90">Access your transport management dashboard</p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mb-4 p-3.5 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in zoom-in duration-300">
            <AlertCircle size={16} className="text-yellow-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            {/* 🎯 FIXED: Disabled bold text tags, uppercase converted to readable standard text input label */}
            <label className="text-xs font-medium text-slate-900/90 ml-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter system username"
              // 🎯 FIXED: Custom inner state input fields configured for clean non-bold standard fonts
              className="w-full mt-1.5 px-5 py-3.5 rounded-2xl bg-white/40 border border-[#A37B1E]/40 focus:border-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900 text-sm"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-900/90 ml-1">Password</label>
            <div className="relative mt-1.5">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/40 border border-[#A37B1E]/40 focus:border-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900 text-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800/70 hover:text-slate-900"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 🎯 FIXED: Buttons flat styled (no shadow-lg), font-black removed, clean tracking tags applied */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-slate-900 text-white font-medium text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
          >
            <ShieldCheck size={16} /> {loading ? "Verifying data..." : "Sign in system"}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-900/10 text-center">
          <p className="text-xs font-medium text-slate-900/70">
            Database protected access
          </p>
        </div>
      </div>
    </div>
  );
}