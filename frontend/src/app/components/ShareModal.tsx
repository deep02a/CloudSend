"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) return;
    onSubmit(email);
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl z-50 w-[90%] max-w-md border border-neutral-200 dark:border-neutral-800"
      >
        <Dialog.Title className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
          Share This File
        </Dialog.Title>

        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block">
          Recipient Email
        </label>
        <input
          type="email"
          placeholder="e.g. user@example.com"
          className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
          >
            Send Invite
          </button>
        </div>
      </motion.div>
    </Dialog>
  );
};
