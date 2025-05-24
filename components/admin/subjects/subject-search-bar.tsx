'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SubjectSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SubjectSearchBar({ searchQuery, onSearchChange }: SubjectSearchBarProps) {
  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm kiếm môn học..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
} 