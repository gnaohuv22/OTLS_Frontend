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
    const now = new Date();
    result = result.filter((cls) => {
      const nextClass = new Date(cls.nextClass);
      const diffHours = (nextClass.getTime() - now.getTime()) / (1000 * 60 * 60);

      switch (filters.status) {
        case 'upcoming':
          return diffHours > 0 && diffHours <= 24;
        case 'ongoing':
          return diffHours > -1.5 && diffHours <= 0; // Giả sử mỗi lớp kéo dài 1.5 giờ
        case 'completed':
          return diffHours < -1.5;
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
      case 'date-asc':
        return new Date(a.nextClass).getTime() - new Date(b.nextClass).getTime();
      case 'date-desc':
        return new Date(b.nextClass).getTime() - new Date(a.nextClass).getTime();
      case 'students-asc':
        return a.totalStudents - b.totalStudents;
      case 'students-desc':
        return b.totalStudents - a.totalStudents;
      default:
        return 0;
    }
  });
} 