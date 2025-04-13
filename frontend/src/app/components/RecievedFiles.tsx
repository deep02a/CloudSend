'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { FileCard } from '@/app/components/fileCard';

type SharedFileType = {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  senderEmail: string;
};

const ReceivedFilesPage = () => {
  const [files, setFiles] = useState<SharedFileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const res = await api.get('/get-recieved-file', { withCredentials: true });

        const parsedFiles = Array.isArray(res.data.files)
          ? res.data.files.map((file: any) => ({
              id: file.id,
              originalName: file.originalName,
              size: Number(file.size),
              uploadedAt: file.uploadedAt || '',
              senderEmail: file.senderEmail,
            }))
          : [];

        setFiles(parsedFiles);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to fetch shared files');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFiles();
  }, []);

  const handleRename = async (fileId: string, newName: string) => {}

  const handleDownload = (fileId: string) => {
    console.log('Download shared file:', fileId);
    // Optional: Implement secure download logic using signed URL or backend streaming
  };

  return (
    <div className="p-4 md:p-10">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">Received Files</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          [...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square w-full max-w-[80px] rounded-xl bg-gray-300 dark:bg-neutral-700 animate-pulse" />
          ))
        ) : files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-full">No files shared with you yet.</p>
        ) : (
          files.map((file,index) => (
            <FileCard
              key={`${file.id}-${index}`}
              file={{
                id: file.id,
                originalName: file.originalName,
                size: file.size,
              }}
              onDownload={handleDownload}
              onShare={() => {}} // disable or hide share option for received files
              onRename={() => {handleRename}}
              onDelete={() => {}}
              disabledOptions={['share', 'rename', 'delete']} // Add this prop to control UI
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReceivedFilesPage;