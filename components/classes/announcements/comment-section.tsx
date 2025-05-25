'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Send, MoreVertical, Pencil, Trash2, Reply } from 'lucide-react';
import { CommentSectionProps, AnnouncementComment } from '../types';
import { UserMention } from './user-mention';

export function CommentSection({ 
  announcementId,
  comments, 
  userData,
  formatDate, 
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  students,
  teacher
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // User mention states
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<{id: string, name: string}[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Edit mention states
  const [editShowMentions, setEditShowMentions] = useState(false);
  const [editMentionSearch, setEditMentionSearch] = useState('');
  const [editMentionedUsers, setEditMentionedUsers] = useState<{id: string, name: string}[]>([]);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Reply mention states
  const [replyShowMentions, setReplyShowMentions] = useState(false);
  const [replyMentionSearch, setReplyMentionSearch] = useState('');
  const [replyMentionedUsers, setReplyMentionedUsers] = useState<{id: string, name: string}[]>([]);
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle text change and mention detection
  const handleTextChange = (
    text: string, 
    setText: (text: string) => void,
    setShowMentions: (show: boolean) => void,
    setMentionSearch: (search: string) => void,
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    setText(text);
    
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const beforeCursor = text.substring(0, cursorPos);
      const atMatch = beforeCursor.match(/@([^@\s]*)$/);
      
      if (atMatch) {
        setShowMentions(true);
        setMentionSearch(atMatch[1]);
      } else {
        setShowMentions(false);
        setMentionSearch('');
      }
    }
  };

  // Handle mention selection
  const handleMentionSelect = (
    userId: string, 
    userName: string,
    text: string,
    setText: (text: string) => void,
    setShowMentions: (show: boolean) => void,
    setMentionedUsers: (users: {id: string, name: string}[]) => void,
    mentionedUsers: {id: string, name: string}[],
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const beforeCursor = text.substring(0, cursorPos);
      const afterCursor = text.substring(cursorPos);
      
      // Find the @ symbol position
      const atPos = beforeCursor.lastIndexOf('@');
      if (atPos !== -1) {
        const newText = beforeCursor.substring(0, atPos) + `@${userName} ` + afterCursor;
        setText(newText);
        
        // Add to mentioned users if not already mentioned
        if (!mentionedUsers.find(u => u.id === userId)) {
          setMentionedUsers([...mentionedUsers, { id: userId, name: userName }]);
        }
        
        setShowMentions(false);
        
        // Focus back and set cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = atPos + userName.length + 2; // @ + name + space
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    }
  };

  const handleSubmit = () => {
    if (commentText.trim()) {
      const mentions = mentionedUsers.map(user => user.id);
      onAddComment(announcementId, commentText.trim(), mentions.length > 0 ? mentions : undefined);
      setCommentText('');
      setMentionedUsers([]);
      setIsActive(false);
    }
  };

  const handleReply = (parentCommentId: string) => {
    if (replyText.trim()) {
      const mentions = replyMentionedUsers.map(user => user.id);
      
      // For our simplified system, always use the original parent ID
      // Find the original parent comment
      const parentComment = comments.find(c => c.id === parentCommentId);
      const originalParentId = parentComment?.parentCommentId || parentCommentId;
      
      // Create comment with proper parent ID for simplified Facebook-style threading
      onAddComment(
        announcementId, 
        replyText.trim(), 
        mentions.length > 0 ? mentions : undefined,
        originalParentId // This ensures replies to child comments still go under the original parent
      );
      setReplyText('');
      setReplyMentionedUsers([]);
      setReplyingToId(null);
    }
  };

  const handleStartEdit = (comment: AnnouncementComment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
    // Initialize mentioned users from existing mentions
    if (comment.mentions && comment.mentions.length > 0) {
      const existingMentions = comment.mentions
        .map(mentionId => {
          // Check if it's a student
          const student = students.find(s => s.id === mentionId);
          if (student) {
            return { id: student.id, name: student.name };
          }
          
          // Check if it's the teacher
          if (teacher && teacher.id === mentionId) {
            return { id: teacher.id, name: teacher.name };
          }
          
          return null;
        })
        .filter(Boolean) as {id: string, name: string}[];
      setEditMentionedUsers(existingMentions);
    }
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editingText.trim()) {
      const mentions = editMentionedUsers.map(user => user.id);
      onUpdateComment(editingCommentId, editingText.trim(), mentions.length > 0 ? mentions : undefined);
      setEditingCommentId(null);
      setEditingText('');
      setEditMentionedUsers([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
    setEditMentionedUsers([]);
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      onDeleteComment(commentId);
    }
  };

  const canEditComment = (comment: AnnouncementComment) => {
    return comment.authorId === userData.id;
  };

  const canDeleteComment = (comment: AnnouncementComment) => {
    return comment.authorId === userData.id || userData.role === 'Teacher';
  };

  // Sort comments by date (oldest first for better conversation flow)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Organize comments into parent-child structure (Facebook style)
  const organizeComments = (comments: AnnouncementComment[]) => {
    const parentComments: AnnouncementComment[] = [];
    const childComments: { [parentId: string]: AnnouncementComment[] } = {};

    // First pass: separate parent and child comments
    comments.forEach(comment => {
      if (!comment.parentCommentId) {
        // This is a parent comment
        parentComments.push(comment);
      } else {
        // This is a child comment - in our simplified system, all replies go under the original parent
        // Find the original parent (not immediate parent which might be another child)
        let originalParentId = comment.parentCommentId;
        const parentComment = comments.find(c => c.id === comment.parentCommentId);
        
        // If the parent is also a child comment, find its parent (the original parent)
        if (parentComment && parentComment.parentCommentId) {
          originalParentId = parentComment.parentCommentId;
        }
        
        if (!childComments[originalParentId]) {
          childComments[originalParentId] = [];
        }
        childComments[originalParentId].push(comment);
      }
    });

    // Sort parent comments by date
    parentComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Sort child comments within each parent group by date
    Object.keys(childComments).forEach(parentId => {
      childComments[parentId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return { parentComments, childComments };
  };

  const { parentComments, childComments } = organizeComments(sortedComments);

  // Handle reply with auto-tagging
  const handleStartReply = (comment: AnnouncementComment) => {
    setReplyingToId(comment.id);
    
    // Auto-tag the person being replied to
    const mentionText = `@${comment.author} `;
    setReplyText(mentionText);
    
    // Add the mentioned user
    setReplyMentionedUsers([{ id: comment.authorId, name: comment.author }]);
    
    // Focus the reply textarea after state updates
    setTimeout(() => {
      if (replyTextareaRef.current) {
        replyTextareaRef.current.focus();
        // Set cursor position after the mention
        replyTextareaRef.current.setSelectionRange(mentionText.length, mentionText.length);
      }
    }, 0);
  };

  // Function to render comment content with mentions highlighted
  const renderCommentContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) {
      return <p className="text-sm mt-1 whitespace-pre-line">{content}</p>;
    }

    // Replace mentioned user IDs with highlighted names
    let processedContent = content;
    mentions.forEach(mentionId => {
      // Check if it's a student
      const student = students.find(s => s.id === mentionId);
      if (student) {
        const mentionRegex = new RegExp(`@${student.name}`, 'g');
        processedContent = processedContent.replace(
          mentionRegex, 
          `**@${student.name}**`
        );
      }
      
      // Check if it's the teacher
      if (teacher && teacher.id === mentionId) {
        const mentionRegex = new RegExp(`@${teacher.name}`, 'g');
        processedContent = processedContent.replace(
          mentionRegex, 
          `**@${teacher.name}**`
        );
      }
    });

    // Convert **text** to highlighted spans
    const parts = processedContent.split(/(\*\*.*?\*\*)/g);
    
    return (
      <p className="text-sm mt-1 whitespace-pre-line">
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const text = part.slice(2, -2);
            return (
              <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">
                {text}
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="mt-6 w-full">
      {parentComments.length > 0 && (
        <>
          <Separator className="my-4" />
          <h4 className="text-sm font-medium mb-4">
            Bình luận ({comments.length})
          </h4>
          <div className="space-y-4 w-full">
            {parentComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Parent Comment */}
                <div className="flex gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.authorRole === 'Teacher' ? 'Giáo viên' : 'Học sinh'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.date)}
                          {comment.isEdited && comment.editedAt && (
                            <span className="ml-1">(đã sửa)</span>
                          )}
                        </span>
                      </div>
                      
                      {(canEditComment(comment) || canDeleteComment(comment)) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditComment(comment) && (
                              <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                                <Pencil className="h-3 w-3 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            {canDeleteComment(comment) && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div className="mt-2 space-y-2 relative">
                        <Textarea
                          ref={editTextareaRef}
                          value={editingText}
                          onChange={(e) => handleTextChange(
                            e.target.value,
                            setEditingText,
                            setEditShowMentions,
                            setEditMentionSearch,
                            editTextareaRef
                          )}
                          className="w-full text-sm"
                          rows={2}
                          placeholder="Nhập @ để gắn thẻ người dùng..."
                        />
                        {editShowMentions && (
                          <UserMention
                            students={students}
                            teacher={teacher}
                            currentUserId={userData.id}
                            searchTerm={editMentionSearch}
                            onMention={(userId, userName) => handleMentionSelect(
                              userId,
                              userName,
                              editingText,
                              setEditingText,
                              setEditShowMentions,
                              setEditMentionedUsers,
                              editMentionedUsers,
                              editTextareaRef
                            )}
                          />
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Lưu
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderCommentContent(comment.content, comment.mentions)}
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => handleStartReply(comment)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Trả lời
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Reply form for parent comment */}
                    {replyingToId === comment.id && (
                      <div className="mt-3 space-y-2 relative">
                        <Textarea
                          ref={replyTextareaRef}
                          placeholder={`Trả lời ${comment.author}... (Nhập @ để gắn thẻ)`}
                          value={replyText}
                          onChange={(e) => handleTextChange(
                            e.target.value,
                            setReplyText,
                            setReplyShowMentions,
                            setReplyMentionSearch,
                            replyTextareaRef
                          )}
                          className="w-full text-sm"
                          rows={2}
                        />
                        {replyShowMentions && (
                          <UserMention
                            students={students}
                            teacher={teacher}
                            currentUserId={userData.id}
                            searchTerm={replyMentionSearch}
                            onMention={(userId, userName) => handleMentionSelect(
                              userId,
                              userName,
                              replyText,
                              setReplyText,
                              setReplyShowMentions,
                              setReplyMentionedUsers,
                              replyMentionedUsers,
                              replyTextareaRef
                            )}
                          />
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Gửi
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                              setReplyMentionedUsers([]);
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Child Comments (Replies) */}
                {childComments[comment.id] && childComments[comment.id].length > 0 && (
                  <div className="ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
                    {childComments[comment.id].map((childComment) => (
                      <div key={childComment.id} className="flex gap-3 w-full">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {childComment.author.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 flex-wrap justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{childComment.author}</span>
                              <Badge variant="outline" className="text-xs">
                                {childComment.authorRole === 'Teacher' ? 'Giáo viên' : 'Học sinh'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(childComment.date)}
                                {childComment.isEdited && childComment.editedAt && (
                                  <span className="ml-1">(đã sửa)</span>
                                )}
                              </span>
                            </div>
                            
                            {(canEditComment(childComment) || canDeleteComment(childComment)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canEditComment(childComment) && (
                                    <DropdownMenuItem onClick={() => handleStartEdit(childComment)}>
                                      <Pencil className="h-3 w-3 mr-2" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteComment(childComment) && (
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteComment(childComment.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Xóa
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          
                          {editingCommentId === childComment.id ? (
                            <div className="mt-2 space-y-2 relative">
                              <Textarea
                                ref={editTextareaRef}
                                value={editingText}
                                onChange={(e) => handleTextChange(
                                  e.target.value,
                                  setEditingText,
                                  setEditShowMentions,
                                  setEditMentionSearch,
                                  editTextareaRef
                                )}
                                className="w-full text-sm"
                                rows={2}
                                placeholder="Nhập @ để gắn thẻ người dùng..."
                              />
                              {editShowMentions && (
                                <UserMention
                                  students={students}
                                  teacher={teacher}
                                  currentUserId={userData.id}
                                  searchTerm={editMentionSearch}
                                  onMention={(userId, userName) => handleMentionSelect(
                                    userId,
                                    userName,
                                    editingText,
                                    setEditingText,
                                    setEditShowMentions,
                                    setEditMentionedUsers,
                                    editMentionedUsers,
                                    editTextareaRef
                                  )}
                                />
                              )}
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEdit}>
                                  Lưu
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {renderCommentContent(childComment.content, childComment.mentions)}
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleStartReply(childComment)}
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Trả lời
                                </Button>
                              </div>
                            </>
                          )}

                          {/* Reply form for child comment */}
                          {replyingToId === childComment.id && (
                            <div className="mt-3 space-y-2 relative">
                              <Textarea
                                ref={replyTextareaRef}
                                placeholder={`Trả lời ${childComment.author}... (Nhập @ để gắn thẻ)`}
                                value={replyText}
                                onChange={(e) => handleTextChange(
                                  e.target.value,
                                  setReplyText,
                                  setReplyShowMentions,
                                  setReplyMentionSearch,
                                  replyTextareaRef
                                )}
                                className="w-full text-sm"
                                rows={2}
                              />
                              {replyShowMentions && (
                                <UserMention
                                  students={students}
                                  teacher={teacher}
                                  currentUserId={userData.id}
                                  searchTerm={replyMentionSearch}
                                  onMention={(userId, userName) => handleMentionSelect(
                                    userId,
                                    userName,
                                    replyText,
                                    setReplyText,
                                    setReplyShowMentions,
                                    setReplyMentionedUsers,
                                    replyMentionedUsers,
                                    replyTextareaRef
                                  )}
                                />
                              )}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleReply(comment.id)} // Always reply to original parent
                                  disabled={!replyText.trim()}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Gửi
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setReplyingToId(null);
                                    setReplyText('');
                                    setReplyMentionedUsers([]);
                                  }}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Main comment form */}
      {isActive ? (
        <div className="w-full space-y-2 mt-4 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Viết bình luận của bạn... (Nhập @ để gắn thẻ người dùng)"
            value={commentText}
            onChange={(e) => handleTextChange(
              e.target.value,
              setCommentText,
              setShowMentions,
              setMentionSearch,
              textareaRef
            )}
            className="w-full"
            rows={3}
          />
          {showMentions && (
            <UserMention
              students={students}
              teacher={teacher}
              currentUserId={userData.id}
              searchTerm={mentionSearch}
              onMention={(userId, userName) => handleMentionSelect(
                userId,
                userName,
                commentText,
                setCommentText,
                setShowMentions,
                setMentionedUsers,
                mentionedUsers,
                textareaRef
              )}
            />
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsActive(false);
                setCommentText('');
                setMentionedUsers([]);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button 
              size="sm"
              onClick={handleSubmit}
              className="gap-1 w-full sm:w-auto"
              disabled={!commentText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Gửi bình luận
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary mt-2"
          onClick={() => setIsActive(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          {comments.length > 0 
            ? `Thêm bình luận` 
            : 'Viết bình luận đầu tiên'
          }
        </Button>
      )}
    </div>
  );
} 