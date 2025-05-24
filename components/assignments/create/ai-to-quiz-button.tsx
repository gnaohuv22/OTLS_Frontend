import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircleIcon } from 'lucide-react';

interface AddQuestionButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Button to add AI generated questions to the quiz
 */
const AddQuestionButton: React.FC<AddQuestionButtonProps> = ({ onClick, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          className={className}
          variant="outline"
          size="sm"
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          <span>Thêm vào bài tập</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">Thêm các câu hỏi AI vào bài tập</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AddQuestionButton; 