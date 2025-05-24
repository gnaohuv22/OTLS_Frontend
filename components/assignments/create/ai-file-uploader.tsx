import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUp, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileToBase64, checkPdfFileSize } from '@/lib/file-processor';

interface AIFileUploaderProps {
  /**
   * Callback khi file được tải lên thành công
   */
  onFileContentLoaded: (fileName: string, originalFile: File) => void;
  
  /**
   * Callback khi có lỗi xảy ra
   */
  onError?: (error: string) => void;
  
  /**
   * Callback khi file bị xoá
   */
  onClearFile?: () => void;
  
  /**
   * Tên file hiện tại (nếu có)
   */
  fileName?: string;
  
  /**
   * Có đang trong quá trình xử lý không
   */
  isProcessing?: boolean;
  
  /**
   * Các loại file được cho phép
   */
  accept?: string[];
  
  /**
   * Kích thước tối đa (bytes), mặc định 10MB
   */
  maxSize?: number;
  
  /**
   * Có hiển thị badge file không
   */
  showFileBadge?: boolean;
}

// Bảng ánh xạ phần mở rộng file sang MIME type
const mimeTypeMap: Record<string, string> = {
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.md': 'text/markdown',
};

/**
 * Component xử lý kéo thả và tải lên file với hỗ trợ cho nhiều định dạng
 * bao gồm txt, docx, pdf, md
 */
const AIFileUploader: React.FC<AIFileUploaderProps> = ({
  onFileContentLoaded,
  onError,
  onClearFile,
  isProcessing = false,
  fileName = '',
  accept = ['.txt', '.pdf', '.docx', '.md'],
  maxSize = 10 * 1024 * 1024, // 10MB mặc định
  showFileBadge = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chuyển đổi danh sách phần mở rộng sang đối tượng chấp nhận của Dropzone
  const acceptedTypes = accept.reduce((acc, ext) => {
    const mimeType = mimeTypeMap[ext] || '*/*';
    return { ...acc, [mimeType]: [ext] };
  }, {});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0]; // Chỉ xử lý file đầu tiên
    setLoading(true);
    setError(null);
    
    try {
      // Kiểm tra kích thước file
      if (file.size > maxSize) {
        throw new Error(`File quá lớn. Kích thước tối đa là ${Math.floor(maxSize / (1024 * 1024))}MB.`);
      }
      
      // Kiểm tra kích thước PDF đặc biệt
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const isPdfSizeOk = await checkPdfFileSize(file);
        if (!isPdfSizeOk) {
          throw new Error('File PDF quá lớn hoặc phức tạp, vui lòng thử file đơn giản hơn.');
        }
      }
      
      // Gọi callback với file gốc, không trích xuất nội dung
      onFileContentLoaded(file.name, file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi xử lý file';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [maxSize, onFileContentLoaded, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    disabled: isProcessing || loading,
    multiple: false,
  });

  // Xử lý xóa file
  const handleClear = useCallback(() => {
    if (onClearFile) onClearFile();
    setError(null);
  }, [onClearFile]);

  return (
    <div className="space-y-2">
      {/* Hiển thị badge file nếu có file và showFileBadge = true */}
      {fileName && showFileBadge && (
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="flex items-center gap-1 max-w-[calc(100%-60px)] overflow-hidden">
            <span className="truncate flex-1">{fileName}</span>
            {!isProcessing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full shrink-0"
                onClick={handleClear}
                aria-label="Xóa file đã tải lên"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        </div>
      )}

      {/* Khu vực kéo thả */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-4 transition-colors cursor-pointer text-center",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50",
          isProcessing || loading ? "opacity-70 cursor-not-allowed" : "",
          error ? "border-destructive/50 bg-destructive/5" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Đang xử lý file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            <FileUp className={cn(
              "h-6 w-6 mb-2",
              error ? "text-destructive" : "text-muted-foreground"
            )} />
            
            {error ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Lỗi tải lên</span>
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? "Thả file tại đây" 
                    : fileName 
                      ? "Thay đổi file" 
                      : "Kéo thả file hoặc nhấp để chọn"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ {accept.join(', ')}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nút xóa file (nếu có file và không hiển thị badge) */}
      {fileName && !showFileBadge && (
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleClear}
            disabled={isProcessing || loading}
          >
            <X className="h-3.5 w-3.5" />
            <span>Xóa file</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIFileUploader; 