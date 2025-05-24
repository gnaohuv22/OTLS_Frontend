/**
 * Hàm client-side để xác thực OTP
 * @param phoneNumber Số điện thoại cần xác thực
 * @param code Mã OTP đã nhập
 * @returns Kết quả từ API
 */
export async function verifyOtp(phoneNumber: string, code: string) {
  try {
    if (!phoneNumber || !code) {
      throw new Error('Số điện thoại và mã OTP là bắt buộc');
    }

    const response = await fetch('/api/twilio/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi xác thực OTP');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi xác thực OTP:', error);
    throw error;
  }
} 