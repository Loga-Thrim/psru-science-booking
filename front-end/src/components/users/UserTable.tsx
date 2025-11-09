import React, { useMemo } from "react";
import type { UserRow } from "../../types/types";

export function UserTable({ users, onEdit, onDelete }: { users: UserRow[]; onEdit: (user: UserRow) => void; onDelete: (user: UserRow) => void;}) {
  const rows = useMemo(
    () =>
      users.map((u) => (
        <tr key={u.user_id} className="border-b last:border-none">
          <td className="px-4 py-2 font-mono text-sm text-gray-700">
            {u.user_id}
          </td>
          <td className="px-4 py-2">{u.username}</td>
          <td className="px-4 py-2">{u.email}</td>
          <td className="px-4 py-2">{u.department}</td>
          <td className="px-4 py-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                u.role === "admin"
                  ? "bg-emerald-100 text-emerald-700"
                  : u.role === "approver"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {u.role}
            </span>
          </td>
          <td className="px-4 py-2 text-right space-x-2">
            <button
              onClick={() => onEdit(u)}
              className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              แก้ไข
            </button>
            <button
              onClick={() => onDelete(u)}
              className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              ลบ
            </button>
          </td>
        </tr>
      )),
    [users, onEdit, onDelete]
  );

  if (users.length === 0)
    return <div className="p-6 text-gray-500">ยังไม่มีผู้ใช้</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">ชื่อผู้ใช้</th>
            <th className="px-4 py-2 text-left">อีเมล</th>
            <th className="px-4 py-2 text-left">คณะ</th>
            <th className="px-4 py-2 text-left">สิทธิ์</th>
            <th className="px-4 py-2 text-right">การทำงาน</th>
          </tr>
        </thead>
        <tbody className="divide-y">{rows}</tbody>
      </table>
    </div>
  );
}
