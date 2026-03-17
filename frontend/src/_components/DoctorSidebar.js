"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Info,
  LogOut,
  Heart,
  ChevronRight,
  Menu,
  X,
  Activity,
  Stethoscope,
} from "lucide-react";

import DoctorDashboard from "../components/Doctor/DoctorDashboard";
import DoctorInfo from "../components/Doctor/DoctorInfo";

const links = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    component: DoctorDashboard,
    description: "My patients & OPD",
  },
  {
    id: "info",
    label: "My Profile",
    icon: Info,
    color: "#10B981",
    bg: "#ECFDF5",
    component: DoctorInfo,
    description: "Personal details",
  },
];

export function DoctorSidebar() {
  const [selected, setSelected] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActiveComponent = links.find((l) => l.id === selected)?.component || DoctorDashboard;
  const activeLink = links.find((l) => l.id === selected);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background: "#FAF5FF",
        height: "calc(100vh - 88px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .doc-nav-item {
          position: relative; display: flex; align-items: center;
          gap: 12px; padding: 12px 16px; border-radius: 16px;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          border: 1.5px solid transparent;
        }
        .doc-nav-item:hover { background: rgba(139,92,246,0.06); }
        .doc-nav-item.active {
          border-color: rgba(139,92,246,0.18);
          background: #fff;
          box-shadow: 0 4px 16px rgba(139,92,246,0.12);
        }
        .doc-sidebar-collapsed .doc-nav-label,
        .doc-sidebar-collapsed .doc-nav-desc,
        .doc-sidebar-collapsed .doc-nav-arrow { display: none; }
        .doc-sidebar-collapsed { width: 76px !important; }
        .doc-sidebar-collapsed .doc-nav-item { justify-content: center; padding: 12px; }
        .doc-sidebar-collapsed .doc-sidebar-footer { padding: 16px 10px; }

        .doc-content-area { flex: 1; overflow-y: auto; background: #FAF5FF; }

        .doc-toggle-btn {
          width: 30px; height: 30px; border-radius: 10px;
          background: #fff; border: 1.5px solid #EDE9FE;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #8B5CF6; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(139,92,246,0.1);
        }
        .doc-toggle-btn:hover { background: #F5F3FF; }

        .doc-breadcrumb-bar {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(139,92,246,0.08);
          padding: 14px 28px;
          display: flex; align-items: center; gap: 10px;
          position: sticky; top: 0; z-index: 20;
        }

        .doc-mobile-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(15,23,42,0.4); backdrop-filter: blur(4px);
        }
        .doc-mobile-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 280px;
          z-index: 50; background: #fff; border-right: 1px solid #EDE9FE;
          box-shadow: 8px 0 32px rgba(139,92,246,0.15);
          padding: 28px 16px; display: flex; flex-direction: column; gap: 8px;
        }
        .doc-user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg,#F5F3FF,#EFF6FF);
          border-radius: 14px; border: 1px solid #EDE9FE;
        }
        .doc-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; border-radius: 14px; cursor: pointer;
          color: #EF4444; font-size: 14px; font-weight: 700;
          background: #FFF5F5; border: 1.5px solid #FEE2E2;
          transition: all 0.2s; width: 100%;
        }
        .doc-logout-btn:hover { background: #FEE2E2; }

        @media (max-width: 768px) {
          .doc-desktop-sidebar { display: none !important; }
          .doc-mobile-trigger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .doc-mobile-trigger { display: none !important; }
        }
      `}</style>

      {/* Mobile Top Bar */}
      <div className="doc-mobile-trigger" style={{ display: "none", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#fff", borderBottom: "1px solid #EDE9FE", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B5CF6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>Doctor Portal</span>
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ width: 38, height: 38, borderRadius: 10, background: "#F5F3FF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Menu size={18} color="#8B5CF6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="doc-mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="doc-mobile-sidebar" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#8B5CF6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stethoscope size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: "#1E293B", fontSize: 15, lineHeight: 1 }}>Doctor Portal</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Health Schedule</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#F8FAFF", border: "1px solid #EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={15} color="#94A3B8" />
                </button>
              </div>
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = selected === link.id;
                return (
                  <div key={link.id} className={`doc-nav-item ${isActive ? "active" : ""}`} onClick={() => { setSelected(link.id); setMobileOpen(false); }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: isActive ? link.bg : "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={isActive ? link.color : "#94A3B8"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: isActive ? "#1E293B" : "#64748B" }}>{link.label}</p>
                      <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 2 }}>{link.description}</p>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: "auto" }}>
                <button className="doc-logout-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }} className="doc-desktop-sidebar-container">

        {/* Sidebar Panel */}
        <div
          className={`doc-desktop-sidebar ${sidebarOpen ? "" : "doc-sidebar-collapsed"}`}
          style={{ width: sidebarOpen ? 260 : 76, flexShrink: 0, background: "#fff", borderRight: "1px solid #EDE9FE", display: "flex", flexDirection: "column", padding: "20px 12px", gap: 8, transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", position: "relative", overflow: "hidden" }}
        >
          {/* Collapse toggle */}
          <div style={{ display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center", paddingBottom: 12, borderBottom: "1px solid #F1F5F9", marginBottom: 4 }}>
            <button className="doc-toggle-btn" onClick={() => setSidebarOpen((v) => !v)}>
              <ChevronRight size={14} style={{ transform: sidebarOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
            </button>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {sidebarOpen && (
              <p style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 8px" }}>Navigation</p>
            )}
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = selected === link.id;
              return (
                <div key={link.id} className={`doc-nav-item ${isActive ? "active" : ""}`} onClick={() => setSelected(link.id)} title={!sidebarOpen ? link.label : undefined}>
                  {isActive && (
                    <motion.div layoutId="doc-sidebar-active" style={{ position: "absolute", inset: 0, borderRadius: 14, background: `linear-gradient(135deg, ${link.bg} 0%, #fff 100%)`, zIndex: 0 }} />
                  )}
                  <div className="doc-nav-icon-wrap" style={{ position: "relative", zIndex: 1, width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: isActive ? link.bg : "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                    <Icon size={17} color={isActive ? link.color : "#94A3B8"} />
                  </div>
                  {sidebarOpen && (
                    <div className="doc-nav-label" style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <p style={{ fontWeight: isActive ? 800 : 600, fontSize: 13.5, color: isActive ? "#1E293B" : "#64748B", lineHeight: 1.2 }}>{link.label}</p>
                      <p className="doc-nav-desc" style={{ fontSize: 10.5, color: "#CBD5E1", marginTop: 1 }}>{link.description}</p>
                    </div>
                  )}
                  {isActive && sidebarOpen && (
                    <ChevronRight size={14} className="doc-nav-arrow" style={{ color: link.color, position: "relative", zIndex: 1, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="doc-sidebar-footer" style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {sidebarOpen && (
              <div className="doc-user-chip">
                <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Stethoscope size={14} color="#fff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Doctor</p>
                  <p style={{ fontSize: 10.5, color: "#94A3B8" }}>Health Schedule</p>
                </div>
              </div>
            )}
            <button className="doc-logout-btn" onClick={handleLogout} style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }} title={!sidebarOpen ? "Logout" : undefined}>
              <LogOut size={15} />
              {sidebarOpen && "Sign Out"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Breadcrumb */}
          <div className="doc-breadcrumb-bar">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: activeLink?.bg || "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeLink && React.createElement(activeLink.icon, { size: 14, color: activeLink.color })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Health Schedule</span>
              <ChevronRight size={12} color="#CBD5E1" />
              <span style={{ fontSize: 13, color: "#1E293B", fontWeight: 800 }}>{activeLink?.label}</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F5F3FF", padding: "5px 12px", borderRadius: 99, border: "1px solid #DDD6FE" }}>
              <Activity size={12} color="#8B5CF6" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>Doctor Portal Active</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="doc-content-area" style={{ flex: 1, overflowY: "auto" }}>
            <AnimatePresence mode="wait">
              <motion.div key={selected} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22, ease: "easeOut" }} style={{ width: "100%", minHeight: "100%" }}>
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSidebar;