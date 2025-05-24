import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";
import { motion } from "framer-motion";
import { AssignmentDetail } from "../shared/types";
import { fadeInUp } from "../shared/animation-variants";

interface AssignmentOverviewProps {
  assignment: AssignmentDetail;
  isExpired: boolean;
  role: string;
  onSubmitClick: () => void;
}

const AssignmentOverview = ({
  assignment,
  isExpired,
  role,
  onSubmitClick
}: AssignmentOverviewProps) => {
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
            <Book className="h-5 w-5" />
            Thông tin bài tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Ngày tạo</h3>
              <p>{new Date(assignment.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Hạn nộp</h3>
              <p className={isExpired ? "text-destructive font-medium" : ""}>
                {new Date(assignment.dueDate).toLocaleDateString('vi-VN')} {new Date(assignment.dueDate).toLocaleTimeString('vi-VN')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Người tạo</h3>
              <p>{assignment.createdBy}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Lớp</h3>
              <p>{assignment.className}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Mô tả</h3>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: assignment.description }}></div>
          </div>
          
          {role === 'Student' && (
            <Button 
              onClick={onSubmitClick} 
              className="w-full md:w-auto mt-4"
              disabled={isExpired || assignment.status === 'completed'}
            >
              {assignment.status === 'completed' ? 'Đã nộp bài' : 'Làm bài ngay'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssignmentOverview; 