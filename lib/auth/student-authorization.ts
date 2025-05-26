import { ClassroomService } from '@/lib/api/classes';
import { getAssignmentById } from '@/lib/api/assignment';

/**
 * Student authorization utilities for checking enrollment-based access
 */
export class StudentAuthorization {
  /**
   * Check if a student is enrolled in a specific class
   * @param studentId - The student's user ID
   * @param classId - The class ID to check enrollment for
   * @returns Promise<boolean> - true if enrolled, false otherwise
   */
  static async isStudentEnrolledInClass(studentId: string, classId: string): Promise<boolean> {
    try {
      // Get all classrooms the student is enrolled in
      const studentClassrooms = await ClassroomService.getClassroomsByStudentId(studentId);
      
      // Check if the specific class is in the student's enrolled classes
      return studentClassrooms.some(classroom => classroom.classroomId === classId);
    } catch (error) {
      console.error('Error checking student enrollment:', error);
      return false;
    }
  }

  /**
   * Check if a student can access a specific assignment
   * @param studentId - The student's user ID
   * @param assignmentId - The assignment ID to check access for
   * @returns Promise<boolean> - true if can access, false otherwise
   */
  static async canStudentAccessAssignment(studentId: string, assignmentId: string): Promise<boolean> {
    try {
      // Get assignment details to find which class it belongs to
      const assignmentResponse = await getAssignmentById(assignmentId);
      
      if (!assignmentResponse.data || !assignmentResponse.data.classes || assignmentResponse.data.classes.length === 0) {
        return false;
      }

      // Get the class ID from the assignment
      const classId = assignmentResponse.data.classes[0].classroomId;
      
      // Check if student is enrolled in that class
      return await this.isStudentEnrolledInClass(studentId, classId);
    } catch (error) {
      console.error('Error checking assignment access:', error);
      return false;
    }
  }

  /**
   * Check if a student can access materials from a specific class
   * @param studentId - The student's user ID
   * @param classId - The class ID to check material access for
   * @returns Promise<boolean> - true if can access, false otherwise
   */
  static async canStudentAccessClassMaterials(studentId: string, classId: string): Promise<boolean> {
    // For class materials, just check if student is enrolled in the class
    return await this.isStudentEnrolledInClass(studentId, classId);
  }

  /**
   * Get all class IDs that a student is enrolled in
   * @param studentId - The student's user ID
   * @returns Promise<string[]> - Array of class IDs the student is enrolled in
   */
  static async getStudentEnrolledClassIds(studentId: string): Promise<string[]> {
    try {
      const studentClassrooms = await ClassroomService.getClassroomsByStudentId(studentId);
      return studentClassrooms.map(classroom => classroom.classroomId);
    } catch (error) {
      console.error('Error getting student enrolled classes:', error);
      return [];
    }
  }

  /**
   * Validate student access and redirect if unauthorized
   * @param studentId - The student's user ID
   * @param resourceType - Type of resource ('class' | 'assignment' | 'material')
   * @param resourceId - ID of the resource to check
   * @param classId - Optional class ID for materials
   * @returns Promise<{ authorized: boolean, redirectUrl?: string }>
   */
  static async validateStudentAccess(
    studentId: string, 
    resourceType: 'class' | 'assignment' | 'material',
    resourceId: string,
    classId?: string
  ): Promise<{ authorized: boolean, redirectUrl?: string }> {
    try {
      let authorized = false;

      switch (resourceType) {
        case 'class':
          authorized = await this.isStudentEnrolledInClass(studentId, resourceId);
          break;
        case 'assignment':
          authorized = await this.canStudentAccessAssignment(studentId, resourceId);
          break;
        case 'material':
          if (classId) {
            authorized = await this.canStudentAccessClassMaterials(studentId, classId);
          }
          break;
      }

      if (!authorized) {
        return {
          authorized: false,
          redirectUrl: '/forbidden?reason=not_enrolled&resource=' + resourceType
        };
      }

      return { authorized: true };
    } catch (error) {
      console.error('Error validating student access:', error);
      return {
        authorized: false,
        redirectUrl: '/forbidden?reason=error&resource=' + resourceType
      };
    }
  }
} 