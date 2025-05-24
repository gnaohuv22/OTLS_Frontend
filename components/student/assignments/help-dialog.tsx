"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare } from "lucide-react";

export function HelpDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const [question, setQuestion] = useState("");
  const [sentQuestion, setSentQuestion] = useState(false);
  
  const handleSendQuestion = () => {
    if (!question.trim()) return;
    
    // Giả lập gửi câu hỏi đến giáo viên
    setSentQuestion(true);
    
    // Reset sau 3 giây
    setTimeout(() => {
      setQuestion("");
      setSentQuestion(false);
    }, 3000);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Trợ giúp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trợ giúp</DialogTitle>
          <DialogDescription>
            Hướng dẫn làm bài tập và gửi câu hỏi đến giáo viên
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">Hướng dẫn</TabsTrigger>
            <TabsTrigger value="ask">Đặt câu hỏi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instructions" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Cách làm bài trắc nghiệm</h3>
              <p className="text-sm text-muted-foreground">
                Chọn đáp án đúng từ các lựa chọn được đưa ra. Một câu hỏi chỉ có một đáp án đúng.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Cách làm bài kéo thả</h3>
              <p className="text-sm text-muted-foreground">
                Kéo và thả các phần tử để sắp xếp theo thứ tự đúng. Nhấn giữ và di chuyển để sắp xếp lại vị trí.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Cách tải lên file bài làm</h3>
              <p className="text-sm text-muted-foreground">
                Bạn có thể kéo thả file vào khu vực tải lên hoặc nhấp vào khu vực đó để chọn file từ máy tính. 
                Ngoài ra, bạn cũng có thể sử dụng camera của thiết bị để chụp ảnh bài làm.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Cách nộp bài</h3>
              <p className="text-sm text-muted-foreground">
                Sau khi hoàn thành tất cả các câu hỏi và tải lên các file cần thiết, nhấn nút &ldquo;Nộp bài&rdquo; ở cuối trang.
                Lưu ý: Bạn không thể chỉnh sửa bài làm sau khi đã nộp.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="ask" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Câu hỏi của bạn</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full min-h-[100px] p-2 rounded-md border resize-none"
                placeholder="Nhập câu hỏi của bạn ở đây..."
                disabled={sentQuestion}
              />
            </div>
            
            <Button
              onClick={handleSendQuestion}
              className="gap-2 w-full"
              disabled={!question.trim() || sentQuestion}
            >
              <MessageSquare className="h-4 w-4" />
              {sentQuestion ? "Đã gửi câu hỏi" : "Gửi câu hỏi đến giáo viên"}
            </Button>
            
            {sentQuestion && (
              <p className="text-sm text-green-600">
                Câu hỏi của bạn đã được gửi đến giáo viên. Giáo viên sẽ phản hồi sớm nhất có thể.
              </p>
            )}
            
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Lưu ý: Giáo viên có thể mất một chút thời gian để phản hồi câu hỏi của bạn.
                Trong khi chờ đợi, bạn có thể tiếp tục làm bài tập.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 