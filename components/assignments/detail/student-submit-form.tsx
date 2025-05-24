import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import EditorComponent from "@/components/shared/editor-component";
import { FileUploader } from "@/components/student/assignments/file-uploader";
import { QuizSection, Question as QuizSectionQuestion } from "@/components/student/assignments/quiz-section";
import { AssignmentDetail, QuizQuestionType } from "../shared/types";
import { useRef } from "react";

interface StudentSubmitFormProps {
  assignment: AssignmentDetail;
  essayAnswer: string;
  onEssayChange: (content: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  mapQuestionsToQuizFormat: (questions: QuizQuestionType[]) => QuizSectionQuestion[];
}

const StudentSubmitForm = ({
  assignment,
  essayAnswer,
  onEssayChange,
  onSubmit,
  isSubmitting,
  mapQuestionsToQuizFormat,
}: StudentSubmitFormProps) => {
  const editorRef = useRef(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Làm bài tập</CardTitle>
        <CardDescription>
          Hoàn thành bài tập theo yêu cầu và nộp trước thời hạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(assignment.type === 'quiz' || assignment.type === 'mixed') && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Phần 1: Trắc nghiệm</h3>
            <QuizSection questions={mapQuestionsToQuizFormat(assignment.quiz.questions)} />
          </div>
        )}
        
        {(assignment.type === 'text' || assignment.type === 'mixed') && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Phần 2: Tự luận</h3>
            <EditorComponent
              content={essayAnswer}
              onContentChange={onEssayChange}
              editorRef={editorRef}
            />
          </div>
        )}
        
        {(assignment.type === 'file' || assignment.type === 'mixed') && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Phần 3: Nộp file bài làm</h3>
            <FileUploader />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting || assignment.status === 'completed'}
        >
          {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentSubmitForm; 