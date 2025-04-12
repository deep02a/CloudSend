// upload-file.tsx
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Document, Page, pdfjs } from 'react-pdf';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/app/components/ui/Button';
import { Slider } from '@/app/components/ui/slider';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import type { Area } from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useRouter } from 'next/navigation';





// ✅ Load ace core and expose it globally BEFORE dynamic import
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';
if (typeof window !== 'undefined') (window as any).ace = ace;

// ✅ Then dynamically import react-ace
const AceEditor = dynamic(() => import('react-ace'), { ssr: false });


export default function UploadFile() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'text' | 'unsupported' | null>(null);
  const [textContent, setTextContent] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [customFilename, setCustomFilename] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ace = require('ace-builds/src-noconflict/ace');
      require('ace-builds/src-noconflict/ext-language_tools');
      (window as any).ace = ace;
  
      // ✅ Set to your local worker file (must exist at public/pdfjs/pdf.worker.min.mjs)
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
    }
  }, []);

  const getFileType = (file: File) => {
    const mime = file.type;
    if (mime.startsWith('video/')) return 'unsupported';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('text/') || mime === 'application/json') return 'text';
    return 'unsupported';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    const type = getFileType(selected);

    if (type === 'unsupported') {
      toast.error('Unsupported file type (videos not allowed)');
      return;
    }

    setFile(selected);
    setFileType(type);
    setCroppedImage(null);
    setSelectedPages([]);
    setCustomFilename(selected.name.replace(/\.[^/.]+$/, ''));

    if (type === 'text') {
      const reader = new FileReader();
      reader.onload = () => setTextContent(reader.result as string);
      reader.readAsText(selected);
    } else if (type === 'image') {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(selected);
    }
  }, []);

  const handleCropComplete = useCallback((_: any, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImage(croppedImg);
  };

  const handleUpload = async () => {
    if (!file) return;

    const extension = file.name.split('.').pop();
    const filename = customFilename.trim() ? `${customFilename}.${extension}` : file.name;

    let fileToUpload: File;

    if (fileType === 'image' && croppedImage) {
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      fileToUpload = new File([blob], filename, { type: file.type });
    } else if (fileType === 'text') {
      fileToUpload = new File([textContent], filename, { type: file.type });
    } else if (fileType === 'pdf' && selectedPages.length) {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (const pageNum of selectedPages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
      }

      const newPdfBytes = await newPdf.save();
      fileToUpload = new File([newPdfBytes], filename, { type: file.type });
    } else {
      fileToUpload = new File([file], filename, { type: file.type });
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await axios.post('http://localhost:5000/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('File uploaded successfully! Redirecting...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast.error('Upload failed.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card className="border-dashed border-2 border-gray-300 p-8 text-center cursor-pointer hover:border-blue-500">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p className="text-gray-600">Drag & drop or click to upload (no videos)</p>
        </div>
      </Card>

      {file && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview & Edit</h2>

          <div>
            <p className="mb-1 text-sm text-gray-600">Change file name:</p>
            <Input value={customFilename} onChange={(e) => setCustomFilename(e.target.value)} className="max-w-md" />
          </div>

          {fileType === 'text' && (
            <AceEditor
              mode="javascript"
              theme="github"
              name="textEditor"
              onChange={setTextContent}
              value={textContent}
              fontSize={14}
              width="100%"
              height="300px"
              setOptions={{ useWorker: false }}
            />
          )}

          {fileType === 'image' && imageSrc && !croppedImage && (
            <div className="relative w-full h-[400px] bg-gray-200">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
              <div className="mt-4">
                <p className="text-sm mb-1">Zoom</p>
                <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={([z]) => setZoom(z)} />
              </div>
              <Button className="mt-4" onClick={showCroppedImage}>Preview Cropped</Button>
            </div>
          )}

          {croppedImage && (
            <div>
              <p className="mb-2 font-medium">Cropped Image Preview</p>
              <Image src={croppedImage} alt="Cropped" width={400} height={300} className="rounded-xl shadow-md" />
            </div>
          )}

          {fileType === 'pdf' && (
            <div className="space-y-4">
              <Document file={file} onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}>
                {Array.from(new Array(pdfNumPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(index + 1)}
                      onChange={() => {
                        setSelectedPages((prev) =>
                          prev.includes(index + 1)
                            ? prev.filter((n) => n !== index + 1)
                            : [...prev, index + 1]
                        );
                      }}
                    />
                    <Page pageNumber={index + 1} width={100} />
                  </div>
                ))}
              </Document>
            </div>
          )}

          <Button className="mt-6" onClick={handleUpload}>
            Upload File
          </Button>
        </div>
      )}
    </div>
  );
}
