import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Props cho component AssignmentHeader
 * @property {string | null} role - Vai trò của người dùng (Teacher, Student, Parent)
 */
interface AssignmentHeaderProps {
  role: string | null | undefined;
}

/**
 * Component hiển thị tiêu đề và nút tạo bài tập mới (nếu là giáo viên)
 * Xử lý trường hợp role có thể là null hoặc undefined
 */
const AssignmentHeader = ({ role }: AssignmentHeaderProps) => {
  // Sử dụng giá trị mặc định '' khi role là null hoặc undefined
  const safeRole = role || '';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold">Danh sách bài tập</h1>
        <p className="text-muted-foreground">
          {safeRole === 'Teacher'
            ? 'Quản lý và theo dõi bài tập của học sinh'
            : 'Danh sách bài tập cần làm và đã hoàn thành'}
        </p>
      </div>

      {safeRole === 'Teacher' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/assignments/create">
            <Button className="gap-2 w-full md:w-auto transition-all duration-200 hover:shadow-md">
              <PlusCircle className="h-4 w-4" />
              Tạo bài tập mới
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AssignmentHeader; 