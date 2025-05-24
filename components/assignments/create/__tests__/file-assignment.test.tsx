import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileAssignment from '../file-assignment';

describe('FileAssignment Component', () => {
  const mockFiles = [
    new File(['file content'], 'test-file.pdf', { type: 'application/pdf' })
  ];
  
  // Tạo real DOM element và spy cho các methods
  let fileInputElement: HTMLInputElement;
  let clickSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Tạo input element thật
    fileInputElement = document.createElement('input');
    clickSpy = jest.spyOn(fileInputElement, 'click');
    
    const mockProps = {
      fileDescription: 'Mô tả file test',
      onDescriptionChange: jest.fn(),
      files: mockFiles,
      onFileChange: jest.fn(),
      onRemoveFile: jest.fn(),
      fileInputRef: { current: fileInputElement } as React.RefObject<HTMLInputElement | null>,
    };
    
    render(<FileAssignment {...mockProps} />);
  });
  
  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('renders with files', () => {
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    expect(screen.getByText('Thêm file')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText('Nhập hướng dẫn hoặc mô tả về bài tập');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Mô tả file test');
  });

  it('renders without files and shows correct upload text', () => {
    // Unmount first
    document.body.innerHTML = '';
    
    // Re-render with empty files array
    render(
      <FileAssignment 
        fileDescription="Mô tả file test"
        onDescriptionChange={jest.fn()}
        files={[]}
        onFileChange={jest.fn()}
        onRemoveFile={jest.fn()}
        fileInputRef={{ current: fileInputElement }}
      />
    );
    
    expect(screen.queryByText('test-file.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Tải file lên')).toBeInTheDocument();
  });

  it('calls onDescriptionChange when textarea is changed', () => {
    // Unmount first
    document.body.innerHTML = '';
    
    const mockDescriptionChange = jest.fn();
    
    // Re-render with mock function
    render(
      <FileAssignment 
        fileDescription="Mô tả file test"
        onDescriptionChange={mockDescriptionChange}
        files={mockFiles}
        onFileChange={jest.fn()}
        onRemoveFile={jest.fn()}
        fileInputRef={{ current: fileInputElement }}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Nhập hướng dẫn hoặc mô tả về bài tập');
    fireEvent.change(textarea, { target: { value: 'Mô tả mới' } });
    
    expect(mockDescriptionChange).toHaveBeenCalledWith('Mô tả mới');
  });

  it('calls onRemoveFile when delete button is clicked', () => {
    // Unmount first
    document.body.innerHTML = '';
    
    const mockRemoveFile = jest.fn();
    
    // Re-render with mock function
    render(
      <FileAssignment 
        fileDescription="Mô tả file test"
        onDescriptionChange={jest.fn()}
        files={mockFiles}
        onFileChange={jest.fn()}
        onRemoveFile={mockRemoveFile}
        fileInputRef={{ current: fileInputElement }}
      />
    );
    
    // Tìm button xóa - thường là button đầu tiên trong component
    const deleteButton = screen.getByRole('button', { name: '' });
    fireEvent.click(deleteButton);
    
    expect(mockRemoveFile).toHaveBeenCalledWith(0);
  });

  it('calls the file input click method when upload button is clicked', () => {
    const uploadButton = screen.getByText('Thêm file');
    fireEvent.click(uploadButton);
    
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
}); 