'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from 'lucide-react';
import { SubjectService, SubjectDTO } from '@/lib/api/resource';
import { useToast } from '@/components/ui/use-toast';

const schedules = [
  "Tất cả",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật"
];

const statuses = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" }
];

const sortOptions = [
  { value: "name-asc", label: "Tên lớp (A-Z)" },
  { value: "name-desc", label: "Tên lớp (Z-A)" },
  { value: "date-asc", label: "Ngày học (Tăng dần)" },
  { value: "date-desc", label: "Ngày học (Giảm dần)" },
  { value: "students-asc", label: "Số học sinh (Tăng dần)" },
  { value: "students-desc", label: "Số học sinh (Giảm dần)" }
];

interface ClassFiltersProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
}

export function ClassFilters({ onFilterChange, onSortChange }: ClassFiltersProps) {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    subject: "all",
    schedule: "Tất cả",
    status: "all"
  });

  const [sort, setSort] = useState("name-asc");

  // Load subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        const subjectsData = await SubjectService.getAllSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học.',
        });
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [toast]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Môn học</Label>
              <Select
                value={filters.subject}
                onValueChange={(value) => handleFilterChange("subject", value)}
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Đang tải..." : "Chọn môn học"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectName}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lịch học</Label>
              <Select
                value={filters.schedule}
                onValueChange={(value) => handleFilterChange("schedule", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lịch học" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 