import React, { useEffect, useRef, memo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface IsolatedTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  readonly?: boolean;
  apiKey?: string;
}

/**
 * Component Editor được tách riêng biệt trong một iframe để cải thiện hiệu suất
 * của trang. Điều này giúp giảm thiểu sự ảnh hưởng của editor đến UI chính.
 */
const IsolatedTextEditor = memo(({
  value,
  onChange,
  height = 400,
  placeholder = 'Nhập nội dung...',
  readonly = false,
  apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY
}: IsolatedTextEditorProps) => {
  const editorRef = useRef<any>(null);
  
  // Sử dụng ref để theo dõi giá trị ngoài
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  
  // Thiết lập cấu hình tối ưu cho editor
  const editorConfig = {
    height,
    menubar: false,
    skin: 'oxide',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'fullscreen', 'preview', 'searchreplace', 'visualblocks',
      'code', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic | ' +
      'alignleft aligncenter alignright | bullist numlist outdent indent | ' +
      'table link image | removeformat code help',
    setup: (editor: any) => {
      editorRef.current = editor;
      
      // Sử dụng debounce để giảm thiểu re-render
      let debounceTimer: NodeJS.Timeout;
      editor.on('input change keyup', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const content = editor.getContent();
          if (content !== valueRef.current) {
            onChange(content);
          }
        }, 300);
      });
      
      // Thiết lập placeholder nếu cần
      editor.on('init', () => {
        const editorElement = editor.getContainer();
        if (editorElement) {
          const iframe = editorElement.querySelector('iframe');
          if (iframe) {
            iframe.setAttribute('title', 'Trình soạn thảo văn bản');
            iframe.setAttribute('loading', 'lazy');
          }
        }
        
        if (valueRef.current) {
          editor.setContent(valueRef.current);
        }
      });
    },
    content_style: `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1.6; }
      p { margin: 0 0 1rem 0; }
      table { border-collapse: collapse; }
      table td, table th { border: 1px solid #ccc; padding: 0.4rem; }
      img { max-width: 100%; height: auto; }
      .mce-content-body:not([dir=rtl])[data-mce-placeholder]:not(.mce-visualblocks)::before {
        content: attr(data-mce-placeholder);
        position: absolute;
        opacity: 0.5;
        color: #888;
      }
    `,
    placeholder,
    readonly,
    browser_spellcheck: true,
    contextmenu: false,
    paste_data_images: true,
    image_advtab: true,
    // Tách biệt trong iframe để tránh ảnh hưởng đến UI chính
    iframe: true,
    iframe_aria_text: 'Trình soạn thảo văn bản',
    // Tải TinyMCE từ CDN để cải thiện hiệu suất tải
    referrer_policy: 'origin',
    // Tùy chọn khác
    branding: false,
    promotion: false
  } as any; // Sử dụng type assertion để tránh lỗi TypeScript
  
  return (
    <div className="isolated-editor-container">
      <Editor
        apiKey={apiKey}
        init={editorConfig}
        value={value}
        onEditorChange={onChange}
      />
    </div>
  );
});

IsolatedTextEditor.displayName = 'IsolatedTextEditor';

export default IsolatedTextEditor; 