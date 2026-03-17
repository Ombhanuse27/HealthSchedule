import { Link } from 'react-router-dom'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/adminApi";
import { loginDoctor } from "../../api/doctorApi";
import Footer from '../Footer/Footer';
import { Heart, User, Lock, ChevronDown, ArrowRight, Stethoscope, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "", role: "admin" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (formData.role === "admin") {
        response = await loginAdmin({ username: formData.username, password: formData.password });
        localStorage.setItem("token", response.data.token);
        navigate("/hospitalsidebar");
      } else {
        response = await loginDoctor({ username: formData.username, password: formData.password });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.doctor?.username || formData.username);
        navigate("/doctorsidebar");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = formData.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .login-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes floatUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .float-up { animation: floatUp 0.5s ease both; }
        .float-up-2 { animation: floatUp 0.5s 0.1s ease both; }
        .float-up-3 { animation: floatUp 0.5s 0.2s ease both; }
        .input-field:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .submit-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35) !important; }
        .submit-btn:active { transform: scale(0.98); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="login-wrap flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 560 }}>

          {/* ── Left Panel ── */}
          <div
            className="hidden md:flex flex-col justify-between p-10 w-5/12"
            style={{ background: "linear-gradient(145deg, #4F46E5 0%, #0EA5E9 60%, #10B981 100%)" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Heart size={20} color="#fff" />
                </div>
                <span className="text-white font-extrabold text-lg">Health Schedule</span>
              </div>

              <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                Welcome<br />back 👋
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Sign in to access your hospital dashboard and manage appointments efficiently.
              </p>
            </div>

            {/* Role cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={16} color="#fff" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Hospital Admin</p>
                  <p className="text-white/60 text-xs">Full dashboard access</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Stethoscope size={16} color="#fff" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Doctor</p>
                  <p className="text-white/60 text-xs">Patient & schedule view</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-10">

            {/* Mobile brand */}
            <div className="flex md:hidden items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366F1,#0EA5E9)" }}>
                <Heart size={16} color="#fff" />
              </div>
              <span className="font-extrabold text-slate-800">Health Schedule</span>
            </div>

            <div className="float-up mb-8">
              <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Sign In</h1>
              <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role selector */}
              <div className="float-up">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login As</label>
                <div className="grid grid-cols-2 gap-3">
                  {["admin", "doctor"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                      style={{
                        background: formData.role === r ? (r === "admin" ? "#EEF2FF" : "#E0F2FE") : "#F8FAFF",
                        border: `1.5px solid ${formData.role === r ? (r === "admin" ? "#6366F1" : "#0EA5E9") : "#E0E7FF"}`,
                        color: formData.role === r ? (r === "admin" ? "#6366F1" : "#0EA5E9") : "#94A3B8",
                      }}
                    >
                      {r === "admin" ? <ShieldCheck size={16} /> : <Stethoscope size={16} />}
                      {r === "admin" ? "Admin" : "Doctor"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div className="float-up-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="float-up-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn w-full py-3.5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  background: isAdmin
                    ? "linear-gradient(135deg,#6366F1,#818CF8)"
                    : "linear-gradient(135deg,#0EA5E9,#38BDF8)",
                  boxShadow: isAdmin
                    ? "0 4px 16px rgba(99,102,241,0.28)"
                    : "0 4px 16px rgba(14,165,233,0.28)",
                }}
              >
                {loading
                  ? <><div className="spin w-4 h-4 rounded-full" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Signing in…</>
                  : <><ArrowRight size={16} /> Sign In as {isAdmin ? "Admin" : "Doctor"}</>
                }
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LoginForm;