import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Số điện thoại và mã OTP là bắt buộc' },
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

    // Xác thực mã OTP với Twilio Verify
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: formattedPhoneNumber, code });

    if (verificationCheck.status === 'approved') {
      return NextResponse.json({
        success: true,
        status: verificationCheck.status,
        message: 'Xác thực số điện thoại thành công'
      });
    } else {
      return NextResponse.json({
        success: false,
        status: verificationCheck.status,
        message: 'Mã OTP không chính xác hoặc đã hết hạn'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Lỗi khi xác thực OTP:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi xác thực OTP',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 