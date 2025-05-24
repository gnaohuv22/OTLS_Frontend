'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordRequirement {
  id: string;
  label: string;
  regex: RegExp;
}

interface PasswordRequirementsProps {
  password: string;
  requirements: PasswordRequirement[];
  showList?: boolean;
}

export function PasswordRequirements({
  password,
  requirements,
  showList = false,
}: PasswordRequirementsProps) {
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    requirements.forEach(req => {
      if (req.regex.test(password)) strength++;
    });
    return (strength / requirements.length) * 100;
  };

  const strengthValue = getPasswordStrength(password);

  return (
    <div className="space-y-3">
      {showList && (
        <ul className="space-y-1">
          {requirements.map((req) => (
            <li key={req.id} className="flex items-center">
              {req.regex.test(password) ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <div className="h-4 w-4 border border-gray-300 rounded-full mr-2" />
              )}
              <span className="text-sm">{req.label}</span>
            </li>
          ))}
        </ul>
      )}
      
      {password && (
        <div className="space-y-1">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                strengthValue <= 20
                  ? "bg-red-500"
                  : strengthValue <= 40
                  ? "bg-orange-500"
                  : strengthValue <= 60
                  ? "bg-yellow-500"
                  : strengthValue <= 80
                  ? "bg-blue-500"
                  : "bg-green-500"
              )}
              style={{
                width: `${strengthValue}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Độ mạnh mật khẩu: {strengthValue}%
          </p>
        </div>
      )}
    </div>
  );
} 