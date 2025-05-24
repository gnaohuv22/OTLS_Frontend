/**
 * Hàm client-side để gửi yêu cầu OTP
 * @param phoneNumber Số điện thoại cần gửi OTP
 * @returns Kết quả từ API
 */
export async function sendOtp(phoneNumber: string) {
  try {
    if (!phoneNumber) {
      throw new Error('Số điện thoại là bắt buộc');
    }

    const response = await fetch('/api/twilio/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi OTP');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi gửi OTP:', error);
    throw error;
  }
} 