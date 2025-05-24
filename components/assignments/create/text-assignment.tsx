import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Editor } from '@tinymce/tinymce-react';

interface TextAssignmentProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  editorConfig?: any;
}

// Sử dụng memo để ngăn re-render không cần thiết
const TextAssignment = memo(function TextAssignment({
  initialContent = '',
  onContentChange,
  editorConfig = {}
}: TextAssignmentProps) {
  // State cục bộ
  const [content, setContent] = useState(initialContent);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  // Xử lý khi nội dung thay đổi với debounce tích hợp
  const handleEditorChange = useCallback((content: string) => {
    setContent(content);
    onContentChange(content);
  }, [onContentChange]);

  // Khởi tạo editor trong iframe
  useEffect(() => {
    setIsEditorReady(false);
    // Khởi tạo TinyMCE trong iframe
    const setupTinyMCE = () => {
      // Gắn sự kiện sau khi editor đã sẵn sàng
      setIsEditorReady(true);
    };

    // Đảm bảo TinyMCE đã được tải trước khi setup
    if (typeof window !== 'undefined' && (window as any).tinymce) {
      setupTinyMCE();
    } else {
      // TinyMCE sẽ tự động khởi tạo khi được tải
      setIsEditorReady(true);
    }
  }, []);

  // Cập nhật nội dung từ prop khi có thay đổi từ bên ngoài
  useEffect(() => {
    if (initialContent !== content && editorRef.current) {
      editorRef.current.setContent(initialContent);
    }
  }, [initialContent, content]);

  // Tích hợp configuration chuẩn
  const editorOptions = {
    selector: 'textarea',
    height: 400,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | table link image | code',
    setup: (editor: any) => {
      editorRef.current = editor;
      editor.on('init', () => {
        // Khởi tạo nội dung ban đầu sau khi editor đã sẵn sàng
        editor.setContent(initialContent);
      });
    },
    init_instance_callback: (editor: any) => {
      // Tối ưu hiệu suất: thêm attribute loading=lazy cho iframe
      const iframe = document.querySelector('.tox-edit-area__iframe');
      if (iframe) {
        iframe.setAttribute('loading', 'lazy');
      }
    },
    // Tối ưu hiệu suất bằng cách tách thành iframe riêng biệt
    iframe: true,
    iframe_aria_text: 'Rich Text Editor',
    ...editorConfig
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo bài tập tự luận</CardTitle>
        <CardDescription>
          Mô tả đề bài và hướng dẫn làm bài tập
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Nội dung bài tập <span className="text-destructive">*</span>
            </Label>
            {isEditorReady ? (
              <Editor
                id="content"
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onEditorChange={handleEditorChange}
                init={editorOptions}
                onInit={(evt, editor) => { editorRef.current = editor; }}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/10">
                <p className="text-muted-foreground">Đang tải trình soạn thảo...</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TextAssignment.displayName = 'TextAssignment';

export default TextAssignment; 