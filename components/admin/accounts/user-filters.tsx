import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Download, Filter } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onReset: () => void;
  onExport?: () => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onReset,
  onExport
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo tên, email..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>{roleFilter || 'Lọc vai trò'}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Teacher">Giáo viên</SelectItem>
              <SelectItem value="Student">Học sinh</SelectItem>
              <SelectItem value="Parent">Phụ huynh</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>{statusFilter || 'Lọc trạng thái'}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="locked">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={onReset}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Đặt lại</span>
        </Button>
        {onExport && (
          <Button variant="outline" size="sm" className="gap-1" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel</span>
          </Button>
        )}
      </div>
    </div>
  );
} 