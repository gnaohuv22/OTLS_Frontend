import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Trophy, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";
import { AssignmentDetail, QuizQuestionType } from "../shared/types";
import { fadeInUp } from "../shared/animation-variants";
import { Badge } from "@/components/ui/badge";

interface AssignmentDetailsProps {
  assignment: AssignmentDetail;
  gradedCount: number;
  submittedCount: number;
  lateCount: number;
  role: string;
  userSubmissionStatus?: string;
  onViewSubmissions: () => void;
}

const AssignmentDetails = ({
  assignment,
  gradedCount,
  submittedCount,
  lateCount,
  role,
  userSubmissionStatus,
  onViewSubmissions
}: AssignmentDetailsProps) => {

  // Function to get submission status badge for student
  const getSubmissionStatusBadge = () => {
    if (!userSubmissionStatus) return <Badge variant="outline">Chưa làm bài</Badge>;
    
    switch (userSubmissionStatus.toLowerCase()) {
      case 'submitted':
        return <Badge variant="secondary">Đã nộp bài đúng hạn</Badge>;
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Đã chấm điểm</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Đã nộp bài muộn</Badge>;
      default:
        return <Badge variant="outline">Chưa làm bài</Badge>;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết bài tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Loại bài tập</h3>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              {assignment.type === 'quiz' && (
                <>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Trắc nghiệm</p>
                    <p className="text-sm text-muted-foreground">Bài kiểm tra trắc nghiệm tự động chấm điểm</p>
                  </div>
                </>
              )}
              {assignment.type === 'text' && (
                <>
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Tự luận</p>
                    <p className="text-sm text-muted-foreground">Bài tập viết tự luận theo yêu cầu</p>
                  </div>
                </>
              )}
              {assignment.type === 'file' && (
                <>
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Nộp file</p>
                    <p className="text-sm text-muted-foreground">Bài tập yêu cầu nộp file đính kèm</p>
                  </div>
                </>
              )}
              {assignment.type === 'mixed' && (
                <>
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Hỗn hợp</p>
                    <p className="text-sm text-muted-foreground">Bài tập kết hợp nhiều loại: trắc nghiệm, tự luận, nộp file</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Student submission status */}
          {role === 'Student' && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Trạng thái bài làm</h3>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Bài làm của bạn:</p>
                    {getSubmissionStatusBadge()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userSubmissionStatus?.toLowerCase() === 'graded' ? 
                      'Giáo viên đã chấm điểm, vào tab "Bài nộp" để xem kết quả.' : 
                      userSubmissionStatus ? 
                        'Bạn đã nộp bài. Đang chờ giáo viên chấm điểm.' : 
                        'Bạn chưa nộp bài. Vào tab "Nộp bài" để bắt đầu làm bài.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Display textContent for text assignments */}
          {assignment.type === 'text' && assignment.textContent && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Nội dung bài tập</h3>
              <div className="p-4 border rounded-md bg-card">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: assignment.textContent }}
                />
              </div>
            </div>
          )}

          {assignment.type === 'quiz' && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Danh sách câu hỏi trắc nghiệm</h3>
              <div className="space-y-4">
                {assignment.quiz.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-md">
                    <p className="font-medium">Câu {index + 1}: {question.question}</p>
                    {question.type === 'multiple_choice' && (
                      <div className="grid gap-2 mt-2">
                        {question.options.map((option, optIdx) => (
                          <div key={optIdx} className={`p-2 border rounded flex items-center gap-2 ${option === question.correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}>
                            <div className={`w-4 h-4 rounded-full ${option === question.correctAnswer ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            <span className={option === question.correctAnswer ? 'font-medium' : ''}>{option}</span>
                            {option === question.correctAnswer && <span className="text-green-500 text-sm ml-auto">Đáp án đúng</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission statistics - only show for teachers and admins */}
          {(role === 'Teacher' || role === 'Admin') && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Thống kê bài nộp</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md flex flex-col items-center">
                  <p className="text-3xl font-bold text-green-500">{gradedCount}</p>
                  <p className="text-sm text-muted-foreground">Đã chấm điểm</p>
                </div>
                <div className="p-4 border rounded-md flex flex-col items-center">
                  <p className="text-3xl font-bold text-blue-500">{submittedCount}</p>
                  <p className="text-sm text-muted-foreground">Đã nộp, chưa chấm</p>
                </div>
                <div className="p-4 border rounded-md flex flex-col items-center">
                  <p className="text-3xl font-bold text-red-500">{lateCount}</p>
                  <p className="text-sm text-muted-foreground">Nộp muộn</p>
                </div>
              </div>
            </div>
          )}

          {role === 'Teacher' && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={onViewSubmissions}
                className="w-full"
              >
                Xem danh sách bài nộp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssignmentDetails; 