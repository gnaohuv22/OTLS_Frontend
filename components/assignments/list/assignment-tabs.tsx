import { motion } from "framer-motion";
import { Assignment } from "../shared/types";
import { staggerContainer } from "../shared/animation-variants";
import AssignmentCard from "./assignment-card";
import EmptyAssignmentState from "./empty-state";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

/**
 * Props cho component AssignmentSections
 * @property {Assignment[]} assignments - Danh sách bài tập đã được lọc
 * @property {string} searchTerm - Từ khóa tìm kiếm
 * @property {string | null | undefined} role - Vai trò của người dùng (Teacher, Student, Parent)
 * @property {boolean} isLoading - Trạng thái đang tải dữ liệu
 */
interface AssignmentSectionsProps {
  filteredAssignments: Assignment[];
  searchTerm: string;
  role: string | null | undefined;
  isLoading?: boolean;
}

// Định nghĩa kiểu dữ liệu cho bài tập được tổ chức
interface StudentAssignments {
  incomplete: Assignment[];
  completed: Assignment[];
  overdue: Assignment[];
}

interface TeacherAssignments {
  upcoming: Assignment[];
  expired: Assignment[];
}

/**
 * Component hiển thị các phần bài tập và danh sách bài tập tương ứng
 * Thay thế tabs bằng các phần riêng biệt để phân loại bài tập
 */
const AssignmentSections = ({
  filteredAssignments,
  searchTerm,
  role,
  isLoading = false
}: AssignmentSectionsProps) => {
  // Sử dụng giá trị mặc định '' khi role là null hoặc undefined
  const safeRole = role || '';
  
  // Tổ chức bài tập dựa trên vai trò người dùng
  const organizedAssignments = useMemo(() => {
    const now = new Date();
    
    if (safeRole === 'Student') {
      // Phân loại bài tập cho học sinh
      const result: StudentAssignments = {
        // Bài tập chưa hoàn thành (sắp theo deadline, gần nhất trước)
        incomplete: filteredAssignments
          .filter(assignment => 
            assignment.submissionStatus === 'not_submitted' && 
            new Date(assignment.dueDate) >= now
          )
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
          
        // Bài tập đã hoàn thành hoặc đang đợi chấm điểm (sắp theo trạng thái và ngày)
        completed: filteredAssignments
          .filter(assignment => 
            assignment.submissionStatus === 'submitted' || 
            assignment.submissionStatus === 'graded'
          )
          .sort((a, b) => {
            // Sắp xếp theo trạng thái trước (submitted trước graded)
            if (a.submissionStatus !== b.submissionStatus) {
              return a.submissionStatus === 'submitted' ? -1 : 1;
            }
            // Sau đó sắp xếp theo ngày nộp (mới nhất trước)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }),
          
        // Bài tập đã quá hạn (sắp theo ngày, cũ nhất trước)
        overdue: filteredAssignments
          .filter(assignment => 
            assignment.submissionStatus === 'not_submitted' && 
            new Date(assignment.dueDate) < now
          )
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      };
      return result;
    } else {
      // Phân loại bài tập cho giáo viên
      const result: TeacherAssignments = {
        // Bài tập chưa đến hạn (sắp theo deadline)
        upcoming: filteredAssignments
          .filter(assignment => new Date(assignment.dueDate) >= now)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
          
        // Bài tập đã hết hạn (sắp theo ngày)
        expired: filteredAssignments
          .filter(assignment => new Date(assignment.dueDate) < now)
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      };
      return result;
    }
  }, [filteredAssignments, safeRole]);
  
  // Type guard để kiểm tra kiểu dữ liệu
  const isStudentAssignments = (data: StudentAssignments | TeacherAssignments): data is StudentAssignments => {
    return 'incomplete' in data;
  };
  
  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải bài tập...</p>
      </div>
    );
  }
  
  // Hiển thị trạng thái trống nếu không có bài tập nào
  if (filteredAssignments.length === 0) {
    return <EmptyAssignmentState searchTerm={searchTerm} />;
  }
  
  // Kiểm tra nếu Student và sử dụng type guard
  if (safeRole === 'Student' && isStudentAssignments(organizedAssignments)) {
    return (
      <div className="space-y-8">
        {/* Phần Chưa hoàn thành */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Chưa hoàn thành</h2>
          {organizedAssignments.incomplete.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Không có bài tập nào cần hoàn thành.</p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {organizedAssignments.incomplete.map((assignment, index) => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  role={safeRole}
                  index={index} 
                />
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Phần Đã hoàn thành & đang đợi chấm điểm */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Đã hoàn thành & đang đợi chấm điểm</h2>
          {organizedAssignments.completed.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Không có bài tập nào đã hoàn thành.</p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {organizedAssignments.completed.map((assignment, index) => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  role={safeRole}
                  index={index} 
                />
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Phần Đã quá hạn */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Đã quá hạn</h2>
          {organizedAssignments.overdue.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Không có bài tập nào quá hạn.</p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {organizedAssignments.overdue.map((assignment, index) => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  role={safeRole}
                  index={index} 
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  }
  
  // Kiểm tra nếu là Teacher hoặc Admin (hoặc Student không có dữ liệu đúng)
  // Đảm bảo organizedAssignments là TeacherAssignments
  const teacherAssignments = isStudentAssignments(organizedAssignments) 
    ? { upcoming: [], expired: [] } as TeacherAssignments 
    : organizedAssignments;
    
  return (
    <div className="space-y-8">
      {/* Phần Chưa đến hạn */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Chưa đến hạn</h2>
        {teacherAssignments.upcoming.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Không có bài tập nào chưa đến hạn.</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {teacherAssignments.upcoming.map((assignment, index) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                role={safeRole}
                index={index} 
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Phần Đã hết hạn */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Đã hết hạn</h2>
        {teacherAssignments.expired.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Không có bài tập nào đã hết hạn.</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {teacherAssignments.expired.map((assignment, index) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                role={safeRole}
                index={index} 
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSections; 