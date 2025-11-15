import React, { useMemo, useState } from "react";
import type { UpsertForm, UserRow } from "../../types/types";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { SelectRole } from "../../components/ui/SelectRole";
import { DEPARTMENTS } from "../../types/types";

export function EditUserModal(
    { user, onClose, onSubmit }:
    { user: UserRow; onClose: () => void; onSubmit: (data: UpsertForm & { user_id: number }) => Promise<void> | void; }
  ) {
  const isValidDepartment = useMemo(
    () => DEPARTMENTS.includes(user.department as (typeof DEPARTMENTS)[number]),
    [user.department]
  );

  const [form, setForm] = useState<UpsertForm>({
    email: user.email,
    username: user.username,
    department: isValidDepartment ? user.department : "",
    role: user.role,
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ ...form, user_id: user.user_id });
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "แก้ไขผู้ใช้ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`แก้ไขผู้ใช้ #${user.user_id}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="อีเมล"
          type="email"
          value={form.email}
          onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          required
        />

        <Input
          label="ชื่อผู้ใช้"
          value={form.username}
          onChange={(v) => setForm((s) => ({ ...s, username: v }))}
          required
        />

        <div className="space-y-1">
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            สังกัด/ภาควิชา
          </label>
          <select
            id="department"
            name="department"
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-3 py-2.5 text-gray-900
                       shadow-sm outline-none transition-all duration-200
                       focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
                       appearance-none"
            value={form.department}
            onChange={(e) =>
              setForm((s) => ({ ...s, department: e.target.value }))
            }
          >
            <option value="" disabled>
              เลือกคณะ
            </option>
            {DEPARTMENTS.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <SelectRole
          value={form.role}
          onChange={(v) => setForm((s) => ({ ...s, role: v }))}
        />

        <Input
          label="เปลี่ยนรหัสผ่าน (ถ้าต้องการ)"
          type="password"
          value={form.password ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, password: v }))}
          placeholder="ปล่อยว่างเพื่อไม่เปลี่ยนรหัสผ่าน"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
