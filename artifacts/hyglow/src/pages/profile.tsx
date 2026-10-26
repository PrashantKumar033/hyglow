import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetProfile, useUpdateProfile, useChangePassword, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ProfileForm { name: string; phone: string; company: string; position: string; timezone: string; language: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile } = useForm<ProfileForm>();
  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword } = useForm<PasswordForm>();

  useEffect(() => {
    if (profile) { resetProfile({ name: profile.name, phone: profile.phone ?? "", company: profile.company, position: profile.position, timezone: profile.timezone, language: profile.language }); }
  }, [profile, resetProfile]);

  const onProfileSubmit = async (data: ProfileForm) => {
    await updateProfile.mutateAsync({ data: { ...data, phone: data.phone || null } });
    queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    toast({ title: "Profile updated" });
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    await changePassword.mutateAsync({ data: { currentPassword: data.currentPassword, newPassword: data.newPassword } });
    resetPassword(); toast({ title: "Password changed successfully" });
  };

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center py-16"><p className="text-muted-foreground">Loading profile...</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16"><AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{profile?.name?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <div><h2 className="text-2xl font-bold">{profile?.name}</h2><p className="text-muted-foreground">{profile?.email}</p><p className="text-sm text-primary font-medium">{profile?.position} at {profile?.company}</p></div>
        </div>

        <Tabs defaultValue="general">
          <TabsList><TabsTrigger value="general"><User className="w-4 h-4 mr-2" />General</TabsTrigger><TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Security</TabsTrigger><TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger></TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Profile Information</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Full Name</Label><Input {...regProfile("name")} data-testid="input-name" /></div>
                    <div><Label>Phone</Label><Input {...regProfile("phone")} data-testid="input-phone" /></div>
                    <div><Label>Company</Label><Input {...regProfile("company")} data-testid="input-company" /></div>
                    <div><Label>Position</Label><Input {...regProfile("position")} data-testid="input-position" /></div>
                    <div><Label>Timezone</Label><Input {...regProfile("timezone")} data-testid="input-timezone" /></div>
                    <div><Label>Language</Label><Input {...regProfile("language")} data-testid="input-language" /></div>
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4 max-w-md">
                  <div><Label>Current Password</Label><Input type="password" {...regPassword("currentPassword")} data-testid="input-current-password" /></div>
                  <div><Label>New Password</Label><Input type="password" {...regPassword("newPassword")} data-testid="input-new-password" /></div>
                  <div><Label>Confirm New Password</Label><Input type="password" {...regPassword("confirmPassword")} data-testid="input-confirm-password" /></div>
                  <Button type="submit" disabled={changePassword.isPending} data-testid="button-change-password">Change Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates via email</p></div>
                  <Switch defaultChecked={profile?.notifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
                  <Switch defaultChecked={profile?.twoFactor} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
