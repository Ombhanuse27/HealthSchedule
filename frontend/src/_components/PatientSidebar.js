"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/Sidebar";
import editIcon from '../images/editIcon.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
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
import Dashboard from "../components/Patientsidebar/Patientdashboard";
import DoctorInfo from "../components/Patientsidebar/PatientInfo";

export function PatientSidebar() {
  const links = [
    {
      label: "Dashboard",
      to: "/PatientSidebar/dashboard",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-8 w-6 shrink-0" />
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

  // State to track selected link URL and edit mode
  const [selectedLink, setSelectedLink] = useState(null);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Handler for edit icon click
  const handleEditClick = () => {
    setIsEditMode(true);
    setSelectedLink("/PatientSidebar/info");
  };

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-blue-800 w-screen h-screen flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      )}
    >
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? (
              <Logo 
                onEditClick={handleEditClick} 
                isEditMode={isEditMode} 
              /> 
            ) : (
              <LogoIcon />
            )}
           
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    selectedLink === link.to
                      ? "bg-gray-300 dark:bg-gray-600"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedLink(link.to);
                    setIsEditMode(false);
                  }}
                >
                  {link.icon}
                  <span className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
                    {link.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        
        </SidebarBody>
      </Sidebar>

   
      <div className="flex flex-1">
        <Skeleton 
          selectedLink={selectedLink} 
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}

export const Logo = ({ onEditClick, isEditMode }) => {
  return (
    <div className="flex flex-col gap-2 w-full items-center justify-center border-b border-gray-700 p-1">
      {/* Profile and 3-dot */}
      <div className="flex w-full justify-between items-center">
        <h4 className="text-lg font-semibold">Profile</h4>
        
        <img 
          src={editIcon} 
          width={30} 
          height={30} 
          onClick={onEditClick}
          className="cursor-pointer hover:opacity-75 transition-opacity"
        />
      </div>

      {/* Rest of the Logo content remains the same */}
      <img
        src="https://assets.aceternity.com/manu.png"
        className="shrink-0 rounded-full mt-2"
        width={100}
        height={100}
        alt="Avatar"
      />

      <h3 className="text-2xl font-bold">Ravi Patil</h3>
      
      <div className="w-full flex flex-col gap-4 mt-4">
       
        <span className="flex flex-col">
        <strong>AGE</strong>
        <p className="border border-grey-200 p-2 rounded-md hover:bg-blue-500 hover:text-black transition-all duration-300 cursor-pointer">
          21
        </p>
      </span>
      <span className="flex flex-col">
      <strong>CONTACT NO</strong> 
        <p className="border border-grey-200 p-2 rounded-md hover:bg-blue-500 hover:text-black transition-all duration-300 cursor-pointer">
         8421456630
        </p>
      </span>
      <span className="flex flex-col">
      <strong>EMAIL</strong> 
        <p className="border border-grey-200 p-2 rounded-md hover:bg-blue-500 hover:text-black transition-all duration-300 cursor-pointer">
          radhey@gmail.com
        </p>
      </span>

      <span className="flex flex-col">
      <strong>Address</strong> 
        <p className="border border-grey-200 p-2 rounded-md hover:bg-blue-500 hover:text-black transition-all duration-300 cursor-pointer">
          Address
        </p>
      </span>
       
      </div>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
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
    </Link>
  );
};

const Skeleton = ({ selectedLink, isEditMode }) => {
  const renderContent = () => {
    // If in edit mode, always return DoctorInfo
    if (isEditMode) {
      return <DoctorInfo />;
    }

    // Otherwise, use the original switch statement
    switch (selectedLink) {
      case "/patientsidebar/dashboard":
        return <Dashboard />; 
      case "/patientsidebar/info":
        return <DoctorInfo />;
        case "/logout":
          window.location.href = "https://health-scheduling.vercel.app/"; // ✅ Correct usage
          break;
        
      default:
        return <Dashboard />; 
    }
  };

  return (
    <div className="flex flex-1">
      <div className="p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-blue-200 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="text-white text-xl font-bold mt-5">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PatientSidebar;