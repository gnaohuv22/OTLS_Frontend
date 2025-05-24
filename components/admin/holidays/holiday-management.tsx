'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, CalendarDays, FilterIcon } from 'lucide-react';
import HolidayService, { Holiday } from '@/lib/api/holidays';
import HolidayList from './holiday-list';
import { HolidayForm } from './holiday-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filtering, setFiltering] = useState(false);
  const { toast } = useToast();

  // Load all holidays
  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HolidayService.getAllHolidays();
      setHolidays(data);
      setFilteredHolidays(data);
      setLoading(false);
    } catch (error: any) {
      if (error.status === 404) {
        setHolidays([]);
        setFilteredHolidays([]);
      } else {
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải danh sách ngày nghỉ',
          variant: 'destructive',
        });
      }
      setLoading(false);
    }
  }, [toast]);

  // Fetch all holidays when component mounts
  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  // Load holidays for a specific year
  const loadHolidaysForYear = async (year: number) => {
    try {
      setLoading(true);
      setFiltering(true);
      const data = await HolidayService.getHolidaysForYear(year);
      setFilteredHolidays(data);
      setCurrentYear(year);
      setLoading(false);
    } catch (error: any) {
      if (error.status === 404) {
        setFilteredHolidays([]);
      } else {
        toast({
          title: 'Lỗi',
          description: error.message || `Không thể tải danh sách ngày nghỉ cho năm ${year}`,
          variant: 'destructive',
        });
      }
      setLoading(false);
    } finally {
      setFiltering(false);
    }
  };

  // Import static holidays
  const handleImportStatic = async () => {
    try {
      setLoading(true);
      const result = await HolidayService.importStaticHolidays();
      toast({
        title: 'Import thành công',
        description: `Đã import ${result.totalAdded} ngày nghỉ. Bỏ qua ${result.totalSkipped} ngày đã tồn tại.`,
      });
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể import ngày nghỉ tĩnh',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Create a new holiday
  const handleCreate = async (data: Holiday) => {
    try {
      await HolidayService.createHoliday(data);
      toast({
        title: 'Thành công',
        description: 'Đã thêm ngày nghỉ mới',
      });
      setShowAddForm(false);
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo ngày nghỉ mới',
        variant: 'destructive',
      });
    }
  };

  // Update an existing holiday
  const handleUpdate = async (data: Holiday) => {
    if (!editingHoliday?.id) return;

    try {
      await HolidayService.updateHoliday(editingHoliday.id, data);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin ngày nghỉ',
      });
      setEditingHoliday(null);
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật ngày nghỉ',
        variant: 'destructive',
      });
    }
  };

  // Delete a holiday
  const handleDelete = async (id: string) => {
    try {
      await HolidayService.deleteHoliday(id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa ngày nghỉ',
      });
      loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa ngày nghỉ',
        variant: 'destructive',
      });
    }
  };

  // Reset filtering
  const handleResetFilter = () => {
    setFilteredHolidays(holidays);
    setFiltering(false);
  };

  // Generate an array of recent and future years for filtering
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            className="flex-shrink-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm ngày nghỉ
          </Button>

          <Button
            variant="outline"
            onClick={handleImportStatic}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Import ngày nghỉ tĩnh</span>
            <span className="sm:hidden">Import</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {filtering && (
            <Button variant="ghost" onClick={handleResetFilter} size="sm" className="h-8">
              Tất cả
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-8">
                <FilterIcon className="h-3.5 w-3.5" />
                <span>Năm {currentYear}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getYearOptions().map(year => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => loadHolidaysForYear(year)}
                  className="cursor-pointer"
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Holiday Form (in modal) */}
      {showAddForm && (
        <HolidayForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddForm(false)}
          isOpen={showAddForm}
        />
      )}

      {editingHoliday && (
        <HolidayForm
          holiday={editingHoliday}
          onSubmit={handleUpdate}
          onCancel={() => setEditingHoliday(null)}
          isOpen={!!editingHoliday}
        />
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <HolidayList
          holidays={filteredHolidays}
          onEdit={(holiday: Holiday) => setEditingHoliday(holiday)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
} 