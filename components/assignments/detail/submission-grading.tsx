import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Submission, QuizQuestionType } from "../shared/types";
import { isCorrectAnswer } from "../shared/utils";
import { ReactNode } from "react";

interface SubmissionGradingProps {
  submission: Submission;
  grade: number | null;
  feedback: string;
  assignmentType: string;
  questions?: QuizQuestionType[];
  onGradeChange: (grade: number) => void;
  onFeedbackChange: (feedback: string) => void;
  onSave: () => void;
  onBack: () => void;
}

const SubmissionGrading = ({
  submission,
  grade,
  feedback,
  assignmentType,
  questions = [],
  onGradeChange,
  onFeedbackChange,
  onSave,
  onBack
}: SubmissionGradingProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chấm điểm bài nộp</CardTitle>
            <CardDescription>
              Học sinh: {submission.studentName}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Quay lại danh sách
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold">Thông tin nộp bài</h3>
            <Badge className={
              submission.status === 'late' 
                ? 'bg-red-500' 
                : submission.status === 'graded' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
            }>
              {submission.status === 'late' && 'Nộp muộn'}
              {submission.status === 'graded' && 'Đã chấm điểm'}
              {submission.status === 'submitted' && 'Đã nộp, chưa chấm'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Thời gian nộp</p>
              <p className="text-muted-foreground">
                {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Trạng thái</p>
              <p className="text-muted-foreground">
                {submission.status === 'late' && 'Nộp muộn'}
                {submission.status === 'graded' && 'Đã chấm điểm'}
                {submission.status === 'submitted' && 'Đã nộp, chưa chấm'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Phần câu trả lời trắc nghiệm */}
        {Object.keys(submission.answers).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Câu trả lời trắc nghiệm</h3>
            <div className="space-y-4">
              {Object.entries(submission.answers).map(([questionId, answer]) => {
                const question = questions.find(q => q.id === questionId);
                return (
                  <div key={questionId} className="p-4 border rounded-md">
                    <p className="font-medium">{question?.question || `Câu hỏi ${questionId}`}</p>
                    <p className="text-muted-foreground">Đáp án: {answer as ReactNode}</p>
                    {question && (
                      <p className={
                        isCorrectAnswer(question, answer)
                          ? "text-green-500 text-sm mt-2" 
                          : "text-red-500 text-sm mt-2"
                      }>
                        {isCorrectAnswer(question, answer)
                          ? "✓ Đúng" 
                          : "✗ Sai"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Phần nội dung bài làm */}
        {submission.textContent && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Bài làm tự luận</h3>
            <div className="p-4 border rounded-md">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: submission.textContent }} />
            </div>
          </div>
        )}
        
        {/* Phần file đính kèm */}
        {submission.files && submission.files.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">File đính kèm</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {submission.files.map((file, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 text-blue-500" />
                    <div>
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.type}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(file.url, '_blank')}>
                      Xem file
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Phần chấm điểm */}
        <div className="space-y-4 pt-4">
          <h3 className="text-md font-semibold">Chấm điểm</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="grade" className="text-sm font-medium">
                Điểm (0-100)
              </label>
              <input 
                type="number" 
                id="grade"
                min="0"
                max="100"
                value={grade !== null ? grade : ''}
                onChange={(e) => onGradeChange(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-md"
                disabled={assignmentType === 'quiz'}
              />
              {assignmentType === 'quiz' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Điểm bài trắc nghiệm được tính tự động và không thể chỉnh sửa
                </p>
              )}
              {submission.status === 'late' && (
                <p className="text-xs text-amber-500 mt-1">
                  Bài nộp muộn sẽ bị trừ 25% tổng điểm
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Nhận xét
              </label>
              <textarea 
                id="feedback"
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                className="w-full p-2 border rounded-md h-20"
                placeholder="Nhập nhận xét cho học sinh..."
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onSave} 
          disabled={assignmentType === 'quiz' && submission.status === 'graded'}
        >
          Lưu đánh giá
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubmissionGrading; 