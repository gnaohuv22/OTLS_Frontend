import { ClassItem } from '@/components/classes/class-card';

/**
 * Lọc danh sách lớp học dựa trên các tiêu chí lọc
 */
export function filterClasses(classes: ClassItem[], filters: any): ClassItem[] {
  let result = [...classes];

  // Tìm kiếm
  if (filters.search) {
    const lowerCaseSearch = filters.search.toLowerCase();
    result = result.filter(
      (cls) =>
        cls.name.toLowerCase().includes(lowerCaseSearch) ||
        cls.subject.toLowerCase().includes(lowerCaseSearch) ||
        cls.teacher.toLowerCase().includes(lowerCaseSearch)
    );
  }

  // Lọc theo môn học
  if (filters.subject && filters.subject !== "Tất cả môn học") {
    result = result.filter((cls) => cls.subject === filters.subject);
  }

  // Lọc theo lịch học
  if (filters.schedule && filters.schedule !== "Tất cả") {
    result = result.filter((cls) => cls.schedule.includes(filters.schedule));
  }

  // Lọc theo trạng thái
  if (filters.status && filters.status !== "all") {
    result = result.filter((cls) => {
      switch (filters.status) {
        case 'active':
          return cls.status === 'active';
        case 'inactive':
          return cls.status === 'inactive';
        case 'scheduled':
          return cls.status === 'scheduled';
        case 'pending':
          return cls.status === 'pending';
        default:
          return true;
      }
    });
  }

  return result;
}

/**
 * Sắp xếp danh sách lớp học theo tiêu chí sắp xếp
 */
export function sortClasses(classes: ClassItem[], sortConfig: string): ClassItem[] {
  return [...classes].sort((a, b) => {
    switch (sortConfig) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'subject-asc':
        return a.subject.localeCompare(b.subject);
      case 'subject-desc':
        return b.subject.localeCompare(a.subject);
      case 'students-asc':
        return a.totalStudents - b.totalStudents;
      case 'students-desc':
        return b.totalStudents - a.totalStudents;
      case 'schedule-asc':
        return a.schedule.localeCompare(b.schedule);
      case 'schedule-desc':
        return b.schedule.localeCompare(a.schedule);
      default:
        return 0;
    }
  });
} 