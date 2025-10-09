import React from 'react';
import { User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
          {user?.role === 'admin' ? 'ผู้ดูแลระบบ' :
           user?.role === 'approver' ? 'ผู้อนุมัติ' : 'ผู้ใช้ทั่วไป'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for dashboard content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">การจองของฉัน</h2>
          <p className="text-gray-500">ยังไม่มีการจองห้อง</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;