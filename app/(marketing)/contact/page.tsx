import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Mail, Phone, MapPin, ChevronLeft, Send } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function ContactPage() {
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
            Liên hệ với chúng tôi
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi hoặc góp ý nào.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Gửi tin nhắn cho chúng tôi</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" placeholder="Nhập họ và tên của bạn" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="example@gmail.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Chủ đề</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chủ đề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Câu hỏi chung</SelectItem>
                      <SelectItem value="technical">Hỗ trợ kỹ thuật</SelectItem>
                      <SelectItem value="feedback">Góp ý, phản hồi</SelectItem>
                      <SelectItem value="partnership">Hợp tác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Tin nhắn</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Nhập nội dung tin nhắn của bạn ở đây..." 
                    rows={6}
                  />
                </div>
                
                <Button type="button" className="w-full sm:w-auto" disabled>
                  <Send className="h-4 w-4 mr-2"/>
                  Gửi tin nhắn (chưa hoạt động)
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Thông tin liên hệ</h2>
              
              <div className="space-y-8">
                <ContactInfo 
                  icon={<Mail className="h-6 w-6 text-primary" />}
                  title="Email"
                  content="otls.support@fpt.edu.vn"
                  description="Gửi email cho chúng tôi và chúng tôi sẽ phản hồi trong vòng 24 giờ."
                />
                
                <ContactInfo 
                  icon={<Phone className="h-6 w-6 text-primary" />}
                  title="Điện thoại"
                  content="(+84) 916 432 148"
                  description="Đường dây hỗ trợ hoạt động từ Thứ Hai đến Thứ Sáu, 8:00 - 17:00."
                />
                
                <ContactInfo 
                  icon={<MapPin className="h-6 w-6 text-primary" />}
                  title="Địa chỉ"
                  content="Khu Giáo dục và Đào tạo, Khu Công nghệ cao Hòa Lạc, Km29, Đại lộ Thăng Long, Thạch Thất, Hà Nội"
                  description="Đại học FPT, nơi dự án OTLS được phát triển."
                />
                
                <div className="bg-muted/30 p-6 rounded-lg border mt-10">
                  <h3 className="text-xl font-semibold mb-3">Các kênh mạng xã hội</h3>
                  <p className="text-muted-foreground mb-4">
                    Theo dõi chúng tôi trên các nền tảng mạng xã hội để cập nhật tin tức và sự kiện mới nhất.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="icon">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon">
                      <span className="sr-only">YouTube</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">Câu hỏi thường gặp</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <FaqItem 
              question="Làm thế nào để tạo tài khoản OTLS?" 
              answer="Để tạo tài khoản OTLS, bạn cần truy cập trang đăng ký, điền thông tin cá nhân và xác minh địa chỉ email. Sau đó, bạn có thể chọn vai trò (học sinh, giáo viên hoặc phụ huynh) và bắt đầu sử dụng nền tảng."
            />
            <FaqItem 
              question="OTLS có phù hợp với học sinh tiểu học không?" 
              answer="OTLS được thiết kế đặc biệt cho học sinh tiểu học với giao diện thân thiện, dễ sử dụng và nội dung học tập phù hợp với lứa tuổi. Nền tảng cũng có tính năng giám sát của phụ huynh để đảm bảo an toàn."
            />
            <FaqItem 
              question="Làm thế nào để liên hệ với đội ngũ hỗ trợ kỹ thuật?" 
              answer="Bạn có thể liên hệ với đội ngũ hỗ trợ kỹ thuật của chúng tôi qua email otls.support@fpt.edu.vn, số điện thoại hỗ trợ, hoặc sử dụng biểu mẫu liên hệ trên trang web của chúng tôi."
            />
            <FaqItem 
              question="OTLS có tính phí không?" 
              answer="OTLS hiện chưa hỗ trợ tính phí, nhưng sẽ có các gói dịch vụ được phát triển trong tương lai."
            />
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
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Chính sách
              </Link>
              <Link href="/contact" className="text-sm text-primary font-medium">
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactInfo({ icon, title, content, description }: { icon: React.ReactNode; title: string; content: string; description: string }) {
  return (
    <div className="flex">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="font-medium mb-1">{content}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-background rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{question}</h3>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  );
} 