'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Upload, ZoomIn, RotateCw, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserService } from '@/lib/api/user';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';

// Hàm tạo hình ảnh từ canvas sau khi crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Hàm tính toán vị trí và kích thước khi xoay
const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);
  
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

// Chuyển đổi độ sang radian
const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180;
};

/**
 * Chuyển đổi Data URL sang File object
 * @param dataUrl Data URL của hình ảnh
 * @param filename Tên file
 * @returns File object
 */
const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Tối ưu hình ảnh: resize và nén
 * @param imageSrc Source của hình ảnh
 * @param pixelCrop Thông tin về vùng crop
 * @param rotation Độ xoay
 * @param maxWidth Kích thước tối đa
 * @returns Hình ảnh đã tối ưu dạng Data URL
 */
async function getOptimizedCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  maxWidth = 500
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Không thể tạo canvas context');
  }
  
  // Tính toán kích thước bounding box của hình ảnh sau khi xoay
  const bBoxWidth = rotateSize(image.width, image.height, rotation).width;
  const bBoxHeight = rotateSize(image.width, image.height, rotation).height;

  // Đặt kích thước canvas để bao phủ toàn bộ ảnh sau khi xoay
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;
  
  // Dịch canvas về vị trí trung tâm để xoay
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);
  
  // Vẽ hình ảnh gốc
  ctx.drawImage(image, 0, 0);
  
  // Trích xuất khu vực đã crop
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Đặt kích thước canvas cho ảnh đã crop
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  // Đặt lại context sau khi thay đổi kích thước canvas
  ctx.putImageData(data, 0, 0);
  
  // Tối ưu kích thước (nếu cần)
  if (pixelCrop.width > maxWidth || pixelCrop.height > maxWidth) {
    // Tạo canvas mới để resize
    const resizeCanvas = document.createElement('canvas');
    const resizeCtx = resizeCanvas.getContext('2d');
    
    if (!resizeCtx) {
      throw new Error('Không thể tạo context cho canvas resize');
    }
    
    // Tính toán tỷ lệ để giữ hình vuông (1:1)
    const ratio = maxWidth / Math.max(pixelCrop.width, pixelCrop.height);
    const newWidth = Math.round(pixelCrop.width * ratio);
    const newHeight = Math.round(pixelCrop.height * ratio);
    
    // Đặt kích thước mới cho canvas
    resizeCanvas.width = newWidth;
    resizeCanvas.height = newHeight;
    
    // Vẽ lại hình ảnh với kích thước mới
    resizeCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, newWidth, newHeight);
    
    // Trả về hình ảnh đã resize, nén với chất lượng 0.8
    return resizeCanvas.toDataURL('image/jpeg', 0.8);
  }
  
  // Trả về file ảnh dạng base64, nén với chất lượng 0.8
  return canvas.toDataURL('image/jpeg', 0.8);
}

interface AvatarUploaderProps {
  currentAvatar?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onAvatarChange: (avatarUrl: string) => void;
  userId?: string; // Thêm userId cho trường hợp upload ngay
  isRegisterMode?: boolean; // Flag để phân biệt giữa đăng ký và cập nhật
}

