import { 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Interface cho thông tin comment của thông báo
 */
export interface AnnouncementComment {
  id: string;
  content: string;
  date: string;
  author: string;
  authorRole: string;
  authorId: string;
  announcementId: string;
  parentCommentId?: string; // For nested comments/replies
  mentions?: string[]; // Array of user IDs that are mentioned
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho thông tin thông báo 
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
  author: string;
  authorRole: string;
  authorId: string;
  classroomId: string;
  comments: AnnouncementComment[];
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho Firebase document structures
 */
interface FirebaseAnnouncement {
  id?: string;
  title: string;
  content: string;
  isImportant: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  classroomId: string;
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirebaseComment {
  id?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  announcementId: string;
  parentCommentId?: string;
  mentions?: string[];
  isEdited: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface cho request tạo thông báo mới
 */
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  isImportant: boolean;
  authorId: string;
  classroomId: string;
  isPinned?: boolean;
}

/**
 * Interface cho request cập nhật thông báo
 */
export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  isImportant?: boolean;
  isPinned?: boolean;
}

/**
 * Interface cho request tạo comment
 */
export interface CreateCommentRequest {
  content: string;
  authorId: string;
  announcementId: string;
  parentCommentId?: string;
  mentions?: string[]; // Array of user IDs to mention
}

/**
 * Interface cho request cập nhật comment
 */
export interface UpdateCommentRequest {
  id: string;
  content: string;
  mentions?: string[];
}

/**
 * Interface cho response của API lấy danh sách thông báo
 */
export interface AnnouncementsResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Interface cho tham số phân trang và lọc
 */
export interface GetAnnouncementsParams {
  page?: number;
  limit?: number;
  classroomId?: string;
  authorId?: string;
  isImportant?: boolean;
  isPinned?: boolean;
  search?: string;
  sortBy?: 'date' | 'importance' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Helper function to get user data from auth context or other sources
 */
const getUserData = (authorId: string) => {
  try {
    // Try to get user data from localStorage first
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get role from localStorage (stored as 'roleName')
    const roleFromStorage = localStorage.getItem('roleName');
    
    // Debug logging
    console.log('getUserData - userData:', userData);
    console.log('getUserData - roleFromStorage:', roleFromStorage);
    console.log('getUserData - authorId:', authorId);
    
    // If we have user data and the authorId matches, use it
    if (userData.userID === authorId) {
      const finalRole = roleFromStorage || userData.roleName || userData.role || 'Student';
      console.log('getUserData - finalRole:', finalRole);
      return {
        name: userData.fullName || userData.name || 'Người dùng',
        role: finalRole
      };
    }
    
    // Fallback: try to get role from cookies
    const roleFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('role='))
      ?.split('=')[1];
    
    const fallbackRole = roleFromCookie || roleFromStorage || userData.roleName || userData.role || 'Student';
    console.log('getUserData - fallbackRole:', fallbackRole);
    
    return {
      name: userData.fullName || userData.name || 'Người dùng',
      role: fallbackRole
    };
  } catch (error) {
    console.warn('Không thể lấy thông tin người dùng từ localStorage:', error);
    return {
      name: 'Người dùng',
      role: 'Student'
    };
  }
};

/**
 * Announcement Service - Unified Firebase service for announcements
 */
export class AnnouncementService {
  
  /**
   * Subscribe to real-time announcements for a classroom
   */
  static subscribeToAnnouncements(
    classroomId: string, 
    callback: (announcements: Announcement[]) => void
  ): () => void {
    const q = query(
      collection(db, 'announcements'),
      where('classroomId', '==', classroomId),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const announcements: Announcement[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as FirebaseAnnouncement;
        const announcement: Announcement = {
          id: doc.id,
          title: data.title,
          content: data.content,
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          isImportant: data.isImportant,
          author: data.authorName,
          authorRole: data.authorRole,
          authorId: data.authorId,
          classroomId: data.classroomId,
          comments: [], // Comments will be loaded separately
          isPinned: data.isPinned,
          isEdited: data.isEdited,
          editedAt: data.editedAt?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };
        announcements.push(announcement);
      });
      
      callback(announcements);
    });
  }

  /**
   * Subscribe to real-time comments for an announcement
   */
  static subscribeToComments(
    announcementId: string,
    callback: (comments: AnnouncementComment[]) => void
  ): () => void {
    const q = query(
      collection(db, 'comments'),
      where('announcementId', '==', announcementId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments: AnnouncementComment[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as FirebaseComment;
        const comment: AnnouncementComment = {
          id: doc.id,
          content: data.content,
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          author: data.authorName,
          authorRole: data.authorRole,
          authorId: data.authorId,
          announcementId: data.announcementId,
          parentCommentId: data.parentCommentId,
          mentions: data.mentions,
          isEdited: data.isEdited,
          editedAt: data.editedAt?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };
        comments.push(comment);
      });
      
      callback(comments);
    });
  }

  /**
   * Lấy tất cả thông báo (có phân trang và lọc) từ Firebase
   */
  static async getAllAnnouncements(params: GetAnnouncementsParams = {}): Promise<AnnouncementsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        classroomId,
        authorId,
        isImportant,
        isPinned,
        search,
        sortBy = 'date',
        sortOrder = 'desc'
      } = params;

      let q = collection(db, 'announcements');
      const constraints: any[] = [];

      // Add filters
      if (classroomId) {
        constraints.push(where('classroomId', '==', classroomId));
      }
      if (authorId) {
        constraints.push(where('authorId', '==', authorId));
      }
      if (isImportant !== undefined) {
        constraints.push(where('isImportant', '==', isImportant));
      }
      if (isPinned !== undefined) {
        constraints.push(where('isPinned', '==', isPinned));
      }

      // Add sorting
      if (sortBy === 'date') {
        constraints.push(orderBy('isPinned', 'desc')); // Always show pinned first
        constraints.push(orderBy('createdAt', sortOrder));
      } else if (sortBy === 'importance') {
        constraints.push(orderBy('isImportant', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (sortBy === 'title') {
        constraints.push(orderBy('title', sortOrder));
      }

      // Add limit
      constraints.push(firestoreLimit(limit));

      const firestoreQuery = query(q, ...constraints);
      const querySnapshot = await getDocs(firestoreQuery);

      const announcements: Announcement[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Get comments for this announcement
        const commentsQuery = query(
          collection(db, 'comments'),
          where('announcementId', '==', docSnapshot.id),
          orderBy('createdAt', 'asc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const comments: AnnouncementComment[] = commentsSnapshot.docs.map(commentDoc => {
          const commentData = commentDoc.data();
          return {
            id: commentDoc.id,
            content: commentData.content,
            date: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
            author: commentData.authorName,
            authorRole: commentData.authorRole,
            authorId: commentData.authorId,
            announcementId: commentData.announcementId,
            parentCommentId: commentData.parentCommentId,
            mentions: commentData.mentions,
            isEdited: commentData.isEdited,
            editedAt: commentData.editedAt?.toDate().toISOString(),
            createdAt: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: commentData.updatedAt?.toDate().toISOString() || new Date().toISOString()
          };
        });

        const announcement: Announcement = {
          id: docSnapshot.id,
          title: data.title,
          content: data.content,
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          isImportant: data.isImportant,
          author: data.authorName,
          authorRole: data.authorRole,
          authorId: data.authorId,
          classroomId: data.classroomId,
          comments,
          isPinned: data.isPinned,
          isEdited: data.isEdited,
          editedAt: data.editedAt?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };

        // Apply search filter if provided
        if (search) {
          const searchLower = search.toLowerCase();
          if (
            announcement.title.toLowerCase().includes(searchLower) ||
            announcement.content.toLowerCase().includes(searchLower) ||
            announcement.author.toLowerCase().includes(searchLower)
          ) {
            announcements.push(announcement);
          }
        } else {
          announcements.push(announcement);
        }
      }

      // Calculate pagination info
      const total = announcements.length; // This is simplified - in production you'd need a separate count query
      const hasMore = announcements.length === limit;

      return {
        announcements,
        total,
        page,
        limit,
        hasMore
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách thông báo từ Firebase:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách thông báo');
    }
  }

  /**
   * Lấy thông báo theo ID từ Firebase
   */
  static async getAnnouncementById(announcementId: string): Promise<Announcement> {
    try {
      if (!announcementId) {
        throw new Error('ID thông báo không được để trống');
      }

      const docRef = doc(db, 'announcements', announcementId);
      const docSnapshot = await getDocs(query(collection(db, 'announcements'), where('__name__', '==', announcementId)));
      
      if (docSnapshot.empty) {
        throw new Error('Không tìm thấy thông báo');
      }

      const data = docSnapshot.docs[0].data();
      
      // Get comments for this announcement
      const commentsQuery = query(
        collection(db, 'comments'),
        where('announcementId', '==', announcementId),
        orderBy('createdAt', 'asc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const comments: AnnouncementComment[] = commentsSnapshot.docs.map(commentDoc => {
        const commentData = commentDoc.data();
        return {
          id: commentDoc.id,
          content: commentData.content,
          date: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
          author: commentData.authorName,
          authorRole: commentData.authorRole,
          authorId: commentData.authorId,
          announcementId: commentData.announcementId,
          parentCommentId: commentData.parentCommentId,
          mentions: commentData.mentions,
          isEdited: commentData.isEdited,
          editedAt: commentData.editedAt?.toDate().toISOString(),
          createdAt: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: commentData.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };
      });

      return {
        id: docSnapshot.docs[0].id,
        title: data.title,
        content: data.content,
        date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        isImportant: data.isImportant,
        author: data.authorName,
        authorRole: data.authorRole,
        authorId: data.authorId,
        classroomId: data.classroomId,
        comments,
        isPinned: data.isPinned,
        isEdited: data.isEdited,
        editedAt: data.editedAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy thông báo từ Firebase:', error);
      throw new Error(error.message || 'Lỗi khi lấy thông báo');
    }
  }

  /**
   * Lấy thông báo theo ID lớp học từ Firebase
   */
  static async getAnnouncementsByClassId(classroomId: string, params: Omit<GetAnnouncementsParams, 'classroomId'> = {}): Promise<AnnouncementsResponse> {
    try {
      if (!classroomId) {
        throw new Error('ID lớp học không được để trống');
      }

      return this.getAllAnnouncements({ ...params, classroomId });
    } catch (error: any) {
      console.error('Lỗi khi lấy thông báo theo lớp học từ Firebase:', error);
      throw new Error(error.message || 'Lỗi khi lấy thông báo theo lớp học');
    }
  }

  /**
   * Lấy thông báo theo ID tác giả từ Firebase
   */
  static async getAnnouncementsByAuthorId(authorId: string, params: Omit<GetAnnouncementsParams, 'authorId'> = {}): Promise<AnnouncementsResponse> {
    try {
      if (!authorId) {
        throw new Error('ID tác giả không được để trống');
      }

      return this.getAllAnnouncements({ ...params, authorId });
    } catch (error: any) {
      console.error('Lỗi khi lấy thông báo theo tác giả từ Firebase:', error);
      throw new Error(error.message || 'Lỗi khi lấy thông báo theo tác giả');
    }
  }

  /**
   * Tạo thông báo mới trong Firebase
   */
  static async createAnnouncement(announcementData: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      // Validate dữ liệu đầu vào
      if (!announcementData.title?.trim()) {
        throw new Error('Tiêu đề thông báo không được để trống');
      }
      
      if (!announcementData.content?.trim()) {
        throw new Error('Nội dung thông báo không được để trống');
      }
      
      if (!announcementData.authorId) {
        throw new Error('ID tác giả không được để trống');
      }
      
      if (!announcementData.classroomId) {
        throw new Error('ID lớp học không được để trống');
      }

      // Get user data
      const userData = getUserData(announcementData.authorId);

      // Create announcement in Firebase directly
      const now = serverTimestamp();
      
      const firebaseAnnouncement: Omit<FirebaseAnnouncement, 'id'> = {
        title: announcementData.title.trim(),
        content: announcementData.content.trim(),
        isImportant: announcementData.isImportant,
        authorId: announcementData.authorId,
        authorName: userData.name,
        authorRole: userData.role,
        classroomId: announcementData.classroomId,
        isPinned: announcementData.isPinned || false,
        isEdited: false,
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp
      };

      const docRef = await addDoc(collection(db, 'announcements'), firebaseAnnouncement);

      // Return the created announcement
      return this.getAnnouncementById(docRef.id);
    } catch (error: any) {
      console.error('Lỗi khi tạo thông báo trong Firebase:', error);
      throw new Error(error.message || 'Lỗi khi tạo thông báo');
    }
  }

  /**
   * Cập nhật thông báo trong Firebase
   */
  static async updateAnnouncement(updateData: UpdateAnnouncementRequest): Promise<Announcement> {
    try {
      if (!updateData.id) {
        throw new Error('ID thông báo không được để trống');
      }

      // Validate dữ liệu nếu có
      if (updateData.title !== undefined && !updateData.title.trim()) {
        throw new Error('Tiêu đề thông báo không được để trống');
      }
      
      if (updateData.content !== undefined && !updateData.content.trim()) {
        throw new Error('Nội dung thông báo không được để trống');
      }

      // Update in Firebase directly
      const docRef = doc(db, 'announcements', updateData.id);
      await updateDoc(docRef, {
        ...updateData,
        isEdited: true,
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Return the updated announcement
      return this.getAnnouncementById(updateData.id);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông báo trong Firebase:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật thông báo');
    }
  }

  /**
   * Xóa thông báo khỏi Firebase
   */
  static async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      if (!announcementId) {
        throw new Error('ID thông báo không được để trống');
      }

      // First delete all comments for this announcement
      const commentsQuery = query(
        collection(db, 'comments'),
        where('announcementId', '==', announcementId)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const deletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the announcement
      const docRef = doc(db, 'announcements', announcementId);
      await deleteDoc(docRef);
      
      return true;
    } catch (error: any) {
      console.error('Lỗi khi xóa thông báo khỏi Firebase:', error);
      throw new Error(error.message || 'Lỗi khi xóa thông báo');
    }
  }

  /**
   * Lấy comments của thông báo từ Firebase
   */
  static async getCommentsByAnnouncementId(announcementId: string, page = 1, limit = 20): Promise<{ comments: AnnouncementComment[], total: number, hasMore: boolean }> {
    try {
      if (!announcementId) {
        throw new Error('ID thông báo không được để trống');
      }

      const commentsQuery = query(
        collection(db, 'comments'),
        where('announcementId', '==', announcementId),
        orderBy('createdAt', 'asc'),
        firestoreLimit(limit)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const comments: AnnouncementComment[] = commentsSnapshot.docs.map(commentDoc => {
        const commentData = commentDoc.data();
        return {
          id: commentDoc.id,
          content: commentData.content,
          date: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
          author: commentData.authorName,
          authorRole: commentData.authorRole,
          authorId: commentData.authorId,
          announcementId: commentData.announcementId,
          parentCommentId: commentData.parentCommentId,
          mentions: commentData.mentions,
          isEdited: commentData.isEdited,
          editedAt: commentData.editedAt?.toDate().toISOString(),
          createdAt: commentData.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: commentData.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };
      });

      return {
        comments,
        total: comments.length,
        hasMore: comments.length === limit
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy bình luận từ Firebase:', error);
      throw new Error(error.message || 'Lỗi khi lấy bình luận');
    }
  }

  /**
   * Tạo comment mới trong Firebase
   */
  static async createComment(commentData: CreateCommentRequest): Promise<AnnouncementComment> {
    try {
      // Validate dữ liệu đầu vào
      if (!commentData.content?.trim()) {
        throw new Error('Nội dung bình luận không được để trống');
      }
      
      if (!commentData.authorId) {
        throw new Error('ID tác giả không được để trống');
      }
      
      if (!commentData.announcementId) {
        throw new Error('ID thông báo không được để trống');
      }

      // Get user data
      const userData = getUserData(commentData.authorId);

      // Create comment in Firebase directly
      const now = serverTimestamp();
      
      // Build Firebase comment object, only include parentCommentId if it's not undefined
      const firebaseComment: Omit<FirebaseComment, 'id'> = {
        content: commentData.content.trim(),
        authorId: commentData.authorId,
        authorName: userData.name,
        authorRole: userData.role,
        announcementId: commentData.announcementId,
        ...(commentData.parentCommentId && { parentCommentId: commentData.parentCommentId }),
        mentions: commentData.mentions,
        isEdited: false,
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp
      };

      const docRef = await addDoc(collection(db, 'comments'), firebaseComment);

      // Get the created comment
      const commentsQuery = query(
        collection(db, 'comments'),
        where('__name__', '==', docRef.id)
      );
      const commentSnapshot = await getDocs(commentsQuery);
      
      if (commentSnapshot.empty) {
        throw new Error('Không tìm thấy bình luận vừa tạo');
      }

      const commentDoc = commentSnapshot.docs[0];
      const data = commentDoc.data();

      return {
        id: commentDoc.id,
        content: data.content,
        date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        author: data.authorName,
        authorRole: data.authorRole,
        authorId: data.authorId,
        announcementId: data.announcementId,
        parentCommentId: data.parentCommentId,
        mentions: data.mentions,
        isEdited: data.isEdited,
        editedAt: data.editedAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Lỗi khi tạo bình luận trong Firebase:', error);
      throw new Error(error.message || 'Lỗi khi tạo bình luận');
    }
  }

  /**
   * Cập nhật comment trong Firebase
   */
  static async updateComment(updateData: UpdateCommentRequest): Promise<AnnouncementComment> {
    try {
      if (!updateData.id) {
        throw new Error('ID bình luận không được để trống');
      }
      
      if (!updateData.content?.trim()) {
        throw new Error('Nội dung bình luận không được để trống');
      }

      // Update in Firebase directly
      const docRef = doc(db, 'comments', updateData.id);
      await updateDoc(docRef, {
        content: updateData.content.trim(),
        mentions: updateData.mentions,
        isEdited: true,
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get the updated comment
      const commentsQuery = query(
        collection(db, 'comments'),
        where('__name__', '==', updateData.id)
      );
      const commentSnapshot = await getDocs(commentsQuery);
      
      if (commentSnapshot.empty) {
        throw new Error('Không tìm thấy bình luận');
      }

      const commentDoc = commentSnapshot.docs[0];
      const data = commentDoc.data();

      return {
        id: commentDoc.id,
        content: data.content,
        date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        author: data.authorName,
        authorRole: data.authorRole,
        authorId: data.authorId,
        announcementId: data.announcementId,
        parentCommentId: data.parentCommentId,
        mentions: data.mentions,
        isEdited: data.isEdited,
        editedAt: data.editedAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Lỗi khi cập nhật bình luận trong Firebase:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật bình luận');
    }
  }

  /**
   * Xóa comment khỏi Firebase
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      if (!commentId) {
        throw new Error('ID bình luận không được để trống');
      }

      const docRef = doc(db, 'comments', commentId);
      await deleteDoc(docRef);
      return true;
    } catch (error: any) {
      console.error('Lỗi khi xóa bình luận khỏi Firebase:', error);
      throw new Error(error.message || 'Lỗi khi xóa bình luận');
    }
  }

  /**
   * Pin/Unpin thông báo trong Firebase
   */
  static async togglePinAnnouncement(announcementId: string, isPinned: boolean): Promise<Announcement> {
    try {
      if (!announcementId) {
        throw new Error('ID thông báo không được để trống');
      }

      const docRef = doc(db, 'announcements', announcementId);
      await updateDoc(docRef, {
        isPinned,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated announcement
      return this.getAnnouncementById(announcementId);
    } catch (error: any) {
      console.error('Lỗi khi ghim/bỏ ghim thông báo trong Firebase:', error);
      throw new Error(error.message || 'Lỗi khi ghim/bỏ ghim thông báo');
    }
  }
} 