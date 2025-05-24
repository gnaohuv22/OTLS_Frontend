import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { QuizQuestionType } from "./types";
import React from "react";

/**
 * Tính thời gian còn lại đến thời hạn
 */
export function getRemainingTime(dueDate: string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  
  if (diff <= 0) return "Đã hết hạn";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} ngày ${hours} giờ`;
  return `${hours} giờ`;
}

/**
 * Lấy màu dựa vào trạng thái bài tập
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-green-500";
    case "in_progress":
      return "text-blue-500";
    case "not_started":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Lấy văn bản trạng thái bài tập
 */
export function getStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "Đã hoàn thành";
    case "assigned":
      return "Đã được giao";
    case "graded":
      return "Đã chấm điểm";
    case "overdue":
      return "Đã quá hạn";
    default:
      return "Không xác định";
  }
}

/**
 * Tạo badge hiển thị trạng thái
 */
export function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Đã hoàn thành</Badge>;
    case "assigned":
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />Đã được giao</Badge>;
    case "graded":
      return <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3" />Đã chấm điểm</Badge>;
    case "overdue":
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Đã quá hạn</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
}

/**
 * Kiểm tra câu trả lời có đúng không
 */
export function isCorrectAnswer(question: QuizQuestionType, answer: string): boolean {
  if (question.type === 'multiple_choice') {
    return answer === question.correctAnswer;
  }
  return false;
}

/**
 * Tạo cấu hình TinyMCE Editor dựa trên chế độ giao diện
 */
export function getEditorConfig(isDarkMode: boolean) {
  return {
    height: 400,
    menubar: true,
    skin: isDarkMode ? 'oxide-dark' : 'oxide',
    content_css: isDarkMode ? 'dark' : 'default',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
      'anchor', 'emoticons', 'visualchars', 'codesample'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | link image media table codesample | help',
    content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px; ${isDarkMode ? 'background-color: #1e1e1e; color: #ddd;' : ''} }`,
    file_picker_types: 'file image media',
    images_upload_url: '/api/upload-image', 
    automatic_uploads: true
  };
}

/**
 * Tạo badge hiển thị trạng thái nộp bài
 */
export function getSubmissionStatusBadge(status?: string) {
  if (!status) return <Badge variant="outline">Chưa làm bài</Badge>;
  
  switch (status.toLowerCase()) {
    case "submitted":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Đã nộp bài</Badge>;
    case "graded":
      return <Badge className="gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />Đã chấm điểm</Badge>;
    case "late":
      return <Badge variant="outline" className="gap-1 bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3" />Nộp muộn</Badge>;
    case "not_submitted":
      return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />Chưa làm bài</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
} 