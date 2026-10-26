# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Recharts

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run bootstrap-admin` — create the first admin in an empty database
- `pnpm --filter @workspace/db run seed` — destructive demo-data seed; requires explicit confirmation and a private admin password
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Hyglow ERP

Full-featured ERP management SaaS application.

### Auth
- Bearer tokens are signed with `AUTH_SECRET` and expire after seven days
- Token stored in `localStorage["hyglow_token"]`
- Passwords use salted scrypt hashes; legacy SHA-256 hashes are upgraded after successful login
- Admin API routes require an admin account; public signup is disabled unless `ALLOW_SIGNUP=true`
- Production requires `DATABASE_URL` and a private `AUTH_SECRET`

### Database Schema (16 tables)
- `usersTable`, `rolesTable` — auth and RBAC
- `employeesTable` — HR management
- `productsTable` — product catalog
- `inventoryTable` — stock levels per warehouse
- `salesTable`, `purchaseOrdersTable`, `salesOrdersTable` — transactions
- `invoicesTable` — billing
- `expensesTable` — expense tracking
- `shipmentsTable` — logistics
- `ledgerEntriesTable` — double-entry bookkeeping
- `notificationsTable`, `messagesTable` — communications
- `supportTicketsTable` — help/support
- `promotionsTable` — discount codes

### Frontend Pages (18 pages)
All pages in `artifacts/hyglow/src/pages/`:
1. `login.tsx` — split-panel login with demo credentials
2. `dashboard.tsx` — KPI stats, revenue chart, quick actions, activity feed
3. `ledger.tsx` — double-entry bookkeeping table
4. `hr.tsx` — employee management with search + dept chart
5. `sales.tsx` — sales records with search + top customers leaderboard
6. `products.tsx` — product catalog with search
7. `inventory.tsx` — stock levels with warehouse filter, fill-rate bars
8. `orders.tsx` — purchase/sales orders with search (takes `type` prop)
9. `invoices.tsx` — invoices with Mark as Paid dropdown, overdue alerts
10. `expenses.tsx` — expenses with pie chart by category
11. `reports.tsx` — financial/sales/inventory analytics with multiple charts
12. `tracking.tsx` — live shipment tracking with timeline
13. `logistics.tsx` — shipment management table
14. `notifications.tsx` — notification cards with mark-read
15. `messages.tsx` — internal messaging
16. `support.tsx` — support ticket management
17. `admin-panel.tsx` — user management (admin only)
18. `roles.tsx` — role + permission management
19. `promotions.tsx` — discount code management
20. `profile.tsx` — profile + password + notification settings

### Sidebar (`dashboard-layout.tsx`)
- Live notification badge count (from API)
- Live message badge count (from API)
- User avatar + name + email in footer
- Active state: filled primary background
- Icons: Archive for Inventory, MapPin for Tracking, Truck for Logistics

### API Routes (`artifacts/api-server/src/routes/`)
- `/api/auth` — login, logout, profile
- `/api/employees` — HR CRUD
- `/api/hr/department-stats` — dept distribution
- `/api/products` — product catalog
- `/api/inventory` — stock management
- `/api/sales` — sales records + top customers
- `/api/purchase-orders`, `/api/sales-orders` — orders
- `/api/invoices` — invoice management (PUT for mark-paid)
- `/api/expenses` — expense tracking + by-category
- `/api/shipments` — logistics
- `/api/tracking/:trackingNumber` — live tracking
- `/api/ledger` — bookkeeping entries + summary
- `/api/notifications` — notifications + mark-read
- `/api/messages` — internal messages
- `/api/support` — support tickets
- `/api/admin` — user + role + promotion management
- `/api/promotions` — discount codes
- `/api/reports` — financial/sales/inventory reports
- `/api/dashboard` — summary stats + activity + revenue chart

### CSS Theme
- Dark navy sidebar: `--sidebar: 222.2 84% 4.9%`
- Teal primary: `--primary: 191 97% 31%`
- White/light background in main area
