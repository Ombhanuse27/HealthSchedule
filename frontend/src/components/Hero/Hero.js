import React, { useState, useEffect } from 'react';
import img from '../../images/doctor15.png';
import { Link } from 'react-router-dom';
import anim1 from "../../video/Telemedicine.mp4";
import anim2 from "../../video/Appointment Detail.mp4";
import anim4 from "../../video/Appointment.mp4";
import { ArrowRight, Calendar, Clock, Shield, Star, Users, ChevronDown } from 'lucide-react';

const Hero = () => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [count, setCount] = useState({ hospitals: 0, patients: 0, doctors: 0 });

  // Animated counters
  useEffect(() => {
    const targets = { hospitals: 500, patients: 10000, doctors: 1200 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        hospitals: Math.floor(targets.hospitals * ease),
        patients: Math.floor(targets.patients * ease),
        doctors: Math.floor(targets.doctors * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Calendar, text: "Easy Scheduling", color: "#6366F1" },
    { icon: Clock, text: "Real-time Slots", color: "#0EA5E9" },
    { icon: Shield, text: "Verified Hospitals", color: "#10B981" },
  ];

  const videos = [
    { src: anim4, label: "Book Appointment", icon: Calendar },
    { src: anim1, label: "Teleconsultation", icon: Users },
    { src: anim2, label: "Track Records", icon: Shield },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes floatUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatRight{ from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring{ 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(1.5);opacity:0} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes count-up  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .hero-text  { animation: floatUp 0.7s ease both; }
        .hero-text-2{ animation: floatUp 0.7s 0.15s ease both; }
        .hero-text-3{ animation: floatUp 0.7s 0.3s ease both; }
        .hero-img   { animation: floatRight 0.8s 0.2s ease both; }
        .float-anim { animation: float 5s ease-in-out infinite; }
        .stat-in    { animation: count-up 0.5s ease both; }

        .gradient-text {
          background: linear-gradient(135deg,#4F46E5 0%,#0EA5E9 50%,#10B981 100%);
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-btn-primary {
          background: linear-gradient(135deg,#4F46E5,#0EA5E9);
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(99,102,241,0.45); }
        .hero-btn-secondary { transition: all 0.2s; border: 2px solid #E0E7FF; }
        .hero-btn-secondary:hover { background:#EEF2FF; border-color:#6366F1; color:#4F46E5; transform:translateY(-1px); }

        .feature-chip { transition: all 0.2s; }
        .feature-chip:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.08); }

        .video-tab { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); cursor:pointer; }
        .video-tab:hover { transform:translateY(-1px); }
        .video-tab.active { box-shadow: 0 4px 16px rgba(99,102,241,0.2); }

        .stat-card { transition: all 0.2s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(99,102,241,0.12); }

        .pulse-dot::after {
          content:''; position:absolute; inset:0; border-radius:50%;
          background:inherit; animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(135deg,#F0F4FF 0%,#EFF6FF 40%,#F0FDF4 100%)",
          paddingTop: 60, paddingBottom: 80,
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div style={{ position:"absolute", top:"-10%", right:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }} className="hero-grid">
            <style>{`.hero-grid { @media(max-width:900px){grid-template-columns:1fr!important} }`}</style>

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div
                className="hero-text"
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, marginBottom:20, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)" }}
              >
                <div className="pulse-dot" style={{ position:"relative", width:8, height:8, borderRadius:"50%", background:"#10B981" }} />
                <span style={{ fontSize:12, fontWeight:700, color:"#6366F1", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                  Smart Healthcare Platform
                </span>
              </div>

              {/* Headline */}
              <h1
                className="hero-text-2"
                style={{ fontSize:"clamp(32px,4.5vw,56px)", fontWeight:900, lineHeight:1.1, color:"#0F172A", marginBottom:20 }}
              >
                Connecting Patients{" "}
                <span className="gradient-text">&amp; Hospitals</span>{" "}
                Seamlessly.
              </h1>

              <p className="hero-text-3" style={{ fontSize:17, color:"#64748B", lineHeight:1.7, marginBottom:32, maxWidth:480, fontWeight:500 }}>
                Book appointments at top hospitals in preferred slots, consult doctors online, and manage your health records — all in one place.
              </p>

              {/* Feature chips */}
              <div className="hero-text-3" style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:36 }}>
                {features.map(({ icon: Icon, text, color }) => (
                  <div key={text} className="feature-chip" style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:12, background:"#fff", border:"1.5px solid #E0E7FF", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:"#334155" }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hero-text-3" style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <Link to="/hospital">
                  <button className="hero-btn-primary" style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 28px", borderRadius:14, color:"#fff", fontWeight:800, fontSize:15, border:"none", cursor:"pointer" }}>
                    Explore Hospitals <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to="/opdForm">
                  <button className="hero-btn-secondary" style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 24px", borderRadius:14, background:"#fff", color:"#334155", fontWeight:700, fontSize:15, cursor:"pointer" }}>
                    <Calendar size={16} style={{ color:"#6366F1" }} /> Book Appointment
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="hero-text-3" style={{ display:"flex", alignItems:"center", gap:14, marginTop:28 }}>
                <div style={{ display:"flex" }}>
                  {["#6366F1","#0EA5E9","#10B981","#F59E0B","#EF4444"].map((c, i) => (
                    <div key={i} style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${c},${c}99)`, border:"2px solid #fff", marginLeft: i > 0 ? -10 : 0, zIndex: 5 - i }} />
                  ))}
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} style={{ color:"#F59E0B", fill:"#F59E0B" }} />)}
                    <span style={{ fontSize:13, fontWeight:800, color:"#1E293B", marginLeft:4 }}>4.9</span>
                  </div>
                  <p style={{ fontSize:12, color:"#94A3B8", fontWeight:500, marginTop:2 }}>Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>

            {/* Right: Doctor image + floating cards */}
            <div className="hero-img" style={{ position:"relative", display:"flex", justifyContent:"center" }}>
              {/* Blob background */}
              <div style={{ position:"absolute", inset:0, borderRadius:"60% 40% 55% 45% / 50% 60% 40% 50%", background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(14,165,233,0.1))", zIndex:0 }} />

              <img src={img} alt="Doctor" className="float-anim" style={{ width:"100%", maxWidth:460, position:"relative", zIndex:1, filter:"drop-shadow(0 20px 40px rgba(99,102,241,0.15))" }} />

              {/* Floating card: Next Appointment */}
              <div style={{ position:"absolute", top:"12%", left:"-5%", background:"#fff", borderRadius:16, padding:"12px 16px", boxShadow:"0 12px 32px rgba(0,0,0,0.12)", border:"1px solid #E0E7FF", zIndex:2, minWidth:180 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Calendar size={17} color="#6366F1" />
                  </div>
                  <div>
                    <p style={{ fontSize:10, color:"#94A3B8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Next Slot</p>
                    <p style={{ fontSize:13, fontWeight:800, color:"#1E293B" }}>Today, 10:00 AM</p>
                  </div>
                </div>
              </div>

              {/* Floating card: Verified */}
              <div style={{ position:"absolute", bottom:"18%", right:"-5%", background:"#fff", borderRadius:16, padding:"12px 16px", boxShadow:"0 12px 32px rgba(0,0,0,0.12)", border:"1px solid #E0E7FF", zIndex:2 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Shield size={17} color="#10B981" />
                  </div>
                  <div>
                    <p style={{ fontSize:10, color:"#10B981", fontWeight:700, textTransform:"uppercase" }}>Verified</p>
                    <p style={{ fontSize:13, fontWeight:800, color:"#1E293B" }}>500+ Hospitals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:64, maxWidth:700 }}>
            {[
              { label:"Hospitals", value:`${count.hospitals}+`, color:"#6366F1", bg:"#EEF2FF" },
              { label:"Patients Served", value:`${count.patients.toLocaleString()}+`, color:"#0EA5E9", bg:"#E0F2FE" },
              { label:"Doctors", value:`${count.doctors}+`, color:"#10B981", bg:"#ECFDF5" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background:"#fff", borderRadius:18, padding:"20px 24px", border:`1.5px solid ${s.bg}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <p className="stat-in" style={{ fontSize:32, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</p>
                <p style={{ fontSize:13, color:"#94A3B8", fontWeight:600, marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES VIDEO SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{ background:"#fff", padding:"80px 0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>

          {/* Section header */}
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, marginBottom:14, background:"#EEF2FF", border:"1px solid #C7D2FE" }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#6366F1", textTransform:"uppercase", letterSpacing:"0.08em" }}>How It Works</span>
            </div>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:900, color:"#0F172A", lineHeight:1.2, marginBottom:12 }}>
              Everything you need for{" "}
              <span className="gradient-text">smarter healthcare</span>
            </h2>
            <p style={{ fontSize:16, color:"#64748B", maxWidth:480, margin:"0 auto", fontWeight:500 }}>
              From instant bookings to teleconsultations — explore our platform's core features.
            </p>
          </div>

          {/* Video tabs */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:32, flexWrap:"wrap" }}>
            {videos.map((v, i) => {
              const Icon = v.icon;
              return (
                <button
                  key={i}
                  className={`video-tab ${activeVideo === i ? "active" : ""}`}
                  onClick={() => setActiveVideo(i)}
                  style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"10px 20px", borderRadius:12, fontWeight:700, fontSize:13,
                    border:`1.5px solid ${activeVideo === i ? "#6366F1" : "#E0E7FF"}`,
                    background: activeVideo === i ? "#EEF2FF" : "#F8FAFF",
                    color: activeVideo === i ? "#4F46E5" : "#64748B",
                    cursor:"pointer",
                  }}
                >
                  <Icon size={15} />
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Videos grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {videos.map((v, i) => (
              <div
                key={i}
                onClick={() => setActiveVideo(i)}
                style={{
                  borderRadius:20, overflow:"hidden", cursor:"pointer",
                  border:`2px solid ${activeVideo === i ? "#6366F1" : "#E0E7FF"}`,
                  boxShadow: activeVideo === i ? "0 8px 32px rgba(99,102,241,0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
                  transition:"all 0.25s",
                  transform: activeVideo === i ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* Card header */}
                <div style={{ padding:"14px 16px", borderBottom:`1px solid ${activeVideo === i ? "#C7D2FE" : "#F1F5F9"}`, background: activeVideo === i ? "#F5F3FF" : "#FAFAFE", display:"flex", alignItems:"center", gap:8 }}>
                  <v.icon size={15} color={activeVideo === i ? "#6366F1" : "#94A3B8"} />
                  <span style={{ fontSize:13, fontWeight:700, color: activeVideo === i ? "#4F46E5" : "#64748B" }}>{v.label}</span>
                  {activeVideo === i && <div style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:"#6366F1" }} />}
                </div>
                <div style={{ background:"#0F172A", aspectRatio:"16/9" }}>
                  <video
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                    autoPlay loop muted playsInline
                  >
                    <source src={v.src} type="video/mp4" />
                  </video>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding:"64px 24px" }}>
        <div
          style={{
            maxWidth:900, margin:"0 auto", borderRadius:28, padding:"48px 40px",
            background:"linear-gradient(135deg,#4F46E5 0%,#0EA5E9 60%,#10B981 100%)",
            textAlign:"center", position:"relative", overflow:"hidden",
            boxShadow:"0 20px 60px rgba(99,102,241,0.25)",
          }}
        >
          <div style={{ position:"absolute", top:"-30%", right:"-10%", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-30%", left:"-5%", width:250, height:250, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
          <h2 style={{ fontSize:"clamp(22px,3vw,36px)", fontWeight:900, color:"#fff", marginBottom:12, position:"relative" }}>
            Ready to take charge of your health?
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.8)", marginBottom:32, fontWeight:500, position:"relative" }}>
            Join thousands of patients already using Health Schedule.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", position:"relative" }}>
            <Link to="/hospital">
              <button style={{ padding:"14px 28px", borderRadius:14, background:"#fff", color:"#4F46E5", fontWeight:800, fontSize:15, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.2s", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
              >
                Find a Hospital <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/opdForm">
              <button style={{ padding:"14px 28px", borderRadius:14, background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:15, border:"1.5px solid rgba(255,255,255,0.35)", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              >
                Book Now
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;