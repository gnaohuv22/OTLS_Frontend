'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ResourceListProps, staggerContainer } from './types';
import { ResourceCard } from './resource-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePagination } from '@/hooks/use-pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ResourceList({ resources, onDeleteResource, onEditResource, subjects }: ResourceListProps) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    itemsPerPage,
    nextPage,
    previousPage,
    goToPage,
    setItemsPerPage
  } = usePagination({
    data: resources,
    itemsPerPage: 12 // 4x3 grid
  });

  return (
    <div className="space-y-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {resources.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy tài nguyên nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          paginatedData.map((resource, index) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              index={index}
              onDeleteResource={onDeleteResource}
              onEditResource={onEditResource}
              subjects={subjects}
            />
          ))
        )}
      </motion.div>

      {/* Pagination Controls */}
      {resources.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="18">18</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
            <span>trên {totalItems} tài nguyên</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="min-w-[32px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage}
              className="flex items-center gap-1"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 