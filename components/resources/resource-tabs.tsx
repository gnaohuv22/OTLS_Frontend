'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceTabsProps, fadeInUp, sortOptions } from './types';
import { ResourceList } from './resource-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Define animation variants
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export function ResourceTabs({ 
  filteredResources, 
  loading = false,
  onDeleteResource,
  onEditResource,
  subjects,
  sortOption,
  setSortOption
}: ResourceTabsProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="popular">Phổ biến</TabsTrigger>
            <TabsTrigger value="docs">Tài liệu</TabsTrigger>
            <TabsTrigger value="media">Nội dung nghe nhìn</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 mr-1 text-muted-foreground" />
            <Select value={sortOption} onValueChange={setSortOption}>
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
        </div>

        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary/70" />
            <p className="text-lg font-medium text-muted-foreground">Đang tải tài nguyên...</p>
          </div>
        ) : (
          <>
            <TabsContent value="all">
              <ResourceList 
                resources={filteredResources} 
                onDeleteResource={onDeleteResource}
                onEditResource={onEditResource}
                subjects={subjects}
              />
            </TabsContent>
            
            <TabsContent value="popular">
              <ResourceList 
                resources={filteredResources.filter(r => (r.downloadCount + r.viewCount) > 0).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                onDeleteResource={onDeleteResource}
                onEditResource={onEditResource}
                subjects={subjects}
              />
            </TabsContent>
            
            <TabsContent value="docs">
              <ResourceList 
                resources={filteredResources.filter(r => r.type === 'document')}
                onDeleteResource={onDeleteResource}
                onEditResource={onEditResource}
                subjects={subjects}
              />
            </TabsContent>
            
            <TabsContent value="media">
              <ResourceList 
                resources={filteredResources.filter(r => r.type === 'media')}
                onDeleteResource={onDeleteResource}
                onEditResource={onEditResource}
                subjects={subjects}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </motion.div>
  );
} 