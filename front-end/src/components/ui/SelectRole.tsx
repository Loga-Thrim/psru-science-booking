import type { UserRole } from "../../types/types";
import { Shield } from "lucide-react";

export function SelectRole({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (v: UserRole) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          สิทธิ์การใช้งาน
        </div>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:outline-none"
      >
        <option value="user">ผู้ใช้ทั่วไป (User)</option>
        <option value="approver">ผู้อนุมัติ (Approver)</option>
        <option value="admin">ผู้ดูแลระบบ (Admin)</option>
      </select>
    </div>
  );
}
