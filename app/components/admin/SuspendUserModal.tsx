'use client';

import { AdminUser } from '@/app/types';
import { useToggleUserStatus } from '@/app/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, ShieldOff, Shield } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SuspendUserModalProps {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SuspendUserModal({
    user,
    open,
    onOpenChange
}: SuspendUserModalProps) {
    const { mutate: toggleStatus, isPending } = useToggleUserStatus();
    const { user: currentUser } = useAuth();

    const isSuspending = user?.status !== 'suspended';
    const newStatus = isSuspending ? 'suspended' : 'active';

    const handleSubmit = () => {
        if (!user) return;

        if (user.id === currentUser?.id) {
            toast.error('Cannot suspend/activate your own account');
            return;
        }

        if (user.role === 'super_admin' && currentUser?.role !== 'super_admin') {
            toast.error('Only super admins can manage other super admins');
            return;
        }

        toggleStatus(
            { userId: user.id, status: newStatus },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isSuspending ? (
                            <>
                                <ShieldOff className="h-5 w-5 text-red-600" />
                                <span className="text-red-600">Suspend User</span>
                            </>
                        ) : (
                            <>
                                <Shield className="h-5 w-5 text-green-600" />
                                <span className="text-green-600">Activate User</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isSuspending
                            ? 'Temporarily disable user access to the platform'
                            : 'Restore user access to the platform'}
                    </DialogDescription>
                </DialogHeader>

                {user && (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isSuspending ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {isSuspending ? (
                                        <ShieldOff className="h-6 w-6" />
                                    ) : (
                                        <Shield className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="capitalize">
                                            {user.role.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'}>
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded-lg ${isSuspending ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle className={`h-5 w-5 mt-0.5 ${isSuspending ? 'text-red-600' : 'text-green-600'
                                    }`} />
                                <div>
                                    <h4 className="font-medium">
                                        {isSuspending ? 'Suspension Consequences' : 'Activation Benefits'}
                                    </h4>
                                    <ul className="mt-2 space-y-2 text-sm">
                                        {isSuspending ? (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                                                    <span>User cannot login to the platform</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                                                    <span>Active sessions will be terminated immediately</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                                                    <span>User will receive a suspension notification email</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5"></span>
                                                    <span>Data remains intact and can be restored</span>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></span>
                                                    <span>User can login to the platform again</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></span>
                                                    <span>All permissions and roles are restored</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></span>
                                                    <span>User will receive a reactivation notification email</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
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
                                onClick={handleSubmit}
                                variant={isSuspending ? 'destructive' : 'default'}
                                disabled={isPending}
                            >
                                {isPending ? 'Processing...' : (
                                    isSuspending ? 'Suspend User' : 'Activate User'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}