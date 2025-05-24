import { memo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileText, RefreshCw, Sparkles, InfoIcon, BookOpen, Lightbulb, FlaskConical, PencilRuler, Scale, FlowerIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AISettingsControlsProps {
  settings: {
    aiNumQuestions: number;
    aiNumOptions: number;
    aiNumCorrectOptions: number;
    aiDifficulty: string;
    aiCreativity: string;
  };
  onSettingChange: (setting: string, value: any) => void;
  disabled: boolean;
}

// Định nghĩa các loại độ khó theo Bloom's Taxonomy với mô tả phù hợp trẻ em
const difficultyLevels = [
  {
    value: 'bloom-remember',
    label: 'Ghi nhớ',
    icon: BookOpen,
    description: 'Nhớ các kiến thức cơ bản, thuật ngữ và thông tin đơn giản',
    examples: 'Liệt kê, nhận biết, kể tên, ghi nhớ'
  },
  {
    value: 'bloom-understand',
    label: 'Hiểu',
    icon: Lightbulb,
    description: 'Hiểu ý nghĩa của thông tin, giải thích được ý tưởng',
    examples: 'Mô tả, giải thích, tóm tắt, so sánh'
  },
  {
    value: 'bloom-apply',
    label: 'Áp dụng',
    icon: FlaskConical,
    description: 'Áp dụng kiến thức đã học vào tình huống mới',
    examples: 'Giải quyết, áp dụng, sử dụng, tính toán'
  },
  {
    value: 'bloom-analyze',
    label: 'Phân tích',
    icon: PencilRuler,
    description: 'Chia nhỏ thông tin thành các phần để hiểu sâu hơn',
    examples: 'So sánh, phân loại, phân tích, tìm nguyên nhân'
  },
  {
    value: 'bloom-evaluate',
    label: 'Đánh giá',
    icon: Scale,
    description: 'Đưa ra phán đoán dựa trên tiêu chí và tiêu chuẩn',
    examples: 'Đánh giá, chọn, giải thích lý do, kết luận'
  },
  {
    value: 'bloom-create',
    label: 'Sáng tạo',
    icon: FlowerIcon,
    description: 'Tạo ra ý tưởng, sản phẩm hoặc cách nhìn mới',
    examples: 'Thiết kế, tạo ra, sáng tác, xây dựng, đề xuất'
  }
];

const AISettingsControls = memo(({
  settings,
  onSettingChange,
  disabled
}: AISettingsControlsProps) => {
  const { 
    aiNumQuestions,
    aiNumOptions, 
    aiNumCorrectOptions,
    aiDifficulty,
    aiCreativity
  } = settings;

  const handleNumOptionsChange = (values: number[]) => {
    const newValue = values[0];
    onSettingChange('aiNumOptions', newValue);

    // Điều chỉnh số lượng đáp án đúng nếu cần
    if (aiNumCorrectOptions > newValue) {
      onSettingChange('aiNumCorrectOptions', newValue);
    }
  };

  // Đặt giá trị mặc định nếu không có giá trị
  useEffect(() => {
    if (!aiDifficulty) {
      onSettingChange('aiDifficulty', 'bloom-understand');
    }
  }, [aiDifficulty, onSettingChange]);

  // Tìm level hiện tại để hiển thị mô tả
  const currentLevel = difficultyLevels.find(level => level.value === aiDifficulty) || difficultyLevels[1];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="aiNumQuestions" className="text-sm font-medium">
            Số lượng câu hỏi: {aiNumQuestions}
          </Label>
        </div>
        <Slider
          id="aiNumQuestions"
          min={1}
          max={20}
          step={1}
          value={[aiNumQuestions]}
          onValueChange={(values) => onSettingChange('aiNumQuestions', values[0])}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="aiNumOptions" className="text-sm font-medium">
            Số lượng đáp án mỗi câu: {aiNumOptions}
          </Label>
        </div>
        <Slider
          id="aiNumOptions"
          min={2}
          max={6}
          step={1}
          value={[aiNumOptions]}
          onValueChange={handleNumOptionsChange}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="aiNumCorrectOptions" className="text-sm font-medium">
            Số lượng đáp án đúng: {aiNumCorrectOptions}
          </Label>
        </div>
        <Slider
          id="aiNumCorrectOptions"
          min={1}
          max={Math.min(aiNumOptions - 1, 4)}
          step={1}
          value={[aiNumCorrectOptions]}
          onValueChange={(values) => onSettingChange('aiNumCorrectOptions', values[0])}
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Độ khó (Theo Bloom's Taxonomy)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Bloom's Taxonomy là phương pháp phân loại mục tiêu học tập, từ ghi nhớ đơn giản đến sáng tạo phức tạp
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {difficultyLevels.map((level) => (
            <TooltipProvider key={level.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                      "hover:bg-accent hover:border-primary",
                      level.value === 'bloom-understand' && !aiDifficulty && "bg-primary/10 border-primary shadow-sm",
                      aiDifficulty === level.value
                        ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/30"
                        : "bg-card border-border"
                    )}
                    disabled={disabled}
                    onClick={(e) => {
                      e.preventDefault();
                      onSettingChange('aiDifficulty', level.value);
                    }}
                  >
                    <level.icon className={cn(
                      "h-5 w-5 mb-2",
                      level.value === 'bloom-understand' && !aiDifficulty && "text-primary",
                      aiDifficulty === level.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      level.value === 'bloom-understand' && !aiDifficulty && "text-primary",
                      aiDifficulty === level.value && "text-primary font-semibold"
                    )}>
                      {level.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <div className="space-y-1">
                    <p className="font-semibold text-xs">{level.label}</p>
                    <p className="text-xs">{level.description}</p>
                    <p className="text-xs italic">Ví dụ: {level.examples}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {aiDifficulty && (
          <Alert className="bg-primary/5 border-primary/20">
            <AlertTitle className="text-sm font-medium">
              {currentLevel.label}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              {currentLevel.description}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiCreativity" className="text-sm font-medium">
          Mức độ sáng tạo
        </Label>
        <ToggleGroup
          type="single"
          value={aiCreativity}
          onValueChange={(value: string) => value && onSettingChange('aiCreativity', value)}
          className="flex justify-start"
          disabled={disabled}
        >
          <ToggleGroupItem value="knowledge" className="gap-1 flex-1" aria-label="Dựa trên kiến thức">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Kiến thức</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="balanced" className="gap-1 flex-1" aria-label="Cân bằng">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Cân bằng</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="creative" className="gap-1 flex-1" aria-label="Sáng tạo">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Sáng tạo</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
});

AISettingsControls.displayName = 'AISettingsControls';

export default AISettingsControls; 