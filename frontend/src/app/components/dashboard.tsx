"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/app/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconMenu2,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "../../../lib/utils";

export function SidebarDemo() {
  const links = [
    { label: "Dashboard", href: "#", icon: <IconBrandTabler className="icon" /> },
    { label: "Profile", href: "/profile", icon: <IconUserBolt className="icon" /> },
    { label: "Settings", href: "/settings", icon: <IconSettings className="icon" /> },
    { label: "Logout", href: "/logout", icon: <IconArrowLeft className="icon" /> },
  ];

  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} >
        <SidebarBody className="flex flex-col justify-between">
          <div className="flex flex-1 flex-col overflow-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <nav className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </nav>
          </div>
          {/* Profile at Bottom */}
          <SidebarLink
            link={{
              label: "Manu Arora",
              href: "#",
              icon: (
                <Image
                  src="https://assets.aceternity.com/manu.png"
                  className="h-7 w-7 shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Avatar"
                />
              ),
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
  <Link href="#" className="flex items-center space-x-2 py-2 text-sm font-normal">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-lg" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
      Acet Labs
    </motion.span>
  </Link>
);
export const LogoIcon = () => (
  <Link href="#" className="flex items-center space-x-2 py-2 text-sm font-normal">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-lg" />
  </Link>
);

// Dashboard Component
const Dashboard = () => (
  <div className="flex flex-1 h-full w-full p-4 md:p-10">
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
        ))}
      </div>
    </div>
  </div>
);
