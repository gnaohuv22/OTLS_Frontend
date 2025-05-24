'use client';

import { passwordFormSchema } from "@/lib/validations/user-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AuthService } from "@/lib/api/auth";
import { useToast } from "@/components/ui/use-toast";

/**
 * Component hiển thị form đổi mật khẩu
 */
export function PasswordForm() {
  const { toast } = useToast();

  // Initialize form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Xử lý đổi mật khẩu
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      // Gọi API đổi mật khẩu
      const result = await AuthService.changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (result.success) {
        // Hiển thị thông báo thành công
        toast({
          title: "Đổi mật khẩu thành công",
          description: "Mật khẩu của bạn đã được cập nhật",
          duration: 3000,
        });

        // Reset form
        passwordForm.reset();
      } else {
        // Hiển thị thông báo lỗi
        toast({
          title: "Lỗi đổi mật khẩu",
          description: result.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error: any) {
      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi đổi mật khẩu",
        description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Form {...passwordForm}>
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 max-w-xl mx-auto">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu hiện tại</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end mt-12">
          <Button 
            type="button"
            disabled={!passwordForm.formState.isDirty || passwordForm.formState.isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              passwordForm.handleSubmit(onPasswordSubmit)();
            }}
          >
            {passwordForm.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 