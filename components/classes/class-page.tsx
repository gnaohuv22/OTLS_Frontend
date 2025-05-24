'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';

// Import các component
import { PageHeader } from '@/components/classes/page-header';
import { SearchBar } from '@/components/classes/search-bar';
import { ClassList } from '@/components/classes/class-list';
import { ClassFormModal } from '@/components/classes/modals/class-form-modal';

// Import hooks và utils
import { useClassData } from '@/components/classes/hooks/use-class-data';

// Định nghĩa animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export interface ClassPageProps {
  // Prop types nếu cần
}

export function ClassPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState('name-asc');
  const { toast } = useToast();
  
  const { 
    filteredClasses, 
    isLoading, 
    handleSearch, 
    handleFilterChange, 
    handleSortChange, 
    handleJoinClass, 
    handleCreateClass 
  } = useClassData(searchTerm, sortConfig);

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={fadeInUp}
      className="container mx-auto py-6"
    >
      <div className="flex flex-col space-y-6">
        <PageHeader 
          newClassOpen={newClassOpen}
          setNewClassOpen={setNewClassOpen}
          onJoinClass={handleJoinClass}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            handleSearch(value);
          }}
          onFilterChange={handleFilterChange}
          onSortChange={(sort) => {
            setSortConfig(sort);
            handleSortChange(sort);
          }}
        />

        <ClassList 
          classes={filteredClasses}
          isLoading={isLoading}
        />
        
        <ClassFormModal 
          isOpen={newClassOpen}
          onOpenChange={setNewClassOpen}
          onSubmitClass={handleCreateClass}
          mode="create"
        />
      </div>
    </motion.div>
  );
} 