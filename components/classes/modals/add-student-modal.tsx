import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash, Search, Loader2, UserRound, Info } from 'lucide-react';
import { AddStudentModalProps } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { ClassroomService } from '@/lib/api/classes';
import { UserService, UserInformation } from '@/lib/api/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DebounceInput } from '@/components/ui/debounce-input';

export function AddStudentModal({
  isOpen,
  setIsOpen,
  newStudentEmail,
  setNewStudentEmail,
  studentsToAdd,
  setStudentsToAdd,
  addStudentEmail,
  removeStudentEmail,
  handleInviteStudents,
  classroomId
}: AddStudentModalProps & { classroomId: string }) {
  const { toast } = useToast();
  const [allStudents, setAllStudents] = useState<UserInformation[]>([]);
  const [searchResults, setSearchResults] = useState<UserInformation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Array<{id: string, name: string}>>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch currently enrolled students to filter them out
  const fetchEnrolledStudents = useCallback(async () => {
    try {
      if (!classroomId) return;
      
      const students = await ClassroomService.getStudentsByClassroomId(classroomId);
      if (Array.isArray(students)) {
        const studentIds = students.map(student => student.studentId);
        setEnrolledStudentIds(studentIds);
      } else {
        setEnrolledStudentIds([]);
      }
    } catch (error: any) {
      console.error('Error fetching enrolled students:', error);
      // On error, initialize with empty array to prevent app crashes
      setEnrolledStudentIds([]);
    }
  }, [classroomId]);

  // Fetch all student users from the API
  const fetchStudentUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await UserService.getAllUsers();
      // Filter users with Student role
      const studentUsers = users.filter(user => user.roleName === 'Student');
      setAllStudents(studentUsers);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể lấy danh sách học sinh',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch all users with Student role when modal opens
  useEffect(() => {
    let isMounted = true;
    
    if (isOpen && isMounted) {
      fetchStudentUsers();
      fetchEnrolledStudents();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchStudentUsers, fetchEnrolledStudents]);

  // Search students based on query
  const searchStudents = useCallback((query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const filteredResults = allStudents.filter(student => 
        // Filter by search term
        (student.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        student.userName.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase())) &&
        // Filter out already enrolled students
        !enrolledStudentIds.includes(student.userID)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setIsSearching(false);
    }
  }, [allStudents, enrolledStudentIds]);

  // Handle search input change with continuous update
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewStudentEmail(value);
    setSearchQuery(value);
    
    // Only search when there are at least 3 characters
    if (value.length >= 3) {
      searchStudents(value);
    } else {
      setSearchResults([]);
    }
  }, [searchStudents, setNewStudentEmail]);

  // Handle immediate input change (for display purposes)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e);
  }, [handleSearchChange]);

  // Add student to selected list
  const handleSelectStudent = useCallback((student: UserInformation) => {
    // Check if student is already in the selected list
    setSelectedStudents(prev => {
      if (prev.some(s => s.id === student.userID)) {
        return prev;
      }
      return [...prev, { 
        id: student.userID, 
        name: student.fullName || student.userName 
      }];
    });
    
    setNewStudentEmail('');
    setSearchQuery('');
    setSearchResults([]);
  }, [setNewStudentEmail]);

  // Remove student from selected list
  const handleRemoveStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev => prev.filter(student => student.id !== studentId));
  }, []);

  // Get available students for quick selection (not already enrolled)
  const availableStudents = useMemo(() => {
    return allStudents.filter(student => !enrolledStudentIds.includes(student.userID));
  }, [allStudents, enrolledStudentIds]);

  // Format current date as ISO string (always set to start of day to avoid timezone issues)
  const getCurrentDateISOString = useCallback(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, []);

  // Dialog open change handler
  const handleOpenChange = useCallback((open: boolean) => {
    if (!isEnrolling) {
      setIsOpen(open);
      
      // Reset state when dialog closes
      if (!open) {
        setSearchQuery('');
        setSearchResults([]);
        setNewStudentEmail('');
      }
    }
  }, [isEnrolling, setIsOpen, setNewStudentEmail]);

  // Enroll selected students
  const handleEnrollStudents = useCallback(async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất một học sinh để thêm vào lớp',
        variant: 'destructive'
      });
      return;
    }

    setIsEnrolling(true);

    try {
      const currentDate = getCurrentDateISOString();
      
      // Create a list of promises to enroll each student
      const enrollPromises = selectedStudents.map(student => 
        ClassroomService.enrollStudent({
          classroomId: classroomId,
          studentId: student.id,
          joinedAt: currentDate // Ensure joinedAt is not null
        })
      );

      // Wait for all promises to complete
      await Promise.all(enrollPromises);

      toast({
        title: 'Thành công',
        description: `Đã thêm ${selectedStudents.length} học sinh vào lớp học`,
      });

      // Close modal and reset data
      setSelectedStudents([]);
      handleOpenChange(false);

      // Navigate to the students tab instead of reloading
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'students');
        window.location.href = url.toString();
      }, 100);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể thêm học sinh vào lớp học',
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [selectedStudents, classroomId, getCurrentDateISOString, toast, handleOpenChange]);

  // Get count of available students (not already enrolled)
  const availableStudentsCount = availableStudents.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm học sinh vào lớp</DialogTitle>
          <DialogDescription>
            Tìm kiếm và thêm học sinh vào lớp bằng tên hoặc username.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Đang tải danh sách học sinh...</span>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {availableStudentsCount === 0 && (
              <div className="flex items-center p-3 text-sm rounded border border-yellow-200 bg-yellow-50 text-yellow-800">
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>Tất cả học sinh trong hệ thống đã được thêm vào lớp học này.</p>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input 
                placeholder="Tìm kiếm học sinh (nhập ít nhất 3 ký tự)..." 
                value={newStudentEmail}
                onChange={handleInputChange}
                className="pl-8"
                disabled={availableStudentsCount === 0}
              />
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Nhập thêm {3 - searchQuery.length} ký tự để bắt đầu tìm kiếm
                </div>
              )}
            </div>

            {isSearching && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Đang tìm kiếm...</span>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="border rounded p-2 space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.map((student) => (
                  <div 
                    key={student.userID} 
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar || undefined} alt={student.fullName || student.userName} />
                        <AvatarFallback className="bg-primary/10">
                          {student.fullName ? student.fullName.charAt(0) : student.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.fullName || student.userName}</span>
                        <span className="text-xs text-muted-foreground">{student.userName} | {student.email}</span>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                    >
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.length === 0 && searchQuery.trim() !== '' && !isSearching && searchQuery.length >= 3 && (
              <div className="flex flex-col items-center justify-center p-4 text-center border rounded">
                <UserRound className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Không tìm thấy học sinh phù hợp</p>
              </div>
            )}
            
            {selectedStudents.length > 0 && (
              <div className="border rounded p-2 space-y-2">
                <Label>Danh sách học sinh sẽ được thêm vào lớp ({selectedStudents.length}):</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {selectedStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate mr-2">{student.name}</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            className="w-full sm:w-auto"
            disabled={isEnrolling}
          >
            Hủy
          </Button>
          <Button 
            type="button" 
            onClick={handleEnrollStudents} 
            className="w-full sm:w-auto"
            disabled={isEnrolling || selectedStudents.length === 0 || isLoading || availableStudentsCount === 0}
          >
            {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Thêm vào lớp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 