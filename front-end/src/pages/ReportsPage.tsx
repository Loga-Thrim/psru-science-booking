import { useEffect, useMemo, useState } from 'react';
import { reservationRow, reservationStatusLabel, reservationTypeLabel } from '../types/types';
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

// Each option is a calendar window, not an open-ended "from now on" cut-off:
// "วันนี้" means bookings dated today, not every booking from today onwards.
// Returns [start, end] inclusive, or null for "all time".
function dateWindow(range: string): [Date, Date] | null {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case 'today':
      return [midnight, midnight];
    case 'week': {
      const monday = new Date(midnight);
      // getDay() is 0 on Sunday, which belongs to the week that started six days earlier.
      monday.setDate(midnight.getDate() - ((midnight.getDay() + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [monday, sunday];
    }
    case 'month':
      return [
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0),
      ];
    default:
      return null;
  }
}

function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [bookings, setBookings] = useState<reservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        // dashboard-stats covers room/user totals; the reservation list is what the
        // date filter and the CSV export actually operate on.
        const [statsRes, listRes] = await Promise.all([
          fetch(`${api}/dashboard-stats`, { headers }),
          fetch(`${api}/reservation-list`, { headers }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (listRes.ok) {
          const data = await listRes.json();
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const filteredBookings = useMemo(() => {
    const window = dateWindow(dateRange);
    if (!window) return bookings;
    const [start, end] = window;
    return bookings.filter((b) => {
      if (!b.booking_date) return false;
      const d = new Date(`${String(b.booking_date).slice(0, 10)}T00:00:00`);
      return !Number.isNaN(d.getTime()) && d >= start && d <= end;
    });
  }, [bookings, dateRange]);

  // Every chart below is derived from the filtered set so the date filter has real effect.
  const view = useMemo(() => {
    const countBy = (key: (b: reservationRow) => string) => {
      const acc: Record<string, number> = {};
      for (const b of filteredBookings) {
        const k = key(b) || 'other';
        acc[k] = (acc[k] ?? 0) + 1;
      }
      return acc;
    };

    const byRoom = countBy((b) => b.room_code || b.room_id || '-');
    const roomUtilization = Object.entries(byRoom)
      .map(([room_code, count]) => ({ room_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const bookingsByType = Object.entries(countBy((b) => b.reservation_type))
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const bookingsByStatus = Object.entries(countBy((b) => b.reservation_status))
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return { roomUtilization, bookingsByType, bookingsByStatus };
  }, [filteredBookings]);

  const getStatusLabel = reservationStatusLabel;
  const getTypeLabel = reservationTypeLabel;

  // Wraps a field in quotes when it contains a comma, quote or newline, otherwise
  // a value like "อาคาร 1, ชั้น 2" would silently split into two columns.
  const csvCell = (value: unknown) => {
    const s = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) return;

    const headers = ['รหัสการจอง', 'ห้อง', 'อาคาร', 'ผู้จอง', 'คณะ/หน่วยงาน', 'เบอร์โทร', 'วันที่', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'จำนวนคน', 'ประเภท', 'สถานะ', 'เหตุผลการจอง', 'เหตุผลการปฏิเสธ'];
    const rows = filteredBookings.map(b => [
      b.reservation_id,
      b.room_code,
      b.building,
      b.username,
      b.department,
      b.phone,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.number_of_users,
      getTypeLabel(b.reservation_type),
      getStatusLabel(b.reservation_status),
      b.reservation_reason,
      b.rejection_reason,
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  const statusCount = (status: string) => view.bookingsByStatus.find(s => s.status === status)?.count || 0;
  const approvedCount = statusCount('approverApproved');
  const rejectedCount = statusCount('rejected');
  // "รอดำเนินการ" covers both approval stages that have not finished yet.
  const pendingCount = statusCount('pending') + statusCount('adminApproved');
  const totalBookings = filteredBookings.length;
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
              <p className="text-3xl font-bold text-slate-700 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Chart */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">การใช้งานห้อง มรพส.</h3>
            <DoorOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {view.roomUtilization.length > 0 ? (
              view.roomUtilization.map((room, index) => {
                const maxCount = Math.max(...view.roomUtilization.map(r => r.count));
                const percentage = maxCount > 0 ? (room.count / maxCount) * 100 : 0;
                const colors = [
                  'from-violet-500 to-purple-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                  'from-slate-600 to-orange-500',
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
            {view.bookingsByType.length > 0 ? (
              view.bookingsByType.map((item) => {
                const total = view.bookingsByType.reduce((sum, t) => sum + t.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const typeColors: Record<string, string> = {
                  teaching: 'from-blue-500 to-indigo-500',
                  exam: 'from-amber-500 to-orange-500',
                  activity: 'from-emerald-500 to-teal-500',
                  meeting: 'from-emerald-500 to-teal-500',
                  other: 'from-gray-400 to-gray-500'
                };
                const typeIcons: Record<string, string> = {
                  teaching: '📚',
                  exam: '📝',
                  activity: '👥',
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
          {view.bookingsByStatus.map((item) => {
            const percentage = totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(1) : '0';
            const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
              pending: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-800', icon: Clock },
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