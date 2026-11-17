import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  DoorOpen,
  ClipboardCheck,
  BarChart3,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useScrollLock } from '../hooks/useScrollLock';

const api = import.meta.env.VITE_API as string;

const ROLE_LABELS: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
};

/**
 * How many requests are waiting for an admin right now.
 *
 * Nobody would know work had arrived without opening the page, so the count
 * goes straight onto the menu item.
 */
function usePendingApprovalCount(role: string | undefined) {
  const [count, setCount] = React.useState(0);
  const location = useLocation();

  React.useEffect(() => {
    if (role !== 'admin') {
      setCount(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${api}/reservation-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setCount(data.filter((r: any) => r.reservation_status === 'pending').length);
      } catch {
        /* the badge is a nicety; never break the shell over it */
      }
    };

    load();
    // Refresh when the user navigates, so approving something updates the badge.
    return () => {
      cancelled = true;
    };
  }, [role, location.pathname]);

  return count;
}

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pendingCount = usePendingApprovalCount(user?.role);

  // The mobile sidebar covers the page the same way a modal does; letting the
  // content scroll underneath it is just as disorienting.
  useScrollLock(isMobileMenuOpen);

  // Booking and checking a booking are open to everyone; the rest is staff work.
  const navigation = [
    { name: 'จองห้อง', href: '/book-room', icon: DoorOpen },
    { name: 'สถานะการจอง', href: '/booking-status', icon: FileText },
    ...(user?.role === 'admin'
      ? [
          {
            name: 'อนุมัติการจอง',
            href: '/approvals',
            icon: ClipboardCheck,
            badge: pendingCount,
          },
          { name: 'จัดการห้อง', href: '/rooms', icon: DoorOpen },
          { name: 'จัดการผู้ใช้', href: '/users', icon: Users },
          { name: 'ภาพรวมระบบ', href: '/dashboard', icon: LayoutDashboard },
          { name: 'รายงาน', href: '/reports', icon: BarChart3 },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          aria-expanded={isMobileMenuOpen}
          className="flex items-center gap-2 rounded-xl border-2 border-stone-300 bg-white px-4 py-3 shadow-md"
        >
          {isMobileMenuOpen ? <X size={24} className="text-slate-800" /> : <Menu size={24} className="text-slate-800" />}
          <span className="text-base font-semibold text-slate-800">เมนู</span>
          {pendingCount > 0 && !isMobileMenuOpen && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-sm font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-all duration-300 ease-in-out",
        {
          '-translate-x-full lg:translate-x-0': !isMobileMenuOpen,
          'translate-x-0': isMobileMenuOpen
        }
      )}>
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/30">
          {/* Logo Section */}
          <div className="px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  PSRU Booking
                </h1>
                <p className="text-sm text-slate-300 font-medium">ระบบจองห้อง มรพส.</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2" aria-label="เมนูหลัก">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              const badge = 'badge' in item ? (item.badge as number) : 0;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className={clsx(
                    "mr-3 h-6 w-6 shrink-0",
                    isActive ? "text-slate-700" : "text-slate-400 group-hover:text-white"
                  )} aria-hidden="true" />
                  <span className="flex-1">{item.name}</span>
                  {badge > 0 && (
                    <span
                      className="ml-2 rounded-full bg-red-600 px-2.5 py-0.5 text-sm font-bold text-white"
                      aria-label={`มี ${badge} รายการรอดำเนินการ`}
                    >
                      {badge}
                    </span>
                  )}
                  {isActive && badge === 0 && (
                    <ChevronRight className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Signed-in staff get their card and sign-out; guests get a quiet
              link, since booking itself never needs an account. */}
          {user ? (
            <div className="mx-4 mb-4 rounded-2xl border border-slate-700/40 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-lg font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-white">{user.name}</p>
                  <p className="truncate text-sm text-slate-300">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-400/40 bg-red-500/15 px-4 py-3 text-base font-semibold text-red-200 transition-colors hover:bg-red-500/30 hover:text-white"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="mx-4 mb-4">
              <Link
                to="/authen"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                เข้าสู่ระบบเจ้าหน้าที่
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content */}
      <main className={clsx(
        "transition-all duration-300 ease-in-out",
        "lg:ml-72 min-h-screen p-5 pt-20 lg:p-8"
      )}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
