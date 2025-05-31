'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { fadeInUp, Resource, sortOptions } from './types';
import { ResourceFilters } from './resource-filters';
import { ResourceTabs } from './resource-tabs';
import { ResourceUploadDialog } from './resource-upload-dialog';
import { ResourceDTO, ResourceService, ResourceUtils, SubjectDTO, SubjectService } from '@/lib/api/resource';
import { toast } from '@/components/ui/use-toast';
import { categorizeFileByExtension, getTypeDisplayName } from './utils';

// Hàm chuyển đổi ResourceDTO từ API thành Resource để hiển thị
const adaptResourceDTO = (dto: ResourceDTO): Resource => {
  // Phân tích metadata
  const metaData = dto.metaData || '{}';
  let parsedMetadata;
  try {
    parsedMetadata = JSON.parse(metaData);
  } catch (e) {
    parsedMetadata = {};
  }

  // Trích xuất thông tin môn học, số lượt tải và xem từ metadata
  const subject = dto.subjectDTO?.subjectName || parsedMetadata.subject;
  const downloadCount = parsedMetadata.downloadCount || 0;
  const viewCount = parsedMetadata.viewCount || 0;

  // Lấy thông tin tác giả từ userDTO nếu có, nếu không sẽ lấy từ owner
  const authorName = dto.userDTO?.fullName || undefined;
  const authorId = dto.owner || '';
  
  // Chuyển đổi kích thước file sang định dạng dễ đọc
  const size = ResourceUtils.formatSize(dto.resourceSize || 0);

  // Kiểm tra xem có thể xem trước tài liệu không dựa trên định dạng file
  const fileExtension = dto.resourceUrl?.split('.').pop()?.toLowerCase() || '';
  const previewAvailable = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension);

  // Phân loại tài liệu dựa trên phần mở rộng file nếu không có thông tin từ API
  let type: 'document' | 'media' | 'presentation' | 'exercise' | 'audio' | 'interactive' = 'document';
  if (dto.resourceType) {
    const resourceType = dto.resourceType.toLowerCase();
    if (resourceType === 'video') {
      // Chuyển đổi loại video cũ thành media
      type = 'media';
    } else if (['document', 'media', 'presentation', 'exercise', 'audio', 'interactive'].includes(resourceType)) {
      type = resourceType as 'document' | 'media' | 'presentation' | 'exercise' | 'audio' | 'interactive';
    }
  } else if (dto.resourceUrl) {
    // Tự động phân loại dựa trên phần mở rộng file nếu không có thông tin từ API
    type = categorizeFileByExtension(dto.resourceUrl) as 'document' | 'media' | 'presentation' | 'exercise' | 'audio' | 'interactive';
  }

  // Đảm bảo độ khó nằm trong danh sách cho phép
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (dto.difficultyLevel) {
    const diffLevel = dto.difficultyLevel.toLowerCase();
    if (['beginner', 'intermediate', 'advanced'].includes(diffLevel)) {
      difficulty = diffLevel as 'beginner' | 'intermediate' | 'advanced';
    }
  }

  // Tính điểm phổ biến (lượt xem + lượt tải * 2)
  const popularity = viewCount + (downloadCount * 2);

  return {
    id: dto.resourceId || '',
    title: dto.title || '',
    description: dto.description || '',
    url: dto.resourceUrl || '',
    type,
    typeName: getTypeDisplayName(type), // Thêm tên hiển thị bằng tiếng Việt
    difficulty,
    subject,
    thumbnail: dto.thumbnailUrl || '',
    author: authorId,
    authorId,
    authorName,
    uploadDate: dto.createdAt || new Date().toISOString(),
    lastModified: dto.updatedAt || dto.createdAt || new Date().toISOString(),
    size,
    downloadCount,
    viewCount,
    previewAvailable,
    metaData,
    popularity
  };
};

// Define sortResources function outside the component to avoid reference errors
const sortResources = (resources: Resource[], option: string): Resource[] => {
  switch (option) {
    case 'popular':
      // Sắp xếp theo phổ biến (views + downloads)
      return [...resources].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    case 'recent':
      // Sắp xếp theo thời gian tải lên (mới nhất lên đầu)
      return [...resources].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    case 'alphabetical':
      // Sắp xếp theo thứ tự chữ cái
      return [...resources].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    
    case 'downloads':
      // Sắp xếp theo số lượt tải
      return [...resources].sort((a, b) => b.downloadCount - a.downloadCount);
    
    default:
      return resources;
  }
};

