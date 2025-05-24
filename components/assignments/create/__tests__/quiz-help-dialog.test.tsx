import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizHelpDialog from '../quiz-help-dialog';

// Mock Dialog component từ shadcn/ui để tránh lỗi khi test
jest.mock('@/components/ui/dialog', () => {
  const actual = jest.requireActual('@/components/ui/dialog');
  return {
    ...actual,
    Dialog: ({ open, onOpenChange, children }: { open: boolean, onOpenChange: any, children: React.ReactNode }) => (
      open ? <div data-testid="dialog-content">{children}</div> : null
    ),
    DialogContent: ({ className, children }: { className: string, children: React.ReactNode }) => (
      <div data-testid="dialog-body" className={className}>{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-header">{children}</div>
    ),
    DialogFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-footer">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <h2 data-testid="dialog-title">{children}</h2>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <p data-testid="dialog-description">{children}</p>
    ),
  };
});

describe('QuizHelpDialog Component', () => {
  it('renders nothing when closed', () => {
    render(<QuizHelpDialog open={false} onOpenChange={() => {}} />);
    
    // Kiểm tra component không hiển thị gì khi open=false
    const dialog = screen.queryByTestId('dialog-content');
    expect(dialog).not.toBeInTheDocument();
  });

  it('renders dialog content when open', () => {
    render(<QuizHelpDialog open={true} onOpenChange={() => {}} />);
    
    // Kiểm tra dialog hiển thị
    const dialog = screen.getByTestId('dialog-content');
    expect(dialog).toBeInTheDocument();
    
    // Kiểm tra tiêu đề
    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Hướng dẫn tạo file câu hỏi');
    
    // Kiểm tra các nội dung cơ bản
    expect(screen.getByText(/Bạn có thể tạo nhiều câu hỏi nhanh chóng/)).toBeInTheDocument();
    expect(screen.getByText(/Mỗi câu hỏi bắt đầu bằng/)).toBeInTheDocument();
    
    // Kiểm tra mẫu định dạng xuất hiện trong dialog
    expect(screen.getByText(/Thủ đô của Việt Nam là gì?/)).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', () => {
    const handleOpenChange = jest.fn();
    render(<QuizHelpDialog open={true} onOpenChange={handleOpenChange} />);
    
    // Tìm button đóng
    const closeButton = screen.getByRole('button', { name: 'Đóng' });
    
    // Click vào button đóng
    fireEvent.click(closeButton);
    
    // Kiểm tra xem callback có được gọi đúng không
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
}); 