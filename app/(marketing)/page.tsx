import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, Calendar, Clock, ChevronRight, Check, Brain, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <GraduationCap className="h-6 w-6 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">OTLS - Nền tảng dạy và học trực tuyến</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Nền tảng học tập trực tuyến tiên tiến cho giáo dục
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Kết nối giáo viên và học sinh thông qua công nghệ, tạo nên trải nghiệm học tập hiệu quả và thú vị
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[180px] h-12 rounded-full">
                Bắt đầu ngay
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="min-w-[180px] h-12 rounded-full">
                Đăng nhập
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center text-sm text-muted-foreground">
            <Check className="h-4 w-4 mr-2 text-primary" />
            <span>Dễ dàng sử dụng</span>
            <span className="mx-2">•</span>
            <Check className="h-4 w-4 mr-2 text-primary" />
            <span>Phù hợp với tiểu học</span>
            <span className="mx-2">•</span>
            <Check className="h-4 w-4 mr-2 text-primary" />
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Tính năng nổi bật</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              OTLS cung cấp đầy đủ các tính năng để hỗ trợ quá trình dạy và học hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="h-6 w-6 text-primary" />}
              title="Học tập tương tác" 
              description="Các bài giảng đa phương tiện giúp học sinh tương tác và lĩnh hội kiến thức hiệu quả hơn."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Lớp học trực tuyến" 
              description="Tạo và quản lý lớp học, giao bài tập và theo dõi tiến độ học tập của học sinh."
            />
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6 text-primary" />}
              title="Kho tài liệu phong phú" 
              description="Thư viện tài liệu đa dạng, bao gồm sách, bài tập và tài liệu tham khảo cho nhiều môn học."
            />
            <FeatureCard 
              icon={<Calendar className="h-6 w-6 text-primary" />}
              title="Quản lý thời gian" 
              description="Lập lịch học tập, nhắc nhở thời gian nộp bài và quản lý lịch trình hiệu quả."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Thống kê học tập" 
              description="Biểu đồ và báo cáo về tiến trình học tập, điểm số và sự tham gia của học sinh."
            />
            <FeatureCard 
              icon={<Award className="h-6 w-6 text-primary" />}
              title="Hệ thống đánh giá" 
              description="Đánh giá chi tiết về kết quả học tập, giúp học sinh cải thiện điểm yếu và phát huy điểm mạnh."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="1000+" label="Học sinh đang theo học" />
            <StatCard number="50+" label="Giáo viên chất lượng" />
            <StatCard number="100+" label="Khóa học đa dạng" />
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Sẵn sàng bắt đầu?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tham gia OTLS ngay hôm nay để trải nghiệm nền tảng học tập hiện đại dành cho học sinh tiểu học
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] h-12">
                Đăng ký ngay
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="min-w-[200px] h-12">
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
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background rounded-xl border p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-background rounded-xl border p-8 shadow-sm">
      <div className="text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
} 