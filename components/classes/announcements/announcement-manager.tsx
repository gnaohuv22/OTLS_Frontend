'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, PinOff, Plus, RefreshCw } from 'lucide-react';
import { AnnouncementService, CreateCommentRequest, UpdateCommentRequest } from '@/lib/api/announcement';
import { useToast } from '@/components/ui/use-toast';
import { AnnouncementManagerProps, Announcement, AnnouncementComment } from '../types';
import { AnnouncementCard } from './announcement-card';
import { NewAnnouncementForm } from './new-announcement-form';

export function AnnouncementManager({
    classroomId,
    userData,
    role,
    formatDate,
    students,
    teacher
}: AnnouncementManagerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const { toast } = useToast();

    // Keep track of comment subscriptions for cleanup
    const commentSubscriptionsRef = useRef<{ [announcementId: string]: () => void }>({});

    // Clean up all comment subscriptions
    const cleanupCommentSubscriptions = useCallback(() => {
        Object.values(commentSubscriptionsRef.current).forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        commentSubscriptionsRef.current = {};
    }, []);

    // Subscribe to comments for a specific announcement
    const subscribeToAnnouncementComments = useCallback((announcementId: string) => {
        // Clean up existing subscription for this announcement if any
        if (commentSubscriptionsRef.current[announcementId]) {
            commentSubscriptionsRef.current[announcementId]();
        }

        // Set up new comment subscription
        const unsubscribe = AnnouncementService.subscribeToComments(
            announcementId,
            (comments: AnnouncementComment[]) => {
                setAnnouncements(prevAnnouncements => 
                    prevAnnouncements.map(announcement => 
                        announcement.id === announcementId 
                            ? { ...announcement, comments }
                            : announcement
                    )
                );
            }
        );

        // Store the unsubscribe function
        commentSubscriptionsRef.current[announcementId] = unsubscribe;
    }, []);

    // Subscribe to comments for all announcements
    const subscribeToAllComments = useCallback((announcements: Announcement[]) => {
        announcements.forEach(announcement => {
            subscribeToAnnouncementComments(announcement.id);
        });
    }, [subscribeToAnnouncementComments]);

    // Load announcements from Firebase
    // Note: You can optionally use real-time listeners by uncommenting the code below
    const loadAnnouncements = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await AnnouncementService.getAnnouncementsByClassId(classroomId, {
                sortBy: 'date',
                sortOrder: 'desc',
                limit: 50 // Load more than visible to allow "load more"
            });

            setAnnouncements(response.announcements);
            
            // Subscribe to real-time comments for all announcements
            subscribeToAllComments(response.announcements);
        } catch (error: any) {
            console.error('Lỗi khi tải thông báo:', error);

            // Check if it's a "no data" scenario vs actual error
            if (error.message?.includes('collection') || error.message?.includes('not found')) {
                // This is likely a case where the collection doesn't exist yet or no announcements
                setAnnouncements([]);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: error.message || 'Không thể tải danh sách thông báo',
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [classroomId, toast, subscribeToAllComments]);

    // Load announcements on component mount
    useEffect(() => {
        if (classroomId) {
            loadAnnouncements();
        }
    }, [classroomId, loadAnnouncements]);

    // Real-time updates for announcements
    useEffect(() => {
        if (classroomId) {
            setIsLoading(true);
            const unsubscribe = AnnouncementService.subscribeToAnnouncements(
                classroomId,
                (newAnnouncements) => {
                    setAnnouncements(newAnnouncements);
                    setIsLoading(false);
                    
                    // Clean up old comment subscriptions and set up new ones
                    cleanupCommentSubscriptions();
                    subscribeToAllComments(newAnnouncements);
                }
            );
            return unsubscribe;
        }
    }, [classroomId, cleanupCommentSubscriptions, subscribeToAllComments]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            cleanupCommentSubscriptions();
        };
    }, [cleanupCommentSubscriptions]);

    // Handle create announcement success
    const handleCreateSuccess = (newAnnouncement: Announcement) => {
        setAnnouncements([newAnnouncement, ...announcements]);
        setShowCreateForm(false);
        
        // Subscribe to comments for the new announcement
        subscribeToAnnouncementComments(newAnnouncement.id);
        
        toast({
            title: 'Thành công',
            description: 'Thông báo đã được tạo thành công',
        });
    };

    // Handle create announcement error
    const handleCreateError = (error: string) => {
        toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: error,
        });
    };

    // Handle update announcement
    const handleUpdateAnnouncement = async (updatedAnnouncement: Announcement) => {
        try {
            const updated = await AnnouncementService.updateAnnouncement({
                id: updatedAnnouncement.id,
                title: updatedAnnouncement.title,
                content: updatedAnnouncement.content,
                isImportant: updatedAnnouncement.isImportant,
                isPinned: updatedAnnouncement.isPinned
            });

            setAnnouncements(announcements.map(a =>
                a.id === updated.id ? updated : a
            ));

            toast({
                title: 'Thành công',
                description: 'Thông báo đã được cập nhật',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật thông báo',
            });
        }
    };

    // Handle delete announcement
    const handleDeleteAnnouncement = async (announcementId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            return;
        }

        try {
            await AnnouncementService.deleteAnnouncement(announcementId);
            
            // Clean up comment subscription for this announcement
            if (commentSubscriptionsRef.current[announcementId]) {
                commentSubscriptionsRef.current[announcementId]();
                delete commentSubscriptionsRef.current[announcementId];
            }
            
            setAnnouncements(announcements.filter(a => a.id !== announcementId));

            toast({
                title: 'Thành công',
                description: 'Thông báo đã được xóa',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể xóa thông báo',
            });
        }
    };

    // Handle toggle pin announcement
    const handleTogglePin = async (announcementId: string, isPinned: boolean) => {
        try {
            const updated = await AnnouncementService.togglePinAnnouncement(announcementId, isPinned);
            setAnnouncements(announcements.map(a =>
                a.id === updated.id ? updated : a
            ));

            toast({
                title: 'Thành công',
                description: isPinned ? 'Thông báo đã được ghim' : 'Thông báo đã được bỏ ghim',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật trạng thái ghim',
            });
        }
    };

    // Handle add comment - Real-time updates will handle UI updates automatically
    const handleAddComment = async (announcementId: string, comment: string, mentions?: string[], parentCommentId?: string) => {
        try {
            // Create the comment request object
            const commentRequest: CreateCommentRequest = {
                content: comment,
                authorId: userData.id,
                announcementId
            };
            
            // Only add parentCommentId if it exists
            if (parentCommentId) {
                commentRequest.parentCommentId = parentCommentId;
            }
            
            // Only add mentions if they exist and are not empty
            if (mentions && mentions.length > 0) {
                commentRequest.mentions = mentions;
            }

            // Create the comment
            await AnnouncementService.createComment(commentRequest);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể thêm bình luận',
            });
        }
    };

    // Handle update comment - Real-time updates will handle UI updates automatically
    const handleUpdateComment = async (commentId: string, content: string, mentions?: string[]) => {
        try {
            // Create the update request object
            const updateRequest: UpdateCommentRequest = {
                id: commentId,
                content
            };
            
            // Only add mentions if they exist and are not empty
            if (mentions && mentions.length > 0) {
                updateRequest.mentions = mentions;
            }

            // Update the comment
            await AnnouncementService.updateComment(updateRequest);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật bình luận',
            });
        }
    };

    // Handle delete comment - Real-time updates will handle UI updates automatically
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            return;
        }

        try {
            await AnnouncementService.deleteComment(commentId);

            // No need to manually update state here - real-time subscription will handle it
            toast({
                title: 'Thành công',
                description: 'Bình luận đã được xóa',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể xóa bình luận',
            });
        }
    };

    // Sort announcements: pinned first, then by date
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const visibleAnnouncements = sortedAnnouncements.slice(0, visibleCount);
    const hasMoreAnnouncements = sortedAnnouncements.length > visibleCount;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Thông báo</h3>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Thông báo</h3>
                    <p className="text-sm text-muted-foreground">
                        {announcements.length} thông báo
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadAnnouncements}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    {role === 'Teacher' && (
                        <Button
                            size="sm"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo thông báo
                        </Button>
                    )}
                </div>
            </div>

            {/* Create announcement form */}
            {showCreateForm && role === 'Teacher' && (
                <NewAnnouncementForm
                    classroomId={classroomId}
                    userData={userData}
                    onCreateSuccess={handleCreateSuccess}
                    onCreateError={handleCreateError}
                />
            )}

            {/* Announcements list */}
            {announcements.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <h4 className="text-lg font-medium mb-2">Chưa có thông báo</h4>
                        <p className="text-muted-foreground mb-4">
                            {role === 'Teacher'
                                ? 'Hãy tạo thông báo đầu tiên cho lớp học của bạn'
                                : 'Chưa có thông báo nào từ giáo viên'
                            }
                        </p>
                        {role === 'Teacher' && (
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo thông báo đầu tiên
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {visibleAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="relative">
                            {announcement.isPinned && (
                                <div className="absolute -top-2 -right-2 z-10">
                                    <Badge variant="secondary" className="gap-1">
                                        <Pin className="h-3 w-3" />
                                        Đã ghim
                                    </Badge>
                                </div>
                            )}
                            <AnnouncementCard
                                announcement={announcement}
                                role={role}
                                userData={userData}
                                formatDate={formatDate}
                                onUpdate={handleUpdateAnnouncement}
                                onDelete={handleDeleteAnnouncement}
                                onAddComment={handleAddComment}
                                onUpdateComment={handleUpdateComment}
                                onDeleteComment={handleDeleteComment}
                                onTogglePin={handleTogglePin}
                                students={students}
                                teacher={teacher}
                            />
                        </div>
                    ))}

                    {/* Load more button */}
                    {hasMoreAnnouncements && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount(prev => prev + 5)}
                            >
                                Xem thêm thông báo
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 