'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Schema cho form quên mật khẩu
const forgotPasswordSchema = z.object({
  username: z.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  parentPhone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
})

interface ForgotPasswordFormProps {
  onSubmit: (username: string, parentPhone: string) => void;
  isLoading?: boolean;
}

export function ForgotPasswordForm({ onSubmit, isLoading = false }: ForgotPasswordFormProps) {
  // Form quên mật khẩu
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: '',
      parentPhone: ''
    }
  })

  // Xử lý gửi yêu cầu đặt lại mật khẩu
  const handleSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    onSubmit(values.username, values.parentPhone);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đăng nhập</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nhập tên đăng nhập của bạn"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại phụ huynh</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="Ví dụ: 0987654321"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Tiếp tục"}
        </Button>
      </form>
    </Form>
  );
} 