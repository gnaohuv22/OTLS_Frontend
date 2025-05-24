import { useSession } from 'next-auth/react';

export const useRole = () => {
  const { data: session } = useSession();
  
  return {
    isTeacher: session?.user?.role === 'Teacher',
    isStudent: session?.user?.role === 'Student',
    isParent: session?.user?.role === 'Parent',
    isAdmin: session?.user?.role === 'Admin',
    role: session?.user?.role,
    user: session?.user
  };
}; 