import React from 'react';
import { File, FileText, ImageIcon, PresentationIcon, Table } from 'lucide-react';

// Hàm hiển thị icon theo loại file
export const getFileIcon = (type: string): React.ReactNode => {
  if (type.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (type === 'application/pdf' || type === 'text/plain' || type === 'text/csv') {
    return <FileText className="h-4 w-4" />;
  } else if (type.includes('spreadsheet') || type.includes('excel')) {
    return <Table className="h-4 w-4" />;
  } else if (type.includes('presentation') || type.includes('powerpoint')) {
    return <PresentationIcon className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
}; 