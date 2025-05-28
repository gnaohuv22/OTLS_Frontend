"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { fadeInUp } from "@/components/assignments/shared/animation-variants";
import AssignmentHeader from "@/components/assignments/list/assignment-header";
import SearchAndFilterBar from "@/components/assignments/list/search-filter-bar";
import AssignmentSections from "@/components/assignments/list/assignment-tabs";
import { Assignment } from "@/components/assignments/shared/types";
import { getAllAssignments, getSubmissionsByUserId, getAssignmentsByClassId } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import { ClassroomService } from "@/lib/api/classes";

export default function AssignmentsList() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);

        if (role === 'Student' && user?.userID) {
          // For students, first get their classrooms
          const classrooms = await ClassroomService.getClassroomsByStudentId(user.userID);

          if (classrooms && classrooms.length > 0) {
            // Create an array to hold all assignments
            const allAssignments: Assignment[] = [];

            // For each classroom, fetch its assignments
            for (const classroom of classrooms) {
              try {
                const response = await getAssignmentsByClassId(classroom.classroomId);

                if (response.data && response.data.assignments) {
                  // Transform API response to match our Assignment type
                  const classAssignments: Assignment[] = response.data.assignments.map((item) => ({
                    id: item.assignmentId,
                    title: item.title,
                    subject: classroom.name || "N/A", // Use classroom name as subject
                    dueDate: item.dueDate,
                    type: (item.assignmentType?.toLowerCase() === "quiz" ? "quiz" : "text") as "text" | "quiz",
                    status: "assigned" as "assigned" | "completed" | "graded" | "overdue", // Default status 
                    progress: 0, // Default progress
                    className: classroom.name || "N/A",
                    createdAt: item.createdAt,
                    submissionStatus: "not_submitted", // Default submission status
                    maxPoints: item.maxPoints || 100, // Add maximum points
                  }));

                  allAssignments.push(...classAssignments);
                }
              } catch (error) {
                console.error(`Error fetching assignments for classroom ${classroom.classroomId}:`, error);
              }
            }

            setAssignments(allAssignments);

            // Fetch student's submissions to update assignment status
            fetchUserSubmissions(user.userID, allAssignments);
          } else {
            setAssignments([]);
            setIsLoading(false);
          }
        } else {
          // For teachers and other roles, use the original implementation
          const response = await getAllAssignments();

          if (response.data) {
            // Transform API response to match our Assignment type
            const transformedAssignments: Assignment[] = response.data.map((item) => ({
              id: item.assignmentId,
              title: item.title,
              subject: item.subject?.subjectName || "N/A",
              dueDate: item.dueDate,
              type: (item.assignmentType?.toLowerCase() === "quiz" ? "quiz" : "text") as "text" | "quiz",
              status: "assigned" as "assigned" | "completed" | "graded" | "overdue", // Default status 
              progress: 0, // Default progress
              className: item.classes && item.classes[0] ? item.classes[0].name : "N/A",
              createdAt: item.createdAt,
              submissionStatus: "not_submitted", // Default submission status
              maxPoints: item.maxPoints || 100, // Add maximum points
            }));

            setAssignments(transformedAssignments);

            // For students, fetch their submissions
            if (role === 'Student' && user?.userID) {
              fetchUserSubmissions(user.userID, transformedAssignments);
            }
          }
        }
      } catch (error: any) {
        if (error.response && error.response.status !== 404) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải danh sách bài tập.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [toast, role, user?.userID]);

  // Fetch user submissions and update assignments with submission status
  const fetchUserSubmissions = async (userId: string, assignmentsList: Assignment[]) => {
    try {
      const response = await getSubmissionsByUserId(userId);

      if (response.data && response.data.submissions) {
        // Create a map of assignmentId -> best submission data (highest grade)
        const submissionMap: Record<string, any> = {};

        response.data.submissions.forEach((submission: any) => {
          const assignmentId = submission.assignmentId;

          // If no existing submission for this assignment or current submission has higher grade
          if (!submissionMap[assignmentId] || submission.grade > submissionMap[assignmentId].grade) {
            submissionMap[assignmentId] = {
              status: submission.status,
              grade: submission.grade,
              submissionId: submission.submissionId,
              submittedAt: submission.submittedAt
            };
          }
        });

        setUserSubmissions(submissionMap);

        // Update assignments with submission status and grades
        const updatedAssignments = assignmentsList.map(assignment => {
          // If the assignment has a submission, update its status accordingly
          if (submissionMap[assignment.id]) {
            const submissionData = submissionMap[assignment.id];
            const submissionStatus = submissionData.status.toLowerCase();

            // Determine the assignment status based on submission status
            let assignmentStatus: "assigned" | "completed" | "graded" | "overdue";
            let typedSubmissionStatus: "submitted" | "graded" | "late";

            if (submissionStatus === 'graded') {
              assignmentStatus = 'graded';
              typedSubmissionStatus = 'graded';
            } else if (submissionStatus === 'submitted') {
              assignmentStatus = 'completed';
              typedSubmissionStatus = 'submitted';
            } else if (submissionStatus === 'late') {
              assignmentStatus = 'completed';
              typedSubmissionStatus = 'late';
            } else {
              // Default to 'assigned' for any other submission status
              assignmentStatus = 'assigned';
              typedSubmissionStatus = 'submitted'; // Default to submitted if unknown
            }

            return {
              ...assignment,
              submissionStatus: typedSubmissionStatus,
              status: assignmentStatus,
              grade: submissionData.grade,
            };
          }

          // If no submission, check if assignment is overdue
          const now = new Date();
          const dueDate = new Date(assignment.dueDate);
          if (now > dueDate) {
            return {
              ...assignment,
              status: 'overdue' as const,
              submissionStatus: 'not_submitted' as const
            };
          }

          // Otherwise, it's an assigned assignment with no submission
          return {
            ...assignment,
            status: 'assigned' as const,
            submissionStatus: 'not_submitted' as const
          };
        });

        setAssignments(updatedAssignments);
      }
    } catch (error) {
      console.error("Error fetching user submissions:", error);
    }
  };

  // Lọc bài tập dựa trên search và filter
  const filteredAssignments = assignments.filter(assignment => {
    // Lọc theo search
    if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Lọc theo môn học
    if (filterSubject && assignment.subject !== filterSubject) {
      return false;
    }

    return true;
  });

  // Danh sách các môn học duy nhất để filter
  const subjects = Array.from(new Set(assignments.map(a => a.subject)));

  return (
    <AuthGuard>
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="container mx-auto px-4 py-6 space-y-6"
      >
        <AssignmentHeader role={role} />

        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterSubject={filterSubject}
          onFilterChange={setFilterSubject}
          subjects={subjects}
        />

        <AssignmentSections
          filteredAssignments={filteredAssignments}
          searchTerm={searchTerm}
          role={role}
          isLoading={isLoading}
        />
      </motion.div>
    </AuthGuard>
  );
} 