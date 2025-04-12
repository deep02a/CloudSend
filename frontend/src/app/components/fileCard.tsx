"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  IconDownload,
  IconSend,
  IconEdit,
  IconCheck,
  IconFile,
  IconFileText,
  IconPhoto,
  IconFileSpreadsheet,
  IconFileCode,
  IconFileZip,
  IconFileDescription,
  IconTrash,
} from "@tabler/icons-react";

interface FileCardProps {
  file: {
    id: string;
    originalName: string;
    size: number;
    mimeType?: string;
  };
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  disabledOptions?: ('rename' | 'delete' | 'share')[];
}

// Helper: Get file extension from mime type
const getExtensionFromMimeType = (mimeType?: string) => {
  if (!mimeType) return "file";
  if (mimeType.includes("image/jpeg")) return "jpg";
  if (mimeType.includes("image/png")) return "png";
  if (mimeType.includes("image/gif")) return "gif";
  if (mimeType.includes("video/mp4")) return "mp4";
  if (mimeType.includes("application/pdf")) return "pdf";
  if (mimeType.includes("application/zip")) return "zip";
  if (mimeType.includes("application/json")) return "json";
  if (mimeType.includes("text/plain")) return "txt";
  if (mimeType.includes("text/csv")) return "csv";
  if (mimeType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) return "xlsx";
  if (mimeType.includes("application/msword")) return "doc";
  if (mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) return "docx";
  return mimeType.split("/")[1] || "file";
};

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onDownload,
  onShare,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [extension, setExtension] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const ext = getExtensionFromMimeType(file.mimeType);
    const nameWithoutExt = file.originalName.replace(/\.[^/.]+$/, "");
    setBaseName(nameWithoutExt);
    setExtension(ext);
  }, [file.originalName, file.mimeType]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    const newName = `${baseName.trim()}.${extension}`;
    if (newName !== file.originalName && baseName.trim()) {
      onRename(file.id, newName);
    }
    setIsEditing(false);
  };

  const getFileIcon = (mimeType?: string): React.ReactNode => {
    const baseClass = "w-12 h-12 text-neutral-600 dark:text-neutral-300";
    if (!mimeType) return <IconFile className={baseClass} />;
    if (mimeType.includes("pdf")) return <IconFileDescription className="w-12 h-12 text-red-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <IconFileZip className="w-12 h-12 text-yellow-500" />;
    if (mimeType.includes("image")) return <IconPhoto className="w-12 h-12 text-rose-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <IconFileSpreadsheet className="w-12 h-12 text-emerald-600" />;
    if (mimeType.includes("text") || mimeType.includes("plain")) return <IconFileText className={baseClass} />;
    if (mimeType.includes("code") || mimeType.includes("javascript") || mimeType.includes("json")) return <IconFileCode className="w-12 h-12 text-indigo-500" />;
    return <IconFile className={baseClass} />;
  };

  return (
    <div className="relative group w-[130px] h-[150px] rounded-xl bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 border border-blue-300 dark:border-blue-700 shadow-md flex flex-col items-center justify-center p-3 transition-all hover:shadow-lg">
      <div className="mb-2">{getFileIcon(file.mimeType)}</div>
  
      <div className="text-center w-full">
        {isEditing ? (
          <div className="flex flex-col items-center gap-1">
            <input
              ref={inputRef}
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="text-xs text-center rounded px-2 py-1 border border-gray-300 dark:border-blue-600 bg-white dark:bg-blue-950 text-black dark:text-white w-full"
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-300">.{extension}</span>
            <button
              onClick={handleRenameSubmit}
              className="text-xs text-green-700 dark:text-green-400 hover:underline flex items-center gap-1"
            >
              <IconCheck size={14} /> Save
            </button>
          </div>
        ) : (
          <p className="truncate text-sm font-medium text-neutral-800 dark:text-white w-full">
            {file.originalName}
          </p>
        )}
      </div>
  
      {!isEditing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none group-hover:pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg"
          >
            <button
              onClick={() => onDownload(file.id)}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded"
            >
              <IconDownload className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => onShare(file.id)}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded"
            >
              <IconSend className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded"
            >
              <IconEdit className="w-4 h-4 text-yellow-600" />
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded"
            >
              <IconTrash className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        </div>
      )}
      {showConfirmModal && (
      <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-lg shadow-xl rounded-2xl p-6 max-w-sm w-[90%] text-center"
      >
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Delete File?
        </h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-5">
           Are you sure you want to delete <span className="font-medium">{file.originalName}</span>? This action is irreversible.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              onDelete(file.id);
              setShowConfirmModal(false);
            }}
            className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 text-sm font-semibold bg-white/60 dark:bg-white/10 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-white/80 dark:hover:bg-white/20 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
      </div>
    )}  
    
    </div>
  );
}  