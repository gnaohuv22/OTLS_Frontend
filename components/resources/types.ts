import { SubjectDTO } from '@/lib/api/resource';

// Resource data interface
export interface Resource {
    id: string;
    title: string;
    description: string;
    subject: string;
    type: 'document' | 'media' | 'presentation' | 'exercise' | 'audio' | 'interactive';
    typeName?: string;   // Tên hiển thị bằng tiếng Việt cho loại tài nguyên
    uploadDate: string;
    size: string;
    downloadCount: number;
    viewCount: number;
    url: string;
    previewAvailable: boolean;
    author: string;
    authorId?: string;     // ID of the author/owner
    authorName?: string;   // Name of the author/owner (from API)
    lastModified: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    thumbnail?: string;
    metaData?: string; // Raw metadata string from API
    popularity?: number; // Combined score of views and downloads for sorting
}

// Resource type option
export interface ResourceTypeOption {
    value: string;
    label: string;
}

// Difficulty level option
export interface DifficultyLevelOption {
    value: string;
    label: string;
}

// Sort options
export interface SortOption {
    value: string;
    label: string;
}

// Resource card props
export interface ResourceCardProps {
    resource: Resource;
    index: number;
    onDeleteResource?: (id: string) => Promise<void>;
    onEditResource?: (resourceData: any) => Promise<void>;
    subjects?: SubjectDTO[];
}

// Resource filter props
export interface ResourceFiltersProps {
    selectedTypes: string[];
    toggleType: (type: string) => void;
    selectedDifficulties: string[];
    toggleDifficulty: (difficulty: string) => void;
    selectedTags: string[];
    toggleTag: (tag: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    allTags: string[];
    filteredResourcesCount: number;
    resetAllFilters: () => void;
    resetFilterCategory: (category: 'type' | 'difficulty' | 'tags') => void;
    loading?: boolean;
    subjects?: string[];
    selectedSubject?: string;
    setSelectedSubject?: (subject: string) => void;
    sortOption?: string;
    setSortOption?: (option: string) => void;
}

// Resource tabs props
export interface ResourceTabsProps {
    filteredResources: Resource[];
    loading?: boolean;
    onDeleteResource?: (id: string) => Promise<void>;
    onEditResource?: (resourceData: any) => Promise<void>;
    subjects?: SubjectDTO[];
    sortOption: string;
    setSortOption: (option: string) => void;
}

// Resource list props
export interface ResourceListProps {
    resources: Resource[];
    onDeleteResource?: (id: string) => Promise<void>;
    onEditResource?: (resourceData: any) => Promise<void>;
    subjects?: SubjectDTO[];
}

// Animation variants
export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Constants
export const resourceTypes: ResourceTypeOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'document', label: 'Tài liệu' },
    { value: 'media', label: 'Nội dung nghe nhìn' },
    { value: 'presentation', label: 'Bài trình chiếu' },
    { value: 'exercise', label: 'Bài tập' },
    { value: 'audio', label: 'Âm thanh' },
    { value: 'interactive', label: 'Tương tác' }
];

export const difficultyLevels: DifficultyLevelOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
];

// Sort options
export const sortOptions: SortOption[] = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'recent', label: 'Mới nhất' },
    { value: 'alphabetical', label: 'A - Z' },
    { value: 'downloads', label: 'Lượt tải cao nhất' }
];

