import * as crypto from "crypto";
import { db } from "./src/index";
import {
  usersTable, ledgerEntriesTable, employeesTable, salesTable,
  productsTable, inventoryTable, purchaseOrdersTable, salesOrdersTable,
  invoicesTable, expensesTable, shipmentsTable, notificationsTable,
  messagesTable, supportTicketsTable, rolesTable, promotionsTable
} from "./src/schema";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    N: 1 << 14,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

async function seed() {
  if (process.env.RUN_DESTRUCTIVE_DEMO_SEED !== "true") {
    throw new Error("This seed deletes existing data. Set RUN_DESTRUCTIVE_DEMO_SEED=true to confirm.");
  }
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12 || adminPassword.length > 128) {
    throw new Error("Set SEED_ADMIN_PASSWORD to a unique password between 12 and 128 characters.");
  }

  console.log("🌱 Seeding database...");

  // Clear tables in safe order
  await db.delete(messagesTable);
  await db.delete(notificationsTable);
  await db.delete(supportTicketsTable);
  await db.delete(shipmentsTable);
  await db.delete(invoicesTable);
  await db.delete(expensesTable);
  await db.delete(salesOrdersTable);
  await db.delete(purchaseOrdersTable);
  await db.delete(salesTable);
  await db.delete(inventoryTable);
  await db.delete(productsTable);
  await db.delete(ledgerEntriesTable);
  await db.delete(promotionsTable);
  await db.delete(rolesTable);
  await db.delete(employeesTable);
  await db.delete(usersTable);

  const pwHash = hashPassword(adminPassword);

  // Users
  await db.insert(usersTable).values([
    { name: "Admin User",     email: "admin@hyglow.com",  passwordHash: pwHash, role: "admin",     company: "Hyglow Inc" },
    { name: "Marcus Johnson", email: "marcus@hyglow.com", passwordHash: pwHash, role: "manager",   company: "Hyglow Inc" },
    { name: "Priya Patel",    email: "priya@hyglow.com",  passwordHash: pwHash, role: "finance",   company: "Hyglow Inc" },
    { name: "Tom Williams",   email: "tom@hyglow.com",    passwordHash: pwHash, role: "logistics", company: "Hyglow Inc" },
  ]);
  console.log("✅ Users");

  // Roles
  await db.insert(rolesTable).values([
    { name: "admin",     description: "Full system access",               permissions: JSON.stringify(["*"]),                                                                                      userCount: 1 },
    { name: "manager",   description: "Manage team and operations",       permissions: JSON.stringify(["hr:read","hr:write","sales:read","sales:write","reports:read"]),                           userCount: 1 },
    { name: "finance",   description: "Financial data access",            permissions: JSON.stringify(["ledger:read","ledger:write","invoices:read","invoices:write","expenses:read","expenses:write"]), userCount: 1 },
    { name: "logistics", description: "Logistics and shipping access",    permissions: JSON.stringify(["shipments:read","shipments:write","inventory:read","orders:read"]),                        userCount: 1 },
    { name: "sales_rep", description: "Sales team member",               permissions: JSON.stringify(["sales:read","sales:write","products:read","orders:read","orders:write"]),                  userCount: 0 },
    { name: "viewer",    description: "Read-only access across modules",  permissions: JSON.stringify(["*:read"]),                                                                                 userCount: 0 },
  ]);
  console.log("✅ Roles");

  // Employees
  await db.insert(employeesTable).values([
    { name: "Marcus Johnson", email: "marcus@hyglow.com", department: "Management",  position: "CEO",                 salary: 12000, status: "active",   joinDate: "2020-01-15", phone: "+1-555-0101" },
    { name: "Priya Patel",    email: "priya@hyglow.com",  department: "Finance",     position: "CFO",                 salary: 11000, status: "active",   joinDate: "2020-03-01", phone: "+1-555-0102" },
    { name: "Tom Williams",   email: "tom@hyglow.com",    department: "Logistics",   position: "Operations Manager",  salary: 9500,  status: "active",   joinDate: "2021-06-01", phone: "+1-555-0103" },
    { name: "Aisha Okonkwo",  email: "aisha@hyglow.com",  department: "Sales",       position: "Sales Director",      salary: 10500, status: "active",   joinDate: "2021-09-15", phone: "+1-555-0104" },
    { name: "Lucas Chen",     email: "lucas@hyglow.com",  department: "Engineering", position: "Lead Developer",      salary: 9800,  status: "active",   joinDate: "2022-02-01", phone: "+1-555-0105" },
    { name: "Sofia Martinez", email: "sofia@hyglow.com",  department: "HR",          position: "HR Manager",          salary: 8500,  status: "active",   joinDate: "2022-05-10", phone: "+1-555-0106" },
    { name: "James Okafor",   email: "james@hyglow.com",  department: "Sales",       position: "Account Executive",   salary: 7200,  status: "active",   joinDate: "2023-01-20", phone: "+1-555-0107" },
    { name: "Nina Hoffman",   email: "nina@hyglow.com",   department: "Marketing",   position: "Marketing Manager",   salary: 8000,  status: "active",   joinDate: "2023-03-05", phone: "+1-555-0108" },
    { name: "Derek Chase",    email: "derek@hyglow.com",  department: "Finance",     position: "Financial Analyst",   salary: 7500,  status: "active",   joinDate: "2023-07-01", phone: "+1-555-0109" },
    { name: "Elena Vasquez",  email: "elena@hyglow.com",  department: "Engineering", position: "Backend Engineer",    salary: 8800,  status: "on-leave", joinDate: "2023-10-15", phone: "+1-555-0110" },
  ]);
  console.log("✅ Employees");

  // Products
  const products = await db.insert(productsTable).values([
    { name: "Enterprise Server X200",       sku: "SRV-X200",  category: "Hardware",    price: 8999, cost: 5500, stock: 45,  unit: "pcs", description: "High-performance 64-core enterprise rack server",     status: "active" },
    { name: "ProDesk Workstation",          sku: "WKS-PRO1",  category: "Hardware",    price: 3499, cost: 2100, stock: 32,  unit: "pcs", description: "Professional-grade desktop workstation",              status: "active" },
    { name: "ERP Suite – Starter",          sku: "SW-ERP-S",  category: "Software",    price: 1199, cost: 200,  stock: 120, unit: "lic", description: "ERP starter package for small businesses",            status: "active" },
    { name: "ERP Suite – Enterprise",       sku: "SW-ERP-E",  category: "Software",    price: 4999, cost: 500,  stock: 75,  unit: "lic", description: "Full-featured ERP for large enterprises",             status: "active" },
    { name: "SmartSwitch 48-Port",          sku: "NET-SW48",  category: "Networking",  price: 1849, cost: 900,  stock: 18,  unit: "pcs", description: "Managed 48-port Gigabit network switch",             status: "active" },
    { name: "4K Conference Camera",         sku: "CAM-4K01",  category: "Peripherals", price: 699,  cost: 380,  stock: 6,   unit: "pcs", description: "Wide-angle 4K conference camera with AI framing",    status: "active" },
    { name: "Noise-Cancelling Headset Pro", sku: "HS-NC200",  category: "Peripherals", price: 349,  cost: 150,  stock: 3,   unit: "pcs", description: "Business headset with active noise cancellation",    status: "active" },
    { name: "UPS 3000VA Power Backup",      sku: "UPS-3000",  category: "Hardware",    price: 599,  cost: 320,  stock: 22,  unit: "pcs", description: "Uninterruptible power supply for server rooms",      status: "active" },
    { name: "NAS Storage 32TB",            sku: "STO-NAS32", category: "Storage",     price: 2299, cost: 1200, stock: 14,  unit: "pcs", description: "Network-attached storage solution for teams",        status: "active" },
    { name: "AutoDesk Annual License",      sku: "LIC-ADSK",  category: "Software",    price: 2400, cost: 1800, stock: 55,  unit: "lic", description: "Annual AutoDesk license for design teams",           status: "active" },
  ]).returning();
  console.log("✅ Products");

  // Inventory
  await db.insert(inventoryTable).values([
    { productId: products[0].id, productName: products[0].name, sku: products[0].sku, warehouse: "Warehouse A – Rack 1", quantity: 45, minStock: 10, maxStock: 100 },
    { productId: products[1].id, productName: products[1].name, sku: products[1].sku, warehouse: "Warehouse A – Rack 2", quantity: 32, minStock:  8, maxStock:  80 },
    { productId: products[2].id, productName: products[2].name, sku: products[2].sku, warehouse: "Digital Vault",        quantity: 120,minStock: 20, maxStock: 300 },
    { productId: products[3].id, productName: products[3].name, sku: products[3].sku, warehouse: "Digital Vault",        quantity: 75, minStock: 10, maxStock: 200 },
    { productId: products[4].id, productName: products[4].name, sku: products[4].sku, warehouse: "Warehouse B – Row 3",  quantity: 18, minStock:  5, maxStock:  50 },
    { productId: products[5].id, productName: products[5].name, sku: products[5].sku, warehouse: "Warehouse B – Row 4",  quantity:  6, minStock:  8, maxStock:  40 },
    { productId: products[6].id, productName: products[6].name, sku: products[6].sku, warehouse: "Warehouse B – Row 5",  quantity:  3, minStock: 10, maxStock:  60 },
    { productId: products[7].id, productName: products[7].name, sku: products[7].sku, warehouse: "Warehouse A – Rack 3", quantity: 22, minStock:  5, maxStock:  40 },
    { productId: products[8].id, productName: products[8].name, sku: products[8].sku, warehouse: "Warehouse A – Rack 4", quantity: 14, minStock:  4, maxStock:  30 },
    { productId: products[9].id, productName: products[9].name, sku: products[9].sku, warehouse: "Digital Vault",        quantity: 55, minStock: 15, maxStock: 150 },
  ]);
  console.log("✅ Inventory");

  // Sales
  await db.insert(salesTable).values([
    { date: "2026-01-10", customer: "Acme Corporation",     product: "Enterprise Server X200",  quantity: 3, amount: 14997, status: "completed", paymentMethod: "bank_transfer" },
    { date: "2026-01-22", customer: "TechNova Ltd",         product: "Enterprise Server X200",  quantity: 2, amount: 9998,  status: "completed", paymentMethod: "card"          },
    { date: "2026-02-05", customer: "GlobalEdge Inc",       product: "ERP Suite – Enterprise",  quantity: 1, amount: 4999,  status: "completed", paymentMethod: "bank_transfer" },
    { date: "2026-02-14", customer: "Synapse Analytics",    product: "ERP Suite – Starter",     quantity: 3, amount: 3597,  status: "completed", paymentMethod: "card"          },
    { date: "2026-02-28", customer: "Prime Logistics",      product: "ProDesk Workstation",     quantity: 2, amount: 6998,  status: "completed", paymentMethod: "bank_transfer" },
    { date: "2026-03-08", customer: "Vertex Capital",       product: "ERP Suite – Enterprise",  quantity: 2, amount: 9998,  status: "completed", paymentMethod: "wire"          },
    { date: "2026-03-15", customer: "Acme Corporation",     product: "4K Conference Camera",    quantity: 5, amount: 3495,  status: "completed", paymentMethod: "card"          },
    { date: "2026-03-20", customer: "Clearwater Health",    product: "Enterprise Server X200",  quantity: 4, amount: 19996, status: "completed", paymentMethod: "bank_transfer" },
    { date: "2026-04-01", customer: "Zenith Manufacturing", product: "NAS Storage 32TB",        quantity: 2, amount: 4598,  status: "pending",   paymentMethod: "bank_transfer" },
    { date: "2026-04-04", customer: "TechNova Ltd",         product: "Noise-Cancelling Headset Pro", quantity: 5, amount: 1745, status: "pending", paymentMethod: "card"       },
  ]);
  console.log("✅ Sales");

  // Purchase Orders
  await db.insert(purchaseOrdersTable).values([
    { orderNumber: "PO-2026-001", date: "2026-01-05", vendor: "Dell Technologies", items: 10, totalAmount: 89990, status: "approved",  deliveryDate: "2026-01-20" },
    { orderNumber: "PO-2026-002", date: "2026-01-18", vendor: "Cisco Systems",     items: 15, totalAmount: 27735, status: "approved",  deliveryDate: "2026-02-01" },
    { orderNumber: "PO-2026-003", date: "2026-02-10", vendor: "Logitech B2B",      items: 50, totalAmount: 17450, status: "received",  deliveryDate: "2026-02-25" },
    { orderNumber: "PO-2026-004", date: "2026-03-01", vendor: "APC by Schneider",  items: 20, totalAmount: 11980, status: "pending",   deliveryDate: "2026-03-20" },
    { orderNumber: "PO-2026-005", date: "2026-03-22", vendor: "Synology",          items: 10, totalAmount: 22990, status: "pending",   deliveryDate: "2026-04-10" },
  ]);
  console.log("✅ Purchase Orders");

  // Sales Orders
  await db.insert(salesOrdersTable).values([
    { orderNumber: "SO-2026-001", date: "2026-01-08", vendor: "Acme Corporation",     items: 3, totalAmount: 14997, status: "delivered",   deliveryDate: "2026-01-15" },
    { orderNumber: "SO-2026-002", date: "2026-01-20", vendor: "TechNova Ltd",          items: 2, totalAmount: 9998,  status: "delivered",   deliveryDate: "2026-01-28" },
    { orderNumber: "SO-2026-003", date: "2026-02-03", vendor: "GlobalEdge Inc",        items: 1, totalAmount: 4999,  status: "delivered",   deliveryDate: "2026-02-10" },
    { orderNumber: "SO-2026-004", date: "2026-03-18", vendor: "Clearwater Health",     items: 4, totalAmount: 19996, status: "in-progress", deliveryDate: "2026-04-05" },
    { orderNumber: "SO-2026-005", date: "2026-04-01", vendor: "Zenith Manufacturing",  items: 2, totalAmount: 8998,  status: "pending",     deliveryDate: "2026-04-20" },
  ]);
  console.log("✅ Sales Orders");

  // Invoices
  await db.insert(invoicesTable).values([
    { invoiceNumber: "INV-2026-001", client: "Acme Corporation",     amount: 14997, tax: 1349.73, total: 16346.73, issueDate: "2026-01-10", dueDate: "2026-02-10", status: "paid",    notes: "" },
    { invoiceNumber: "INV-2026-002", client: "TechNova Ltd",         amount: 9998,  tax: 899.82,  total: 10897.82, issueDate: "2026-01-22", dueDate: "2026-02-22", status: "paid",    notes: "" },
    { invoiceNumber: "INV-2026-003", client: "GlobalEdge Inc",       amount: 4999,  tax: 449.91,  total: 5448.91,  issueDate: "2026-02-05", dueDate: "2026-03-05", status: "paid",    notes: "" },
    { invoiceNumber: "INV-2026-004", client: "Clearwater Health",    amount: 19996, tax: 1799.64, total: 21795.64, issueDate: "2026-03-20", dueDate: "2026-04-20", status: "pending", notes: "NET-30 terms" },
    { invoiceNumber: "INV-2026-005", client: "Zenith Manufacturing", amount: 8998,  tax: 809.82,  total: 9807.82,  issueDate: "2026-04-01", dueDate: "2026-05-01", status: "pending", notes: "" },
    { invoiceNumber: "INV-2026-006", client: "Synapse Analytics",    amount: 7497,  tax: 674.73,  total: 8171.73,  issueDate: "2026-02-14", dueDate: "2026-03-14", status: "overdue", notes: "Follow-up required" },
  ]);
  console.log("✅ Invoices");

  // Expenses
  await db.insert(expensesTable).values([
    { date: "2026-01-31", category: "Technology", description: "AWS Cloud Infrastructure – January billing",     amount: 4200, status: "approved", submittedBy: "Tom Williams"   },
    { date: "2026-02-10", category: "Travel",     description: "Executive team travel – NYC leadership summit",  amount: 3800, status: "approved", submittedBy: "Marcus Johnson" },
    { date: "2026-02-15", category: "Office",     description: "Office supplies Q1 – stationery and equipment", amount: 1239, status: "approved", submittedBy: "Sofia Martinez" },
    { date: "2026-02-28", category: "Marketing",  description: "TechExpo 2026 exhibitor booth and setup",       amount: 8500, status: "approved", submittedBy: "Nina Hoffman"   },
    { date: "2026-03-05", category: "Legal",      description: "Legal services – Q1 contract review",           amount: 2200, status: "approved", submittedBy: "Priya Patel"    },
    { date: "2026-03-20", category: "HR",         description: "Q1 team building event and dinner for 25 staff", amount: 1800, status: "pending",  submittedBy: "Sofia Martinez" },
    { date: "2026-04-01", category: "Technology", description: "Software subscriptions – GitHub, Slack, Figma", amount: 950,  status: "pending",  submittedBy: "Lucas Chen"     },
    { date: "2026-04-03", category: "Marketing",  description: "Client entertainment – Acme Corp dinner",       amount: 1450, status: "pending",  submittedBy: "Aisha Okonkwo"  },
  ]);
  console.log("✅ Expenses");

  // Shipments
  await db.insert(shipmentsTable).values([
    { trackingNumber: "SHP-2026-001", origin: "Chicago, IL",  destination: "New York, NY",    carrier: "FedEx",        status: "delivered",  shipDate: "2026-01-09", estimatedDelivery: "2026-01-15", weight: 145,  description: "3x Enterprise Server X200 for Acme Corp" },
    { trackingNumber: "SHP-2026-002", origin: "Chicago, IL",  destination: "San Francisco, CA",carrier: "UPS",         status: "delivered",  shipDate: "2026-01-21", estimatedDelivery: "2026-01-28", weight: 89.5, description: "2x Enterprise Server for TechNova" },
    { trackingNumber: "SHP-2026-003", origin: "Austin, TX",   destination: "Austin, TX",       carrier: "E-Delivery",  status: "delivered",  shipDate: "2026-02-05", estimatedDelivery: "2026-02-10", weight: 0,    description: "Digital – ERP Enterprise license for GlobalEdge" },
    { trackingNumber: "SHP-2026-004", origin: "Chicago, IL",  destination: "Miami, FL",        carrier: "DHL",         status: "in-transit", shipDate: "2026-03-25", estimatedDelivery: "2026-04-05", weight: 312,  description: "4x Enterprise Server for Clearwater Health" },
    { trackingNumber: "SHP-2026-005", origin: "Dallas, TX",   destination: "Detroit, MI",      carrier: "FedEx Freight",status: "pending",   shipDate: "2026-04-10", estimatedDelivery: "2026-04-20", weight: 220,  description: "2x NAS Storage units for Zenith Manufacturing" },
  ]);
  console.log("✅ Shipments");

  // Ledger Entries
  let runningBalance = 0;
  const ledgerRows = [
    { date: "2026-01-10", description: "Revenue – Acme Corp SO-2026-001",    account: "Revenue",      type: "credit", debit: 0,    credit: 14997, reference: "SO-2026-001" },
    { date: "2026-01-22", description: "Revenue – TechNova SO-2026-002",      account: "Revenue",      type: "credit", debit: 0,    credit: 9998,  reference: "SO-2026-002" },
    { date: "2026-01-31", description: "AWS Infrastructure – January",        account: "Technology",   type: "debit",  debit: 4200, credit: 0,     reference: "EXP-001"     },
    { date: "2026-02-05", description: "Revenue – GlobalEdge ERP license",    account: "Revenue",      type: "credit", debit: 0,    credit: 4999,  reference: "SO-2026-003" },
    { date: "2026-02-10", description: "Executive travel – NYC summit",       account: "Travel",       type: "debit",  debit: 3800, credit: 0,     reference: "EXP-002"     },
    { date: "2026-02-14", description: "Revenue – Synapse Analytics",         account: "Revenue",      type: "credit", debit: 0,    credit: 3597,  reference: "SALE-004"    },
    { date: "2026-02-15", description: "Office supplies Q1",                  account: "Office",       type: "debit",  debit: 1239, credit: 0,     reference: "EXP-003"     },
    { date: "2026-02-28", description: "TechExpo 2026 marketing booth",       account: "Marketing",    type: "debit",  debit: 8500, credit: 0,     reference: "EXP-004"     },
    { date: "2026-02-28", description: "Revenue – Prime Logistics bundle",    account: "Revenue",      type: "credit", debit: 0,    credit: 6998,  reference: "SALE-005"    },
    { date: "2026-03-05", description: "Legal services – Q1 review",         account: "Legal",        type: "debit",  debit: 2200, credit: 0,     reference: "EXP-005"     },
    { date: "2026-03-08", description: "Revenue – Vertex Capital deal",       account: "Revenue",      type: "credit", debit: 0,    credit: 9998,  reference: "SALE-006"    },
    { date: "2026-03-15", description: "Revenue – Acme cameras order",        account: "Revenue",      type: "credit", debit: 0,    credit: 3495,  reference: "SALE-007"    },
    { date: "2026-03-20", description: "Revenue – Clearwater Health servers", account: "Revenue",      type: "credit", debit: 0,    credit: 19996, reference: "SALE-008"    },
  ];
  await db.insert(ledgerEntriesTable).values(
    ledgerRows.map(r => {
      runningBalance += r.credit - r.debit;
      return { ...r, balance: runningBalance };
    })
  );
  console.log("✅ Ledger Entries");

  // Notifications
  await db.insert(notificationsTable).values([
    { title: "Low Stock Alert",           message: "4K Conference Camera and Noise-Cancelling Headset Pro are below minimum stock levels.",     type: "warning", read: false },
    { title: "Invoice Overdue",           message: "Invoice INV-2026-006 for Synapse Analytics ($7,497) is overdue by 23 days.",               type: "error",   read: false },
    { title: "Shipment In Transit",       message: "SHP-2026-004 to Clearwater Health is in transit. Estimated arrival April 5, 2026.",        type: "info",    read: false },
    { title: "Purchase Order Awaiting",   message: "PO-2026-005 with Synology ($22,990) is awaiting approval.",                                type: "info",    read: false },
    { title: "Sale Recorded",             message: "New sale of $19,996 to Clearwater Health has been logged. Invoice pending.",                type: "success", read: true  },
    { title: "Employee Status Updated",   message: "Elena Vasquez's status has been updated to 'On Leave'.",                                   type: "info",    read: true  },
  ]);
  console.log("✅ Notifications");

  // Support Tickets
  await db.insert(supportTicketsTable).values([
    { title: "Unable to export reports to PDF",        description: "When clicking Export on the Reports page, nothing happens in Chrome or Firefox.",                   status: "open",        priority: "high",   category: "Bug",             submittedBy: "Admin User"  },
    { title: "Request: Bulk employee import via CSV",  description: "We have 50+ employees to onboard and would love a CSV import feature to avoid manual entry.",       status: "open",        priority: "medium", category: "Feature Request", submittedBy: "Marcus Johnson" },
    { title: "Invoice email delivery failure",         description: "Invoices sent to @gmail.com addresses are bouncing. Internal mail works fine.",                     status: "in-progress", priority: "high",   category: "Bug",             submittedBy: "Priya Patel" },
    { title: "Dashboard revenue chart not loading",    description: "Revenue chart shows 'No data' despite existing sales records.",                                     status: "resolved",    priority: "medium", category: "Bug",             submittedBy: "Tom Williams"  },
    { title: "How to configure role permissions?",     description: "Need help setting up custom permissions for the logistics role.",                                    status: "resolved",    priority: "low",    category: "Question",        submittedBy: "Admin User"  },
  ]);
  console.log("✅ Support Tickets");

  // Messages
  await db.insert(messagesTable).values([
    { sender: "Marcus Johnson",  recipient: "All Staff",       content: "Please review the Q1 financials and prepare department summaries by April 10.",                                      read: true  },
    { sender: "Nina Hoffman",    recipient: "Logistics Team",  content: "The TechExpo booth is confirmed for March 28-30. Coordinate setup schedule with Tom.",                               read: true  },
    { sender: "Priya Patel",     recipient: "Admin",           content: "Clearwater Health is our largest Q1 deal. Ensure SHP-2026-004 is tracked daily until delivery.",                    read: false },
    { sender: "System",          recipient: "Admin",           content: "New ERP feature: Live inventory alerts are now active. Minimum stock thresholds trigger automatic notifications.",  read: false },
  ]);
  console.log("✅ Messages");

  // Promotions
  await db.insert(promotionsTable).values([
    { title: "Q2 Enterprise Bundle", code: "ENT-Q2",  type: "percentage", discount: 15, startDate: "2026-04-01", endDate: "2026-06-30", status: "active",  usageCount: 8,   usageLimit: 50   },
    { title: "Startup Kickstart",    code: "START50", type: "flat",       discount: 500,startDate: "2026-01-01", endDate: "2026-12-31", status: "active",  usageCount: 23,  usageLimit: 100  },
    { title: "Black Friday 2025",    code: "BF2025",  type: "percentage", discount: 25, startDate: "2025-11-28", endDate: "2025-12-01", status: "expired", usageCount: 156, usageLimit: 200  },
    { title: "Referral Rewards",     code: "REFER20", type: "percentage", discount: 20, startDate: "2026-03-01", endDate: "2026-09-30", status: "active",  usageCount: 5,   usageLimit: null },
  ]);
  console.log("✅ Promotions");

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
