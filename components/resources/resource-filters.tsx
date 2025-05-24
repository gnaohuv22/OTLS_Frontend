'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Star, BarChart, Loader2, ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fadeInUp, ResourceFiltersProps, resourceTypes, difficultyLevels, sortOptions } from './types';
import { renderTypeIcon } from './utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ResourceFilters({
  selectedTypes,
  toggleType,
  selectedDifficulties,
  toggleDifficulty,
  selectedTags,
  toggleTag,
  searchQuery,
  setSearchQuery,
  allTags,
  filteredResourcesCount,
  resetAllFilters,
  resetFilterCategory,
  loading = false,
  subjects = [],
  selectedSubject = 'Tất cả',
  setSelectedSubject,
  sortOption = 'popular',
  setSortOption
}: ResourceFiltersProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" /> Tìm kiếm
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetAllFilters}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Xóa tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Từ khóa</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sort">Sắp xếp theo</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger id="sort" className="w-full">
                    <SelectValue placeholder="Chọn cách sắp xếp" />
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
              
              {subjects.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Môn học</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Loại tài nguyên</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => resetFilterCategory('type')}
                    disabled={selectedTypes.length === 0}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {resourceTypes.slice(1).map((type) => (
                    <Button
                      key={type.value}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start w-full h-auto py-1.5 px-2",
                        selectedTypes.includes(type.value) && "bg-primary/10 text-primary"
                      )}
                      onClick={() => toggleType(type.value)}
                    >
                      {renderTypeIcon(type.value)}
                      <span className="ml-2">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Độ khó</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => resetFilterCategory('difficulty')}
                    disabled={selectedDifficulties.length === 0}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {difficultyLevels.slice(1).map((level) => (
                    <Button
                      key={level.value}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start w-full h-auto py-1.5 px-2",
                        selectedDifficulties.includes(level.value) && "bg-primary/10 text-primary"
                      )}
                      onClick={() => toggleDifficulty(level.value)}
                    >
                      {level.value === 'beginner' && <Sparkles className="h-4 w-4 text-green-500" />}
                      {level.value === 'intermediate' && <Star className="h-4 w-4 text-amber-500" />}
                      {level.value === 'advanced' && <BarChart className="h-4 w-4 text-red-500" />}
                      <span className="ml-2">{level.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Chủ đề phổ biến</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => resetFilterCategory('tags')}
                      disabled={selectedTags.length === 0}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "cursor-pointer hover:bg-muted transition-colors",
                          selectedTags.includes(tag) && "bg-primary/10 text-primary"
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display filtered results count */}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Đã tìm thấy <span className="font-medium text-foreground">{filteredResourcesCount}</span> tài nguyên
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 