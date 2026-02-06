// src/components/admin/AdminManagementSection.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAdminForm from './CreateAdminForm';
import AdminUsersList from './AdminUsersList';
import { Shield, Users, UserPlus } from 'lucide-react';

export default function AdminManagementSection() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>
            <p className="text-muted-foreground">
              Create and manage admin users with elevated permissions
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <Shield className="h-4 w-4" />
            Super Admin Access
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create Admin
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Admins
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <CreateAdminForm />
        </TabsContent>
        
        <TabsContent value="manage" className="mt-6">
          <AdminUsersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}