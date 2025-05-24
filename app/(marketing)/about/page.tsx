import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, ChevronLeft } from 'lucide-react';
import React from 'react';

export default function AboutPage() {
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
            Giới thiệu về OTLS
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            Hiểu thêm về sứ mệnh, tầm nhìn và con người đằng sau nền tảng học tập trực tuyến OTLS
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Tầm nhìn & Sứ mệnh</h2>
              
              <div className="space-y-6">
                <div className="bg-muted/30 p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Tầm nhìn</h3>
                  <p className="text-muted-foreground">
                    Trở thành nền tảng học tập trực tuyến hàng đầu Việt Nam, mang đến trải nghiệm giáo dục toàn diện, 
                    chất lượng và phù hợp với mọi học sinh.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Sứ mệnh</h3>
                  <p className="text-muted-foreground">
                    Phát triển một nền tảng học tập trực tuyến dễ tiếp cận, thân thiện và hiệu quả, 
                    kết nối giáo viên, học sinh và phụ huynh trong một môi trường học tập số hóa, 
                    đồng thời tạo điều kiện cho việc học tập trở nên thú vị và hấp dẫn hơn.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Đội ngũ của chúng tôi</h2>
              
              <p className="text-muted-foreground mb-6">
                OTLS được phát triển bởi đội ngũ sinh viên từ Nhóm SEP490_G42, Trường Đại học FPT, dưới sự hướng dẫn của các 
                giảng viên.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TeamMember 
                  name="Nhóm SEP490_G42"
                  role="Đội ngũ phát triển"
                  description="Sinh viên ngành Kỹ thuật phần mềm tại Trường Đại học FPT, với đam mê về công nghệ và giáo dục."
                />
                <TeamMember 
                  name="Trường Đại học FPT"
                  role="Đơn vị hỗ trợ"
                  description="Cung cấp môi trường học tập và các nguồn lực cần thiết để phát triển dự án."
                />
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Giá trị cốt lõi</h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <CoreValue 
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Đồng hành cùng phát triển" 
                description="Chúng tôi cam kết đồng hành cùng học sinh, giáo viên và phụ huynh trong suốt quá trình học tập và phát triển."
              />
              <CoreValue 
                icon={<BookOpen className="h-6 w-6 text-primary" />}
                title="Sáng tạo không ngừng" 
                description="Luôn tìm tòi, đổi mới và áp dụng các phương pháp giáo dục tiên tiến vào nền tảng học tập."
              />
              <CoreValue 
                icon={<GraduationCap className="h-6 w-6 text-primary" />}
                title="Chất lượng giáo dục" 
                description="Đặt chất lượng giáo dục lên hàng đầu, đảm bảo mọi nội dung đều được kiểm duyệt kỹ lưỡng và phù hợp với chương trình học."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Bắt đầu hành trình học tập cùng OTLS</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Tham gia ngay hôm nay để trải nghiệm nền tảng học tập tiên tiến dành cho mọi học sinh
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[180px]">
                Đăng ký ngay
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="min-w-[180px]">
                Đăng nhập
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
              <Link href="/about" className="text-sm text-primary font-medium">
                Giới thiệu
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
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

function TeamMember({ name, role, description }: { name: string; role: string; description: string }) {
  return (
    <div className="bg-background rounded-lg border p-5 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="text-primary text-sm font-medium mb-2">{role}</div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function CoreValue({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background rounded-lg border p-6 shadow-sm hover:shadow-md transition-all">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
} 