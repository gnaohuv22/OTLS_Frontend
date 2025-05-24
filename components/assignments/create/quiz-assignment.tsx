import React, { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Brain } from 'lucide-react';
import { useAssignment, QuizQuestion } from './assignment-context';
import QuizQuestionItem from './quiz-question-item';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuizAssignmentProps {}

// Sử dụng memo để ngăn re-render không cần thiết
const QuizAssignment = memo(function QuizAssignment({}: QuizAssignmentProps) {
  const { 
    state, 
    addQuizQuestion,
    removeQuizQuestion,
    updateQuizQuestion
  } = useAssignment();
  
  const { quizQuestions } = state;

  // Filter to get AI-generated and manual questions
  const aiGeneratedQuestions = quizQuestions.filter(q => q.isAIGenerated);
  const manualQuestions = quizQuestions.filter(q => !q.isAIGenerated);

  // Add a new question with isAIGenerated=false
  const handleAddQuestion = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    addQuizQuestion(false);
  }, [addQuizQuestion]);

  return (
    <Card className="animate-scale-in" style={{ animationDelay: '150ms' }}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 transition-all hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </div>
              
              {aiGeneratedQuestions.length > 0 && (
                <div className="text-sm text-muted-foreground animate-fade-in">
                  <span>Tổng cộng: {quizQuestions.length} câu hỏi</span>
                  <span className="ml-2">({aiGeneratedQuestions.length} tạo bởi AI)</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Render all questions in order */}
            {quizQuestions.map((question, idx) => (
              <div 
                key={question.id} 
                className="animate-slide-in" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <QuizQuestionItem
                  question={question}
                  index={idx}
                  onUpdateQuestion={(field, value) => updateQuizQuestion(question.id, field, value)}
                  onRemove={() => removeQuizQuestion(question.id)}
                  isAIGenerated={question.isAIGenerated}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default QuizAssignment; 