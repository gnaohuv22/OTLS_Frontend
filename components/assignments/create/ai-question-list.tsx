import { memo, useCallback } from 'react';
import AIQuestionItem from './ai-question-item';
import { QuizQuestion } from './assignment-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import AIToQuizButton from './ai-to-quiz-button';

interface AIQuestionListProps {
  questions: QuizQuestion[];
  onQuestionChange?: (qIndex: number, field: string, value: any) => void;
  onSwitchToQuiz?: () => void; // Callback để chuyển sang tab Trắc nghiệm
  readOnly?: boolean; // New prop to indicate if questions should be read-only
}

const AIQuestionList = memo(({ 
  questions, 
  onQuestionChange,
  onSwitchToQuiz,
  readOnly = false
}: AIQuestionListProps) => {
  // Tạo callback handler tối ưu cho các câu hỏi để giảm re-render
  const createQuestionChangeHandler = useCallback((index: number) => {
    return (field: string, value: any) => {
      onQuestionChange && onQuestionChange(index, field, value);
    };
  }, [onQuestionChange]);

  // Tạo một key duy nhất dựa trên tất cả các ID câu hỏi để đảm bảo re-render khi questions thay đổi
  const questionsKey = questions.map(q => q.id).join('-');

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30 flex-1 mr-2">
            <InfoIcon className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400 font-medium">
              Nội dung được tạo bởi AI
            </AlertTitle>
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
              Các câu hỏi này được tạo tự động bởi AI. Vui lòng kiểm tra kỹ nội dung, đáp án và độ chính xác trước khi gửi cho học sinh. 
              Điều chỉnh các câu hỏi nếu cần để đảm bảo phù hợp với trình độ và mục tiêu bài học.
            </AlertDescription>
          </Alert>
          
          {onSwitchToQuiz && questions.length > 0 && (
            <AIToQuizButton 
              onClick={onSwitchToQuiz} 
              className="ml-2 shrink-0"
            />
          )}
        </div>
      )}
      
      <div 
        className="space-y-4 p-2 border rounded-md bg-background" 
        key={questionsKey} // Thêm key để đảm bảo component sẽ re-render khi questions thay đổi
      >
        {questions.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4 bg-muted rounded-md">
            Chưa có câu hỏi nào được tạo. Hãy điều chỉnh các tham số và nhấn "Tạo câu hỏi" để bắt đầu.
          </div>
        ) : (
          <>
            <div className="text-center text-sm text-muted-foreground py-2 bg-muted rounded-md">
              Tổng số {questions.length} câu hỏi
            </div>
            
            {questions.map((question, idx) => (
              <AIQuestionItem 
                key={`question-${question.id}`} // Sử dụng prefix để đảm bảo tính duy nhất
                question={question} 
                qIndex={idx} 
                onQuestionChange={onQuestionChange || ((index, field, value) => {})} 
                readOnly={readOnly}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
});

AIQuestionList.displayName = 'AIQuestionList';

export default AIQuestionList; 