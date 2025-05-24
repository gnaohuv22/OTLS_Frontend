import { memo, useCallback } from 'react';
import QuizQuestionItem from './quiz-question-item';
import { QuizQuestion } from './assignment-context';

interface QuizQuestionListProps {
  questions: QuizQuestion[];
  onUpdateQuestion: (id: number, field: keyof QuizQuestion, value: any) => void;
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void;
  onRemoveQuestion: (id: number) => void;
}

const QuizQuestionList = memo(({ 
  questions, 
  onUpdateQuestion,
  onUpdateOption,
  onRemoveQuestion
}: QuizQuestionListProps) => {
  // Tạo các callback handlers để tránh re-renders không cần thiết
  const createQuestionUpdateHandler = useCallback((questionId: number) => {
    return (field: keyof QuizQuestion, value: any) => {
      onUpdateQuestion(questionId, field, value);
    };
  }, [onUpdateQuestion]);
  
  const createOptionUpdateHandler = useCallback((questionId: number) => {
    return (optionIndex: number, value: string) => {
      onUpdateOption(questionId, optionIndex, value);
    };
  }, [onUpdateOption]);
  
  const createRemoveHandler = useCallback((questionId: number) => {
    return () => {
      onRemoveQuestion(questionId);
    };
  }, [onRemoveQuestion]);

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto p-2">
      {questions.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-4">
          Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu.
        </div>
      ) : (
        questions.map((question, idx) => (
          <QuizQuestionItem 
            key={question.id} 
            question={question} 
            index={idx}
            onUpdateQuestion={createQuestionUpdateHandler(question.id)}
            onRemove={createRemoveHandler(question.id)}
          />
        ))
      )}
    </div>
  );
});

QuizQuestionList.displayName = 'QuizQuestionList';

export default QuizQuestionList; 