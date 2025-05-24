'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Holiday } from '@/lib/api/holidays';

// Schema validation with zod
const holidaySchema = z.object({
  name: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
  description: z.string().optional(),
  startDate: z.string({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  endDate: z.string().optional(),
  isRecurring: z.boolean().default(false),
  type: z.enum(['static', 'dynamic']).default('dynamic'),
  isActive: z.boolean().default(true),
});

type HolidayFormValues = z.infer<typeof holidaySchema>;

interface HolidayFormProps {
  holiday?: Holiday;
  onSubmit: (data: Holiday) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function HolidayForm({ holiday, onSubmit, onCancel, isOpen }: HolidayFormProps) {
  // Format dates for the form
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    // Try to parse the date from ISO format
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  };

  // Initialize form with default values or holiday data if provided
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: holiday?.name || '',
      description: holiday?.description || '',
      startDate: formatDateForInput(holiday?.startDate),
      endDate: formatDateForInput(holiday?.endDate),
      isRecurring: holiday?.isRecurring || false,
      type: holiday?.type || 'dynamic',
      isActive: holiday?.isActive !== false, // default to true
    },
  });

  const onFormSubmit = (values: HolidayFormValues) => {
    // Convert string dates to ISO format for API
    const startDate = values.startDate ? new Date(values.startDate) : new Date();
    const endDate = values.endDate ? new Date(values.endDate) : undefined;
    
    const formattedData: Holiday = {
      ...holiday, // Preserve ID if editing
      name: values.name,
      description: values.description,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString(),
      isRecurring: values.isRecurring,
      type: values.type,
      isActive: values.isActive,
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {holiday ? 'Chỉnh sửa ngày nghỉ' : 'Thêm ngày nghỉ mới'}
          </DialogTitle>
          <DialogDescription>
            {holiday ? 'Cập nhật thông tin cho ngày nghỉ hiện có.' : 'Thêm ngày nghỉ mới vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên ngày nghỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên ngày nghỉ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại ngày nghỉ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại ngày nghỉ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="static">Cố định (Static)</SelectItem>
                        <SelectItem value="dynamic">Thay đổi (Dynamic)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cố định: trùng ngày cụ thể hàng năm (như 01/01)
                      <br />
                      Thay đổi: ngày thay đổi theo năm (như Tết Âm lịch)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả ngày nghỉ"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Để trống nếu ngày nghỉ chỉ kéo dài 1 ngày
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Lặp lại hàng năm</FormLabel>
                      <FormDescription>
                        Ngày nghỉ này sẽ lặp lại vào cùng ngày mỗi năm
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Kích hoạt</FormLabel>
                      <FormDescription>
                        Ngày nghỉ sẽ được áp dụng trong lịch học
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit">
                {holiday ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 