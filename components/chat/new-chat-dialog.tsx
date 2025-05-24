import React, { useState } from 'react';
import { Search, X, MessageSquarePlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { User } from './types';

interface NewChatDialogProps {
  users: User[];
  onSelectUser: (user: User) => void;
  selectedUsers: User[];
  onRemoveUser: (userId: string) => void;
  onCreateChat: () => void;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({
  users,
  onSelectUser,
  selectedUsers,
  onRemoveUser,
  onCreateChat,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(user => !selectedUsers.find(selectedUser => selectedUser.id === user.id));
  
  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        Cuộc trò chuyện mới
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
            <DialogDescription>
              Chọn người bạn muốn trò chuyện
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc email"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{user.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onRemoveUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="max-h-[200px] overflow-y-auto border rounded-md">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy người phù hợp
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        onSelectUser(user);
                        setSearch('');
                        setOpen(false);
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${
                        user.status === 'online' 
                          ? 'bg-green-500' 
                          : user.status === 'away' 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-400'
                      }`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Hủy
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={() => {
                onCreateChat();
                setOpen(false);
              }}
              disabled={selectedUsers.length === 0}
            >
              Bắt đầu trò chuyện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewChatDialog; 