export function AvatarUploader({
  currentAvatar = '',
  fallbackText = 'U',
  size = 'lg',
  onAvatarChange,
  userId,
  isRegisterMode = false,
}: AvatarUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useAuth();
  const { toast } = useToast();

  // Log thông tin avatar được truyền vào để debug
  useEffect(() => {
  }, [currentAvatar]);

  // Xác định kích thước avatar dựa trên prop size
  const avatarSize = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  }[size];

  // Xử lý khi hình ảnh không thể tải
  const handleAvatarError = () => {
    console.error('Lỗi tải hình ảnh avatar từ URL:', currentAvatar);
    setAvatarError(true);
  };

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(false);
        setIsEditDialogOpen(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Xử lý khi crop hoàn tất
  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Áp dụng các thay đổi và tải lên avatar
  const handleCropConfirm = useCallback(async () => {
    try {
      setIsUploading(true);
      
      if (imageSrc && croppedAreaPixels) {
        const optimizedImage = await getOptimizedCroppedImg(
          imageSrc,
          croppedAreaPixels,
          rotation,
          500
        );
        
        // Chuyển đổi Data URL thành File object để upload
        const avatarFile = dataURLtoFile(
          optimizedImage,
          `avatar-${Date.now()}.jpg`
        );
        
        // Chế độ đăng ký - chỉ cần trả về Data URL
        if (isRegisterMode) {
          onAvatarChange(optimizedImage);
          setIsEditDialogOpen(false);
          setAvatarError(false); // Reset lỗi avatar nếu có
          toast({
            title: "Đã cập nhật ảnh đại diện",
            description: "Ảnh đại diện sẽ được lưu khi bạn hoàn tất đăng ký",
          });
        } 
        // Chế độ cập nhật hồ sơ - upload lên server ngay
        else {
          // Xác định userId
          const targetUserId = userId || userData?.userID;
          
          if (!targetUserId) {
            throw new Error('Không tìm thấy ID người dùng');
          }
          
          // Upload avatar lên server
          const avatarUrl = await UserService.uploadAvatar(targetUserId, avatarFile);
          
          // Cập nhật URL cho component cha
          onAvatarChange(avatarUrl);
          
          // Reset lỗi avatar nếu có
          setAvatarError(false);
          
          // Đóng dialog và thông báo
          setIsEditDialogOpen(false);
          toast({
            title: "Cập nhật ảnh đại diện thành công",
            description: "Ảnh đại diện của bạn đã được cập nhật",
            duration: 3000,
          });
        }
        
        // Reset các giá trị
        setZoom(1);
        setRotation(0);
      }
    } catch (e: any) {
      console.error('Lỗi khi xử lý ảnh đại diện:', e);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: e.message || "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, onAvatarChange, isRegisterMode, userId, userData, toast]);

  return (
    <div className="relative inline-block">
      <Avatar className={`${avatarSize} cursor-pointer`} onClick={() => setIsDialogOpen(true)}>
        <AvatarImage 
          src={avatarError ? '/avatars/default.png' : currentAvatar} 
          alt="Avatar" 
          style={{ objectFit: 'cover' }}
          onError={handleAvatarError}
        />
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>
      
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full shadow"
        aria-label="Thay đổi ảnh đại diện"
      >
        <Upload className="h-3 w-3" />
      </button>

      {/* Dialog chọn ảnh */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={avatarError ? '/avatars/default.png' : currentAvatar} 
                style={{ objectFit: 'cover' }}
                onError={handleAvatarError}
              />
              <AvatarFallback>{fallbackText}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Chọn ảnh từ thiết bị"
              title="Chọn ảnh từ thiết bị"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Chọn ảnh mới
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa ảnh */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Điều chỉnh ảnh đại diện</DialogTitle>
          </DialogHeader>
          
          {imageSrc ? (
            <div className="flex flex-col space-y-4">
              {/* Vùng hiển thị crop */}
              <div className="relative h-64 w-full overflow-hidden rounded-md">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              {/* Điều khiển zoom */}
              <div className="flex items-center space-x-2">
                <ZoomIn className="h-4 w-4" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom"
                  onValueChange={(value: number[]) => setZoom(value[0])}
                  className="flex-1"
                />
              </div>
              
              {/* Điều khiển xoay */}
              <div className="flex items-center space-x-2">
                <RotateCw className="h-4 w-4" />
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  step={1}
                  aria-label="Xoay"
                  onValueChange={(value: number[]) => setRotation(value[0])}
                  className="flex-1"
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)} 
                  disabled={isUploading}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCropConfirm} 
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Áp dụng
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <p>Không có ảnh nào được chọn</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 