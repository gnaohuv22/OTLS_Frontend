'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  showStrengthIndicator?: boolean;
  requirements?: {
    id: string;
    label: string;
    regex: RegExp;
  }[];
}

export function PasswordInput({
  id,
  name,
  placeholder = "Nhập mật khẩu",
  value,
  onChange,
  error,
  disabled = false,
  className,
  showStrengthIndicator = false,
  requirements = [],
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrength = (password: string): number => {
    if (!password || !requirements.length) return 0;
    let strength = 0;
    requirements.forEach(req => {
      if (req.regex.test(password)) strength++;
    });
    return (strength / requirements.length) * 100;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn("pl-9 pr-9", error && "border-red-500", className)}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-10 w-10 px-3"
          onClick={togglePasswordVisibility}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {showStrengthIndicator && value && requirements.length > 0 && (
        <div className="space-y-1">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                getPasswordStrength(value) <= 20
                  ? "bg-red-500"
                  : getPasswordStrength(value) <= 40
                  ? "bg-orange-500"
                  : getPasswordStrength(value) <= 60
                  ? "bg-yellow-500"
                  : getPasswordStrength(value) <= 80
                  ? "bg-blue-500"
                  : "bg-green-500"
              )}
              style={{
                width: `${getPasswordStrength(value)}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Độ mạnh mật khẩu: {getPasswordStrength(value)}%
          </p>
        </div>
      )}
    </div>
  );
} 