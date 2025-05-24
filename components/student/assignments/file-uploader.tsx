"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview: string;
}

export function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Process dropped files
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(2),
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const filteredFiles = prevFiles.filter(file => file.id !== id);
      return filteredFiles;
    });
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      setVideoStream(stream);
      setIsCapturing(true);
    } catch (err) {
      console.error("Không thể khởi động camera:", err);
    }
  };

  const captureImage = () => {
    if (!videoStream) return;
    
    const video = document.querySelector('video');
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = {
        id: Math.random().toString(36).substring(2),
        name: `camera-capture-${new Date().toISOString()}.jpg`,
        type: 'image/jpeg',
        size: blob.size,
        preview: URL.createObjectURL(blob)
      };
      
      setFiles(prevFiles => [...prevFiles, file]);
      stopCapture();
    }, 'image/jpeg', 0.95);
  };

  const stopCapture = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsCapturing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Uploader */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive 
              ? 'Thả tệp tin ở đây...' 
              : 'Kéo & thả tệp tin vào đây, hoặc nhấp để chọn tệp tin'
            }
          </p>
          <p className="text-xs text-muted-foreground">
            Hỗ trợ JPG, PNG, GIF, PDF (tối đa 5MB)
          </p>
        </div>
      </div>

      {/* Camera capture */}
      {isCapturing ? (
        <div className="border rounded-md p-4 space-y-4">
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <video
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              ref={(videoEl) => {
                if (videoEl && videoStream) {
                  videoEl.srcObject = videoStream;
                }
              }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={captureImage} className="gap-2">
              <Camera className="h-4 w-4" />
              Chụp ảnh
            </Button>
            <Button variant="outline" onClick={stopCapture}>
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={startCapture} className="gap-2">
          <Camera className="h-4 w-4" />
          Chụp ảnh bằng camera
        </Button>
      )}

      {/* File preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Các tệp tin đã tải lên</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {files.map((file) => (
              <div key={file.id} className="border rounded-md p-4 relative">
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label={`Xóa tệp tin ${file.name}`}
                  title={`Xóa tệp tin ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex gap-4">
                  {file.type.startsWith('image/') ? (
                    <div className="h-20 w-20 relative flex-shrink-0">
                      <Image
                        src={file.preview}
                        alt={file.name}
                        className="object-cover rounded-md"
                        fill
                      />
                    </div>
                  ) : (
                    <File className="h-20 w-20 p-2 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    <div className="pt-2">
                      <a 
                        href={file.preview} 
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Xem trước
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 