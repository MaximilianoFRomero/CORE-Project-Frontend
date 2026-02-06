// src/components/admin/CreateAdminForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAdminUser } from '@/app/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

// ✅ CORRECCIÓN: Usar .default() correctamente y asegurar tipos
const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  generatePassword: z.boolean(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export default function CreateAdminForm() {
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { mutate: createAdmin, isPending } = useCreateAdminUser();

  // ✅ CORRECCIÓN: Inicializar con valores explícitos
  const form = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      generatePassword: false,
      avatarUrl: '',
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    form.setValue('password', newPassword);
    toast.info('Password generated. Make sure to copy it!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Password copied to clipboard');
  };

  const onSubmit = (data: CreateAdminFormData) => {
    console.log('Form data submitted:', data);
    
    // Preparar datos para enviar
    const submitData: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl || undefined,
    };

    // Si se generó password, añadirlo; si no, usar el password del usuario
    if (data.generatePassword) {
      submitData.generatePassword = true;
      // El password se genera en el backend
    } else if (data.password && data.password.trim() !== '') {
      submitData.password = data.password;
    } else {
      toast.error('Please enter a password or enable password generation');
      return;
    }

    createAdmin(submitData, {
      onSuccess: () => {
        form.reset({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          generatePassword: false,
          avatarUrl: '',
        });
        setGeneratedPassword('');
        if (data.generatePassword) {
          toast.info('Admin created with generated password. Make sure to share it securely.');
        }
      },
      onError: (error: any) => {
        console.error('Error creating admin:', error);
        toast.error(error.message || 'Failed to create admin user');
      },
    });
  };

  const generatePassword = form.watch('generatePassword');
  const currentPassword = form.watch('password');

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Create Admin User</CardTitle>
            <CardDescription>
              Create new admin users with elevated permissions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="admin@company.com" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    The admin will use this email to login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generatePassword"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Generate Password</FormLabel>
                    <FormDescription>
                      Automatically generate a secure password
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          handleGeneratePassword();
                        } else {
                          setGeneratedPassword('');
                          form.setValue('password', '');
                        }
                      }}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!generatePassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter a secure password" 
                        {...field} 
                        disabled={isPending}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Must contain at least 8 characters with uppercase, lowercase, and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {generatedPassword && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Generated Password</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <code className="block p-2 bg-background rounded text-sm font-mono break-all">
                  {generatedPassword}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  This password will not be shown again. Make sure to save it securely.
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/avatar.jpg" 
                      {...field} 
                      disabled={isPending}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validation summary */}
            {!generatePassword && (!currentPassword || currentPassword.trim() === '') && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Please enter a password or enable password generation
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    email: '',
                    firstName: '',
                    lastName: '',
                    password: '',
                    generatePassword: false,
                    avatarUrl: '',
                  });
                  setGeneratedPassword('');
                }}
                disabled={isPending}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || (!generatePassword && (!currentPassword || currentPassword.trim() === ''))}
              >
                {isPending ? (
                  <>
                    <span className="animate-pulse">Creating...</span>
                  </>
                ) : (
                  'Create Admin User'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}