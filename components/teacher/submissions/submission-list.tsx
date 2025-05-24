"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, 
  Eye, 
  MoreVertical, 
  Check, 
  Trash, 
  RefreshCw, 
  Clock, 
  XCircle, 
  Search, 
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Filter
} from "lucide-react";
import { getSubmissionsByAssignmentId, deleteSubmission, getAssignmentById } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to format a date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper function to calculate time difference
const getTimeElapsed = (submittedAt: string, dueDate: string) => {
  const submittedDate = new Date(submittedAt);
  const dueDateObj = new Date(dueDate);
  
  // If submitted before due date, return "Đúng hạn"
  if (submittedDate <= dueDateObj) {
    return { text: "Đúng hạn", isLate: false };
  }
  
  // Calculate difference
  const diffMs = submittedDate.getTime() - dueDateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return { text: `Nộp muộn ${diffDays} ngày`, isLate: true };
  } else if (diffHours > 0) {
    return { text: `Nộp muộn ${diffHours} giờ`, isLate: true };
  } else {
    return { text: `Nộp muộn ${diffMins} phút`, isLate: true };
  }
};

// Sort types
type SortKey = 'fullName' | 'submittedAt' | 'status' | 'timeStatus' | 'grade';
type SortDirection = 'asc' | 'desc';

interface SubmissionRecord {
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
  userDTO: {
    userID: string;
    userName: string;
    fullName: string;
    email: string;
    avatar: string | null;
    roleName: string;
  };
}

interface SubmissionListProps {
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: string;
}

export function SubmissionList({ 
  assignmentId, 
  assignmentTitle,
  assignmentType
}: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const { toast } = useToast();
  
  // Sorting and filtering state
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch assignment details
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await getAssignmentById(assignmentId);
        if (response.data) {
          setAssignment(response.data);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };
    
    fetchAssignment();
  }, [assignmentId]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSubmissionsByAssignmentId(assignmentId);
      
      if (response.data && response.data.submissions) {
        setSubmissions(response.data.submissions);
      } else {
        setSubmissions([]);
      }
    } catch (error: any) {
      if (error.status === 404) {
        setSubmissions([]);
      } else {
        toast({
          variant: "destructive",
        title: "Lỗi",
          description: "Không thể tải danh sách bài nộp. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, toast]);

  // Fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle deletion of a submission to allow retake
  const handleDeleteSubmission = async (submissionId: string, studentName: string) => {
    try {
      setIsDeleting(submissionId);
      const response = await deleteSubmission(submissionId);
      
      if (response.data === true) {
        // Remove from state
        setSubmissions(prev => prev.filter(sub => sub.submissionId !== submissionId));
        
        toast({
          title: "Đã cho phép làm lại",
          description: `Học sinh ${studentName} đã được phép làm lại bài tập.`,
        });
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cho phép làm lại. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <Badge variant="outline">Đã nộp</Badge>;
      case 'graded':
        return <Badge variant="secondary">Đã chấm</Badge>;
      case 'stopped with caution':
        return <Badge variant="destructive">Nộp bắt buộc</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Nộp muộn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Check if assignment is an exam
  const isExam = assignment?.timer && assignment.timer !== "0";
  
  // Handle sort toggle
  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if already sorting by this key
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to ascending
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
      : <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />;
  };
  
  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    // First filter by search query and status
    let result = [...submissions];
    
    // Filter by student name if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(sub => 
        sub.userDTO.fullName.toLowerCase().includes(query) || 
        sub.userDTO.userName.toLowerCase().includes(query)
      );
    }
    
    // Filter by status if not showing all
    if (statusFilter !== 'all') {
      result = result.filter(sub => sub.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Then sort
    return result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortKey) {
        case 'fullName':
          valueA = a.userDTO.fullName.toLowerCase();
          valueB = b.userDTO.fullName.toLowerCase();
          break;
        case 'submittedAt':
          valueA = new Date(a.submittedAt).getTime();
          valueB = new Date(b.submittedAt).getTime();
          break;
        case 'status':
          valueA = a.status.toLowerCase();
          valueB = b.status.toLowerCase();
          break;
        case 'timeStatus': // Sort by on-time vs late
          const timeA = assignment?.dueDate 
            ? getTimeElapsed(a.submittedAt, assignment.dueDate).isLate
            : false;
          const timeB = assignment?.dueDate 
            ? getTimeElapsed(b.submittedAt, assignment.dueDate).isLate
            : false;
          return sortDirection === 'asc'
            ? Number(timeA) - Number(timeB)
            : Number(timeB) - Number(timeA);
        case 'grade':
          valueA = a.grade;
          valueB = b.grade;
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [submissions, sortKey, sortDirection, searchQuery, statusFilter, assignment?.dueDate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>Danh sách bài nộp</CardTitle>
              {isExam && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Clock className="mr-1 h-3 w-3" /> Bài kiểm tra
                </Badge>
              )}
            </div>
            <CardDescription>
              {assignmentTitle} - {submissions.length} bài nộp
            </CardDescription>
          </div>
          
          <div className="flex gap-2 flex-col md:flex-row items-end md:items-center">
            <div className="relative w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên học sinh"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="submitted">Đã nộp</SelectItem>
                <SelectItem value="graded">Đã chấm</SelectItem>
                <SelectItem value="stopped with caution">Nộp bắt buộc</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSubmissions}
              title="Làm mới"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAndSortedSubmissions.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? "Không tìm thấy bài nộp nào khớp với bộ lọc" 
              : "Chưa có học sinh nộp bài"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSortToggle('fullName')}>
                    <div className="flex items-center">
                      Học sinh
                      {getSortIcon('fullName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortToggle('submittedAt')}>
                    <div className="flex items-center">
                      Thời gian nộp
                      {getSortIcon('submittedAt')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortToggle('status')}>
                    <div className="flex items-center">
                      Trạng thái
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortToggle('timeStatus')}>
                    <div className="flex items-center">
                      Đúng hạn
                      {getSortIcon('timeStatus')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSortToggle('grade')}>
                    <div className="flex items-center">
                      Điểm
                      {getSortIcon('grade')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSubmissions.map((submission) => {
                  const { text: timeStatus, isLate } = assignment?.dueDate 
                    ? getTimeElapsed(submission.submittedAt, assignment.dueDate) 
                    : { text: "N/A", isLate: false };
                  
                  return (
                    <TableRow key={submission.submissionId}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{submission.userDTO.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {submission.userDTO.userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(submission.submittedAt)}</span>
                          {submission.status.toLowerCase() === 'stopped with caution' && (
                            <span className="text-xs text-red-500 flex items-center mt-1">
                              <XCircle className="h-3 w-3 mr-1" /> Nộp bắt buộc
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-sm",
                          isLate ? "text-red-600" : "text-green-600"
                        )}>
                          {timeStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {assignmentType.toLowerCase() === 'quiz' || submission.status.toLowerCase() === 'graded' 
                              ? submission.grade.toFixed(1) 
                              : '–'}
                          </span>
                          {assignmentType.toLowerCase() === 'quiz' && (
                            <span className="text-xs text-muted-foreground">
                              Tự động chấm
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isDeleting === submission.submissionId ? (
                          <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/assignments/${assignmentId}/submissions/${submission.submissionId}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </Link>
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => handleDeleteSubmission(
                                  submission.submissionId, 
                                  submission.userDTO.fullName
                                )}
                                className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Cho phép làm lại
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 