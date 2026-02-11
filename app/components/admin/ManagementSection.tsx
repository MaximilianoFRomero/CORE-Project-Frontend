'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersList from './UsersList';
import CreateUserForm from './CreateUserForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, Users } from 'lucide-react';

export default function UserManagementSection() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
            <p className="text-muted-foreground">
              Create and manage users with different permission levels
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <Shield className="h-4 w-4" />
            Super Admin Access
          </div>
        </div>
      </div>
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create New User
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <UsersList />
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardContent>
              <CreateUserForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}