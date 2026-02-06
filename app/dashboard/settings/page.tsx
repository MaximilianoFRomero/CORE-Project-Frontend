// src/app/dashboard/settings/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/providers/auth-provider';
import AdminManagementSection from "@/app/components/admin/AdminManagementSection";
import { Shield, User, Key, Users, Mail, Calendar, Settings as SettingsIcon, Bell, Globe, Database } from "lucide-react";

export default function SettingsPage() {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings, team permissions, and platform preferences
        </p>
      </div>

      {/* User Info Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user?.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                Super Administrator
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Configure your personal profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Account Role</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
                      {isSuperAdmin && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium text-sm font-mono truncate">{user?.id}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your projects
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Default Dashboard View</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred dashboard layout
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab - Conditional Content */}
        <TabsContent value="team" className="space-y-6">
          {isSuperAdmin ? (
            <AdminManagementSection />
          ) : isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage team members and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
                  <p className="text-muted-foreground mb-4">
                    You have admin access but need super-admin privileges for advanced team management.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Your current role: <span className="font-medium capitalize">{user?.role}</span></p>
                    <p className="mt-2">As an admin, you can:</p>
                    <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        Manage projects and deployments
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        View all team projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        Access analytics and reports
                      </li>
                    </ul>
                    <p className="mt-4">Contact a super-admin for team management access.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
                <CardDescription>
                  Manage team members and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
                  <p className="text-muted-foreground mb-4">
                    You need admin or super-admin privileges to access team management.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Your current role: <span className="font-medium capitalize">{user?.role}</span></p>
                    <p className="mt-1">Contact an admin or super-admin for access.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Project Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when projects are created or updated
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Deployment Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts about deployment status changes
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys and access tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Personal Access Tokens</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate personal access tokens for API authentication
                  </p>
                  <Button variant="outline" size="sm">
                    Generate New Token
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Repository Tokens</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage tokens for repository integrations (GitHub, GitLab)
                  </p>
                  <Button variant="outline" size="sm">
                    Add Repository Token
                  </Button>
                </div>

                {isAdmin && (
                  <div className="p-4 border rounded-lg border-primary/20 bg-primary/5">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Admin API Tokens
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate tokens with elevated permissions for administrative tasks
                    </p>
                    <Button variant="default" size="sm">
                      Generate Admin Token
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs can be implemented as needed */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect third-party services and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Integrations coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>
                Configure database connections and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Database settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}