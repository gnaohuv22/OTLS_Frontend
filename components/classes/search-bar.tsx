'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ClassFilters } from '@/components/common/filters/class-filter';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onFilterChange,
  onSortChange
}: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên lớp, môn học hoặc giáo viên..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 transition-all duration-200"
        />
      </div>
      <ClassFilters
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />
    </motion.div>
  );
} 