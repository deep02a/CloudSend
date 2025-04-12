'use client';
import { Toaster } from 'sonner';
import UploadFile from "@/app/components/Upload-file";

export default function UploadFilePage() {
    return (
        <>
         <Toaster position="top-right" richColors />
        <UploadFile /></>
    )
}