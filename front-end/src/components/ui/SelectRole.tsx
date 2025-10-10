import React from "react";
import type { UserRole } from "../../types/types";

export function SelectRole({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (v: UserRole) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">สิทธิ์</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="user">user</option>
        <option value="approver">approver</option>
        <option value="admin">admin</option>
      </select>
    </div>
  );
}
