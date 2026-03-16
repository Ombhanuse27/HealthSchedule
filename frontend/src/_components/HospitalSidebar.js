"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Stethoscope,
  Info,
  LogOut,
  Heart,
  ChevronRight,
  Menu,
  X,
  Activity,
} from "lucide-react";

import Dashboard from "../components/HospitalAdmin/AdminDashboard";
import MegaDoctors from "../components/Doctor/MegaDoctors";
import HospitalInfo from "../components/HospitalAdmin/HospitalInfo";

// ── Nav config ──
const links = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#6366F1",
    bg: "#EEF2FF",
    component: Dashboard,
    description: "Appointments & OPD",
  },
  {
    id: "doctors",
    label: "Doctors",
    icon: Stethoscope,
    color: "#0EA5E9",
    bg: "#E0F2FE",
    component: MegaDoctors,
    description: "Staff management",
  },
  {
    id: "info",
    label: "Hospital Info",
    icon: Info,
    color: "#10B981",
    bg: "#ECFDF5",
    component: HospitalInfo,
    description: "Settings & details",
  },
];

export function HospitalSidebar() {
  const [selected, setSelected] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActiveComponent = links.find((l) => l.id === selected)?.component || Dashboard;
  const activeLink = links.find((l) => l.id === selected);

  const handleLogout = () => {
    window.location.href = "https://health-scheduling.vercel.app/";
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background: "#F0F4FF",
        // 72px = navbar height (matches pt-[72px] in App.js).
        // height:100% won't resolve on a flex-1 parent without explicit height,
        // so calc is the reliable fix.
        height: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          border: 1.5px solid transparent;
          text-decoration: none;
        }
        .nav-item:hover { background: rgba(99,102,241,0.06); }
        .nav-item.active { 
          border-color: rgba(99,102,241,0.15);
          background: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.12);
        }

        .sidebar-collapsed .nav-label,
        .sidebar-collapsed .nav-desc,
        .sidebar-collapsed .brand-text,
        .sidebar-collapsed .nav-arrow { display: none; }

        .sidebar-collapsed { width: 76px !important; }
        .sidebar-collapsed .nav-item { justify-content: center; padding: 12px; }
        .sidebar-collapsed .nav-icon-wrap { margin: 0; }
        .sidebar-collapsed .sidebar-footer { padding: 16px 10px; }

        .content-area { 
          flex: 1; 
          overflow-y: auto;
          border-radius: 24px 0 0 24px;
          background: #F0F4FF;
        }

        .toggle-btn {
          width: 30px; height: 30px;
          border-radius: 10px;
          background: #fff;
          border: 1.5px solid #E0E7FF;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #6366F1;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(99,102,241,0.1);
        }
        .toggle-btn:hover { background: #EEF2FF; }

        .breadcrumb-bar {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(99,102,241,0.08);
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .mobile-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(15,23,42,0.4);
          backdrop-filter: blur(4px);
        }
        .mobile-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: 280px;
          z-index: 50;
          background: #fff;
          border-right: 1px solid #E0E7FF;
          box-shadow: 8px 0 32px rgba(99,102,241,0.15);
          padding: 28px 16px;
          display: flex; flex-direction: column; gap: 8px;
        }

        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg,#F5F3FF,#EFF6FF);
          border-radius: 14px;
          border: 1px solid #E0E7FF;
        }
        .logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          border-radius: 14px;
          cursor: pointer;
          color: #EF4444;
          font-size: 14px;
          font-weight: 700;
          background: #FFF5F5;
          border: 1.5px solid #FEE2E2;
          transition: all 0.2s;
          width: 100%;
        }
        .logout-btn:hover { background: #FEE2E2; }

        @keyframes slideRight {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-right { animation: slideRight 0.3s ease; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-trigger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-trigger { display: none !important; }
        }
      `}</style>

      {/* ── Mobile Top Bar ── */}
      <div
        className="mobile-trigger"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "#fff",
          borderBottom: "1px solid #E0E7FF",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#6366F1,#0EA5E9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Heart size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>Health Schedule</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "#EEF2FF", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Menu size={18} color="#6366F1" />
        </button>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: "linear-gradient(135deg,#6366F1,#0EA5E9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Heart size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: "#1E293B", fontSize: 15, lineHeight: 1 }}>Health Schedule</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Hospital Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#F8FAFF", border: "1px solid #E0E7FF",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <X size={15} color="#94A3B8" />
                </button>
              </div>

              {links.map((link) => {
                const Icon = link.icon;
                const isActive = selected === link.id;
                return (
                  <div
                    key={link.id}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => { setSelected(link.id); setMobileOpen(false); }}
                  >
                    <div
                      className="nav-icon-wrap"
                      style={{
                        width: 38, height: 38, borderRadius: 11,
                        background: isActive ? link.bg : "#F8FAFF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={isActive ? link.color : "#94A3B8"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: isActive ? "#1E293B" : "#64748B", lineHeight: 1.2 }}>
                        {link.label}
                      </p>
                      <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 2 }}>{link.description}</p>
                    </div>
                    {isActive && (
                      <div style={{ width: 6, height: 6, borderRadius: 99, background: link.color, flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}

              <div style={{ marginTop: "auto" }}>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Layout ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }} className="desktop-sidebar-container">

        {/* Sidebar */}
        <div
          className={`desktop-sidebar ${sidebarOpen ? "" : "sidebar-collapsed"}`}
          style={{
            width: sidebarOpen ? 260 : 76,
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #E8EDFF",
            display: "flex",
            flexDirection: "column",
            padding: "24px 12px",
            gap: 8,
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Collapse toggle */}
          <div style={{ display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center", paddingBottom: 12, borderBottom: "1px solid #F1F5F9", marginBottom: 4 }}>
            <button className="toggle-btn" onClick={() => setSidebarOpen((v) => !v)}>
              <ChevronRight
                size={14}
                style={{ transform: sidebarOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}
              />
            </button>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {sidebarOpen && (
              <p style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 8px" }}>
                Navigation
              </p>
            )}
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = selected === link.id;
              return (
                <div
                  key={link.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSelected(link.id)}
                  title={!sidebarOpen ? link.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${link.bg} 0%, #fff 100%)`,
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div
                    className="nav-icon-wrap"
                    style={{
                      position: "relative", zIndex: 1,
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isActive ? link.bg : "#F8FAFF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon size={17} color={isActive ? link.color : "#94A3B8"} />
                  </div>
                  {sidebarOpen && (
                    <div className="nav-label" style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <p style={{
                        fontWeight: isActive ? 800 : 600,
                        fontSize: 13.5,
                        color: isActive ? "#1E293B" : "#64748B",
                        lineHeight: 1.2,
                        transition: "color 0.2s",
                      }}>
                        {link.label}
                      </p>
                      <p className="nav-desc" style={{ fontSize: 10.5, color: "#CBD5E1", marginTop: 1 }}>
                        {link.description}
                      </p>
                    </div>
                  )}
                  {isActive && sidebarOpen && (
                    <ChevronRight
                      size={14}
                      className="nav-arrow"
                      style={{ color: link.color, position: "relative", zIndex: 1, flexShrink: 0 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sidebar-footer" style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {sidebarOpen && (
              <div className="user-chip">
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg,#6366F1,#818CF8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>H</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Hospital Admin
                  </p>
                  <p style={{ fontSize: 10.5, color: "#94A3B8" }}>Administrator</p>
                </div>
              </div>
            )}
            <button
              className="logout-btn"
              onClick={handleLogout}
              style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
              title={!sidebarOpen ? "Logout" : undefined}
            >
              <LogOut size={15} />
              {sidebarOpen && "Sign Out"}
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Breadcrumb */}
          <div className="breadcrumb-bar">
            <div
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: activeLink?.bg || "#EEF2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {activeLink && React.createElement(activeLink.icon, { size: 14, color: activeLink.color })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Health Schedule</span>
              <ChevronRight size={12} color="#CBD5E1" />
              <span style={{ fontSize: 13, color: "#1E293B", fontWeight: 800 }}>{activeLink?.label}</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F0FDF4", padding: "5px 12px", borderRadius: 99, border: "1px solid #A7F3D0" }}>
              <Activity size={12} color="#10B981" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>All Systems Normal</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="content-area" style={{ flex: 1, overflowY: "auto" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{ width: "100%", minHeight: "100%" }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalSidebar;