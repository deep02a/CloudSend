"use client";
import React, {  useEffect, useState} from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/app/components/ui/sidebar";
import {
  IconArrowLeft,
  IconUserCircle,
  IconSend,
  IconDownload,
  IconMenu2,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { cn } from "../../../lib/utils";


type FileType = {
  id: number;
  name: string;
  size: string;
  uploadedAt: string;
};

// Dummy logged-in user name — replace with actual logic (e.g., from context)
const loggedInUser = "John Doe";

export function SidebarDemo() {
  const links = [
    { label: "Received Files", href: "/received", icon: <IconDownload className="icon" /> },
    { label: "Sent Files", href: "/sent", icon: <IconSend className="icon" /> },
    { label: "Profile", href: "/profile", icon: <IconUserCircle className="icon" /> },
    { label: "Logout", href: "/logout", icon: <IconArrowLeft className="icon" /> },
  ];

  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col justify-between">
          <div className="flex flex-1 flex-col overflow-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <nav className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </nav>
          </div>
          {/* Dynamic Username at Bottom */}
          <SidebarLink
            link={{
              label: loggedInUser,
              href: "#",
              icon: <IconUserCircle className="icon" />,
            }}
          />
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col bg-white dark:bg-neutral-900">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute left-4 top-4 z-50 p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg md:hidden"
        >
          <IconMenu2 className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
        </button>

        {/* Dashboard Content */}
        <Dashboard />
      </div>
    </div>
  );
}

// Logo Components
export const Logo = () => (
  <Link href="/dashboard" className="flex items-center space-x-2 py-2 text-sm font-normal">
    <div className="h-5 w-6 bg-white dark:bg-white rounded-lg" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-white dark:text-white">
      CloudSend
    </motion.span>
  </Link>
);
export const LogoIcon = () => (
  <Link href="/dashboard" className="flex items-center space-x-2 py-2 text-sm font-normal">
    <div className="h-5 w-6 bg-white dark:bg-white rounded-lg" />
  </Link>
);


// Dashboard Component
export const Dashboard = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/fetch-files",{ withCredentials: true }); // Update this URL to match your backend route
        setFiles(res.data);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="flex flex-1 h-full w-full p-4 md:p-10 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full justify-items-center overflow-y-auto max-h-full pr-2">
        {loading
          ? [...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="aspect-square w-full max-w-[80px] rounded-xl bg-blue-200 bg-gradient-to-br from-blue-500 to-blue-800 shadow-md animate-pulse"
              />
            ))
          : files.map((file) => (
              <div
                key={file.id}
                className="aspect-square w-full max-w-[80px] rounded-xl bg-white shadow-md flex items-center justify-center text-center text-xs p-2 dark:bg-neutral-800 dark:text-white"
              >
                {file.name}
              </div>
            ))}
      </div>
    </div>
  );
};

