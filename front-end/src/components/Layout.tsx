import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  DoorOpen, 
  ClipboardList, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: Calendar },
    { name: 'จองห้อง', href: '/book-room', icon: DoorOpen },
    ...(user?.role === 'admin' ? [
      { name: 'จัดการห้อง', href: '/rooms', icon: DoorOpen },
      { name: 'จัดการผู้ใช้', href: '/users', icon: Users },
    ] : []),
    ...(user?.role === 'approver' ? [
      { name: 'อนุมัติการจอง', href: '/approvals', icon: ClipboardList },
    ] : []),
    { name: 'รายงาน', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
        {
          '-translate-x-full lg:translate-x-0': !isMobileMenuOpen,
          'translate-x-0': isMobileMenuOpen
        }
      )}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">ระบบจองห้อง</h1>
            <p className="text-sm text-gray-600">คณะวิทยาศาสตร์และเทคโนโลยี</p>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center px-4 py-2 text-sm rounded-md',
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={clsx(
        "transition-all duration-200 ease-in-out",
        "lg:ml-64 min-h-screen bg-gray-100 p-6"
      )}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;