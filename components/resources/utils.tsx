import React from 'react';
import { FileText, Video, BookOpen, FileBox, Music, BarChart2, Sparkles, Star, BarChart, Play, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hàm hiển thị biểu tượng dựa trên loại tài nguyên
export const renderTypeIcon = (type: string, className = 'h-4 w-4') => {
    switch (type.toLowerCase()) {
        case 'document':
            return <FileText className={className} />;
        case 'video':
        case 'media':
            return <Video className={className} />;
        case 'presentation':
            return <Play className={className} />;
        case 'exercise':
            return <BookOpen className={className} />;
        case 'audio':
            return <Music className={className} />;
        case 'interactive':
            return <BarChart2 className={className} />;
        case 'image':
            return <ImageIcon className={className} />;
        default:
            return <FileBox className={className} />;
    }
};

// Tên hiển thị cho các loại tài nguyên bằng tiếng Việt
export const getTypeDisplayName = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'document':
            return 'Tài liệu';
        case 'video':
        case 'media':
            return 'Nội dung nghe nhìn';
        case 'presentation':
            return 'Bài trình chiếu';
        case 'exercise':
            return 'Bài tập';
        case 'audio':
            return 'Âm thanh';
        case 'interactive':
            return 'Tương tác';
        case 'image':
            return 'Hình ảnh';
        default:
            return 'Không xác định';
    }
};

// Phân loại tài nguyên dựa trên phần mở rộng file
export const categorizeFileByExtension = (fileUrl: string): string => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    
    // Tài liệu văn bản
    if (['pdf', 'doc', 'docx', 'txt', 'odt', 'rtf', 'md'].includes(extension || '')) {
        return 'document';
    }
    
    // Tài liệu trình chiếu
    if (['ppt', 'pptx', 'odp', 'key'].includes(extension || '')) {
        return 'presentation';
    }
    
    // Bảng tính
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension || '')) {
        return 'exercise';
    }
    
    // Nội dung nghe nhìn (video + hình ảnh)
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension || '')) {
        return 'media';
    }
    
    // Hình ảnh (cũng thuộc loại media)
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
        return 'media';
    }
    
    // Âm thanh
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension || '')) {
        return 'audio';
    }
    
    // Tương tác
    if (['html', 'htm', 'js', 'swf', 'h5p'].includes(extension || '')) {
        return 'interactive';
    }
    
    // Mặc định là tài liệu nếu không thể phân loại
    return 'document';
};

// Hàm hiển thị nhãn độ khó
export const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case 'beginner':
            return (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-green-500" />
                    Cơ bản
                </Badge>
            );
        case 'intermediate':
            return (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Trung bình
                </Badge>
            );
        case 'advanced':
            return (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                    <BarChart className="h-3.5 w-3.5 mr-1 text-red-500" />
                    Nâng cao
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Trung bình
                </Badge>
            );
    }
};

// Style cho nhãn loại tài nguyên
export const getTypeBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
        case 'document':
            return 'bg-blue-50 text-blue-800 border-blue-200';
        case 'video':
        case 'media':
            return 'bg-purple-50 text-purple-800 border-purple-200';
        case 'presentation':
            return 'bg-orange-50 text-orange-800 border-orange-200';
        case 'exercise':
            return 'bg-green-50 text-green-800 border-green-200';
        case 'audio':
            return 'bg-pink-50 text-pink-800 border-pink-200';
        case 'interactive':
            return 'bg-indigo-50 text-indigo-800 border-indigo-200';
        case 'image':
            return 'bg-teal-50 text-teal-800 border-teal-200';
        default:
            return 'bg-slate-50 text-slate-800 border-slate-200';
    }
}; 