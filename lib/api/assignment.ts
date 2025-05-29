import { api } from './client';
import { ApiResponse } from './auth';

// Types for Assignment-related data
interface ClassroomInfo {
  classroomId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isOnlineMeeting: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  userID: string;
  userName: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  avatar: string | null;
  roleName: string;
  status: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubjectInfo {
  subjectId: string;
  subjectName: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  assignmentId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  allowLateSubmissions: boolean;
  assignmentType: string;
  textContent: string;
  timer: string | null;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentDetails extends Assignment {
  classes?: ClassroomInfo[];
  user?: UserInfo;
  subject?: SubjectInfo;
  quizQuestions?: QuizQuestion[] | null;
  submissions?: Submission[] | null;
}

// Quiz assignment response type
interface QuizAssignmentResponse extends AssignmentDetails {
  classIds: string[];
}

// Submission types
interface Submission {
  submissionId: string;
  submittedAt: string;
  status: string;
  grade: number;
  feedback: string;
  answers: Record<string, string>;
  textContent: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionWithDetails extends Submission {
  assignmentId: string;
  user: UserInfo;
  uploadedFiles: any[]; // Could be expanded later if needed
}

// Adding this to match the response from get-submissions-by-userId endpoint
interface UserSubmissionsResponse {
  user: UserInfo;
  submissions: UserSubmission[];
}

// A simplified version of submission with assignmentId for the user submissions list
interface UserSubmission extends Submission {
  assignmentId: string;
}

// For get-submissions-by-assignmentId response
interface SubmissionsByAssignmentResponse extends AssignmentDetails {
  classIds: string[];
  submissions?: SubmissionWithUserInfo[]; // Override the parent submissions property
}

// Type for submission with user information in a nested property
interface SubmissionWithUserInfo extends Omit<Submission, 'user'> {
  userDTO: UserInfo;
}

interface AddSubmissionRequest {
  submittedAt: string;
  status: string;
  grade: number;
  feedback: string;
  answers: Record<string, string>;
  textContent: string;
  assignmentId: string;
  userId: string;
}

interface UpdateSubmissionRequest extends AddSubmissionRequest {
  submissionId: string;
}

// Class assignment response type
interface ClassAssignmentsResponse {
  baseClassDTO: {
    classroomId: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string | null;
    isOnlineMeeting: string;
    createdAt: string;
    updatedAt: string;
  };
  assignments: Assignment[];
}

// Quiz Question types
interface QuizQuestion {
  assignmentId: string;
  quizQuestionId: string;
  question: string;
  options: string[];
  correctOptions: number[];
  points: number;
  explanation: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateQuizQuestionRequest {
  question: string;
  options: string[];
  correctOptions: number[];
  points: number;
  explanation: string;
  assignmentId: string;
}

interface UpdateQuizQuestionRequest {
  quizQuestionId: string;
  question: string;
  options: string[];
  correctOptions: number[];
  points: number;
  explanation: string;
  assignmentId: string;
}

// Request types
interface AddAssignmentRequest {
  userId: string;
  subjectId: string;
  title: string;
  description: string;
  classIds: string[];
  dueDate: string;
  maxPoints: number;
  allowLateSubmissions: boolean;
  assignmentType: string;
  textContent: string;
  timer: string | null;
}

interface UpdateAssignmentRequest extends AddAssignmentRequest {
  assignmentId: string;
}

/**
 * Get all assignments
 * @returns Promise with all assignments
 */
export const getAllAssignments = async (): Promise<ApiResponse<AssignmentDetails[]>> => {
  try {
    const response = await api.get<ApiResponse<AssignmentDetails[]>>("/assignment/get-all-assignments");
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    throw new Error(error.message || 'Failed to fetch assignments');
  }
};

/**
 * Get assignment by ID
 * @param assignmentId - ID of the assignment to get
 * @returns Promise with assignment details
 */
export const getAssignmentById = async (assignmentId: string): Promise<ApiResponse<AssignmentDetails>> => {
  try {
    const response = await api.get<ApiResponse<AssignmentDetails>>(`/assignment/get-assignment-by-id/${assignmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assignment by ID:', error);
    throw new Error(error.message || 'Failed to fetch assignment by ID');
  }
};

/**
 * Create a new assignment
 * @param data - Assignment data to create
 * @returns Promise with created assignment
 */
export const addAssignment = async (data: AddAssignmentRequest): Promise<ApiResponse<Assignment>> => {
  try {
    const response = await api.post<ApiResponse<Assignment>>("/assignment/add-assignment", data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    throw new Error(error.message || 'Failed to create assignment');
  }
};

/**
 * Update an existing assignment
 * @param data - Assignment data to update
 * @returns Promise with updated assignment
 */
export const updateAssignment = async (data: UpdateAssignmentRequest): Promise<ApiResponse<Assignment>> => {
  try {
    const response = await api.put<ApiResponse<Assignment>>("/assignment/update-assignment", data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    throw new Error(error.message || 'Failed to update assignment');
  }
};

/**
 * Delete an assignment
 * @param assignmentId - ID of the assignment to delete
 * @returns Promise with deletion result
 */
export const deleteAssignment = async (assignmentId: string): Promise<ApiResponse<boolean>> => {
  try {
    const response = await api.delete<ApiResponse<boolean>>(`/assignment/delete-assignment/${assignmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    throw new Error(error.message || 'Failed to delete assignment');
  }
};

/**
 * Get assignments by class ID
 * @param classId - ID of the class to get assignments for
 * @returns Promise with class and its assignments
 */
export const getAssignmentsByClassId = async (classId: string): Promise<ApiResponse<ClassAssignmentsResponse>> => {
  try {
    const response = await api.get<ApiResponse<ClassAssignmentsResponse>>(`/assignment/get-assignments-by-classId/${classId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assignments by class ID:', error);
    throw new Error(error.message || 'Failed to fetch assignments by class ID');
  }
};

/**
 * Get quizzes by assignment ID
 * @param assignmentId - ID of the assignment to get quizzes for
 * @returns Promise with quiz assignment details including quiz questions
 */
export const getQuizsByAssignmentId = async (assignmentId: string): Promise<ApiResponse<QuizAssignmentResponse>> => {
  try {
    const response = await api.get<ApiResponse<QuizAssignmentResponse>>(`/assignment/get-quizs-by-assignmentId/${assignmentId}`);
    
    // Sắp xếp data theo createAt tăng dần
    if (response.data.data && Array.isArray(response.data.data)) {
      response.data.data.sort((a, b) => {
        const dateA = new Date(a.createAt).getTime();
        const dateB = new Date(b.createAt).getTime();
        return dateA - dateB; // Tăng dần
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching quizzes by assignment ID:', error);
    throw new Error(error.message || 'Failed to fetch quizzes by assignment ID');
  }
};

/**
 * Get all quiz questions
 * @returns Promise with all quiz questions
 */
export const getAllQuizQuestions = async (): Promise<ApiResponse<QuizQuestion[]>> => {
  try {
    const response = await api.get<ApiResponse<QuizQuestion[]>>("/assignment/get-all-quiz-questions");
    return response.data;
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    throw new Error(error.message || 'Failed to fetch quiz questions');
  }
};

/**
 * Create a new quiz question
 * @param data - Quiz question data to create
 * @returns Promise with created quiz question
 */
export const createQuizQuestion = async (data: CreateQuizQuestionRequest): Promise<ApiResponse<QuizQuestion>> => {
  try {
    const response = await api.post<ApiResponse<QuizQuestion>>("/assignment/create-quiz-question", data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating quiz question:', error);
    throw new Error(error.message || 'Failed to create quiz question');
  }
};

/**
 * Update an existing quiz question
 * @param data - Quiz question data to update
 * @returns Promise with updated quiz question
 */
export const updateQuizQuestion = async (data: UpdateQuizQuestionRequest): Promise<ApiResponse<QuizQuestion>> => {
  try {
    const response = await api.put<ApiResponse<QuizQuestion>>("/assignment/update-quiz-question", data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating quiz question:', error);
    throw new Error(error.message || 'Failed to update quiz question');
  }
};

/**
 * Delete a quiz question
 * @param quizQuestionId - ID of the quiz question to delete
 * @returns Promise with deletion result
 */
export const deleteQuizQuestion = async (quizQuestionId: string): Promise<ApiResponse<boolean>> => {
  try {
    const response = await api.delete<ApiResponse<boolean>>(`/assignment/delete-quiz-question/${quizQuestionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting quiz question:', error);
    throw new Error(error.message || 'Failed to delete quiz question');
  }
};

/**
 * Get all submissions
 * @returns Promise with all submissions
 */
export const getAllSubmissions = async (): Promise<ApiResponse<SubmissionWithDetails[]>> => {
  try {
    const response = await api.get<ApiResponse<SubmissionWithDetails[]>>("/assignment/get-all-submissions");
    return response.data;
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    throw new Error(error.message || 'Failed to fetch submissions');
  }
};

/**
 * Get submission by ID
 * @param submissionId - ID of the submission to get
 * @returns Promise with submission details
 */
export const getSubmissionById = async (submissionId: string): Promise<ApiResponse<SubmissionWithDetails>> => {
  try {
    const response = await api.get<ApiResponse<SubmissionWithDetails>>(`/assignment/get-submission-by-id/${submissionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching submission by ID:', error);
    throw new Error(error.message || 'Failed to fetch submission by ID');
  }
};

/**
 * Get submissions by assignment ID
 * @param assignmentId - ID of the assignment to get submissions for
 * @returns Promise with assignment details and its submissions
 */
export const getSubmissionsByAssignmentId = async (assignmentId: string): Promise<ApiResponse<SubmissionsByAssignmentResponse>> => {
  try {
    const response = await api.get<ApiResponse<SubmissionsByAssignmentResponse>>(`/assignment/get-submissions-by-assignmentId/${assignmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching submissions by assignment ID:', error);
    throw new Error(error.message || 'Failed to fetch submissions by assignment ID');
  }
};

/**
 * Get submissions by user ID
 * @param userId - ID of the user to get submissions for
 * @returns Promise with user details and their submissions
 */
export const getSubmissionsByUserId = async (userId: string): Promise<ApiResponse<UserSubmissionsResponse>> => {
  try {
    const response = await api.get<ApiResponse<UserSubmissionsResponse>>(`/assignment/get-submissions-by-userId/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching submissions by user ID:', error);
    throw new Error(error.message || 'Failed to fetch submissions by user ID');
  }
};

/**
 * Create a new submission
 * @param data - Submission data to create
 * @returns Promise with created submission
 */
export const addSubmission = async (data: AddSubmissionRequest): Promise<ApiResponse<Submission>> => {
  try {
    const response = await api.post<ApiResponse<Submission>>("/assignment/add-submission", data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating submission:', error);
    throw new Error(error.message || 'Failed to create submission');
  }
};

/**
 * Update an existing submission
 * @param data - Submission data to update
 * @returns Promise with updated submission
 */
export const updateSubmission = async (data: UpdateSubmissionRequest): Promise<ApiResponse<Submission>> => {
  try {
    const response = await api.put<ApiResponse<Submission>>("/assignment/update-submission", data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating submission:', error);
    throw new Error(error.message || 'Failed to update submission');
  }
};

/**
 * Delete a submission
 * @param submissionId - ID of the submission to delete
 * @returns Promise with deletion result
 */
export const deleteSubmission = async (submissionId: string): Promise<ApiResponse<boolean>> => {
  try {
    const response = await api.delete<ApiResponse<boolean>>(`/assignment/delete-submission/${submissionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    throw new Error(error.message || 'Failed to delete submission');
  }
};

/**
 * Assignment Service - Organized collection of assignment-related API functions
 */
export const AssignmentService = {
  // Assignment Management
  getAllAssignments,
  getAssignmentById,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByClassId,
  
  // Quiz Management
  getQuizsByAssignmentId,
  getAllQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  
  // Submission Management
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByAssignmentId,
  getSubmissionsByUserId,
  addSubmission,
  updateSubmission,
  deleteSubmission,
};

// Export types for use in components
export type {
  Assignment,
  AssignmentDetails,
  AddAssignmentRequest,
  UpdateAssignmentRequest,
  QuizQuestion,
  CreateQuizQuestionRequest,
  UpdateQuizQuestionRequest,
  Submission,
  SubmissionWithDetails,
  AddSubmissionRequest,
  UpdateSubmissionRequest,
  ClassAssignmentsResponse,
  QuizAssignmentResponse,
  SubmissionsByAssignmentResponse,
  UserSubmissionsResponse,
};


