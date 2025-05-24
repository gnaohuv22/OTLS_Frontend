'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function DebugPage() {
  const { user, role, isAuthenticated } = useAuth();
  const [cookieRole, setCookieRole] = useState<string | null>(null);
  const [allCookies, setAllCookies] = useState<Record<string, string>>({});
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({});

  // Collect debug information on component mount
  useEffect(() => {
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
          items[key] = localStorage.getItem(key) || '';
        }
      }
      setLocalStorageItems(items);
    }
  }, []);

  // Handle setting role cookie
  const setRole = (newRole: string | null) => {
    if (newRole) {
      Cookies.set('role', newRole, { path: '/' });
      toast({
        title: 'Role Updated',
        description: `Set role cookie to "${newRole}"`,
      });
    } else {
      Cookies.remove('role', { path: '/' });
      toast({
        title: 'Role Removed',
        description: 'Removed role cookie',
      });
    }

    // Update state
    setCookieRole(newRole);
    
    // Reload cookies
    setAllCookies(Cookies.get());
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user authentication information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Role from Context:</strong> {role || 'None'}
              </div>
              <div>
                <strong>Role from Cookie:</strong> {cookieRole || 'None'}
              </div>
              <div>
                <strong>User ID:</strong> {user?.userID || 'None'}
              </div>
              <div>
                <strong>User Name:</strong> {user?.fullName || 'None'}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={() => setRole('Admin')}>
              Set Role to Admin
            </Button>
            <Button variant="outline" onClick={() => setRole('Teacher')}>
              Set Role to Teacher
            </Button>
            <Button variant="outline" onClick={() => setRole('Student')}>
              Set Role to Student
            </Button>
            <Button variant="destructive" onClick={() => setRole(null)}>
              Remove Role
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Pages</CardTitle>
            <CardDescription>Test access to admin pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Current role: {cookieRole || role || 'None'}</p>
              <p>
                Access should be granted if your role is <strong>Admin</strong>.
                Otherwise, you should be redirected to the dashboard.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/subjects">Go to Subjects Admin</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/accounts">Go to Accounts Admin</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/classes">Go to Classes Admin</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Cookies and Local Storage</CardTitle>
            <CardDescription>All stored browser data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Cookies</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                  {JSON.stringify(allCookies, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Local Storage</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                  {JSON.stringify(localStorageItems, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAllCookies(Cookies.get());
                const items: Record<string, string> = {};
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key) {
                    items[key] = localStorage.getItem(key) || '';
                  }
                }
                setLocalStorageItems(items);
                toast({
                  title: 'Refreshed',
                  description: 'Browser data refreshed',
                });
              }}
            >
              Refresh Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 