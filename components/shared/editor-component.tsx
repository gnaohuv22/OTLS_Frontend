import { memo } from 'react';
import dynamic from 'next/dynamic';
import { getEditorConfig } from '@/components/assignments/shared/utils';
import { useTheme } from 'next-themes';

// Dynamic import for the editor
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo...</p>
});

interface EditorComponentProps {
  content: string;
  onContentChange: (content: string) => void;
  editorRef?: React.RefObject<any>;
  height?: number;
  customConfig?: object;
}

const EditorComponent = memo(({
  content,
  onContentChange,
  editorRef,
  height = 400,
  customConfig = {}
}: EditorComponentProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Lấy cấu hình mặc định và ghi đè nếu có custom config
  const defaultConfig = getEditorConfig(isDarkMode);
  const config = {
    ...defaultConfig,
    height: height || defaultConfig.height,
    ...customConfig
  };

  return (
    <Editor
      apiKey="vlvwh0a473am39bdhvjjt8sxpaicnav5z89epu5yg3vrecnc"
      value={content}
      onInit={(evt, editor) => {
        if (editorRef && editorRef.current) editorRef.current = editor;
      }}
      init={config}
      onEditorChange={onContentChange}
    />
  );
});

EditorComponent.displayName = 'EditorComponent';

export default EditorComponent; 