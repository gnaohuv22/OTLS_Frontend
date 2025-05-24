import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';
import { QuizQuestion } from './assignment-context';

interface AIQuestionItemProps {
  question: QuizQuestion;
  qIndex: number;
  onQuestionChange: (qIndex: number, field: string, value: any) => void;
  readOnly?: boolean;
}

const AIQuestionItem = memo(({ 
  question, 
  qIndex, 
  onQuestionChange,
  readOnly = false
}: AIQuestionItemProps) => {
  return (
    <Card key={question.id} className="border p-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm font-medium flex-1">
            Câu hỏi {qIndex + 1}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <DebounceTextarea
          placeholder="Nội dung câu hỏi"
          value={question.question}
          onValueChange={(value) => onQuestionChange(qIndex, 'question', value)}
          rows={2}
          className="resize-none"
          debounceDelay={500}
          disabled={readOnly}
        />

        <div className="space-y-3">
          {question.options.map((option: string, oIndex: number) => (
            <div key={oIndex} className="flex items-center gap-3">
              <Checkbox
                id={`aiquestion-${question.id}-option-${oIndex}`}
                title={`Đánh dấu đây là đáp án đúng của câu hỏi ${qIndex + 1}`}
                checked={question.correctOptions.includes(oIndex)}
                onCheckedChange={(checked) => {
                  if (readOnly) return;
                  const newCorrectOptions = checked
                    ? [...question.correctOptions, oIndex].filter((v, i, a) => a.indexOf(v) === i)
                    : question.correctOptions.filter((idx: number) => idx !== oIndex);
                  
                  onQuestionChange(qIndex, 'correctOptions', newCorrectOptions);
                }}
                disabled={readOnly}
              />
              <Label
                htmlFor={`aiquestion-${question.id}-option-${oIndex}`}
                className="sr-only"
              >
                Đánh dấu là đáp án đúng
              </Label>
              <DebounceInput
                key={`aioption-${question.id}-${oIndex}`}
                placeholder={`Phương án ${oIndex + 1}`}
                value={option}
                onValueChange={(value) => {
                  if (readOnly) return;
                  const newOptions = [...question.options];
                  newOptions[oIndex] = value;
                  onQuestionChange(qIndex, 'options', newOptions);
                }}
                className="flex-1"
                debounceDelay={500}
                disabled={readOnly}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Giải thích</Label>
          <DebounceTextarea
            placeholder="Giải thích đáp án (tùy chọn)"
            value={question.explanation || ""}
            onValueChange={(value) => onQuestionChange(qIndex, 'explanation', value)}
            rows={3}
            className="text-sm resize-none"
            debounceDelay={500}
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
});

AIQuestionItem.displayName = 'AIQuestionItem';

export default AIQuestionItem; 