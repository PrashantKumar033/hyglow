import { Link } from "wouter";
import {
  BarChart3, Users, ShoppingCart, Package, FileText, TrendingUp,
  Truck, MapPin, Bell, MessageSquare, Shield, Star,
  ArrowRight, CheckCircle, Layers, Zap, Globe, Lock,
  IndianRupee, PieChart, Warehouse, Headphones, LayoutDashboard,
  ChevronRight, Sparkles
} from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Real-time KPIs, revenue charts, and quick-action shortcuts all in one view.", color: "from-teal-500 to-cyan-400" },
  { icon: IndianRupee, title: "Account Ledger", desc: "Track debits, credits, and balances with a full double-entry accounting system.", color: "from-blue-500 to-indigo-400" },
  { icon: Users, title: "HR Management", desc: "Manage employees, departments, salaries, and attendance with ease.", color: "from-violet-500 to-purple-400" },
  { icon: TrendingUp, title: "Sales CRM", desc: "Monitor deals, revenue pipelines, and customer relationships in one place.", color: "from-pink-500 to-rose-400" },
  { icon: Package, title: "Products & Catalog", desc: "Full product catalog with pricing, stock levels, and category management.", color: "from-orange-500 to-amber-400" },
  { icon: Warehouse, title: "Inventory Control", desc: "Track stock across warehouses with low-stock alerts and reorder management.", color: "from-emerald-500 to-green-400" },
  { icon: ShoppingCart, title: "Purchase & Sales Orders", desc: "End-to-end PO and SO management with status tracking and approval flows.", color: "from-cyan-500 to-teal-400" },
  { icon: FileText, title: "Invoicing", desc: "Generate, send, and track invoices. Mark as paid and monitor overdue accounts.", color: "from-indigo-500 to-blue-400" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Financial summaries, sales charts, and inventory breakdowns with visual insights.", color: "from-teal-500 to-green-400" },
  { icon: Truck, title: "Logistics & Transport", desc: "Manage shipments, carriers, and delivery schedules from a single panel.", color: "from-yellow-500 to-orange-400" },
  { icon: MapPin, title: "Live Tracking", desc: "Real-time shipment tracking with full event timeline and status updates.", color: "from-red-500 to-pink-400" },
  { icon: PieChart, title: "Expenses", desc: "Log, categorize, and visualize business expenses with spending analytics.", color: "from-purple-500 to-violet-400" },
  { icon: Bell, title: "Notifications", desc: "Smart alerts for low stock, overdue invoices, and critical business events.", color: "from-amber-500 to-yellow-400" },
  { icon: MessageSquare, title: "Team Messages", desc: "Built-in messaging for seamless team communication across departments.", color: "from-blue-500 to-cyan-400" },
  { icon: Headphones, title: "Help & Support", desc: "Raise and manage support tickets with priority tracking and resolution status.", color: "from-rose-500 to-red-400" },
  { icon: Shield, title: "Admin & Roles", desc: "Granular role-based permissions, user management, and audit controls.", color: "from-slate-500 to-gray-400" },
];

const stats = [
  { value: "20+", label: "ERP Modules" },
  { value: "₹0", label: "Setup Fee" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "10x", label: "Faster Operations" },
];

const steps = [
  { num: "01", title: "Sign In Instantly", desc: "No lengthy onboarding. Login and your dashboard is live in seconds." },
  { num: "02", title: "Manage Everything", desc: "HR, inventory, invoices, logistics — all modules work together seamlessly." },
  { num: "03", title: "Grow with Confidence", desc: "Real-time analytics and smart alerts keep your business one step ahead." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Hyglow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <Link href="/login">
          <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-teal-500/40 hover:scale-105">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-28 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-teal-400 font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            India's Modern Business ERP Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight max-w-4xl">
            Run Your Entire{" "}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Business
            </span>
            <br />from One Platform
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Hyglow brings together 20+ powerful modules — HR, Inventory, Invoicing, Sales,
            Logistics, and more — into one beautifully unified ERP. Built for Indian businesses.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/signup">
              <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-teal-500/30 transition-all duration-200 hover:scale-105 hover:shadow-teal-500/50 text-sm">
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#features">
              <button className="flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-8 py-3.5 rounded-full transition-all duration-200 text-sm font-medium">
                <Layers className="w-4 h-4" />
                Explore Features
              </button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> No credit card</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> Free forever plan</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-500" /> GST-ready invoicing</div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section className="py-14 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                {s.value}
              </span>
              <span className="text-sm text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-3.5 h-3.5" /> Everything You Need
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              20+ Modules,{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                One Platform
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every tool your business needs — deeply integrated, beautifully designed, and ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-teal-500/20 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/5"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Up & Running in{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>
            <p className="text-slate-400 text-lg">No complex setup. No steep learning curve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-start p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <span className="text-5xl font-extrabold text-teal-500/20 mb-4">{step.num}</span>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY HYGLOW ──────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Built for{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Indian Businesses
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Hyglow understands the unique needs of Indian enterprises — from GST invoicing to rupee-based financial tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: IndianRupee, title: "₹ Native Currency", desc: "All financials are in Indian Rupees with en-IN number formatting (lakhs & crores)." },
              { icon: Globe, title: "GST-Ready Invoicing", desc: "Generate compliant invoices with GST tax line items, GSTIN, and HSN codes." },
              { icon: Lock, title: "Secure & Reliable", desc: "Role-based access controls, session management, and 99.9% uptime guarantee." },
              { icon: Zap, title: "Blazing Fast", desc: "Built on modern React + Vite, with optimistic UI and real-time data sync." },
              { icon: Layers, title: "Fully Integrated", desc: "Every module connects — inventory updates orders, orders update invoices automatically." },
              { icon: Shield, title: "Enterprise-Grade Roles", desc: "Granular permissions for every team — admins, managers, sales reps, and more." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-teal-500/20 transition-colors">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Start Today — It's Free
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Your Business,{" "}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of businesses managing everything with Hyglow. No setup fee. No hidden charges.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-10 py-4 rounded-full shadow-2xl shadow-teal-500/30 transition-all duration-200 hover:scale-105 hover:shadow-teal-500/50 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-10 py-4 rounded-full transition-all duration-200 text-base font-medium">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">Hyglow ERP</span>
          </div>
          <p className="text-xs text-slate-500">© 2024 Hyglow. All rights reserved. Built for India.</p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
