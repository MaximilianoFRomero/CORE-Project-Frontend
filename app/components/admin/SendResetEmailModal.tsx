'use client';

import { AdminUser } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Mail, AlertCircle } from 'lucide-react';

interface SendResetEmailModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmail: (email: string) => void;
  isSending: boolean;
}

export default function SendResetEmailModal({ 
  user, 
  open, 
  onOpenChange,
  onSendEmail,
  isSending
}: SendResetEmailModalProps) {

  const handleSend = () => {
    if (!user) return;
    onSendEmail(user.email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Send Password Reset Email
          </DialogTitle>
          <DialogDescription>
            Send a password reset link to the user's email address
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      Will receive reset instructions
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">What happens next?</h4>
                  <ul className="mt-2 space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></span>
                      <span>User will receive an email with password reset instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></span>
                      <span>The reset link will be valid for 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></span>
                      <span>User can set a new password by following the link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></span>
                      <span>Existing sessions will remain active until expiration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <span className="animate-pulse">Sending...</span>
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}