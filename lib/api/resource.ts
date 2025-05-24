import { api } from './client';
import { ApiResponse } from './auth';

/**
 * Resource User DTO interface
 */
export interface ResourceUserDTO {
  userID: string;
  userName: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  avatar: string | null;
  roleName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resource interface
 */
export interface ResourceDTO {
  resourceId: string;
  title: string;
  description: string;
  resourceType: string;
  resourceUrl: string;
  owner: string;
  metaData: string;
  resourceSize: number;
  thumbnailUrl: string;
  status: string;
  difficultyLevel: string;
  userDTO: ResourceUserDTO | null;
  subjectDTO?: SubjectDTO | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subject interface
 */
export interface SubjectDTO {
  subjectId: string;
  subjectName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response meta information for pagination
 */
export interface ResponseMeta {
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Resource upload request interface
 */
export interface ResourceUploadRequest {
  title: string;
  description: string;
  owner: string;
  metaData: string;
  resourceFile: File;
  thumbnailFile: File;
  difficultyLevel: string;
  subjectId: string;
}

/**
 * Resource edit request interface
 */
export interface ResourceEditRequest {
  resourceId: string;
  title?: string;
  description?: string;
  owner?: string;
  metaData?: string;
  resourceFile?: File;
  thumbnailFile?: File;
  difficultyLevel?: string;
  subjectId?: string;
}

/**
 * ResourceService - Service to manage resource-related API calls
 */
export const ResourceService = {
  /**
   * Get all resources
   * @returns Promise with resources data
   */
  getAllResources: async (): Promise<ResourceDTO[]> => {
    try {
      const response = await api.get<ApiResponse<ResourceDTO[]>>('/resource/all-resources');
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to fetch resources');
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      throw new Error(error.message || 'Failed to fetch resources');
    }
  },

  /**
   * Add a new resource
   * @param resourceData Resource data to upload
   * @returns Promise with the created resource data
   */
  addResource: async (resourceData: ResourceUploadRequest): Promise<ResourceDTO> => {
    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append('title', resourceData.title);
      formData.append('description', resourceData.description);
      formData.append('owner', resourceData.owner);
      formData.append('metaData', resourceData.metaData);
      formData.append('resourceFile', resourceData.resourceFile);
      formData.append('thumbnailFile', resourceData.thumbnailFile);
      formData.append('difficultyLevel', resourceData.difficultyLevel);
      formData.append('subjectId', resourceData.subjectId);

      const response = await api.post<ApiResponse<ResourceDTO>>(
        '/resource/add-resource',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data?.message || 'Failed to add resource');
    } catch (error: any) {
      console.error('Error adding resource:', error);
      throw new Error(error.message || 'Failed to add resource');
    }
  },

  /**
   * Edit an existing resource
   * @param resourceData Resource data to update
   * @returns Promise with the updated resource data
   */
  editResource: async (resourceData: ResourceEditRequest): Promise<ResourceDTO> => {
    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append('resourceId', resourceData.resourceId);
      
      if (resourceData.title) formData.append('title', resourceData.title);
      if (resourceData.description) formData.append('description', resourceData.description);
      if (resourceData.owner) formData.append('owner', resourceData.owner);
      if (resourceData.metaData) formData.append('metaData', resourceData.metaData);
      if (resourceData.resourceFile) formData.append('resourceFile', resourceData.resourceFile);
      if (resourceData.thumbnailFile) formData.append('thumbnailFile', resourceData.thumbnailFile);
      if (resourceData.difficultyLevel) formData.append('difficultyLevel', resourceData.difficultyLevel);
      if (resourceData.subjectId) formData.append('subjectId', resourceData.subjectId);

      const response = await api.put<ApiResponse<ResourceDTO>>(
        '/resource/edit-resource',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data?.message || 'Failed to update resource');
    } catch (error: any) {
      console.error('Error updating resource:', error);
      throw new Error(error.message || 'Failed to update resource');
    }
  },

  /**
   * Delete a resource by ID
   * @param resourceId Resource ID to delete
   * @returns Promise with deletion result
   */
  deleteResource: async (resourceId: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/resource/delete-resource/${resourceId}`);
      
      if (response.data?.isValid) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Failed to delete resource');
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      throw new Error(error.message || 'Failed to delete resource');
    }
  },

  /**
   * Process thumbnail image by cropping
   * @param file Thumbnail image file
   * @returns Promise with processed file
   */
  processThumbnail: async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        // Only process image files
        if (!file.type.startsWith('image/')) {
          reject(new Error('Thumbnail must be an image file'));
          return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.onload = () => {
            // Determine which dimension is shorter
            const isTall = img.height > img.width;
            const targetSize = 768; // Target size for the shorter side
            
            let width, height;
            if (isTall) {
              // If image is tall (portrait), width is shorter
              width = targetSize;
              height = (img.height / img.width) * targetSize;
            } else {
              // If image is wide (landscape), height is shorter
              height = targetSize;
              width = (img.width / img.height) * targetSize;
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create image blob'));
                return;
              }
              
              // Create a new file from blob
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified
              });
              
              resolve(processedFile);
            }, file.type, 0.9); // 0.9 quality
          };
          
          img.src = e.target?.result as string;
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }
};

/**
 * SubjectService - Service to manage subject-related API calls
 */
export const SubjectService = {
  /**
   * Get all subjects
   * @returns Promise with subjects data
   */
  getAllSubjects: async (): Promise<SubjectDTO[]> => {
    try {
      const response = await api.get<ApiResponse<SubjectDTO[]>>('/subject/all-subjects');
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to fetch subjects');
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      throw new Error(error.message || 'Failed to fetch subjects');
    }
  },

  /**
   * Add a new subject
   * @param subjectName Name of the new subject
   * @returns Promise with the result
   */
  addSubject: async (subjectName: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<boolean>>(
        '/subject/add-subject',
        { SubjectName: subjectName }
      );

      if (response.data?.isValid) {
        return true;
      }

      throw new Error(response.data?.message || 'Failed to add subject');
    } catch (error: any) {
      console.error('Error adding subject:', error);
      throw new Error(error.message || 'Failed to add subject');
    }
  },

  /**
   * Delete a subject by ID
   * @param subjectId Subject ID to delete
   * @returns Promise with deletion result
   */
  deleteSubject: async (subjectId: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/subject/delete-subject/${subjectId}`);
      
      if (response.data?.isValid) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Failed to delete subject');
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      throw new Error(error.message || 'Failed to delete subject');
    }
  },

  /**
   * Edit an existing subject
   * @param subjectId Subject ID to edit
   * @param subjectName New name for the subject
   * @returns Promise with edit result
   */
  editSubject: async (subjectId: string, subjectName: string): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<boolean>>(
        '/subject/edit-subject',
        {
          subjectId,
          SubjectName: subjectName
        }
      );

      if (response.data?.isValid) {
        return true;
      }

      throw new Error(response.data?.message || 'Failed to edit subject');
    } catch (error: any) {
      console.error('Error editing subject:', error);
      throw new Error(error.message || 'Failed to edit subject');
    }
  }
};

// Utility functions for resource handling
export const ResourceUtils = {
  /**
   * Parse resource metadata from JSON string
   * @param metadataStr Metadata as a JSON string
   * @returns Parsed metadata object or empty object if parsing fails
   */
  parseMetadata: (metadataStr: string): Record<string, any> => {
    try {
      return JSON.stringify(metadataStr) ? JSON.parse(metadataStr) : {};
    } catch (e) {
      console.error('Error parsing resource metadata:', e);
      return {};
    }
  },

  /**
   * Format resource size to human-readable format
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  formatSize: (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}; 