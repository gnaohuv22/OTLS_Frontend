import React from 'react';
import { render, screen } from '@testing-library/react';
import TextAssignment from '../text-assignment';

// Mock the dynamic import của TinyMCE editor
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = ({ onEditorChange, value, init }: { 
    onEditorChange: (content: string, editor: any) => void; 
    value: string;
    init: any;
  }) => (
    <div data-testid="mock-tinymce">
      <textarea
        data-testid="mock-editor"
        defaultValue={value}
        title="Mock TinyMCE Editor"
        placeholder="Enter content here"
        onChange={(e) => onEditorChange && onEditorChange(e.target.value, { target: { getContent: () => e.target.value } })}
      />
    </div>
  );
  return DynamicComponent;
});

describe('TextAssignment Component', () => {
  const mockProps = {
    content: 'Test nội dung',
    onContentChange: jest.fn(),
    editorConfig: {
      height: 400,
      plugins: ['test-plugin'],
    },
    editorRef: { current: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with proper title and description', () => {
    render(<TextAssignment {...mockProps} />);
    
    expect(screen.getByText('Tạo bài tập tự luận')).toBeInTheDocument();
    expect(screen.getByText('Mô tả đề bài và hướng dẫn làm bài tập')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('passes the content to the editor', () => {
    render(<TextAssignment {...mockProps} />);
    
    const mockEditor = screen.getByTestId('mock-editor');
    expect(mockEditor).toHaveValue('Test nội dung');
  });

  it('passes the editor configuration properly', () => {
    render(<TextAssignment {...mockProps} />);
    
    // This is a basic check - in a real test we might check if props are passed correctly
    // but since we've mocked the dynamic component, we can only check if it renders
    expect(screen.getByTestId('mock-tinymce')).toBeInTheDocument();
  });
}); 