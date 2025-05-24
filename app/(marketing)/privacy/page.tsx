import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Lock, ChevronLeft } from 'lucide-react';
import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trang chủ
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Chính sách bảo mật
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của người dùng OTLS
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted/20 p-6 rounded-lg border mb-10">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-xl font-semibold">Cam kết bảo mật</h3>
              </div>
              <p className="text-muted-foreground">
                OTLS cam kết bảo vệ thông tin cá nhân của tất cả người dùng, bao gồm học sinh, giáo viên và phụ huynh. 
                Chúng tôi tuân thủ các quy định về bảo vệ dữ liệu và không bao giờ chia sẻ thông tin cá nhân với bên thứ ba mà không được sự đồng ý rõ ràng.
              </p>
            </div>
            
            <div className="space-y-10">
              <PolicySection 
                title="Thu thập thông tin"
                content={[
                  "Chúng tôi chỉ thu thập những thông tin cần thiết để cung cấp dịch vụ, bao gồm:",
                  "• Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại",
                  "• Thông tin học tập: Kết quả học tập, tiến độ hoàn thành bài tập",
                  "• Dữ liệu sử dụng: Thời gian truy cập, tương tác với nền tảng"
                ]}
              />
              
              <PolicySection 
                title="Sử dụng thông tin"
                content={[
                  "Thông tin thu thập được sử dụng cho các mục đích:",
                  "• Cung cấp và duy trì dịch vụ học tập trực tuyến",
                  "• Cá nhân hóa trải nghiệm học tập",
                  "• Thông báo về cập nhật, tính năng mới hoặc thay đổi trong dịch vụ",
                  "• Phân tích và cải thiện nền tảng"
                ]}
              />
              
              <PolicySection 
                title="Bảo vệ dữ liệu"
                content={[
                  "Chúng tôi thực hiện các biện pháp bảo mật sau để bảo vệ dữ liệu:",
                  "• Mã hóa dữ liệu nhạy cảm",
                  "• Sao lưu dữ liệu định kỳ",
                  "• Kiểm tra bảo mật thường xuyên",
                  "• Hạn chế quyền truy cập vào dữ liệu người dùng"
                ]}
              />
              
              <PolicySection 
                title="Quyền của người dùng"
                content={[
                  "Người dùng có các quyền sau đối với dữ liệu cá nhân:",
                  "• Quyền truy cập thông tin cá nhân",
                  "• Quyền yêu cầu xóa hoặc sửa đổi thông tin",
                  "• Quyền rút lại sự đồng ý cho việc xử lý dữ liệu",
                  "• Quyền phản đối việc xử lý dữ liệu"
                ]}
              />
              
              <PolicySection 
                title="Cookie và công nghệ theo dõi"
                content={[
                  "OTLS sử dụng cookie và các công nghệ tương tự để:",
                  "• Duy trì phiên đăng nhập",
                  "• Ghi nhớ tùy chọn người dùng",
                  "• Thu thập thông tin về cách người dùng tương tác với nền tảng",
                  "• Cải thiện hiệu suất và trải nghiệm người dùng"
                ]}
              />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Thay đổi chính sách</h2>
                <p className="text-muted-foreground mb-4">
                  Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh các thay đổi trong hoạt động 
                  kinh doanh hoặc để tuân thủ các yêu cầu pháp lý. Khi có thay đổi đáng kể, chúng tôi sẽ thông báo cho 
                  người dùng thông qua email hoặc thông báo trên nền tảng.
                </p>
                <p className="text-muted-foreground">
                  Phiên bản mới nhất của Chính sách Bảo mật sẽ luôn được đăng tải trên trang web của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold">Có câu hỏi về quyền riêng tư?</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Nếu bạn có bất kỳ câu hỏi hoặc lo ngại nào về cách chúng tôi xử lý thông tin cá nhân, 
              vui lòng liên hệ với đội ngũ bảo mật của chúng tôi.
            </p>
            
            <Link href="/contact">
              <Button size="lg" className="min-w-[200px]">
                Liên hệ với chúng tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">OTLS</span>
            </div>
            
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              © 2024 OTLS. Bản quyền thuộc Nhóm SEP490_G42, Trường Đại học FPT.
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                Giới thiệu
              </Link>
              <Link href="/privacy" className="text-sm text-primary font-medium">
                Chính sách
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PolicySection({ title, content }: { title: string; content: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {content.map((paragraph, index) => (
        <p key={index} className="text-muted-foreground mb-3">
          {paragraph}
        </p>
      ))}
    </div>
  );
} 