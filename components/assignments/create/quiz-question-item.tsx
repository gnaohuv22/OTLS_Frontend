import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash, Brain } from 'lucide-react';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';
import { QuizQuestion } from './assignment-context';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Định nghĩa props cho component
export interface QuizQuestionItemProps {
  question: QuizQuestion;
  index?: number;
  onUpdateQuestion: (field: keyof QuizQuestion, value: any) => void;
  onRemove: () => void;
  isAIGenerated?: boolean;
}

// Component hiển thị và chỉnh sửa câu hỏi quiz
const QuizQuestionItem = ({
  question,
  index = 0,
  onUpdateQuestion,
  onRemove,
  isAIGenerated = false
}: QuizQuestionItemProps) => {
  // Xử lý cập nhật đáp án đúng
  const handleCorrectOptionChange = (optionIndex: number, isChecked: boolean) => {
    let newCorrectOptions = [...question.correctOptions];
    
    if (isChecked) {
      // Thêm vào đáp án đúng nếu được chọn
      if (!newCorrectOptions.includes(optionIndex)) {
        newCorrectOptions.push(optionIndex);
        // Sắp xếp để duy trì thứ tự
        newCorrectOptions.sort((a, b) => a - b);
      }
    } else {
      // Xóa khỏi đáp án đúng nếu bỏ chọn
      newCorrectOptions = newCorrectOptions.filter(index => index !== optionIndex);
    }
    
    onUpdateQuestion('correctOptions', newCorrectOptions);
  };

  // Handle option update directly
  const handleOptionUpdate = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdateQuestion('options', newOptions);
  };

  // Add a new option
  const handleAddOption = () => {
    const newOptions = [...question.options, ""];
    onUpdateQuestion('options', newOptions);
  };

  // Remove an option
  const handleRemoveOption = (optionIndex: number) => {
    const newOptions = [...question.options];
    newOptions.splice(optionIndex, 1);
    
    // Update correct options if needed
    const newCorrectOptions = question.correctOptions
      .filter(idx => idx !== optionIndex) // Remove the deleted option
      .map(idx => idx > optionIndex ? idx - 1 : idx); // Adjust indices
    
    onUpdateQuestion('options', newOptions);
    onUpdateQuestion('correctOptions', newCorrectOptions);
  };

  return (
    <Card className={cn(
      "p-4",
      isAIGenerated && "border-primary/30 bg-primary/5"
    )}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm font-medium">
                Câu hỏi {index + 1}
              </Label>
              
              {isAIGenerated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-primary gap-1">
                        <Brain className="h-3 w-3" />
                        <span>AI</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Câu hỏi này được tạo tự động bởi AI</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <DebounceTextarea
              value={question.question}
              onValueChange={(value) => onUpdateQuestion('question', value)}
              placeholder={`Nhập câu hỏi ${index + 1}`}
              className="min-h-[60px] resize-none"
              debounceDelay={500}
            />
          </div>
          <div className="flex space-x-2 items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Các phương án trả lời</Label>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <Checkbox
                id={`question-${question.id}-option-${optionIndex}`}
                checked={question.correctOptions.includes(optionIndex)}
                onCheckedChange={(checked) => handleCorrectOptionChange(optionIndex, checked === true)}
              />
              <DebounceInput
                key={`option-${question.id}-${optionIndex}`}
                value={option}
                onValueChange={(value) => handleOptionUpdate(optionIndex, value)}
                placeholder={`Phương án ${optionIndex + 1}`}
                className="flex-1"
                debounceDelay={500}
              />
              {question.options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(optionIndex)}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          
          {question.options.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="mt-2"
            >
              Thêm phương án
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Giải thích đáp án (tùy chọn)</Label>
          <DebounceTextarea
            value={question.explanation}
            onValueChange={(value) => onUpdateQuestion('explanation', value)}
            placeholder="Nhập giải thích đáp án (sẽ hiển thị sau khi học sinh nộp bài)"
            className="resize-none"
            rows={2}
            debounceDelay={500}
          />
        </div>
      </div>
    </Card>
  );
};

export default QuizQuestionItem; 