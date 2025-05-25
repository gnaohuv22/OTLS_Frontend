'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserMentionProps } from '../types';

interface MentionableUser {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string;
  role: 'Teacher' | 'Student';
}

export function UserMention({
  students,
  teacher,
  currentUserId,
  onMention,
  searchTerm
}: UserMentionProps) {
  const [filteredUsers, setFilteredUsers] = useState<MentionableUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Combine students and teacher into mentionable users
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers([]);
      return;
    }

    const mentionableUsers: MentionableUser[] = [];

    // Add teacher if available and not the current user
    if (teacher && teacher.id !== currentUserId) {
      mentionableUsers.push({
        id: teacher.id,
        name: teacher.name,
        avatar: teacher.avatar,
        email: teacher.email,
        role: 'Teacher'
      });
    }

    // Add students (excluding current user)
    students.forEach(student => {
      if (student.id !== currentUserId) {
        mentionableUsers.push({
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          email: student.email,
          role: 'Student'
        });
      }
    });

    // Filter users based on search term
    const filtered = mentionableUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredUsers(filtered);
    setSelectedIndex(0);
  }, [searchTerm, students, teacher, currentUserId]);

  const handleSelectUser = useCallback((user: MentionableUser) => {
    onMention(user.id, user.name);
    setFilteredUsers([]);
  }, [onMention]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredUsers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            handleSelectUser(filteredUsers[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setFilteredUsers([]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredUsers, selectedIndex, handleSelectUser]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
      <div ref={listRef} className="p-1">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
          Gắn thẻ người dùng
        </div>
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
              index === selectedIndex 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="text-xs">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {user.name}
                </span>
                <Badge variant={user.role === 'Teacher' ? 'default' : 'outline'} className="text-xs">
                  {user.role === 'Teacher' ? 'Giáo viên' : 'Học sinh'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user.email || 'Không có email'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 