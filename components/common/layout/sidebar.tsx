"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Library,
    Settings,
    Menu,
    Calendar,
    MessageCircle,
    Bell,
    Users,
    School,
    BarChart4,
    Shield,
    CalendarOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import Image from "next/image";

// NavItem component cho sidebar desktop
function NavItem({
    href,
    label,
    children
}: {
    href: string;
    label: string;
    children: React.ReactNode
}) {
    const pathname = usePathname();
    // Cải tiến kiểm tra active state cho các trang admin
    const isActive = href === "/dashboard" 
        ? pathname === href
        : href.includes("/admin") 
            ? pathname.includes("/admin") && pathname.includes(href.split("/").pop() || "")
            : pathname === href;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 md:h-8 md:w-8",
                            isActive
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <div className={cn(
                            "transition-transform duration-200",
                            isActive ? "" : "group-hover:scale-110"
                        )}>
                            {children}
                        </div>
                        <span className="sr-only">{label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="z-50 animate-in zoom-in-50 duration-100">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useAuth();
    const [isClaudeTheme, setIsClaudeTheme] = useState(false);
    
    // Listen for theme changes
    useEffect(() => {
        // Check initial theme
        if (typeof window !== 'undefined') {
            const currentTheme = localStorage.getItem('theme');
            setIsClaudeTheme(currentTheme === 'claude-theme');
        }
        
        // Listen for theme changes
        const handleThemeChange = (event: CustomEvent) => {
            if (event.detail && event.detail.theme) {
                setIsClaudeTheme(event.detail.theme === 'claude-theme');
            } else {
                // Check theme from localStorage as fallback
                const currentTheme = localStorage.getItem('theme');
                setIsClaudeTheme(currentTheme === 'claude-theme');
            }
        };
        
        window.addEventListener('themeChange', handleThemeChange as EventListener);
        return () => {
            window.removeEventListener('themeChange', handleThemeChange as EventListener);
        };
    }, []);
    
    // Nếu là phụ huynh, ẩn sidebar
    if (role === 'Parent' as any) {
        return null;
    }

    // Kiểm tra nếu đang ở trang admin
    const isAdminPage = pathname.startsWith("/admin");

    // Danh sách các mục trong sidebar dựa vào role
    const getNavItems = () => {
        // Menu cho Admin
        const adminItems = [
            {
                href: "/dashboard",
                label: "Tổng quan",
                icon: <LayoutDashboard className="h-5 w-5" />
            },
            {
                href: "/admin/accounts",
                label: "Quản lý tài khoản",
                icon: <Users className="h-5 w-5" />
            },
            {
                href: "/admin/classes",
                label: "Quản lý lớp học", 
                icon: <School className="h-5 w-5" />
            },
            {
                href: "/admin/subjects",
                label: "Quản lý môn học",
                icon: <BookOpen className="h-5 w-5" />
            },
            {
                href: "/admin/assignments",
                label: "Quản lý bài tập",
                icon: <FileText className="h-5 w-5" />
            },
            {
                href: "/admin/resources",
                label: "Quản lý tài nguyên",
                icon: <Library className="h-5 w-5" />
            },
            {
                href: "/admin/holidays",
                label: "Quản lý ngày nghỉ lễ",
                icon: <CalendarOff className="h-5 w-5" />
            },
            {
                href: "/settings",
                label: "Cài đặt hệ thống",
                icon: <Settings className="h-5 w-5" />
            }
        ];

        // Các mục dùng chung cho Student và Teacher
        const commonItems = [
            {
                href: "/dashboard",
                label: "Tổng quan",
                icon: <LayoutDashboard className="h-5 w-5" />
            },
            {
                href: "/schedule",
                label: "Lịch",
                icon: <Calendar className="h-5 w-5" />
            },
            {
                href: "/notifications",
                label: "Thông báo",
                icon: <Bell className="h-5 w-5" />
            }
        ];

        const teacherItems = [
            {
                href: "/classes",
                label: "Lớp học",
                icon: <BookOpen className="h-5 w-5" />
            },
            {
                href: "/assignments",
                label: "Bài tập",
                icon: <FileText className="h-5 w-5" />
            },
            {
                href: "/resources",
                label: "Tài nguyên",
                icon: <Library className="h-5 w-5" />
            },
            {
                href: "/settings",
                label: "Cài đặt",
                icon: <Settings className="h-5 w-5" />
            }
        ];

        const studentItems = [
            {
                href: "/classes",
                label: "Lớp học",
                icon: <BookOpen className="h-5 w-5" />
            },
            {
                href: "/assignments",
                label: "Bài tập",
                icon: <FileText className="h-5 w-5" />
            },
            {
                href: "/resources",
                label: "Tài nguyên",
                icon: <Library className="h-5 w-5" />
            },
            {
                href: "/settings",
                label: "Cài đặt",
                icon: <Settings className="h-5 w-5" />
            }
        ];

        // Luôn hiển thị sidebar admin cho role Admin, bất kể đang ở trang nào
        if (role === 'Admin' as any) {
            return adminItems;
        } else if (role === 'Teacher' as any) {
            return [...commonItems, ...teacherItems];
        } 
        
        // Default for student
        return [...commonItems, ...studentItems];
    };

    const navItems = getNavItems();
    
    // Determine logo content based on theme
    let logoContent;
    if (isClaudeTheme) {
        logoContent = (
            <div className="claude-logo flex items-center justify-center w-full h-full">
                <Image 
                    src="/claude-ai-icon.svg" 
                    alt="Claude AI Logo" 
                    width={40} 
                    height={40} 
                    className="transition-all group-hover:scale-110" 
                />
            </div>
        );
    } else {
        logoContent = role === 'Admin' as any ? 
            <Shield className="h-5 w-5 transition-all group-hover:scale-110" /> : 
            <GraduationCap className="h-5 w-5 transition-all group-hover:scale-110" />;
    }
    
    const logoText = isClaudeTheme ? 
        "Claude - Trợ lý AI" : 
        (role === 'Admin' as any ? "Quản trị OTLS" : "Online Teaching and Learning Solution");

    return (
        <>
            {/* Mobile Nav Button */}
            <div className="fixed top-3 left-3 z-50 block sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="h-10 w-10 rounded-lg bg-background shadow-md border transition-shadow hover:shadow-lg">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Mở Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link
                                href="/dashboard"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                            >
                                {logoContent}
                                <span className="sr-only">{logoText}</span>
                            </Link>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-2.5 transition-colors duration-200",
                                        pathname === item.href || (item.href.includes("/admin") && pathname.includes(item.href.split("/").pop() || ""))
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col border-r bg-background sm:flex transition-all duration-300">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="/dashboard"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        {logoContent}
                        <span className="sr-only">{logoText}</span>
                    </Link>

                    {navItems.map((item) => (
                        <NavItem key={item.href} href={item.href} label={item.label}>
                            {item.icon}
                        </NavItem>
                    ))}
                </nav>
            </aside>
        </>
    );
} 