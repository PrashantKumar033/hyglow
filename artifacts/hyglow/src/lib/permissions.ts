export interface ModulePerms {
  view: boolean;
  use: boolean;
  edit: boolean;
  delete: boolean;
}

export type SidebarPermissions = Record<string, ModulePerms>;

export const SIDEBAR_MODULES = [
  { key: "dashboard",       label: "Dashboard",        section: "main" },
  { key: "ledger",          label: "Account Ledger",   section: "main" },
  { key: "hr",              label: "HR",               section: "main" },
  { key: "sales",           label: "Sales",            section: "main" },
  { key: "products",        label: "Products",         section: "main" },
  { key: "inventory",       label: "Inventory",        section: "main" },
  { key: "purchase_orders", label: "Purchase Orders",  section: "main" },
  { key: "sales_orders",    label: "Sales Orders",     section: "main" },
  { key: "invoices",        label: "Invoices",         section: "main" },
  { key: "expenses",        label: "Expenses",         section: "main" },
  { key: "reports",         label: "Reports",          section: "main" },
  { key: "tracking",        label: "Tracking",         section: "main" },
  { key: "logistics",       label: "Logistics",        section: "main" },
  { key: "notifications",   label: "Notifications",    section: "main" },
  { key: "messages",        label: "Messages",         section: "main" },
  { key: "support",         label: "Support",          section: "main" },
] as const;

export const ALL_PERMS: ModulePerms = { view: true, use: true, edit: true, delete: true };
export const NO_PERMS:  ModulePerms = { view: false, use: false, edit: false, delete: false };

export const DEFAULT_ADMIN_PERMISSIONS: SidebarPermissions = Object.fromEntries(
  SIDEBAR_MODULES.map(m => [m.key, { ...ALL_PERMS }])
);

export const DEFAULT_USER_PERMISSIONS: SidebarPermissions = Object.fromEntries(
  SIDEBAR_MODULES.map(m => [
    m.key,
    ["dashboard", "notifications", "messages", "support"].includes(m.key)
      ? { view: true, use: true, edit: false, delete: false }
      : { ...NO_PERMS },
  ])
);

export function parsePermissions(raw: string | null | undefined, role: string): SidebarPermissions {
  if (role === "admin") return DEFAULT_ADMIN_PERMISSIONS;
  if (!raw) return DEFAULT_USER_PERMISSIONS;
  try {
    return JSON.parse(raw) as SidebarPermissions;
  } catch {
    return DEFAULT_USER_PERMISSIONS;
  }
}

export function canView(perms: SidebarPermissions, key: string): boolean {
  return perms[key]?.view ?? false;
}
export function canUse(perms: SidebarPermissions, key: string): boolean {
  return perms[key]?.use ?? false;
}
export function canEdit(perms: SidebarPermissions, key: string): boolean {
  return perms[key]?.edit ?? false;
}
export function canDelete(perms: SidebarPermissions, key: string): boolean {
  return perms[key]?.delete ?? false;
}
