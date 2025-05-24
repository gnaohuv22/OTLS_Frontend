'use client';

import { useState, useEffect } from 'react';
import { TeacherDashboard } from '../../../components/dashboard/cards/teacher-dashboard';
import { StudentDashboard } from '../../../components/dashboard/cards/student-dashboard';
import { ParentDashboard } from '../../../components/dashboard/cards/parent-dashboard';
import { AdminDashboard } from '../../../components/dashboard/cards/admin-dashboard';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Định nghĩa animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export default function DashboardPage() {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Thêm state để test các role khác nhau mà không cần xác thực
  const [testMode, setTestMode] = useState(false); // Đặt thành true để test
  const [testRole, setTestRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Parent' | null>('Admin');

  useEffect(() => {
    // Trong test mode, bỏ qua kiểm tra xác thực
    if (testMode) {
      setIsLoading(false);
      return;
    }
    
    // Kiểm tra xác thực khi không ở test mode
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, router, testMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary"
        />
      </div>
    );
  }
  
  // Hiển thị dashboard dựa vào role thực tế hoặc test role
  const currentRole = testMode ? testRole : role;
  
  if (currentRole === 'Admin') {
    return (
      <>
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <AdminDashboard />
        </motion.div>
      </>
    );
  } else if (currentRole === 'Teacher') {
    return (
      <>
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <TeacherDashboard />
        </motion.div>
      </>
    );
  } else if (currentRole === 'Student') {
    return (
      <>
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <StudentDashboard />
        </motion.div>
      </>
    );
  } else if (currentRole === 'Parent') {
    return (
      <>
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <ParentDashboard />
        </motion.div>
      </>
    );
  }
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
}