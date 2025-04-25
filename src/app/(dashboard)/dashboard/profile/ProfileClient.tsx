'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Edit, Mail, User } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  _count: {
    transactions: number;
  };
}

export default function ProfileClient() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="p-8 text-center">
          <CardTitle className="mb-4">User Not Found</CardTitle>
          <CardDescription>
            Please sign in to view your profile.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // Format data for display
  const joinDate = new Date(user.createdAt || new Date()).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - User profile card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your account details and personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {userData?.name || user.fullName || user.username || 'User'}
                </h2>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4" />
                  {userData?.email || user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </h3>
                <p>{joinDate}</p>
              </div>
              
              <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Transactions
                </h3>
                <p>{userData?._count?.transactions || 0} registered transactions</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right column - Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Recent activity in your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4 py-2">
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-xs text-muted-foreground">Today, {new Date().toLocaleTimeString()}</p>
              </div>
              
              {userData && userData._count && userData._count.transactions > 0 ? (
                <div className="border-l-2 border-primary pl-4 py-2">
                  <p className="text-sm font-medium">Transactions Registered</p>
                  <p className="text-xs text-muted-foreground">{userData._count.transactions} transactions total</p>
                </div>
              ) : (
                <div className="border-l-2 border-gray-300 pl-4 py-2">
                  <p className="text-sm font-medium">No Transactions</p>
                  <p className="text-xs text-muted-foreground">You haven&apos;t added any transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 