import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { FormControl } from '@/components/ui/form-control';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DebounceInput } from '@/components/ui/debounce-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, HelpCircle } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface CommonFieldsProps {
  title: string;
  onTitleChange: (value: string) => void;
  titleError?: string;
  
  description: string;
  onDescriptionChange: (value: string) => void;
  
  subject: string;
  onSubjectChange: (value: string) => void;
  
  classIds: string[];  // Thay đổi để hỗ trợ nhiều lớp
  onClassIdsChange: (value: string[]) => void;
  
  dueDate: string;
  onDueDateChange: (value: string) => void;
  
  maxPoints: string;
  onMaxPointsChange: (value: string) => void;
  
  allowLateSubmissions: boolean;
  onAllowLateSubmissionsChange: (checked: boolean) => void;
  
  timer: string | null;
  onTimerChange: (value: string | null) => void;
  
  remainingTime: string;
  classes: Array<{ id: string; name: string; }>;
  isLoadingClasses?: boolean;
  subjects?: Array<{ subjectId: string; subjectName: string; }>;
}

// Function để chuyển đổi tiếng Việt có dấu sang không dấu
function removeVietnameseAccents(str: string) {
  if (!str) return '';
  return str.normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '')
           .replace(/đ/g, 'd').replace(/Đ/g, 'D')
           .toLowerCase();
}

/**
 * Component hiển thị các trường dữ liệu chung cho form tạo bài tập
 * với khả năng debounce để tránh re-render không cần thiết
 */
