'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SubjectDTO, SubjectService } from '@/lib/api/resource';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';
import {
  SubjectSearchBar,
  AddSubjectDialog,
  EditSubjectDialog,
  DeleteSubjectDialog,
  SubjectsTable
} from '@/components/admin/subjects';

// Animation variants for motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function SubjectsManagementPage() {
  const { role: contextRole } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDTO | null>(null);
  const [cookieRole, setCookieRole] = useState<string | null>(null);

  // Get the role from both context and cookie
  useEffect(() => {
    // Check role cookie directly
    const roleCookie = Cookies.get('role');
    setCookieRole(roleCookie || null);

    // Debug logging
    console.log('Role from context:', contextRole);
    console.log('Role from cookie:', roleCookie);
  }, [contextRole]);

  // Determine effective role (use context role, fallback to cookie role)
  const effectiveRole = contextRole || cookieRole;

  // Debug log for role
  useEffect(() => {
    console.log('Effective role in subject management page:', effectiveRole);
  }, [effectiveRole]);

  // Fetch all subjects
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSubjects = await SubjectService.getAllSubjects();
      setSubjects(fetchedSubjects);
    } catch (error: any) {
      if (error.status === 404) {
        setSubjects([]);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học. Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Open edit dialog
  const handleEditClick = (subject: SubjectDTO) => {
    setSelectedSubject(subject);
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (subject: SubjectDTO) => {
    setSelectedSubject(subject);
    setDeleteDialogOpen(true);
  };

  if (effectiveRole !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quyền truy cập bị từ chối</h1>
          <p className="text-muted-foreground">Bạn không có quyền truy cập vào trang này.</p>
          <p className="text-sm text-muted-foreground mt-4">
            Role from context: {contextRole || 'None'}<br />
            Role from cookie: {cookieRole || 'None'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUp}
      className="container py-6 space-y-6"
    >

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý môn học</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa các môn học trong hệ thống</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Search Bar Component */}
          <SubjectSearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {/* Add Dialog Component */}
          <AddSubjectDialog onSubjectAdded={fetchSubjects} />
        </div>
      </div>

      {/* Subjects Table Component */}
      <SubjectsTable
        subjects={subjects}
        loading={loading}
        searchQuery={searchQuery}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Edit Subject Dialog */}
      <EditSubjectDialog
        subject={selectedSubject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubjectUpdated={fetchSubjects}
      />

      {/* Delete Subject Confirmation */}
      <DeleteSubjectDialog
        subject={selectedSubject}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSubjectDeleted={fetchSubjects}
      />
    </motion.div>
  );
} 