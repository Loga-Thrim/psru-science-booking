import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp,
  Users,
  DoorOpen,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

const api = import.meta.env.VITE_API;

interface ReportStats {
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

function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

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

  const exportToCSV = () => {
    if (!stats?.recentBookings) return;
    
    const headers = ['ห้อง', 'ผู้จอง', 'วันที่', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'สถานะ'];
    const rows = stats.recentBookings.map(b => [
      b.room_code,
      b.username,
      b.booking_date,
      b.start_time,
      b.end_time,
      getStatusLabel(b.reservation_status)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  const approvedCount = stats?.bookingsByStatus?.find(s => s.status === 'approverApproved')?.count || 0;
  const rejectedCount = stats?.bookingsByStatus?.find(s => s.status === 'rejected')?.count || 0;
  const pendingCount = stats?.bookingsByStatus?.find(s => s.status === 'pending')?.count || 0;
  const totalBookings = stats?.totalBookings || 0;
  const approvalRate = totalBookings > 0 ? ((approvedCount / totalBookings) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            รายงานและสถิติ
          </h1>
          <p className="text-gray-500 mt-1">วิเคราะห์ข้อมูลการใช้งานระบบจองห้อง</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-luxury text-sm py-2 px-4 w-auto"
          >
            <option value="all">ทั้งหมด</option>
            <option value="today">วันนี้</option>
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <Download className="w-4 h-4" />
            ส่งออก CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">อัตราการอนุมัติ</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{approvalRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-success rounded-full transition-all duration-500"
              style={{ width: `${approvalRate}%` }}
            />
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">อนุมัติแล้ว</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">ไม่อนุมัติ</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">รอดำเนินการ</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Chart */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">การใช้งานห้องประชุม</h3>
            <DoorOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats?.roomUtilization && stats.roomUtilization.length > 0 ? (
              stats.roomUtilization.map((room, index) => {
                const maxCount = Math.max(...stats.roomUtilization.map(r => r.count));
                const percentage = maxCount > 0 ? (room.count / maxCount) * 100 : 0;
                const colors = [
                  'from-violet-500 to-purple-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-pink-500 to-rose-500'
                ];
                return (
                  <div key={room.room_code}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-700">{room.room_code}</span>
                      <span className="text-gray-500">{room.count} การจอง</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-400">
                <DoorOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีข้อมูลการใช้งาน</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Type Distribution */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">ประเภทการจอง</h3>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats?.bookingsByType && stats.bookingsByType.length > 0 ? (
              stats.bookingsByType.map((item) => {
                const total = stats.bookingsByType.reduce((sum, t) => sum + t.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const typeColors: Record<string, string> = {
                  teaching: 'from-blue-500 to-indigo-500',
                  meeting: 'from-emerald-500 to-teal-500',
                  other: 'from-gray-400 to-gray-500'
                };
                const typeIcons: Record<string, string> = {
                  teaching: '📚',
                  meeting: '👥',
                  other: '📋'
                };
                return (
                  <div key={item.type} className="flex items-center gap-4">
                    <div className="text-2xl">{typeIcons[item.type] || '📋'}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700">{getTypeLabel(item.type)}</span>
                        <span className="text-gray-500">{item.count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${typeColors[item.type] || 'from-gray-400 to-gray-500'} rounded-full transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีข้อมูลประเภทการจอง</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">สถานะการจองทั้งหมด</h3>
          <span className="text-sm text-gray-500">รวม {totalBookings} รายการ</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.bookingsByStatus?.map((item) => {
            const percentage = totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(1) : '0';
            const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
              pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
              adminApproved: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle },
              approverApproved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
              rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle }
            };
            const config = statusConfig[item.status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: Clock };
            const Icon = config.icon;
            
            return (
              <div key={item.status} className={`p-4 rounded-xl border-2 ${config.bg}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.text}`} />
                  <div>
                    <p className={`text-sm font-medium ${config.text}`}>{getStatusLabel(item.status)}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{percentage}% ของทั้งหมด</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="luxury-card p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <DoorOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats?.totalRooms || 0}</p>
          <p className="text-gray-500 mt-1">ห้องทั้งหมด</p>
        </div>

        <div className="luxury-card p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-info flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          <p className="text-gray-500 mt-1">ผู้ใช้ทั้งหมด</p>
        </div>

        <div className="luxury-card p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-success flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats?.weeklyBookings || 0}</p>
          <p className="text-gray-500 mt-1">การจองสัปดาห์นี้</p>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;