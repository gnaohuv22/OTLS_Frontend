// Hàm lấy văn bản fallback cho avatar từ họ tên hoặc tên đăng nhập
export const getAvatarFallbackText = (fullName?: string, userName?: string): string => {
  if (fullName && fullName.length > 0) {
    return fullName.charAt(0).toUpperCase();
  }
  
  if (userName && userName.length > 0) {
    return userName.charAt(0).toUpperCase();
  }
  
  return "U";
}; 