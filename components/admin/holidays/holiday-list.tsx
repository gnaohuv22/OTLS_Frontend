'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, Calendar, RotateCw, CheckCircle, XCircle, Info } from 'lucide-react';
import { Holiday } from '@/lib/api/holidays';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

interface HolidayListProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
}

export default function HolidayList({ holidays, onEdit, onDelete }: HolidayListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [holidayToDelete, setHolidayToDelete] = React.useState<Holiday | null>(null);

  const handleDeleteClick = (holiday: Holiday) => {
    if (holiday.id) {
      setHolidayToDelete(holiday);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (holidayToDelete?.id) {
      onDelete(holidayToDelete.id);
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  if (holidays.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Không có ngày nghỉ nào được tìm thấy.</p>
      </div>
    );
  }

  // Component for mobile view
  const MobileHolidayList = () => (
    <div className="space-y-3">
      {holidays.map((holiday) => (
        <Card key={holiday.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1 mr-3">
                <div className="font-medium flex items-center gap-1.5">
                  {holiday.name}
                  {holiday.isActive !== false ? (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(holiday.startDate)}
                  {holiday.endDate && ` - ${formatDate(holiday.endDate)}`}
                </div>
                
                {holiday.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {holiday.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-1 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0" 
                        onClick={() => onEdit(holiday)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chỉnh sửa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDeleteClick(holiday)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Xóa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {holiday.isRecurring ? (
                <Badge variant="outline" className="flex items-center gap-1 text-xs py-0 h-5">
                  <RotateCw className="h-3 w-3" />
                  Hàng năm
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 text-xs py-0 h-5">
                  <Calendar className="h-3 w-3" />
                  {holiday.type === 'static' ? 'Cố định' : 'Thay đổi'}
                </Badge>
              )}
              
              {holiday.isActive !== false ? (
                <Badge variant="default" className="flex items-center gap-1 text-xs py-0 h-5 bg-green-500">
                  <CheckCircle className="h-3 w-3" />
                  Đang kích hoạt
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs py-0 h-5">
                  <XCircle className="h-3 w-3" />
                  Đã vô hiệu
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Component for desktop view
  const DesktopHolidayList = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Tên ngày nghỉ</TableHead>
            <TableHead className="w-[220px]">Mô tả</TableHead>
            <TableHead className="w-[110px]">Ngày bắt đầu</TableHead>
            <TableHead className="w-[110px]">Ngày kết thúc</TableHead>
            <TableHead className="w-[130px]">Loại</TableHead>
            <TableHead className="w-[135px]">Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {holiday.name}
                  {holiday.isActive !== false ? (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-[220px]">
                {holiday.description ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="line-clamp-2 text-sm cursor-default">
                          {holiday.description}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{holiday.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : '—'}
              </TableCell>
              <TableCell>{formatDate(holiday.startDate)}</TableCell>
              <TableCell>{holiday.endDate ? formatDate(holiday.endDate) : '—'}</TableCell>
              <TableCell className="whitespace-nowrap">
                {holiday.isRecurring ? (
                  <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                    <RotateCw className="h-3 w-3 flex-shrink-0" />
                    <span>Hàng năm</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{holiday.type === 'static' ? 'Cố định' : 'Thay đổi'}</span>
                  </Badge>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {holiday.isActive !== false ? (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-500 whitespace-nowrap">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span>Đang kích hoạt</span>
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1 whitespace-nowrap">
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    <span>Đã vô hiệu</span>
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(holiday)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Chỉnh sửa</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(holiday)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Xóa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      {/* Mobile view (hidden on md and larger screens) */}
      <div className="md:hidden">
        <MobileHolidayList />
      </div>

      {/* Desktop view (hidden on smaller than md screens) */}
      <div className="hidden md:block">
        <DesktopHolidayList />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn ngày nghỉ &quot;{holidayToDelete?.name}&quot; và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 