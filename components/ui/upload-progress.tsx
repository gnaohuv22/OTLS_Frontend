"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadProgressProps {
  fileName: string
  fileSize: number // in bytes
  onCancel: () => void
}

export function UploadProgress({ fileName, fileSize, onCancel }: UploadProgressProps) {
  const [progress, setProgress] = React.useState(0)
  const [uploadSpeed, setUploadSpeed] = React.useState(0) // KB/s
  const [timeRemaining, setTimeRemaining] = React.useState(0) // seconds

  React.useEffect(() => {
    // Mô phỏng tốc độ upload dựa vào kích thước file
    // File càng lớn, tốc độ càng chậm (giả lập)
    const baseSpeed = 500 // KB/s
    const simulatedSpeed = Math.max(100, baseSpeed - (fileSize / (1024 * 1024))) // Giảm tốc độ khi file lớn
    
    // Cập nhật progress mỗi 100ms
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        
        // Tăng progress ngẫu nhiên
        const increment = (Math.random() * 2 + 1) * (simulatedSpeed / baseSpeed)
        const newProgress = Math.min(100, prev + increment)
        
        // Cập nhật tốc độ và thời gian còn lại
        const currentSpeed = (fileSize / 1024) * (increment / 100) * (1000 / 100) // KB/s
        setUploadSpeed(currentSpeed)
        
        const remainingBytes = fileSize * (1 - newProgress / 100)
        const remainingTime = remainingBytes / (currentSpeed * 1024)
        setTimeRemaining(remainingTime)
        
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [fileSize])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return Math.ceil(seconds) + ' giây'
    return Math.ceil(seconds / 60) + ' phút'
  }

  return (
    <div className="w-full space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(fileSize)} • {Math.round(uploadSpeed)} KB/s
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {progress < 100
          ? `Còn lại ${formatTimeRemaining(timeRemaining)}`
          : "Đã hoàn thành"}
      </p>
    </div>
  )
} 