import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizAssignment from '../quiz-assignment';
import { QuizQuestion } from '../quiz-question-item';

// Mock component con để tập trung vào chức năng của component hiện tại
jest.mock('./QuizQuestionList', () => ({
  __esModule: true,
  default: ({ questions }: { questions: QuizQuestion[] }) => (
    <div data-testid="mock-question-list">
      {questions.length} câu hỏi
    </div>
  ),
}));

describe('QuizAssignment Component', () => {
  const mockQuestions: QuizQuestion[] = [
    { 
      id: 1, 
      question: 'Câu hỏi test', 
      options: ['Lựa chọn 1', 'Lựa chọn 2'], 
      correctOptions: [0], 
      points: 10,
      explanation: 'Giải thích' 
    }
  ];

  // Tạo real DOM element và spy cho các methods
  let fileInputElement: HTMLInputElement;
  let clickSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Tạo input element thật
    fileInputElement = document.createElement('input');
    clickSpy = jest.spyOn(fileInputElement, 'click');
    
    const mockProps = {
      questions: mockQuestions,
      onUpdateQuestion: jest.fn(),
      onUpdateOption: jest.fn(),
      onRemoveQuestion: jest.fn(),
      onAddQuestion: jest.fn(),
      onOpenHelpDialog: jest.fn(),
      onFileUpload: jest.fn(),
      quizFileInputRef: { current: fileInputElement } as React.RefObject<HTMLInputElement | null>,
    };
    
    render(<QuizAssignment {...mockProps} />);
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('renders correctly with questions', () => {
    expect(screen.getByTestId('mock-question-list')).toBeInTheDocument();
    expect(screen.getByText('1 câu hỏi')).toBeInTheDocument();
    expect(screen.getByText('Nhập từ file')).toBeInTheDocument();
    expect(screen.getByText('Thêm câu hỏi')).toBeInTheDocument();
  });

  it('calls onAddQuestion when add button is clicked', () => {
    const addButton = screen.getByText('Thêm câu hỏi');
    const mockProps = {
      onAddQuestion: jest.fn()
    };
    
    // Re-render with our specific props
    const { unmount } = render(
      <QuizAssignment 
        questions={mockQuestions}
        onUpdateQuestion={jest.fn()}
        onUpdateOption={jest.fn()}
        onRemoveQuestion={jest.fn()}
        onAddQuestion={mockProps.onAddQuestion}
        onOpenHelpDialog={jest.fn()}
        onFileUpload={jest.fn()}
        quizFileInputRef={{ current: fileInputElement }}
      />
    );
    
    // Find the button again after re-render
    const addButtonAfterRender = screen.getAllByText('Thêm câu hỏi')[1];
    fireEvent.click(addButtonAfterRender);
    
    expect(mockProps.onAddQuestion).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('calls the file input click method when upload button is clicked', () => {
    const uploadButton = screen.getByText('Nhập từ file');
    fireEvent.click(uploadButton);
    
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
}); 