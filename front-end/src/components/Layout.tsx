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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-lg shadow-sm border border-amber-200/50 hover:scale-105 transition-transform"
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
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-amber-500/20">
          {/* Logo Section */}
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
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
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-sm'
                      : 'text-gray-300 hover:bg-white/5 hover:text-amber-400'
                  )}
                >
                  <Icon className={clsx(
                    "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? "text-black" : "text-gray-500 group-hover:text-amber-400"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-black/70" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold text-sm">
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