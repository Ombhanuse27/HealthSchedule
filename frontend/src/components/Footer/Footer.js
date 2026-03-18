import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../images/logo1.png';
import { Phone, Mail, MapPin, Twitter, Github, Linkedin, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const quickLinks = [
    { title: 'Hospital List', path: '/hospital' },
    { title: 'Book Appointment', path: '/opdForm' },
    { title: 'Login', path: '/login' },
    { title: 'Register', path: '/register' },
  ];

  const legalLinks = [
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Support', path: '/support' },
  ];

  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter', color: '#0EA5E9', bg: '#E0F2FE' },
    { icon: Github, href: '#', label: 'GitHub', color: '#1E293B', bg: '#F1F5F9' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: '#0369A1', bg: '#E0F2FE' },
  ];

  return (
    <footer style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: "#0F172A", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .footer-link { color: #94A3B8; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .footer-link:hover { color: #fff; transform: translateX(3px); }
        .social-btn { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; transition: all 0.2s; cursor: pointer; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.08); }
        .social-btn:hover { transform: translateY(-3px); border-color: transparent; }
        .subscribe-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* Top gradient bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#6366F1,#0EA5E9,#10B981)" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48 }} className="footer-grid">
          <style>{`
            @media(max-width:900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
            @media(max-width:580px) { .footer-grid { grid-template-columns: 1fr !important; } }
          `}</style>

          {/* ── Brand Column ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
                <Heart size={18} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.1 }}>Health Schedule</p>
                <p style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Smart Healthcare</p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, fontWeight: 500, marginBottom: 24, maxWidth: 280 }}>
              A unified platform to discover hospitals, book appointments, and consult doctors — all in one place.
            </p>

            {/* Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { icon: Phone, text: "+91 1234567890" },
                { icon: Mail, text: "hello@healthschedule.in" },
                { icon: MapPin, text: "Pune, Maharashtra, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} color="#818CF8" />
                  </div>
                  <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map(({ icon: Icon, href, label, color, bg }) => (
                <a key={label} href={href} className="social-btn" title={label} style={{ background: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  <Icon size={16} color="#94A3B8" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {quickLinks.map(({ title, path }) => (
                <li key={path}>
                  <Link to={path} className="footer-link">
                    <ArrowRight size={12} style={{ opacity: 0.5 }} />
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ── */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {legalLinks.map(({ title, path }) => (
                <li key={path}>
                  <Link to={path} className="footer-link">
                    <ArrowRight size={12} style={{ opacity: 0.5 }} />
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Stay Updated
            </h4>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, marginBottom: 16, lineHeight: 1.6 }}>
              Get the latest health tips and hospital updates in your inbox.
            </p>

            {subscribed ? (
              <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="email"
                  placeholder="Enter your email…"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="subscribe-input"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 500, boxSizing: "border-box" }}
                />
                <button
                  type="submit"
                  style={{ padding: "11px", borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#0EA5E9)", color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Platform stats mini */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
              {[["500+", "Hospitals"], ["10k+", "Patients"]].map(([val, lbl]) => (
                <div key={lbl} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "#818CF8" }}>{val}</p>
                  <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
            © 2025 Health Schedule. Built with{" "}
            <Heart size={12} style={{ display: "inline", color: "#EF4444", fill: "#EF4444", verticalAlign: "middle" }} />
            {" "}by <strong style={{ color: "#818CF8" }}>Team CRUD</strong>
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {legalLinks.map(({ title, path }) => (
              <Link key={path} to={path} style={{ fontSize: 12, color: "#334155", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color="#818CF8"}
                onMouseLeave={e => e.target.style.color="#334155"}
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;