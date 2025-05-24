import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Trash, Calendar, Bookmark, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface AssignmentHeaderProps {
  title: string;
  subject: string;
  role: string;
  assignmentId: string;
  isExpired: boolean;
  remainingTime: string;
  isExam: boolean;
  timer: string | null;
  onDeleteClick: () => void;
}

const AssignmentHeader = ({
  title,
  subject,
  role,
  assignmentId,
  isExpired,
  remainingTime,
  isExam,
  timer,
  onDeleteClick
}: AssignmentHeaderProps) => {
  const router = useRouter();
  
  // Format timer for display
  const formattedTimer = timer ? 
    new Date(parseInt(timer) * 1000).toISOString().substr(11, 8) : 
    null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Môn học: {subject}</p>
        </motion.div>
        
        {role === 'Teacher' ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/assignments/edit/${assignmentId}`)}
              disabled={isExpired}
              title={isExpired ? "Không thể chỉnh sửa bài tập đã hết hạn" : "Chỉnh sửa bài tập"}
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteClick}
              disabled={isExpired}
              title={isExpired ? "Không thể xóa bài tập đã hết hạn" : "Xóa bài tập"}
            >
              <Trash className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              <Clock className="h-4 w-4 mr-1" />
              {isExpired ? "Đã hết hạn" : remainingTime}
            </Badge>
            
            {isExam && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <Bookmark className="h-4 w-4 mr-1" />
                Bài thi
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Additional information row */}
      <div className="flex flex-wrap gap-3 text-sm">
        {isExam && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <TimerReset className="h-4 w-4 text-blue-600" />
            <span>Thời gian làm bài: {formattedTimer || "Không giới hạn"}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
          <Calendar className="h-4 w-4 text-green-600" />
          <span>Trạng thái: {isExpired ? "Đã hết hạn" : "Đang diễn ra"}</span>
        </div>
        
        {role === 'Teacher' && isExam && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <Bookmark className="h-4 w-4 text-purple-600" />
            <span>Loại bài: Bài thi - Thời gian: {formattedTimer}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentHeader; 