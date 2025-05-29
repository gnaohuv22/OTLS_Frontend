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

const TextAssignment = memo(function TextAssignment({
  initialContent = '', // Đảm bảo có default value
  onContentChange,
  editorConfig = {}
}: TextAssignmentProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  // Xử lý khi nội dung thay đổi
  const handleEditorChange = useCallback((newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  }, [onContentChange]);

  // Cập nhật content state khi initialContent thay đổi
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Xử lý việc set content vào editor khi editor sẵn sàng hoặc initialContent thay đổi
  useEffect(() => {
    if (isEditorReady && editorRef.current && initialContent !== undefined) {
      // Kiểm tra nếu content hiện tại khác với initialContent
      const currentContent = editorRef.current.getContent();
      if (currentContent !== initialContent) {
        editorRef.current.setContent(initialContent || '');
      }
    }
  }, [isEditorReady, initialContent]);

  // Editor configuration
  const editorOptions = {
    height: 400,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | table link image | code',
    setup: (editor: any) => {
      // Set reference ngay khi setup
      editorRef.current = editor;
      
      // Xử lý khi editor được khởi tạo
      editor.on('init', () => {
        console.log('Editor initialized, setting content:', initialContent);
        // Set content ngay sau khi editor init
        if (initialContent) {
          editor.setContent(initialContent);
        }
        setIsEditorReady(true);
      });
    },
    init_instance_callback: (editor: any) => {
      // Callback này chạy sau khi editor hoàn toàn sẵn sàng
      console.log('Editor instance ready, current content:', editor.getContent());
      
      // Double check content sau khi editor sẵn sàng
      if (initialContent && editor.getContent() !== initialContent) {
        editor.setContent(initialContent);
      }
      
      // Tối ưu hiệu suất cho iframe
      const iframe = document.querySelector('.tox-edit-area__iframe');
      if (iframe) {
        iframe.setAttribute('loading', 'lazy');
      }
    },
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
            <Editor
              id="content"
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={content} // Thêm value prop để đảm bảo controlled component
              onEditorChange={handleEditorChange}
              init={editorOptions}
              onInit={(evt, editor) => { 
                editorRef.current = editor;
                console.log('onInit called, setting content:', initialContent);
                if (initialContent) {
                  editor.setContent(initialContent);
                }
              }}
            />
            {!isEditorReady && (
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