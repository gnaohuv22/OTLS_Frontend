"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TwilioOtpAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Gửi mã OTP đến số điện thoại
  const sendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/twilio/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi khi gửi OTP");
      }

      setIsVerificationSent(true);
      toast({
        title: "Thành công!",
        description: "Mã OTP đã được gửi đến số điện thoại của bạn",
      });
      
    } catch (error: any) {
      console.error("Lỗi khi gửi OTP:", error);
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xác minh mã OTP
  const verifyOTP = async () => {
    if (!verificationCode) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/twilio/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Mã OTP không hợp lệ");
      }

      setSuccess(true);
      toast({
        title: "Xác thực thành công!",
        description: "Số điện thoại của bạn đã được xác thực thành công.",
      });
      
    } catch (error: any) {
      console.error("Lỗi khi xác thực OTP:", error);
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber("");
    setVerificationCode("");
    setIsVerificationSent(false);
    setSuccess(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Xác thực số điện thoại</CardTitle>
        <CardDescription className="text-center">
          {success 
            ? "Số điện thoại của bạn đã được xác thực thành công" 
            : isVerificationSent
              ? "Nhập mã OTP đã được gửi đến số điện thoại của bạn"
              : "Nhập số điện thoại của bạn để nhận mã OTP xác thực"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-center">Số điện thoại <span className="font-medium">{phoneNumber}</span> đã được xác thực thành công.</p>
            <Button onClick={resetForm} className="w-full">
              Xác thực số điện thoại khác
            </Button>
          </div>
        ) : isVerificationSent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Mã OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Nhập mã OTP 6 số"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={verifyOTP}
                disabled={!verificationCode || loading}
                className="w-full"
              >
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="link"
                  onClick={() => setIsVerificationSent(false)}
                  disabled={loading}
                  className="px-0"
                >
                  Quay lại
                </Button>
                
                <Button
                  variant="link"
                  onClick={sendOTP}
                  disabled={loading}
                  className="px-0"
                >
                  Gửi lại mã
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại của bạn"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Ví dụ: 0901234567 hoặc +84901234567
              </p>
            </div>
            
            <Button
              onClick={sendOTP}
              disabled={!phoneNumber || loading}
              className="w-full"
            >
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 