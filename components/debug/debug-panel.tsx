'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { 
  BugIcon, 
  XIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  RefreshCcwIcon,
  UserIcon,
  ShieldIcon,
  CookieIcon,
  DatabaseIcon,
  TrashIcon
} from 'lucide-react';

interface DebugPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// Check for production mode outside the component
const isProduction = process.env.NODE_ENV === 'production';

export function DebugPanel({ position = 'bottom-right' }: DebugPanelProps) {
  // Define all hooks first
  const { user, role, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cookieRole, setCookieRole] = useState<string | null>(null);
  const [allCookies, setAllCookies] = useState<Record<string, string>>({});
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({});

  // Get position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  // Load debug info
  useEffect(() => {
    // Don't run in production or when panel is closed
    if (isProduction || !isOpen) return;
    
    // Get role cookie
    const roleCookie = Cookies.get('role');
    setCookieRole(roleCookie || null);

    // Get all cookies
    const cookies = Cookies.get();
    setAllCookies(cookies);

    // Get localStorage items
    if (typeof window !== 'undefined') {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key) || '';
            // Truncate long values
            items[key] = value.length > 100 ? `${value.substring(0, 100)}...` : value;
          } catch (e) {
            items[key] = 'Error: Could not read value';
          }
        }
      }
      setLocalStorageItems(items);
    }
  }, [isOpen, pathname]);

  // Return null early if in production mode
  if (isProduction) {
    return null;
  }

  // Handle setting role cookie
  const setRole = (newRole: string | null) => {
    if (newRole) {
      Cookies.set('role', newRole, { path: '/' });
    } else {
      Cookies.remove('role', { path: '/' });
    }

    // Update state
    setCookieRole(newRole);
    
    // Reload cookies
    setAllCookies(Cookies.get());
  };

  // Refresh data
  const refreshData = () => {
    // Get role cookie
    const roleCookie = Cookies.get('role');
    setCookieRole(roleCookie || null);

    // Get all cookies
    const cookies = Cookies.get();
    setAllCookies(cookies);

    // Get localStorage items
    if (typeof window !== 'undefined') {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key) || '';
            // Truncate long values
            items[key] = value.length > 100 ? `${value.substring(0, 100)}...` : value;
          } catch (e) {
            items[key] = 'Error: Could not read value';
          }
        }
      }
      setLocalStorageItems(items);
    }
  };

  // Add the new function to delete a localStorage item
  const deleteLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined' && key) {
      try {
        localStorage.removeItem(key);
        // Update the display
        refreshData();
      } catch (e) {
        console.error(`Error deleting localStorage key: ${key}`, e);
      }
    }
  };

  // Add the new function to clear assignment bans
  const clearAssignmentBans = () => {
    if (typeof window !== 'undefined') {
      try {
        // Remove all otls_assignment_caution_count_ keys
        Object.keys(localStorageItems).forEach(key => {
          if (key.startsWith('otls_assignment_caution_count_')) {
            localStorage.removeItem(key);
          }
        });
        
        // Remove banned assignments list
        localStorage.removeItem('otls_banned_assignments');
        
        // Update the display
        refreshData();
      } catch (e) {
        console.error('Error clearing assignment bans', e);
      }
    }
  };

  // Show only the trigger button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400 transition-all`}
        title="Open Debug Panel"
      >
        <BugIcon size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50 w-80 rounded-lg bg-background border shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-1 font-semibold">
          <BugIcon size={16} className="text-yellow-500" />
          <span>Debug Panel</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshData}
            className="p-1 hover:bg-muted rounded-full"
            title="Refresh Data"
          >
            <RefreshCcwIcon size={14} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-full"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded-full"
            title="Close"
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 max-h-[70vh] overflow-y-auto text-sm">
        {/* Basic Auth Info */}
        <div className="mb-3">
          <div className="flex items-center gap-1 font-medium mb-1">
            <UserIcon size={14} />
            <span>Authentication</span>
          </div>
          <div className="pl-5 space-y-1">
            <div><strong>Auth Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
            <div><strong>Context Role:</strong> {role || 'None'}</div>
            <div><strong>Cookie Role:</strong> {cookieRole || 'None'}</div>
            <div><strong>User ID:</strong> {user?.userID || 'None'}</div>
          </div>
        </div>

        {/* Page Info */}
        <div className="mb-3">
          <div className="flex items-center gap-1 font-medium mb-1">
            <ShieldIcon size={14} />
            <span>Current Page</span>
          </div>
          <div className="pl-5">
            <div><strong>Path:</strong> {pathname}</div>
          </div>
        </div>

        {/* Role Tools */}
        <div className="mb-3">
          <div className="flex items-center gap-1 font-medium mb-1">
            <span>Set Role</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-2">
            <Button 
              size="sm" 
              variant={cookieRole === 'Admin' ? 'default' : 'outline'} 
              onClick={() => setRole('Admin')}
              className="h-7 text-xs"
            >
              Admin
            </Button>
            <Button 
              size="sm" 
              variant={cookieRole === 'Teacher' ? 'default' : 'outline'} 
              onClick={() => setRole('Teacher')}
              className="h-7 text-xs"
            >
              Teacher
            </Button>
            <Button 
              size="sm" 
              variant={cookieRole === 'Student' ? 'default' : 'outline'} 
              onClick={() => setRole('Student')}
              className="h-7 text-xs"
            >
              Student
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setRole(null)}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Expanded Debug Info */}
        {isExpanded && (
          <>
            {/* Cookies */}
            <div className="mb-3">
              <div className="flex items-center gap-1 font-medium mb-1">
                <CookieIcon size={14} />
                <span>Cookies</span>
              </div>
              <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto max-h-32">
                {JSON.stringify(allCookies, null, 2)}
              </pre>
            </div>

            {/* LocalStorage */}
            <div className="mb-3">
              <div className="flex items-center justify-between gap-1 font-medium mb-1">
                <div className="flex items-center gap-1">
                  <DatabaseIcon size={14} />
                  <span>Local Storage</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={clearAssignmentBans}
                >
                  Clear Assignment Bans
                </Button>
              </div>
              <div className="pl-2 space-y-2">
                {Object.entries(localStorageItems).length === 0 ? (
                  <div className="text-muted-foreground">No localStorage items</div>
                ) : (
                  Object.entries(localStorageItems).map(([key, value]) => (
                    <div key={key} className="border rounded-md p-2">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-xs truncate max-w-[200px]">{key}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => deleteLocalStorageItem(key)}
                          title="Delete this item"
                        >
                          <TrashIcon size={12} />
                        </Button>
                      </div>
                      <div className="text-xs mt-1 font-mono bg-muted p-1 rounded text-wrap break-words">{value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 