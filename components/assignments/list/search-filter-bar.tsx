import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterSubject: string | null;
  onFilterChange: (subject: string | null) => void;
  subjects: string[];
}

const SearchAndFilterBar = ({
  searchTerm,
  onSearchChange,
  filterSubject,
  onFilterChange,
  subjects
}: SearchAndFilterBarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-col md:flex-row gap-4 items-center"
    >
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search" 
          placeholder="Tìm kiếm bài tập..."
          className="pl-8 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 transition-all duration-200">
            <Filter className="h-4 w-4" />
            {filterSubject ? `Môn: ${filterSubject}` : 'Lọc theo môn học'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-in zoom-in-50 duration-200">
          <DropdownMenuLabel>Chọn môn học</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onFilterChange(null)}
            className="transition-colors duration-200"
          >
            Tất cả môn học
          </DropdownMenuItem>
          {subjects.map(subject => (
            <DropdownMenuItem 
              key={subject} 
              onClick={() => onFilterChange(subject)}
              className="transition-colors duration-200"
            >
              {subject}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default SearchAndFilterBar; 