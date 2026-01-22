import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DoorOpen, 
  Users, 
  CalendarCheck, 
  Clock, 
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const api = import.meta.env.VITE_API;

interface DashboardStats {
  totalRooms: number;
  totalUsers: number;
  totalBookings: number;
  pendingApprovals: number;
  todayBookings: number;
  weeklyBookings: number;
  roomUtilization: { room_code: string; count: number }[];
  recentBookings: any[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByType: { type: string; count: number }[];
}

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${api}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRoleBadge = () => {
    const roles: Record<string, { label: string; class: string }> = {
      admin: { label: 'ผู้ดูแลระบบ', class: 'gradient-primary' },
      approver: { label: 'ผู้อนุมัติ', class: 'gradient-success' },
      user: { label: 'ผู้ใช้ทั่วไป', class: 'gradient-info' }
    };
    const role = roles[user?.role || 'user'];
    return (
      <span className={`px-4 py-2 text-sm font-semibold text-white rounded-full ${role.class} shadow-lg`}>
        {role.label}
      </span>
    );
  };

  const statCards = [
    { 
      title: 'ห้องทั้งหมด', 
      value: stats?.totalRooms || 0, 
      icon: DoorOpen, 
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/30'
    },
    { 
      title: 'ผู้ใช้ทั้งหมด', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/30'
    },
    { 
      title: 'การจองทั้งหมด', 
      value: stats?.totalBookings || 0, 
      icon: CalendarCheck, 
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/30'
    },
    { 
      title: 'รอการอนุมัติ', 
      value: stats?.pendingApprovals || 0, 
      icon: Clock, 
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/30'
    },
    { 
      title: 'การจองวันนี้', 
      value: stats?.todayBookings || 0, 
      icon: Calendar, 
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/30'
    },
    { 
      title: 'การจองสัปดาห์นี้', 
      value: stats?.weeklyBookings || 0, 
      icon: TrendingUp, 
      gradient: 'from-indigo-500 to-blue-600',
      shadow: 'shadow-indigo-500/30'
    },
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      adminApproved: 'แอดมินอนุมัติ',
      approverApproved: 'อนุมัติแล้ว',
      rejected: 'ไม่อนุมัติ'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      teaching: 'การสอน',
      meeting: 'ประชุม',
      other: 'อื่นๆ'
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
          <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            สวัสดี, {user?.name} 
            <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-500" />
          </h1>
          <p className="text-gray-500 mt-1">ยินดีต้อนรับสู่ระบบจองห้องประชุม PSRU</p>
        </div>
        {getRoleBadge()}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index}
              className={`stat-card bg-gradient-to-br ${card.gradient} ${card.shadow}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{card.title}</p>
                    <p className="text-4xl font-bold mt-2">{card.value.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization */}
        <div className="luxury-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">ห้องที่ใช้งานมากที่สุด</h3>
          <div className="space-y-4">
            {stats?.roomUtilization && stats.roomUtilization.length > 0 ? (
              stats.roomUtilization.map((room, index) => {
                const maxCount = Math.max(...stats.roomUtilization.map(r => r.count));
                const percentage = maxCount > 0 ? (room.count / maxCount) * 100 : 0;
                const colors = [
                  'from-amber-500 to-yellow-500',
                  'from-gray-700 to-gray-800',
                  'from-yellow-400 to-amber-400',
                  'from-stone-600 to-stone-700',
                  'from-amber-400 to-yellow-400'
                ];
                return (
                  <div key={room.room_code}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{room.room_code}</span>
                      <span className="text-gray-500">{room.count} ครั้ง</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-8">ยังไม่มีข้อมูลการใช้งาน</p>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="luxury-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">สถานะการจอง</h3>
          <div className="space-y-4">
            {stats?.bookingsByStatus && stats.bookingsByStatus.length > 0 ? (
              stats.bookingsByStatus.map((item) => {
                const total = stats.bookingsByStatus.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const statusColors: Record<string, string> = {
                  pending: 'from-amber-400 to-yellow-500',
                  adminApproved: 'from-blue-400 to-indigo-500',
                  approverApproved: 'from-emerald-400 to-green-500',
                  rejected: 'from-red-400 to-rose-500'
                };
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{getStatusLabel(item.status)}</span>
                      <span className="text-gray-500">{item.count} รายการ ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${statusColors[item.status] || 'from-gray-400 to-gray-500'} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-8">ยังไม่มีข้อมูลการจอง</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="luxury-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">การจองล่าสุด</h3>
            <Link 
              to="/booking-status" 
              className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>ห้อง</th>
                  <th>ผู้จอง</th>
                  <th>วันที่</th>
                  <th>เวลา</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.reservation_id}>
                    <td className="font-semibold text-gray-900">{booking.room_code}</td>
                    <td className="text-gray-600">{booking.username}</td>
                    <td className="text-gray-600">{formatDate(booking.booking_date)}</td>
                    <td className="text-gray-600">
                      {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                    </td>
                    <td>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        booking.reservation_status === 'approverApproved' 
                          ? 'bg-green-100 text-green-700'
                          : booking.reservation_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.reservation_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusLabel(booking.reservation_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีการจองล่าสุด</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link 
          to="/book-room"
          className="luxury-card p-6 group hover:border-purple-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">จองห้องใหม่</h4>
              <p className="text-sm text-gray-500">เริ่มต้นจองห้องประชุม</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/booking-status"
          className="luxury-card p-6 group hover:border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-info flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">ตรวจสอบสถานะ</h4>
              <p className="text-sm text-gray-500">ดูสถานะการจองของคุณ</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/reports"
          className="luxury-card p-6 group hover:border-emerald-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">ดูรายงาน</h4>
              <p className="text-sm text-gray-500">วิเคราะห์ข้อมูลการใช้งาน</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;