export function Resources() {
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [sortOption, setSortOption] = useState('popular');
  const { role, user } = useAuth();

  // Tải tài nguyên và môn học khi component được tạo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Tải môn học trước để đảm bảo chúng vẫn có sẵn ngay cả khi tải tài nguyên thất bại
        const subjectsData = await SubjectService.getAllSubjects();
        setSubjects(subjectsData);
        
        try {
          // Tải tài nguyên riêng biệt để nếu nó thất bại, chúng ta vẫn có môn học
          const resourcesData = await ResourceService.getAllResources();
          // Chuyển đổi ResourceDTO sang Resource để sử dụng trong components
          const adaptedResources = resourcesData.map(dto => {
            const resource = adaptResourceDTO(dto);
            
            // Nếu người dùng hiện tại là tác giả, sử dụng tên của họ
            if (user && resource.authorId === user.userID) {
              resource.authorName = user.fullName || resource.authorName;
            }
            
            return resource;
          });
          setResources(adaptedResources);
        } catch (resourceError) {
          toast({
            title: 'Lưu ý',
            description: 'Không thể tải danh sách tài nguyên. Bạn vẫn có thể tải lên tài nguyên mới.',
            variant: 'destructive'
          });
          // Đặt mảng tài nguyên trống nếu tải thất bại
          setResources([]);
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
        // Đặt mảng trống cho cả tài nguyên và môn học nếu mọi thứ đều thất bại
        setResources([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Get all unique tags from resources by extracting them from metadata
  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    resources.forEach(resource => {
      const metadata = ResourceUtils.parseMetadata(resource.metaData || '{}');
      const tags = metadata.tags || [];
      if (Array.isArray(tags)) {
        tags.forEach(tag => uniqueTags.add(tag));
      } else if (typeof tags === 'string') {
        uniqueTags.add(tags);
      }
    });
    return Array.from(uniqueTags);
  }, [resources]);

  // Filter resources
  const filteredResources = useMemo(() => {
    // Lọc tài nguyên theo các bộ lọc đã chọn
    const filtered = resources.filter(resource => {
      // Parse metadata to get tags
      const metadata = ResourceUtils.parseMetadata(resource.metaData || '{}');
      const resourceTags = Array.isArray(metadata.tags) ? metadata.tags : 
                           typeof metadata.tags === 'string' ? [metadata.tags] : [];
      
      // Subject filter (one only)
      const matchesSubject = selectedSubject === 'Tất cả' || resource.subject === selectedSubject;
      
      // Type filter (multiple allowed - OR logic)
      const matchesType = 
        selectedTypes.length === 0 || 
        selectedTypes.some(type => resource.type === type);
      
      // Difficulty filter (multiple allowed - OR logic)
      const matchesDifficulty = 
        selectedDifficulties.length === 0 || 
        selectedDifficulties.some(diff => resource.difficulty === diff);
      
      // Search query (title or description)
      const matchesSearch =
        searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tags filter (multiple allowed - OR logic)
      const matchesTags =
        selectedTags.length === 0 || 
        selectedTags.some(tag => resourceTags.includes(tag));

      // All filter types must match (AND logic between filter categories)
      return matchesSubject && matchesType && matchesDifficulty && matchesSearch && matchesTags;
    });

    // Sắp xếp tài nguyên theo tùy chọn đã chọn
    return sortResources(filtered, sortOption);
  }, [resources, selectedSubject, selectedTypes, selectedDifficulties, searchQuery, selectedTags, sortOption]);

  // Toggle type selection
  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  // Toggle difficulty selection
  const toggleDifficulty = useCallback((difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  }, []);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSelectedSubject('Tất cả');
    setSelectedTypes([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSearchQuery('');
    setSortOption('popular');
  }, []);

  // Reset specific filter category
  const resetFilterCategory = useCallback((category: 'type' | 'difficulty' | 'tags') => {
    switch (category) {
      case 'type':
        setSelectedTypes([]);
        break;
      case 'difficulty':
        setSelectedDifficulties([]);
        break;
      case 'tags':
        setSelectedTags([]);
        break;
    }
  }, []);

  // Handle resource upload
  const handleResourceUpload = useCallback(async (resourceData: any) => {
    try {
      // Create metadata with just viewCount and downloadCount
      const metadata = JSON.stringify({
        viewCount: 0,
        downloadCount: 0
      });
      
      // Process thumbnail file if provided - resize to maintain aspect ratio with max dimensions
      let thumbnailFile = resourceData.thumbnailFile;
      if (thumbnailFile) {
        try {
          thumbnailFile = await ResourceService.processThumbnail(thumbnailFile);
        } catch (error) {
          console.error('Error processing thumbnail:', error);
          toast({
            title: 'Cảnh báo',
            description: 'Không thể xử lý hình thu nhỏ. Sử dụng hình ảnh gốc.',
            variant: 'default'
          });
        }
      }
      
      // Create upload request with all required fields
      const uploadRequest = {
        title: resourceData.title,
        description: resourceData.description || '',
        owner: user?.userID || '', // Get user ID from auth context
        metaData: metadata,
        resourceFile: resourceData.file, // Pass the file directly to API without additional processing
        thumbnailFile: thumbnailFile, // Processed thumbnail
        difficultyLevel: resourceData.difficulty || 'Intermediate',
        subjectId: resourceData.subjectId || '' // Ensure subjectId is passed properly
      };
      
      // Send request to API
      const newResource = await ResourceService.addResource(uploadRequest);
      
      // Add new resource to list
      const adaptedResource = adaptResourceDTO(newResource);
      
      // Ensure the author name is set to current user if it's the same author ID
      if (user && adaptedResource.authorId === user.userID) {
        adaptedResource.authorName = user.fullName || adaptedResource.authorName;
      }
      
      setResources(prev => [adaptedResource, ...prev]);
      
      toast({
        title: 'Thành công',
        description: 'Tải lên tài nguyên thành công!',
        variant: 'default'
      });
      
    } catch (error: any) {
      console.error('Lỗi khi tải lên tài nguyên:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải lên tài nguyên. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Handle resource deletion
  const handleDeleteResource = useCallback(async (resourceId: string) => {
    try {
      await ResourceService.deleteResource(resourceId);
      
      // Remove resource from list
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa tài nguyên!',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Lỗi khi xóa tài nguyên:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa tài nguyên. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  }, []);

  // Handle resource editing
  const handleEditResource = useCallback(async (resourceData: any) => {
    try {
      // Find the existing resource to get its metadata
      const resource = resources.find(r => r.id === resourceData.resourceId);
      if (!resource) {
        throw new Error('Không tìm thấy tài nguyên');
      }
      
      // Parse existing metadata to preserve viewCount and downloadCount
      const currentMetadata = ResourceUtils.parseMetadata(resource.metaData || '{}');
      
      // Update resource in the API
      const updateRequest = {
        resourceId: resourceData.resourceId,
        title: resourceData.title,
        description: resourceData.description,
        difficultyLevel: resourceData.difficultyLevel,
        thumbnailFile: resourceData.thumbnailFile,
        subjectId: resourceData.subjectId, // Ensure subjectId is properly passed
        owner: resourceData.owner,
        metaData: JSON.stringify(currentMetadata) // Preserve the existing metadata
      };
      
      const updatedResource = await ResourceService.editResource(updateRequest);
      
      // Update resource in state
      const adaptedResource = adaptResourceDTO(updatedResource);
      
      // Ensure the author name is set to current user if it's the same author ID
      if (user && adaptedResource.authorId === user.userID) {
        adaptedResource.authorName = user.fullName || adaptedResource.authorName;
      }
      
      setResources(prev => 
        prev.map(r => r.id === adaptedResource.id ? adaptedResource : r)
      );
      
      toast({
        title: 'Thành công',
        description: 'Cập nhật tài nguyên thành công!',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Lỗi khi cập nhật tài nguyên:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Cập nhật tài nguyên thất bại. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  }, [resources, user]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUp}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Tài nguyên học tập</h1>
          
          {/* Only show upload button for Teacher role */}
          {role === 'Teacher' && (
            <ResourceUploadDialog 
              onUpload={handleResourceUpload} 
              subjects={subjects}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters column - takes up 1/4 of the space on large screens */}
          <div className="lg:col-span-1">
            <ResourceFilters
              subjects={subjects.map(s => s.subjectName)}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              selectedDifficulties={selectedDifficulties}
              toggleDifficulty={toggleDifficulty}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              allTags={allTags}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              filteredResourcesCount={filteredResources.length}
              resetAllFilters={resetAllFilters}
              resetFilterCategory={resetFilterCategory}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>
          
          {/* Content column - takes up 3/4 of the space on large screens */}
          <div className="lg:col-span-3">
            <ResourceTabs
              filteredResources={filteredResources}
              loading={loading}
              onDeleteResource={handleDeleteResource}
              onEditResource={handleEditResource}
              subjects={subjects}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 