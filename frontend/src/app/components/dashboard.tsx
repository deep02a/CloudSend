"use client";
import React, {  useEffect, useState} from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/app/components/ui/sidebar";
import api from "@/lib/axios"; 
import { toast } from "sonner";

import {
  IconArrowLeft,
  IconUserCircle,
  IconSend,
  IconDownload,
  IconMenu2,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { FileCard } from "../components/fileCard";
import { ShareModal } from "../components/ShareModal";
import { cn } from "@/lib/utils";



type FileType = {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string;
};

// Dummy logged-in user name — replace with actual logic (e.g., from context)
const loggedInUser = "John Doe";

export function SidebarDemo() {
  const links = [
    { label: "Upload File", href: "/dashboard/upload-file", icon: <IconUpload className="icon" /> },
    { label: "Received Files", href: "/dashboard/received", icon: <IconDownload className="icon" /> },
    { label: "Sent Files", href: "/dashboard/sent", icon: <IconSend className="icon" /> },
    { label: "Profile", href: "/dashboard/profile", icon: <IconUserCircle className="icon" /> },
    { label: "Logout", href: "/dashboard/logout", icon: <IconArrowLeft className="icon" /> },
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);


  useEffect(() => {
    const fetchFiles = async () => {
      try {

        const res = await api.get("/fetch-files", {
          withCredentials: true,
        });
        
        const filesWithCorrectTypes = Array.isArray(res.data.files)
          ? res.data.files.map((file: any) => ({
              id: file.id,
              originalName: file.originalName,
              size: Number(file.size),
              uploadedAt: file.uploadedAt || "",
            }))
          : [];

        console.log("Parsed files:", filesWithCorrectTypes);
        setFiles(filesWithCorrectTypes);
      } catch (err:any) {
        if (err.response) {
          console.error("Error fetching files:", err.response.status, err.response.data);
          alert(`Error: ${err.response.status} - ${err.response.data}`);
        } else if (err.request) {
          console.error("No response received:", err.request);
          alert("No response from server");
        } else {
          console.error("Axios error:", err.message);
          alert(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleRename = async (fileId: string, newName: string) => {
    try {
      // 1. Update on the server
      await api.patch(`files/rename/${fileId}`, { newName }, { withCredentials: true });
  
      // 2. Update the UI
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, originalName: newName } : file
        )
      );
    } catch (error: any) {
      console.error("Rename failed", error);
      alert("Failed to rename the file.");
    }
  };

  const handleDownload = (fileId: string) => {
    console.log("Downloading file:", fileId);
    // Implement download logic here
  };

  const handleShare = (fileId: string) => {
    setSelectedFileId(fileId);
    setShareModalOpen(true);
  };

  const handleSubmitShare = async (email: string) => {
    if (!selectedFileId) return;
  
    const toastId = toast.loading("Sharing file...");
  
    try {
      const res = await api.post(
        "/get-shared-file",
        {
          fileId: selectedFileId,
          recipientEmail: email,
        },
        { withCredentials: true }
      );
  
      toast.success("File shared successfully!", { id: toastId });
      setShareModalOpen(false);
      setSelectedFileId(null);
    } catch (err: any) {
      console.error("Error sharing file:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to share file", { id: toastId });
    }
  };
  

  const handleDelete = async (fileId: string) => {
    const toastId = toast.loading("Deleting file...");
    try {
      const res = await api.delete(`/delete-file/${fileId}`, {
        withCredentials: true,
      });
      toast.success("File deleted successfully", { id: toastId });
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      // Refresh your file list
    } catch (err:any) {
      toast.error(err?.response?.data?.message || "Failed to delete file", {
        id: toastId,
      });
    }
  }

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
              <FileCard
                key={file.id}
                file={{ id: file.id.toString(), originalName: file.originalName, size: file.size }}
                onDownload={handleDownload}
                onShare={handleShare}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}

        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onSubmit={handleSubmitShare}
        />
      </div>
    </div>
  );
};

