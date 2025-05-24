import Link from 'next/link';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Library,
  PanelLeft,
  Settings,
  Calendar
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavItem } from '../../../components/common/layout/tooltip';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <GraduationCap className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">E-Learning Platform</span>
        </Link>

        <NavItem href="/classes" label="Lớp học">
          <BookOpen className="h-5 w-5" />
        </NavItem>

        <NavItem href="/schedule" label="Lịch học">
          <Calendar className="h-5 w-5" />
        </NavItem>

        <NavItem href="/assignments" label="Bài tập">
          <FileText className="h-5 w-5" />
        </NavItem>

        <NavItem href="/resources" label="Tài nguyên">
          <Library className="h-5 w-5" />
        </NavItem>

      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Mở Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <GraduationCap className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">E-Learning Platform</span>
          </Link>
          <Link
            href="/classes"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-5 w-5" />
            Lớp học
          </Link>
          <Link
            href="/schedule"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Calendar className="h-5 w-5" />
            Lịch học
          </Link>
          <Link
            href="/assignments"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-5 w-5" />
            Bài tập
          </Link>
          <Link
            href="/resources"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Library className="h-5 w-5" />
            Tài nguyên
          </Link>
          <div className="flex items-center gap-4 px-2.5">
            <span className="text-muted-foreground hover:text-foreground">Thông báo</span>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
