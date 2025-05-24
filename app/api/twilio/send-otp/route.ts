import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    // Định dạng số điện thoại (thêm mã quốc gia nếu cần)
    const formattedPhoneNumber = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+84${phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber}`;

    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json(
        { error: 'Thiếu thông tin xác thực Twilio. Vui lòng kiểm tra biến môi trường.' },
        { status: 500 }
      );
    }

    // Khởi tạo client Twilio
    const client = twilio(accountSid, authToken);

    // Gửi mã OTP bằng Twilio Verify
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: formattedPhoneNumber, channel: 'sms' });

    return NextResponse.json({
      success: true,
      status: verification.status,
      message: 'Mã OTP đã được gửi thành công.'
    });
  } catch (error: any) {
    console.error('Lỗi khi gửi OTP:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi gửi OTP',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 