'use client';

import { AdminUser } from '@/app/types';
import { useDeleteUser } from '@/app/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Trash2, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeleteUserModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserModal({ 
  user, 
  open, 
  onOpenChange 
}: DeleteUserModalProps) {
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;

    deleteUser(user.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. All user data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-6">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  {user.role === 'super_admin' || user.role === 'admin' ? (
                    <Shield className="h-6 w-6" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-red-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-red-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white">
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant="destructive">
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Irreversible Action</h4>
                  <ul className="mt-2 space-y-2 text-sm text-red-700">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                      <span>User account will be permanently deleted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                      <span>All user data will be removed from the system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                      <span>User will lose access to all projects and resources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                      <span>This action cannot be undone</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Type the user's email to confirm deletion:
              </p>
              <div className="text-center p-3 bg-gray-50 border rounded-md">
                <code className="text-sm font-medium">{user.email}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Make sure this is the correct user before proceeding
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete User Permanently'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}