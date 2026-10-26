import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  useGetAdminUsers, useCreateAdminUser, useUpdateAdminUser,
  useDeleteAdminUser, getGetAdminUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Settings, Shield, Users, Pencil, Trash2, Search,
  UserCog, Key, CheckCircle2, Crown, Eye, EyeOff,
  LayoutGrid, Lock, Unlock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SIDEBAR_MODULES, SidebarPermissions, ModulePerms,
  DEFAULT_USER_PERMISSIONS,
} from "@/lib/permissions";


interface UserForm { name: string; email: string; password: string; role: string; company: string; }

const ROLES = [
  { value: "admin",   label: "Admin",   color: "bg-primary/10 text-primary border-primary/20",         icon: Crown },
  { value: "manager", label: "Manager", color: "bg-violet-500/10 text-violet-600 border-violet-500/20", icon: Shield },
  { value: "user",    label: "User",    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",        icon: Users },
  { value: "viewer",  label: "Viewer",  color: "bg-slate-500/10 text-slate-600 border-slate-500/20",     icon: Eye },
];

function roleBadge(role: string) {
  const r = ROLES.find(x => x.value === role) ?? ROLES[2];
  return <Badge className={`${r.color} capitalize font-medium`} variant="outline">{r.label}</Badge>;
}

const PERM_COLS: { key: keyof ModulePerms; label: string; color: string }[] = [
  { key: "view",   label: "View",   color: "text-blue-600"    },
  { key: "use",    label: "Use",    color: "text-teal-600"    },
  { key: "edit",   label: "Edit",   color: "text-amber-600"   },
  { key: "delete", label: "Delete", color: "text-rose-600"    },
];

function emptyPerms(): SidebarPermissions {
  return Object.fromEntries(SIDEBAR_MODULES.map(m => [m.key, { view: false, use: false, edit: false, delete: false }]));
}

function SidebarAccessTab({ users }: { users: { id: number; name: string; email: string; role: string }[] }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [perms, setPerms] = useState<SidebarPermissions>(emptyPerms());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const nonAdminUsers = users.filter(u => u.role !== "admin");
  const selectedUser = nonAdminUsers.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    const token = localStorage.getItem("hyglow_token");
    fetch(`/api/admin/users/${selectedUserId}/sidebar-permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.sidebarPermissions) {
          try { setPerms(JSON.parse(data.sidebarPermissions)); } catch { setPerms(DEFAULT_USER_PERMISSIONS); }
        } else {
          setPerms(DEFAULT_USER_PERMISSIONS);
        }
      })
      .catch(() => setPerms(DEFAULT_USER_PERMISSIONS))
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  const toggle = (moduleKey: string, permKey: keyof ModulePerms) => {
    setPerms(prev => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [permKey]: !prev[moduleKey]?.[permKey] },
    }));
  };

  const toggleRow = (moduleKey: string, value: boolean) => {
    setPerms(prev => ({
      ...prev,
      [moduleKey]: { view: value, use: value, edit: value, delete: value },
    }));
  };

  const applyPreset = (preset: "full" | "viewOnly" | "none") => {
    if (preset === "full") setPerms(Object.fromEntries(SIDEBAR_MODULES.map(m => [m.key, { view: true, use: true, edit: true, delete: true }])));
    else if (preset === "viewOnly") setPerms(Object.fromEntries(SIDEBAR_MODULES.map(m => [m.key, { view: true, use: true, edit: false, delete: false }])));
    else setPerms(emptyPerms());
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    const token = localStorage.getItem("hyglow_token");
    try {
      await fetch(`/api/admin/users/${selectedUserId}/sidebar-permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sidebarPermissions: perms }),
      });
      toast({ title: "Permissions saved", description: `${selectedUser?.name}'s sidebar access has been updated.` });
    } catch {
      toast({ title: "Error saving permissions", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const allOn = SIDEBAR_MODULES.every(m => Object.values(perms[m.key] ?? {}).every(Boolean));
  const allOff = SIDEBAR_MODULES.every(m => Object.values(perms[m.key] ?? {}).every(v => !v));

  return (
    <div className="space-y-5">
      {/* User selector */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <Label className="text-sm font-semibold">Select User to Configure</Label>
              <p className="text-xs text-muted-foreground">Admins always have full access. Configure sidebar access for Managers, Users, and Viewers.</p>
            </div>
            <Select value={selectedUserId?.toString() ?? ""} onValueChange={v => setSelectedUserId(Number(v))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {nonAdminUsers.length === 0
                  ? <SelectItem value="none" disabled>No non-admin users</SelectItem>
                  : nonAdminUsers.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{u.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                        {roleBadge(u.role)}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedUserId && (
        <>
          {/* Header + presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {selectedUser?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{selectedUser?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.email} · {selectedUser?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Quick presets:</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyPreset("full")}>
                <Unlock className="w-3 h-3 mr-1" /> Full Access
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyPreset("viewOnly")}>
                <Eye className="w-3 h-3 mr-1" /> View Only
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => applyPreset("none")}>
                <Lock className="w-3 h-3 mr-1" /> No Access
              </Button>
            </div>
          </div>

          {/* Permissions matrix */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading permissions...
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground w-48">Module</th>
                        {PERM_COLS.map(col => (
                          <th key={col.key} className={`text-center px-4 py-3 font-semibold text-xs w-24 ${col.color}`}>
                            {col.label}
                          </th>
                        ))}
                        <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground w-28">All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIDEBAR_MODULES.map((mod, i) => {
                        const mp = perms[mod.key] ?? { view: false, use: false, edit: false, delete: false };
                        const rowOn = Object.values(mp).every(Boolean);
                        return (
                          <tr key={mod.key} className={`border-b last:border-b-0 transition-colors hover:bg-muted/20 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                            <td className="px-4 py-3">
                              <span className="font-medium text-sm">{mod.label}</span>
                            </td>
                            {PERM_COLS.map(col => (
                              <td key={col.key} className="px-4 py-3 text-center">
                                <Switch
                                  checked={mp[col.key]}
                                  onCheckedChange={() => toggle(mod.key, col.key)}
                                  className="data-[state=checked]:bg-primary"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRow(mod.key, !rowOn)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                  rowOn
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {rowOn ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {rowOn ? "On" : "Off"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Changes take effect when the user next logs in or refreshes.
            </p>
            <Button onClick={handleSave} disabled={saving} className="min-w-32">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Permissions</>
              )}
            </Button>
          </div>
        </>
      )}

      {!selectedUserId && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl">
          <LayoutGrid className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Select a user above to manage their sidebar access</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Control which modules they can view, use, edit, or delete</p>
        </div>
      )}
    </div>
  );
}

function EditUserDialog({ user, open, onOpenChange }: {
  user: { id: number; name: string; email: string; role: string; company: string } | null;
  open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [role, setRole] = useState(user?.role ?? "user");
  const [showPassword, setShowPassword] = useState(false);
  const updateUser = useUpdateAdminUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<UserForm>();

  useEffect(() => {
    if (user) { reset({ name: user.name, email: user.email, company: user.company, password: "" }); setRole(user.role); }
  }, [user, reset]);

  const onSubmit = async (data: UserForm) => {
    if (!user) return;
    const payload: Partial<UserForm> = { name: data.name, email: data.email, company: data.company, role };
    if (data.password?.trim()) payload.password = data.password.trim();
    await updateUser.mutateAsync({ id: user.id, data: payload as UserForm });
    queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
    toast({ title: "User updated", description: `${data.name}'s profile has been saved.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> Edit User</DialogTitle>
        </DialogHeader>
        {user && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
              <Avatar className="w-10 h-10"><AvatarFallback className="bg-primary text-primary-foreground font-bold">{user.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
              <div><p className="font-semibold text-sm">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
              {roleBadge(role)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Full Name</Label><Input {...register("name", { required: true })} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Company</Label><Input {...register("company")} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-medium">Email</Label><Input type="email" {...register("email", { required: true })} className="h-9" /></div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => { const Icon = r.icon; return (
                  <button key={r.value} type="button" onClick={() => { setRole(r.value); setValue("role", r.value); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${role === r.value ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/60 text-muted-foreground"}`}>
                    <Icon className="w-4 h-4 shrink-0" />{r.label}{role === r.value && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ); })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-muted-foreground" /> New Password <span className="text-muted-foreground font-normal">(leave blank to keep)</span></Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} minLength={8} {...register("password")} className="h-9 pr-9" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={updateUser.isPending}>{updateUser.isPending ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPanelPage() {
  const [tab, setTab] = useState<"users" | "access">("users");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<{ id: number; name: string; email: string; role: string; company: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [createRole, setCreateRole] = useState("user");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const { data: users, isLoading } = useGetAdminUsers();
  const createUser = useCreateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<UserForm>({ defaultValues: { role: "user" } });

  const filtered = (users ?? []).filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const onCreateSubmit = async (data: UserForm) => {
    await createUser.mutateAsync({ data: { ...data, role: createRole } });
    queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
    reset(); setCreateRole("user"); setCreateOpen(false);
    toast({ title: "User created", description: `${data.name} has been added.` });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser.mutateAsync({ id: deleteTarget.id });
    queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
    toast({ title: "User deleted", variant: "destructive" });
    setDeleteTarget(null);
  };

  const counts = {
    total: users?.length ?? 0,
    admin: users?.filter(u => u.role === "admin").length ?? 0,
    manager: users?.filter(u => u.role === "manager").length ?? 0,
    user: users?.filter(u => u.role === "user").length ?? 0,
    viewer: users?.filter(u => u.role === "viewer").length ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Admin Control Panel</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage users, roles, and sidebar access permissions</p>
          </div>
          {tab === "users" && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-user"><Plus className="w-4 h-4 mr-2" /> Create User</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Create New User</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 mt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Full Name</Label><Input {...register("name", { required: true })} className="h-9" placeholder="Rahul Sharma" /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Company</Label><Input {...register("company")} className="h-9" placeholder="Acme Pvt. Ltd." /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs font-medium">Email</Label><Input type="email" {...register("email", { required: true })} className="h-9" placeholder="user@company.com" /></div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Password</Label>
                    <div className="relative">
                      <Input type={showCreatePassword ? "text" : "password"} minLength={8} {...register("password", { required: true, minLength: 8 })} className="h-9 pr-9" placeholder="At least 8 characters" />
                      <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Role</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(r => { const Icon = r.icon; return (
                        <button key={r.value} type="button" onClick={() => { setCreateRole(r.value); setValue("role", r.value); }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${createRole === r.value ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/60 text-muted-foreground"}`}>
                          <Icon className="w-4 h-4 shrink-0" />{r.label}{createRole === r.value && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                      ); })}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createUser.isPending}>{createUser.isPending ? "Creating..." : "Create User"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Users", value: counts.total, icon: Users,  color: "text-foreground" },
            { label: "Admins",      value: counts.admin,   icon: Crown,  color: "text-primary" },
            { label: "Managers",    value: counts.manager, icon: Shield, color: "text-violet-600" },
            { label: "Users",       value: counts.user,    icon: Users,  color: "text-blue-600" },
            { label: "Viewers",     value: counts.viewer,  icon: Eye,    color: "text-slate-500" },
          ].map(s => { const Icon = s.icon; return (
            <Card key={s.label}>
              <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{s.label}</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent>
            </Card>
          ); })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {([
            { key: "users",  label: "User Management", icon: Users },
            { key: "access", label: "Sidebar Access",  icon: LayoutGrid },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab: User Management */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>User</TableHead><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2 text-muted-foreground"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />Loading users...</div></TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No users found.</TableCell></TableRow>
                    ) : filtered.map(u => (
                      <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{u.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                            <div><p className="font-semibold text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.company || "—"}</TableCell>
                        <TableCell>{roleBadge(u.role)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5"
                              onClick={() => setEditUser({ id: u.id, name: u.name, email: u.email, role: u.role, company: u.company ?? "" })}>
                              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                              onClick={() => setDeleteTarget({ id: u.id, name: u.name })}>
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Sidebar Access */}
        {tab === "access" && <SidebarAccessTab users={users ?? []} />}

        <EditUserDialog user={editUser} open={!!editUser} onOpenChange={v => { if (!v) setEditUser(null); }} />

        <AlertDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user "{deleteTarget?.name}"?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. The user will permanently lose access to Hyglow.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete User</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
