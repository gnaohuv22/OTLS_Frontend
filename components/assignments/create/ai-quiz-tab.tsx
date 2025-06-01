import React, { useRef, useCallback, memo, useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Check, ChevronDown, ChevronRight, HelpCircle, CheckSquare, Square } from 'lucide-react';
import { useAssignment } from './assignment-context';
import { getDifficultyLevel, getCreativityLevel, createAISystemPrompt } from '../../../app/(dashboard)/assignments/create/utils';
import AIQuestionList from './ai-question-list';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DebounceTextarea } from '@/components/ui/debounce-textarea';
import AIFileUploader from './ai-file-uploader';
import { fileToBase64, extractTextFromFile } from '@/lib/file-processor';
import AISettingsControls from './ai-settings-control';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Sử dụng memo để tránh re-render không cần thiết
const AIQuizTab = memo(function AIQuizTab() {
  const { toast } = useToast();
  const {
    state,
    setCommonField,
    setAiSetting,
    addAIGeneratedQuestions,
    setAiGenerating,
    clearAiFile,
  } = useAssignment();

  const {
    quizQuestions,
    aiPrompt,
    aiFileName,
    aiNumQuestions,
    aiNumOptions,
    aiNumCorrectOptions,
    aiDifficulty,
    aiCreativity,
    aiGenerating,
    aiFileContent
  } = state;

  // State to store generated questions before adding them to the main quiz
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [questionsAdded, setQuestionsAdded] = useState(false);

  // State for collapsible sections
  const [isOpen, setIsOpen] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);

  // Thêm state cho upload PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Restore the original handlePromptChange callback
  const handlePromptChange = useCallback((value: string) => {
    console.log('AI Prompt change triggered:', { 
      newValue: value, 
      currentValue: aiPrompt,
      valueLength: value?.length || 0
    });
    setCommonField('aiPrompt', value);
  }, [setCommonField, aiPrompt]);

  // Xử lý file upload cho AI
  const handleFileContentLoaded = useCallback((fileName: string, originalFile: File) => {
    setCommonField('aiFileName', fileName);
    
    // Lưu file PDF nếu có
    if (originalFile.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      setPdfFile(originalFile);

      // Chuyển đổi PDF thành base64 nếu cần
      fileToBase64(originalFile)
        .then(base64Content => {
          setPdfBase64(base64Content);
          // Lưu loại file
          setCommonField('aiFileType', originalFile.type);
          // Lưu file gốc để xử lý
          setCommonField('aiOriginalFile', originalFile);
        })
        .catch(error => {
          console.error('Error converting PDF to base64:', error);
          toast({
            variant: 'destructive',
            title: 'Lỗi xử lý file PDF',
            description: 'Không thể chuyển đổi PDF sang định dạng phù hợp.',
          });
        });
    } else {
      // Không phải PDF nhưng vẫn cần lưu loại file và file gốc
      setCommonField('aiFileType', originalFile.type);
      setCommonField('aiOriginalFile', originalFile);
      
      // Xoá state PDF nếu có
      setPdfFile(null);
      setPdfBase64(null);
    }
  }, [setCommonField, toast]);

  // Xoá file
  const handleClearFile = useCallback(() => {
    clearAiFile();
    setPdfFile(null);
    setPdfBase64(null);
  }, [clearAiFile]);

  // Select/deselect all questions
  const handleSelectAllQuestions = useCallback(() => {
    if (selectedQuestions.size === generatedQuestions.length) {
      // If all questions are selected, deselect all
      setSelectedQuestions(new Set());
    } else {
      // Otherwise, select all
      setSelectedQuestions(new Set(generatedQuestions.map((_: any, index: number) => index)));
    }
  }, [generatedQuestions, selectedQuestions]);

  // Toggle selection of a specific question
  const toggleQuestionSelection = useCallback((index: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Tạo câu hỏi từ AI
  const generateQuestionsWithAI = useCallback(async (e?: React.MouseEvent) => {
    // Prevent default if event is provided (prevents form submission)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Kiểm tra xem có ít nhất một trong hai (file hoặc prompt)
    if (!aiPrompt?.trim() && !state.aiOriginalFile) {
      toast({
        variant: 'destructive',
        title: 'Thiếu nội dung',
        description: 'Vui lòng nhập chủ đề hoặc tải lên tài liệu để tạo câu hỏi.',
      });
      return;
    }

    // Ensure numCorrectOptions is valid
    if (aiNumCorrectOptions >= aiNumOptions) {
      toast({
        variant: 'destructive',
        title: 'Số đáp án đúng không hợp lệ',
        description: `Số đáp án đúng (${aiNumCorrectOptions}) phải nhỏ hơn số lượng phương án (${aiNumOptions}).`,
      });
      // Optionally reset or suggest a valid value
      setAiSetting('aiNumCorrectOptions', Math.max(1, aiNumOptions - 1));
      return;
    }

    setAiGenerating(true);
    // Reset added state when generating new questions
    setQuestionsAdded(false);
    // Expand the questions section when new questions are generated
    setIsQuestionsExpanded(true);

    try {
      // Sử dụng các utils để tạo prompt
      const difficultyLevel = getDifficultyLevel(aiDifficulty);
      const creativityLevel = getCreativityLevel(aiCreativity);

      // Tạo system prompt bằng util
      const systemPrompt = createAISystemPrompt(
        aiNumQuestions,
        aiNumOptions,
        aiNumCorrectOptions,
        difficultyLevel,
        creativityLevel
      );

      // Sử dụng AbortController để có thể hủy request nếu cần
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Prepare request data
      const requestData: any = {
        systemPrompt,
        numQuestions: aiNumQuestions,
        numOptions: aiNumOptions,
        numCorrectOptions: aiNumCorrectOptions,
        difficulty: aiDifficulty,
        creativity: aiCreativity
      };

      // Kiểm tra xem có file không
      const originalFile = state.aiOriginalFile;
      
      // Luôn thêm user prompt nếu có, bất kể có file hay không
      if (aiPrompt && aiPrompt.trim()) {
        requestData.userPrompt = aiPrompt;
      }
      
      if (originalFile) {
        // Nếu là PDF và đã có base64
        if ((originalFile.type === 'application/pdf' || originalFile.name.endsWith('.pdf')) && pdfBase64) {
          requestData.pdfBase64 = pdfBase64;
          requestData.pdfMimeType = originalFile.type || 'application/pdf';
          
          // Thêm context từ aiPrompt nếu có
          if (aiPrompt && aiPrompt.trim() && !requestData.userPrompt) {
            requestData.userPrompt = `Tôi đang tải lên một tài liệu PDF. ${aiPrompt}`;
          } else if (aiPrompt && aiPrompt.trim()) {
            // Nếu đã có userPrompt, chỉ cần thêm thông tin file
            requestData.userPrompt = `Tôi đang tải lên một tài liệu PDF và yêu cầu: ${requestData.userPrompt}`;
          }
        } 
        // Với file docx, cần parse thành văn bản vì Gemini không hỗ trợ trực tiếp
        else if (originalFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                originalFile.name.endsWith('.docx')) {
          try {
            // Parse docx to text
            const textContent = await extractTextFromFile(originalFile);
            
            // Kết hợp prompt của người dùng với nội dung file
            if (aiPrompt && aiPrompt.trim()) {
              requestData.userPrompt = `${requestData.userPrompt}\n\nDựa trên nội dung tài liệu sau:\n\n${textContent}`;
            } else {
              requestData.userPrompt = `Tạo câu hỏi trắc nghiệm dựa trên nội dung sau:\n\n${textContent}`;
            }
          } catch (err) {
            console.error('Error parsing docx file:', err);
            toast({
              variant: 'destructive',
              title: 'Lỗi xử lý file Word',
              description: 'Không thể xử lý nội dung file Word. Vui lòng thử lại với file khác.',
            });
            setAiGenerating(false);
            return;
          }
        }
        // Với các loại file khác, cần convert sang base64 và gửi
        else {
          try {
            const base64Data = await fileToBase64(originalFile);
            // Check if the file type is supported by Gemini
            const supportedMimeTypes = ['text/plain', 'text/markdown', 'application/pdf'];
            const mimeType = originalFile.type || getMimeTypeFromFileName(originalFile.name);
            
            if (supportedMimeTypes.includes(mimeType)) {
              requestData.fileBase64 = base64Data;
              requestData.fileMimeType = mimeType;
              requestData.fileName = originalFile.name;
              
              // Thêm context từ aiPrompt nếu có
              if (aiPrompt && aiPrompt.trim() && !requestData.userPrompt) {
                requestData.userPrompt = `Tôi đang tải lên một tài liệu ${mimeType}. ${aiPrompt}`;
              } else if (aiPrompt && aiPrompt.trim()) {
                // Nếu đã có userPrompt, chỉ cần thêm thông tin file
                requestData.userPrompt = `Tôi đang tải lên một tài liệu ${mimeType} và yêu cầu: ${requestData.userPrompt}`;
              }
            } else {
              // For unsupported formats, extract text and send as prompt
              const textContent = await extractTextFromFile(originalFile);
              
              // Kết hợp prompt của người dùng với nội dung file
              if (aiPrompt && aiPrompt.trim()) {
                requestData.userPrompt = `${requestData.userPrompt}\n\nDựa trên nội dung tài liệu sau:\n\n${textContent}`;
              } else {
                requestData.userPrompt = `Tạo câu hỏi trắc nghiệm dựa trên nội dung sau:\n\n${textContent}`;
              }
            }
          } catch (err) {
            console.error('Error processing file:', err);
            toast({
              variant: 'destructive',
              title: 'Lỗi xử lý file',
              description: 'Không thể xử lý nội dung file. Vui lòng thử lại với file khác.',
            });
            setAiGenerating(false);
            return;
          }
        }
      } else if (!aiPrompt || !aiPrompt.trim()) {
        // Nếu không có file và không có prompt
        toast({
          variant: 'destructive',
          title: 'Thiếu nội dung',
          description: 'Vui lòng nhập chủ đề hoặc tải lên tài liệu để tạo câu hỏi.',
        });
        setAiGenerating(false);
        return;
      }
      // Else: Nếu chỉ có aiPrompt, đã được gán ở dòng đầu tiên

      // Gọi API để generate câu hỏi
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Lỗi khi gọi API: ${response.status} ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`);
      }

      const data = await response.json();

      // Chuyển kết quả từ API thành định dạng cần thiết
      const aiQuestions = data.questions.map((q: any, index: number) => ({
        id: index, // Temporary ID, will be properly assigned when adding to quizQuestions
        question: q.question,
        options: q.options,
        correctOptions: q.correctOptions,
        points: 10,
        explanation: q.explanation || ''
      }));

      // Store the generated questions in local state
      setGeneratedQuestions(aiQuestions);
      
      // Select all questions by default
      setSelectedQuestions(new Set(aiQuestions.map((_: any, index: number) => index)));

      toast({
        title: 'Tạo câu hỏi thành công',
        description: `Đã tạo ${aiQuestions.length} câu hỏi từ AI. Bạn có thể chọn câu hỏi để thêm vào bài tập.`,
      });

    } catch (error: any) {
      console.error('Lỗi khi tạo câu hỏi AI:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi khi tạo câu hỏi',
        description: error.message || 'Không thể tạo câu hỏi từ AI. Vui lòng thử lại sau.',
      });
    } finally {
      setAiGenerating(false);
    }
  }, [
    aiPrompt,
    aiNumQuestions,
    aiNumOptions,
    aiNumCorrectOptions,
    aiDifficulty,
    aiCreativity,
    pdfBase64,
    setAiGenerating,
    setAiSetting,
    toast,
    state.aiOriginalFile
  ]);

  // Hủy yêu cầu tạo câu hỏi nếu đang trong quá trình tạo
  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setAiGenerating(false);

    toast({
      title: 'Đã hủy',
      description: 'Đã hủy quá trình tạo câu hỏi.',
    });
  }, [setAiGenerating, toast]);

  // Thêm câu hỏi được tạo vào danh sách câu hỏi quiz
  const handleAddToQuiz = useCallback(() => {
    if (generatedQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Không có câu hỏi để thêm',
        description: 'Vui lòng tạo câu hỏi trước khi thêm vào bài tập.',
      });
      return;
    }

    // If no questions are selected, show a message
    if (selectedQuestions.size === 0) {
      toast({
        variant: 'destructive',
        title: 'Chưa chọn câu hỏi nào',
        description: 'Vui lòng chọn ít nhất một câu hỏi để thêm vào bài tập.',
      });
      return;
    }

    // Process only the selected questions with correct IDs
    const questionsToAdd = Array.from(selectedQuestions).map(index => ({
      ...generatedQuestions[index],
      id: Date.now() + Math.random(), // Ensure unique IDs
      isAIGenerated: true
    }));

    // Add the processed questions to the main quiz
    addAIGeneratedQuestions(questionsToAdd);

    // Remove the added questions from the generated questions list
    const remainingQuestions = generatedQuestions.filter((_, index) => !selectedQuestions.has(index));
    setGeneratedQuestions(remainingQuestions);
    
    // Clear selections
    setSelectedQuestions(new Set());

    // Set the added flag to true if all questions were added
    if (remainingQuestions.length === 0) {
      setQuestionsAdded(true);
    }

    toast({
      title: 'Thêm câu hỏi thành công',
      description: `Đã thêm ${questionsToAdd.length} câu hỏi vào bài tập.`,
    });

    // Optionally, you can switch to the quiz tab here
  }, [generatedQuestions, selectedQuestions, addAIGeneratedQuestions, toast]);

  // Tính toán trạng thái cho nút tạo câu hỏi
  const isGenerateDisabled = aiGenerating || (!aiPrompt && !state.aiOriginalFile);

  // Filter quiz questions to show only AI-generated ones from the current session
  const aiGeneratedQuestions = generatedQuestions;

  // Hiển thị trạng thái dựa trên input
  const inputStatus = useMemo(() => {
    if (aiPrompt?.trim() && state.aiOriginalFile) {
      return "Tạo câu hỏi dựa trên prompt và tài liệu";
    } else if (state.aiOriginalFile) {
      return "Tạo câu hỏi từ tài liệu đã tải lên";
    } else if (aiPrompt?.trim()) {
      return "Tạo câu hỏi từ chủ đề đã nhập";
    } else {
      return "Nhập chủ đề hoặc tải tài liệu để tạo câu hỏi";
    }
  }, [aiPrompt, state.aiOriginalFile]);

  // Toggle collapsible state
  const toggleCollapsible = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Helper function to get MIME type from filename
  const getMimeTypeFromFileName = (fileName: string): string => {
    if (fileName.endsWith('.txt')) return 'text/plain';
    if (fileName.endsWith('.pdf')) return 'application/pdf';
    if (fileName.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (fileName.endsWith('.doc')) return 'application/msword';
    if (fileName.endsWith('.md')) return 'text/markdown';
    return 'application/octet-stream';
  };

  return (
    <Card className="border-primary/20 animate-scale-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                AI Tạo câu hỏi tự động
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-6 w-6">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[320px] animate-fade-in">
                  <p className="text-sm">Công cụ này sử dụng AI để tạo tự động các câu hỏi trắc nghiệm dựa trên chủ đề hoặc tài liệu của bạn.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="transition-transform duration-200 hover:scale-110"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isOpen ? "Thu gọn" : "Mở rộng"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* User guide - always visible */}
          {!isOpen && generatedQuestions.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
              Mở rộng để tạo câu hỏi tự động bằng AI
            </p>
          )}

          {/* Show summary of generated questions when collapsed */}
          {!isOpen && generatedQuestions.length > 0 && (
            <div className="flex items-center gap-2 mt-2 animate-fade-in">
              <Badge variant="outline" className="bg-primary/10">
                {generatedQuestions.length} câu hỏi đã tạo
              </Badge>
              {!questionsAdded && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 transition-all hover:scale-105"
                  onClick={handleAddToQuiz}
                  type="button"
                >
                  <Check className="h-3 w-3" />
                  Thêm vào bài tập
                </Button>
              )}
              
              {questionsAdded && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-fade-in">
                  <Check className="h-3 w-3 mr-1" />
                  Đã thêm vào bài tập
                </Badge>
              )}
            </div>
          )}
        </div>

        <CollapsibleContent>
          <CardContent className="p-0 px-6 pb-6 space-y-5">
            {/* User guide */}
            <Alert className="bg-primary/5 border-primary/20 animate-slide-in">
              <Brain className="h-4 w-4 text-primary" />
              <AlertTitle>Hướng dẫn sử dụng công cụ tạo câu hỏi AI</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Tải lên tài liệu hoặc nhập chủ đề cho câu hỏi (hoặc kết hợp cả hai)</li>
                  <li>Điều chỉnh các thông số tạo câu hỏi (số lượng, độ khó...)</li>
                  <li>Nhấn "Tạo câu hỏi" để tự động tạo các câu hỏi trắc nghiệm</li>
                  <li>Kiểm tra các câu hỏi được tạo và nhấn "Thêm vào bài tập" để sử dụng</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Nhập prompt hoặc tải tài liệu */}
            <div className="space-y-4 animate-slide-in" style={{ animationDelay: '100ms' }}>
              {/* File uploader */}
              <AIFileUploader
                onFileContentLoaded={handleFileContentLoaded}
                fileName={aiFileName}
                onClearFile={handleClearFile}
                accept={['.txt', '.pdf', '.docx', '.md']}
                isProcessing={aiGenerating}
                showFileBadge={true}
              />

              {/* Prompt input */}
              <div className="space-y-2">
                <Label htmlFor="ai-prompt" className="font-medium">
                  Chủ đề hoặc hướng dẫn cho AI
                  {aiFileName && <span className="ml-1 text-muted-foreground"> - Kết hợp với tài liệu: {aiFileName}</span>}
                </Label>
                <DebounceTextarea
                  id="ai-prompt"
                  placeholder={aiFileName 
                    ? "Ví dụ: Tạo câu hỏi dựa trên phần 'Phương trình bậc 2' trong tài liệu" 
                    : "Ví dụ: Tạo câu hỏi trắc nghiệm về phương trình bậc 2 cho học sinh lớp 9"}
                  value={aiPrompt || ''}
                  onValueChange={handlePromptChange}
                  className="min-h-[80px] text-sm resize-none"
                  debounceDelay={500}
                  disabled={aiGenerating}
                />
                {aiFileName && (
                  <p className="text-xs text-muted-foreground">
                    Kết hợp cả prompt và tài liệu sẽ giúp AI tập trung vào nội dung quan trọng trong tài liệu
                  </p>
                )}
              </div>

              {/* AI Settings */}
              <AISettingsControls
                settings={{
                  aiNumQuestions,
                  aiNumOptions,
                  aiNumCorrectOptions,
                  aiDifficulty,
                  aiCreativity
                }}
                onSettingChange={setAiSetting}
                disabled={aiGenerating}
              />

              {/* Generate button */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-muted-foreground">
                  {aiGenerating ? 'Đang tạo câu hỏi...' : (
                    aiGeneratedQuestions.length > 0
                      ? `${aiGeneratedQuestions.length} câu hỏi đã được tạo`
                      : inputStatus
                  )}
                </div>

                <div className="flex gap-2">
                  {aiGenerating ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelGeneration}
                      type="button"
                      className="animate-pulse"
                    >
                      Hủy
                    </Button>
                  ) : (
                    <>
                      {aiGeneratedQuestions.length > 0 && !questionsAdded && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 transition-all hover:scale-105"
                            onClick={handleAddToQuiz}
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                            Thêm vào bài tập
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        className={`gap-2 transition-all hover:scale-105 ${
                          aiPrompt?.trim() && state.aiOriginalFile ? "bg-primary" : ""
                        }`}
                        onClick={(e) => generateQuestionsWithAI(e)}
                        disabled={isGenerateDisabled}
                        type="button"
                        title={inputStatus}
                      >
                        {aiGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                        Tạo câu hỏi
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Hiển thị câu hỏi đã tạo */}
            {aiGeneratedQuestions.length > 0 && (
              <div className="space-y-4 pt-4 animate-fade-in">
                <Collapsible open={isQuestionsExpanded} onOpenChange={setIsQuestionsExpanded}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Câu hỏi đã tạo</h3>

                      {/* Display an indicator when questions have been added to the quiz */}
                      {questionsAdded && (
                        <div className="flex items-center text-sm text-green-600 animate-fade-in">
                          <Check className="h-4 w-4 mr-1" />
                          Đã thêm vào bài tập
                        </div>
                      )}
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        {isQuestionsExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {isQuestionsExpanded ? "Thu gọn câu hỏi" : "Mở rộng câu hỏi"}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent>
                    <div className="mt-4">
                      {/* Select all checkbox */}
                      {aiGeneratedQuestions.length > 0 && !questionsAdded && (
                        <div className="flex items-center mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                            onClick={handleSelectAllQuestions}
                            type="button"
                          >
                            {selectedQuestions.size === generatedQuestions.length ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            {selectedQuestions.size === generatedQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          </Button>
                          <span className="text-sm text-muted-foreground ml-2">
                            Đã chọn {selectedQuestions.size}/{aiGeneratedQuestions.length} câu hỏi
                          </span>
                        </div>
                      )}

                      <TooltipProvider>
                        <div className="space-y-4">
                          {aiGeneratedQuestions.map((question, index) => (
                            <div key={index} className="relative">
                              {/* Selection checkbox for each question */}
                              {!questionsAdded && (
                                <div 
                                  className="absolute left-0 top-3 -ml-8 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleQuestionSelection(index);
                                  }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleQuestionSelection(index);
                                    }}
                                  >
                                    {selectedQuestions.has(index) ? (
                                      <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              )}
                              <div 
                                className={`${selectedQuestions.has(index) ? "" : "opacity-50"} cursor-pointer`}
                                onClick={(e) => {
                                  if (!questionsAdded) {
                                    e.stopPropagation();
                                    toggleQuestionSelection(index);
                                  }
                                }}
                              >
                                <div className="rounded-md border p-4">
                                  <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                                  <div className="space-y-2 mt-2">
                                    {question.options.map((option: string, optIndex: number) => (
                                      <div key={optIndex} className={`flex items-start gap-2 text-sm ${question.correctOptions.includes(optIndex) ? 'text-green-600 font-medium' : ''}`}>
                                        <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <div>{option}</div>
                                      </div>
                                    ))}
                                  </div>
                                  {question.explanation && (
                                    <div className="mt-3 text-sm text-muted-foreground border-t pt-2">
                                      <span className="font-medium">Giải thích: </span>
                                      {question.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TooltipProvider>

                      {aiGeneratedQuestions.length > 0 && !questionsAdded && (
                        <div className="flex justify-end pt-3 animate-fade-in">
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2 transition-all hover:scale-105"
                            onClick={handleAddToQuiz}
                            type="button"
                            disabled={selectedQuestions.size === 0}
                          >
                            <Check className="h-4 w-4" />
                            Thêm {selectedQuestions.size} câu hỏi vào bài tập
                          </Button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});

AIQuizTab.displayName = 'AIQuizTab';

export default AIQuizTab;