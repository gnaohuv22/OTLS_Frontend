import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Assignment } from "../shared/types";
import { getRemainingTime, getStatusColor, getStatusText, getStatusBadge, getSubmissionStatusBadge } from "../shared/utils";
import { itemVariants } from "../shared/animation-variants";

interface AssignmentCardProps {
  assignment: Assignment;
  role: string;
  index: number;
}

const AssignmentCard = ({ assignment, role, index }: AssignmentCardProps) => {
  // Check if the assignment is graded and has a grade
  const isGraded = assignment.submissionStatus === 'graded' && assignment.grade !== undefined && assignment.grade !== null;
  
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/assignments/${assignment.id}`} className="h-full block">
        <Card className="p-5 h-full hover:shadow-md transition-all duration-300 flex flex-col">
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="transition-colors duration-200">{assignment.subject}</Badge>
                {role === 'Student' && (
                  assignment.submissionStatus ? 
                    getSubmissionStatusBadge(assignment.submissionStatus) : 
                    getStatusBadge(assignment.status)
                )}
                {role !== 'Student' && getStatusBadge(assignment.status)}
              </div>
              <motion.h2 
                className="font-semibold line-clamp-2 text-lg"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {assignment.title}
              </motion.h2>
            </div>

            <div className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className={`text-xs ${getStatusColor(assignment.status)}`}>
                  {new Date(assignment.dueDate) > new Date() ? 
                    `Còn ${getRemainingTime(assignment.dueDate)}` : 
                    'Đã hết hạn'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{assignment.className}</span>
            </div>
            
            {/* Display grade information if the assignment is graded */}
            {isGraded && (
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Điểm số:</span>
                </div>
                <div className="text-sm font-semibold">
                  {assignment.grade !== null && assignment.grade !== undefined ? 
                    <>
                      {assignment.grade}/{assignment.maxPoints}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({((assignment.grade / (assignment.maxPoints || 100)) * 100).toFixed(0)}%)
                      </span>
                    </> : 
                    'Đã chấm'
                  }
                </div>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default AssignmentCard; 