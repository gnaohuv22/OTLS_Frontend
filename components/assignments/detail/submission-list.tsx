import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Submission } from "../shared/types";

interface SubmissionListProps {
  submissions: Submission[];
  onSelectSubmission: (submission: Submission) => void;
}

const SubmissionList = ({ submissions, onSelectSubmission }: SubmissionListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách bài nộp</CardTitle>
        <CardDescription>
          Xem và chấm điểm bài nộp của học sinh
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={submission.studentAvatar} alt={submission.studentName} />
                      <AvatarFallback>{submission.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{submission.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {submission.status === 'graded' && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Đã chấm: {submission.grade}/100
                      </Badge>
                    )}
                    {submission.status === 'submitted' && (
                      <Badge variant="outline">Chưa chấm</Badge>
                    )}
                    {submission.status === 'late' && (
                      <Badge variant="destructive">Muộn</Badge>
                    )}
                    <Button 
                      size="sm"
                      onClick={() => onSelectSubmission(submission)}
                    >
                      {submission.status === 'graded' ? 'Xem chi tiết' : 'Chấm điểm'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Chưa có học sinh nào nộp bài.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionList; 