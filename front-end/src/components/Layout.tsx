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
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { name: 'จองห้อง', href: '/book-room', icon: DoorOpen },
    { name: 'สถานะการจอง', href: '/booking-status', icon: FileText },
    ...(user?.role === 'admin' ? [
      { name: 'จัดการห้อง', href: '/rooms', icon: DoorOpen },
      { name: 'จัดการผู้ใช้', href: '/users', icon: Users },
      { name: 'อนุมัติการจอง', href: '/approvals', icon: ClipboardCheck },
    ] : []),
    ...(user?.role === 'approver' ? [
      { name: 'อนุมัติการจอง', href: '/approvals', icon: ClipboardCheck },
    ] : []),
    { name: 'รายงาน', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-lg shadow-sm border border-stone-200 hover:scale-105 transition-transform"
        >
          {isMobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
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
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  PSRU Booking
                </h1>
                <p className="text-xs text-gray-400 font-medium">ระบบจองห้องประชุม</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={clsx(
                    "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.department}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={clsx(
        "transition-all duration-300 ease-in-out",
        "lg:ml-72 min-h-screen p-6 lg:p-8"
      )}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;