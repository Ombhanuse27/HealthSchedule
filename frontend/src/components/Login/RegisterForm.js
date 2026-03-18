import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAdmin } from "../../api/adminApi";
import Footer from '../Footer/Footer';
import { Heart, User, Lock, MapPin, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "", address: "", email: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerAdmin(formData);
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Create username", "Enter Email","Set password", "Add address"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .reg-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes floatUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .float-up   { animation: floatUp 0.45s 0.0s ease both; }
        .float-up-2 { animation: floatUp 0.45s 0.08s ease both; }
        .float-up-3 { animation: floatUp 0.45s 0.16s ease both; }
        .float-up-4 { animation: floatUp 0.45s 0.24s ease both; }
        .input-field:focus { border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .submit-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.35) !important; }
        .submit-btn:active { transform: scale(0.98); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="reg-wrap flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 560 }}>

          {/* ── Right image/info panel ── */}
          <div
            className="hidden md:flex flex-col justify-between p-10 w-5/12 order-last"
            style={{ background: "linear-gradient(145deg, #059669 0%, #0D9488 50%, #0EA5E9 100%)" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Heart size={20} color="#fff" />
                </div>
                <span className="text-white font-extrabold text-lg">Health Schedule</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                Join us<br />today 🏥
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Register your hospital admin account and start managing appointments, doctors, and patient records.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Getting started</p>
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-white/80 text-sm font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Form Panel ── */}
          <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-10">

            {/* Mobile brand */}
            <div className="flex md:hidden items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#10B981,#0EA5E9)" }}>
                <Heart size={16} color="#fff" />
              </div>
              <span className="font-extrabold text-slate-800">Health Schedule</span>
            </div>

            <div className="float-up mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <Building2 size={13} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Hospital Admin</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Create Account</h1>
              <p className="text-slate-400 text-sm">Register to get full access to the platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="float-up-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6EE7B7" }} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F0FDF9", border: "1.5px solid #D1FAE5" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="float-up-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6EE7B7" }} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F0FDF9", border: "1.5px solid #D1FAE5" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="float-up-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6EE7B7" }} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F0FDF9", border: "1.5px solid #D1FAE5" }}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="float-up-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hospital Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6EE7B7" }} />
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter hospital address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                    style={{ background: "#F0FDF9", border: "1.5px solid #D1FAE5" }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn w-full py-3.5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#10B981,#0D9488)",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.28)",
                }}
              >
                {loading
                  ? <><div className="spin w-4 h-4 rounded-full" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Creating account…</>
                  : <><CheckCircle2 size={16} /> Create Account</>
                }
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: "#10B981" }}>
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;