"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/Sidebar";
import Dashboard from "../components/HospitalAdmin/AdminDashboard";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconDetails,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import MegaDoctors from "../components/Doctor/MegaDoctors";
import HospitalInfo from "../components/HospitalAdmin/HospitalInfo";
import ourDoctors from "../components/Doctor/ourDoctors";
import DoctorDashboard from "../components/Doctor/DoctorDashboard";
import DoctorInfo from "../components/Doctor/DoctorInfo";


export function HospitalSidebar() {
  const links = [
    {
      label: "Dashboard",
      to: "/hospitalsidebar/dashboard",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-8 w-6 shrink-0" />
      ),
    },
    
    {
      label: "Info",
      to: "/hospitalsidebar/info",
      icon: (
        <IconDetails className="text-neutral-700 dark:text-neutral-200 h-8 w-6 shrink-0" />
      ),
    },
    {
      label: "Logout",
      to: "/logout",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-8 w-6 shrink-0" />
      ),
    },
  ];

  // ✅ State to track selected link URL
  const [selectedLink, setSelectedLink] = useState(null); // No default URL selected
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-screen h-screen flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden mt-48 md:mt-40 lg:mt-32"
      )}
    >
      {/* ✅ Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    selectedLink === link.to
                      ? "bg-gray-300 dark:bg-gray-600" // Highlight selected link
                      : ""
                  }`}
                  onClick={() => setSelectedLink(link.to)} // ✅ Set URL on click
                >
                  {link.icon}
                  <span className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
                    {link.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-5">
            <SidebarLink
              link={{
                label: "Health Schedule",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-10 w-8 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ✅ Render content dynamically inside Skeleton */}
      <div className="flex flex-1">
        {selectedLink ? (
          <Skeleton selectedLink={selectedLink} />
        ) : (
          <Skeleton /> // Show default Skeleton initially
        )}
      </div>
    </div>
  );
}

// ✅ Logo with Full Name
export const Logo = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-8 w-8 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-2xl text-red-500 dark:text-white whitespace-pre"
      >
        Health Schedule
      </motion.span>
    </Link>
  );
};

// ✅ Minimal Logo for Collapsed Sidebar
export const LogoIcon = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
    </Link>
  );
};


const Skeleton = ({ selectedLink }) => {

  const renderContent = () => {
    switch (selectedLink) {
      case "/hospitalsidebar/dashboard":
        return <DoctorDashboard />; 
      case "/hospitalsidebar/doctor":
        return (
          <ourDoctors/>
        );
      case "/hospitalsidebar/info":
        return (
         <DoctorInfo />
        );
        case "/logout":
          window.location.href = "https://health-scheduling.vercel.app/"; // ✅ Correct usage
          break;
        
      default:
        return <DoctorDashboard />; 
    }
  };

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden">
<div className="p-2 md:px-10 py-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-blue-200 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto custom-scrollbar">      
        {/* {!selectedLink ? (
          <>
            <input className="h-10 w-60 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse ml-auto"></input>
            <div className="flex gap-2 md:mt-10">
              {[...new Array(7)].map((_, i) => (
                <div
                  key={"first-array" + i}
                  className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
                ></div>
              ))}
            </div>
            <div className="flex gap-2 flex-1">
              {[...new Array(1)].map((_, i) => (
                <div
                  key={"second-array" + i}
                  className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
                ></div>
              ))}
            </div>
            <div className="text-white text-xl font-bold mt-5">
              👋 Welcome! Click any label.
            </div>
          </>
        ) : ( */}
          
          <div className="text-white bg-blue-200 text-xl font-bold mt-5 w-full">{renderContent()}</div>
        {/*  )} */}
      </div>
    </div>
  );
};

export default HospitalSidebar;
