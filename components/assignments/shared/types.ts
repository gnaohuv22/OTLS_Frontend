export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  type: "text" | "quiz" | "file" | "mixed";
  status: "assigned" | "completed" | "graded" | "overdue";
  progress: number;
  className: string; // Class property
  createdAt: string;
  submissionStatus?: "not_submitted" | "submitted" | "graded" | "late";
  grade?: number | null; // Student's grade if graded
  maxPoints?: number; // Maximum possible points
}

export interface UploadedFile { // drop
  name: string;
  url: string;
  type: string;
}

export interface QuizQuestionBase {
  id: string;
  question: string;
  image: string;
}

export interface MultipleChoiceQuestion extends QuizQuestionBase { // keep
  type: "multiple_choice";
  options: string[];
  correctAnswer: string;
}

export type QuizQuestionType = MultipleChoiceQuestion;

export interface QuizData {
  questions: QuizQuestionType[];
}

export interface AssignmentDetail extends Assignment {
  description: string;
  textContent?: string;
  createdBy: string;
  classId: string;
  quiz: QuizData;
  essayAnswer?: string;
  timer: string | null;
  isExam: boolean;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  status: "submitted" | "graded" | "late";
  grade: number | null;
  feedback: string;
  answers: Record<string, string>;
  files?: UploadedFile[];
  textContent?: string;
}

export interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  items?: string[];
  image: string;
} 