export const CommonFields = memo(function CommonFields({
  title,
  onTitleChange,
  titleError,
  
  description,
  onDescriptionChange,
  
  subject,
  onSubjectChange,
  
  classIds,
  onClassIdsChange,
  
  dueDate,
  onDueDateChange,
  
  maxPoints,
  onMaxPointsChange,
  
  allowLateSubmissions,
  onAllowLateSubmissionsChange,
  
  timer,
  onTimerChange,
  
  remainingTime,
  classes,
  isLoadingClasses = false,
  subjects = []
}: CommonFieldsProps) {
  const [open, setOpen] = useState(false); // Trạng thái đóng/mở dropdown
  const [searchTerm, setSearchTerm] = useState(''); // State để lưu từ khóa tìm kiếm
  
  // State for timer minutes and seconds
  const [timerMinutes, setTimerMinutes] = useState<string>('0');
  const [timerSeconds, setTimerSeconds] = useState<string>('0');
  const [maxPointsError, setMaxPointsError] = useState<string>('');
  const [timerError, setTimerError] = useState<string>('');
  
  // Initialize timer minutes and seconds from timer prop (seconds)
  useEffect(() => {
    if (timer) {
      const totalSeconds = parseInt(timer, 10);
      if (!isNaN(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimerMinutes(minutes.toString());
        setTimerSeconds(seconds.toString());
      } else {
        setTimerMinutes('0');
        setTimerSeconds('0');
      }
    } else {
      setTimerMinutes('0');
      setTimerSeconds('0');
    }
  }, [timer]);
  
  // Add debug log to track title value and re-renders
  useEffect(() => {
    console.log('CommonFields re-render, title value:', title);
  }, [title]);

  // Debug callback for title changes with explicit logging
  const handleTitleChange = useCallback((value: string) => {
    console.log('Title changed to:', value);
    onTitleChange(value);
  }, [onTitleChange]);

  // Debug callback for max points with validation
  const handleMaxPointsChange = useCallback((value: string) => {
    console.log('Max points changed to:', value);
    
    // Real-time validation
    const points = parseInt(value, 10);
    if (isNaN(points)) {
      setMaxPointsError('Điểm phải là số');
    } else if (points < 0) {
      setMaxPointsError('Điểm không thể âm');
    } else if (points > 10) {
      setMaxPointsError('Điểm tối đa là 10');
      // Automatically set to 10 if exceeds
      onMaxPointsChange('10');
      return;
    } else {
      setMaxPointsError('');
    }
    
    onMaxPointsChange(value);
  }, [onMaxPointsChange]);

  // Handle timer changes
  const updateTimer = useCallback(() => {
    const minutes = parseInt(timerMinutes, 10) || 0;
    const seconds = parseInt(timerSeconds, 10) || 0;
    
    // Calculate total seconds
    const totalSeconds = (minutes * 60) + seconds;
    
    // Convert to string or null if zero
    const timerValue = totalSeconds > 0 ? totalSeconds.toString() : null;
    onTimerChange(timerValue);
  }, [timerMinutes, timerSeconds, onTimerChange]);
  
  // Handle minutes change with validation
  const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const minutes = parseInt(value, 10);
    
    // Real-time validation
    if (value === '') {
      setTimerMinutes('0');
      setTimerError('');
    } else if (isNaN(minutes)) {
      setTimerError('Phút phải là số');
      return;
    } else if (minutes < 0) {
      setTimerError('Phút không thể âm');
      return;
    } else if (minutes > 300) {
      setTimerError('Thời gian tối đa là 300 phút');
      setTimerMinutes('300');
    } else {
      setTimerMinutes(minutes.toString());
      setTimerError('');
    }
    
    // Removed automatic updateTimer call here to prevent infinite loop
  }, [setTimerMinutes]);
  
  // Handle seconds change with validation
  const handleSecondsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const seconds = parseInt(value, 10);
    
    // Real-time validation
    if (value === '') {
      setTimerSeconds('0');
      setTimerError('');
    } else if (isNaN(seconds)) {
      setTimerError('Giây phải là số');
      return;
    } else if (seconds < 0) {
      setTimerError('Giây không thể âm');
      return;
    } else if (seconds > 59) {
      setTimerError('Giây tối đa là 59');
      setTimerSeconds('59');
    } else {
      setTimerSeconds(seconds.toString());
      setTimerError('');
    }
    
    // Removed automatic updateTimer call here to prevent infinite loop
  }, [setTimerSeconds]);
  
  // Use a more controlled approach for timer updates with a delayed effect
  useEffect(() => {
    // Use a debounce technique to prevent too many updates
    const timeoutId = setTimeout(() => {
      const minutes = parseInt(timerMinutes, 10) || 0;
      const seconds = parseInt(timerSeconds, 10) || 0;
      
      // Calculate total seconds
      const totalSeconds = (minutes * 60) + seconds;
      
      // Convert to string or null if zero
      const timerValue = totalSeconds > 0 ? totalSeconds.toString() : null;
      onTimerChange(timerValue);
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [timerMinutes, timerSeconds, onTimerChange]);

  // Tạo hiển thị lớp được chọn
  const selectedClassesDisplay = useMemo(() => {
    if (classIds.length === 0) return "Chọn lớp học";
    
    const selectedClasses = classes.filter(cls => classIds.includes(cls.id))
      .map(cls => cls.name);
    
    if (selectedClasses.length === 1) {
      return selectedClasses[0];
    } else if (selectedClasses.length === 2) {
      return `${selectedClasses[0]} và ${selectedClasses[1]}`;
    } else {
      return `${selectedClasses[0]}, ${selectedClasses[1]} và +${selectedClasses.length - 2} lớp khác`;
    }
  }, [classIds, classes]);

  // Lọc danh sách lớp học dựa trên từ khóa tìm kiếm
  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classes;
    
    const normalizedSearch = removeVietnameseAccents(searchTerm);
    
    return classes.filter(cls => {
      const normalizedClassName = removeVietnameseAccents(cls.name);
      return normalizedClassName.includes(normalizedSearch);
    });
  }, [classes, searchTerm]);

  // Xử lý khi chọn/bỏ chọn một lớp
  const toggleClass = useCallback((classId: string) => {
    if (!onClassIdsChange || typeof onClassIdsChange !== 'function') {
      console.error('onClassIdsChange is not a valid function');
      return;
    }
    
    if (classIds.includes(classId)) {
      // Nếu đã chọn, bỏ chọn lớp này
      onClassIdsChange(classIds.filter(id => id !== classId));
    } else {
      // Nếu chưa chọn, thêm lớp này vào
      onClassIdsChange([...classIds, classId]);
    }
  }, [classIds, onClassIdsChange]);

  // Xử lý thay đổi subject với debounce
  const handleSubjectChange = useCallback((value: string) => {
    onSubjectChange(value);
  }, [onSubjectChange]);
  
  // Handle description changes
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);
  
  // Determine if assignment is in exam mode
  const isExamMode = useMemo(() => {
    const minutes = parseInt(timerMinutes, 10) || 0;
    const seconds = parseInt(timerSeconds, 10) || 0;
    return minutes > 0 || seconds > 0;
  }, [timerMinutes, timerSeconds]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Tiêu đề <span className="text-destructive">*</span>
        </Label>
        <DebounceInput
          id="title"
          value={title}
          onValueChange={handleTitleChange}
          placeholder="Nhập tiêu đề bài tập"
          debounceDelay={500}
          className={cn(
            titleError && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={!!titleError}
        />
        {titleError && (
          <p className="text-sm text-destructive">{titleError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-medium">
          Môn học <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={subject} 
          onValueChange={handleSubjectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn môn học" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.subjectId} value={subject.subjectId}>
                {subject.subjectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Mô tả bài tập
        </Label>
        <Textarea
          id="description"
          placeholder="Nhập mô tả ngắn về bài tập (không bắt buộc)"
          className="min-h-[80px] resize-y"
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="class" className="text-sm font-medium">
          Lớp học <span className="text-destructive">*</span>
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
              onClick={() => setOpen(!open)}
            >
              {selectedClassesDisplay}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Tìm kiếm lớp học..." 
                onValueChange={setSearchTerm}
                value={searchTerm}
                autoFocus 
              />
              {isLoadingClasses ? (
                <div className="py-6 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Đang tải danh sách lớp học...</p>
                </div>
              ) : (
                <>
                  <CommandEmpty>Không tìm thấy lớp phù hợp.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <ScrollArea className="h-60">
                      {filteredClasses.map((cls) => (
                        <CommandItem
                          key={cls.id}
                          value={cls.id}
                          onSelect={() => toggleClass(cls.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Checkbox 
                              checked={classIds.includes(cls.id)} 
                              onCheckedChange={() => {
                                toggleClass(cls.id);
                              }}
                              id={`class-${cls.id}`}
                              className="data-[state=checked]:bg-primary"
                              disabled={false}
                            />
                            <span className="flex-1">
                              {cls.name}
                            </span>
                            {classIds.includes(cls.id) && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </>
              )}
              <div className="p-2 border-t">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
        {classIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {classes
              .filter(cls => classIds.includes(cls.id))
              .map(cls => (
                <Badge 
                  key={cls.id} 
                  variant="secondary"
                  className="rounded-full py-0"
                >
                  {cls.name}
                </Badge>
              ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate" className="text-sm font-medium">
          Hạn nộp bài <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-col gap-2">
          <DebounceInput
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onValueChange={onDueDateChange}
            className="w-full"
            required
          />
          {remainingTime && (
            <Alert className="py-2">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs">
                  {remainingTime}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPoints" className="text-sm font-medium">
          Điểm tối đa
        </Label>
        <Input
          id="maxPoints"
          type="number"
          min="0"
          max="10"
          value={maxPoints}
          onChange={(e) => handleMaxPointsChange(e.target.value)}
          className={cn(
            maxPointsError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {maxPointsError && (
          <p className="text-sm text-destructive">{maxPointsError}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="timer" className="text-sm font-medium">
            Thời gian làm bài
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] p-4">
                <p>Đặt thời gian làm bài với phút và giây.</p>
                <p className="mt-2">Nếu để thời gian là 0, bài tập sẽ ở chế độ luyện tập, học sinh có thể làm nhiều lần.</p>
                <p className="mt-2">Nếu đặt thời gian (giây hoặc phút &gt; 0), bài tập sẽ chuyển thành bài kiểm tra với tính năng chống gian lận, học sinh chỉ được làm một lần duy nhất.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="timerMinutes" className="text-xs">Phút (tối đa 300)</Label>
            <Input
              id="timerMinutes"
              type="number"
              min="0"
              max="300"
              value={timerMinutes}
              onChange={handleMinutesChange}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="timerSeconds" className="text-xs">Giây (tối đa 59)</Label>
            <Input
              id="timerSeconds"
              type="number"
              min="0"
              max="59"
              value={timerSeconds}
              onChange={handleSecondsChange}
              className="w-full"
            />
          </div>
        </div>
        {timerError && (
          <p className="text-sm text-destructive">{timerError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {!isExamMode
            ? 'Chế độ luyện tập (không giới hạn thời gian)' 
            : 'Chế độ kiểm tra (có giới hạn thời gian)'}
        </p>
      </div>

      <div className="flex items-center space-x-2 pt-6">
        <Checkbox
          id="allowLate"
          checked={allowLateSubmissions}
          onCheckedChange={onAllowLateSubmissionsChange}
        />
        <Label htmlFor="allowLate">Cho phép nộp muộn</Label>
      </div>
    </div>
  );
}); 