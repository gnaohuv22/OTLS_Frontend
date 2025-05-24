import { memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash, Upload } from 'lucide-react';

interface AIFileUploadProps {
  fileName: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  disabled: boolean;
}

const AIFileUpload = memo(({ 
  fileName, 
  onFileUpload, 
  onClearFile, 
  disabled 
}: AIFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label htmlFor="aiFileUpload" className="text-sm font-medium">
        Hoặc tải lên tài liệu
      </Label>
      <div className="border rounded-md p-4">
        <input
          id="aiFileUpload"
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx,.doc,.md"
          onChange={onFileUpload}
          className="hidden"
          title="Chọn tài liệu để tạo câu hỏi"
          aria-label="Chọn tài liệu để tạo câu hỏi"
          disabled={disabled}
        />

        {fileName ? (
          <div className="flex items-center justify-between bg-muted p-2 rounded">
            <span className="text-sm truncate max-w-[300px]">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onClearFile}
              disabled={disabled}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="h-4 w-4" />
            Tải tài liệu lên
          </Button>
        )}
      </div>
    </div>
  );
});

AIFileUpload.displayName = 'AIFileUpload';

export default AIFileUpload; 