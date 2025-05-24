'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputWithIconProps {
  id: string;
  name: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export function InputWithIcon({
  id,
  name,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  className,
  helpText,
}: InputWithIconProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn("pl-9", error && "border-red-500 focus-visible:ring-red-500", className)}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 