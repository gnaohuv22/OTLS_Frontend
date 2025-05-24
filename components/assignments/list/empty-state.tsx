import { FileText } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyAssignmentStateProps {
  searchTerm: string;
}

const EmptyAssignmentState = ({ searchTerm }: EmptyAssignmentStateProps) => {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FileText className="h-6 w-6 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-medium">Không có bài tập nào</h3>
      <p className="text-muted-foreground mt-1">
        {searchTerm 
          ? "Không tìm thấy bài tập nào phù hợp với tìm kiếm của bạn"
          : "Hiện tại không có bài tập nào trong danh sách này"}
      </p>
    </motion.div>
  );
};

export default EmptyAssignmentState; 