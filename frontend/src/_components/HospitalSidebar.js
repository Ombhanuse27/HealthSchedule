"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/Sidebar";
import Dashboard from "../components/HospitalAdmin/AdminDashboard";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconDetails,
  IconUserBolt,
} from "@tabler/icons-react";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Ensure AnimatePresence is imported
import { cn } from "../lib/utils";
import MegaDoctors from "../components/Doctor/MegaDoctors";
import HospitalInfo from "../components/HospitalAdmin/HospitalInfo";

export function HospitalSidebar() {
  // ✅ State to track selected link URL (Defaults to dashboard)
  const [selectedLink, setSelectedLink] = useState("/hospitalsidebar/dashboard");
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      to: "/hospitalsidebar/dashboard",
      icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-6 w-6 shrink-0" />,
    },
    {
      label: "Doctors",
      to: "/hospitalsidebar/doctor",
      icon: <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-6 w-6 shrink-0" />,
    },
    {
      label: "Info",
      to: "/hospitalsidebar/info",
      icon: <IconDetails className="text-neutral-700 dark:text-neutral-200 h-6 w-6 shrink-0" />,
    },
    {
      label: "Logout",
      to: "/logout", // logical path
      action: "logout", // Custom flag
      icon: <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-6 w-6 shrink-0" />,
    },
  ];

  const handleLinkClick = (link) => {
    if (link.action === "logout") {
      // ✅ Handle logout logic here, not in render
      window.location.href = "https://health-scheduling.vercel.app/";
    } else {
      setSelectedLink(link.to);
    }
  };

  return (
    <div
      className={cn(
        // ✅ Layout Fix: 
        // 1. h-[calc(100vh-...)] ensures the container takes full remaining height minus your navbar top margin.
        // 2. overflow-hidden on the parent prevents the whole page from scrolling.
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-[calc(100vh-150px)] mt-36" // Adjusted height calculation to fix scrolling
      )}
    >
      {/* ✅ Sidebar Container */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLinkClick(link)}
                  className={cn(
                    "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 relative",
                    // Hover and Active styles
                    selectedLink === link.to
                      ? "bg-white dark:bg-neutral-700 shadow-sm" 
                      : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                  )}
                >
                   {/* Active Indicator Strip */}
                   {selectedLink === link.to && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}

                  {link.icon}
                  
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    selectedLink === link.to 
                      ? "text-blue-600 dark:text-white font-bold" 
                      : "text-neutral-700 dark:text-neutral-200"
                  )}>
                    {link.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <SidebarLink
              link={{
                label: "Health Schedule",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-8 w-8 shrink-0 rounded-full border border-gray-300"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ✅ Content Area - SCROLL FIX HERE */}
      {/* overflow-y-auto is applied HERE so only the content scrolls, not the sidebar */}
      <div className="flex flex-1 overflow-y-auto bg-white dark:bg-neutral-900 rounded-tl-2xl border-l border-neutral-200 dark:border-neutral-700 shadow-inner">
        <div className="p-4 md:p-8 w-full h-full">
           <Skeleton selectedLink={selectedLink} />
        </div>
      </div>
    </div>
  );
}

// ✅ Logo Components
export const Logo = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-6 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-lg text-black dark:text-white whitespace-pre"
      >
        Health Schedule
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-6 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
    </Link>
  );
};

// ✅ Content Renderer with Animation
const Skeleton = ({ selectedLink }) => {
  const renderContent = () => {
    switch (selectedLink) {
      case "/hospitalsidebar/dashboard":
        return <Dashboard />;
      case "/hospitalsidebar/doctor":
        return <MegaDoctors />;
      case "/hospitalsidebar/info":
        return <HospitalInfo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedLink}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default HospitalSidebar;