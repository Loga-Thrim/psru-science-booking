import { useMemo, useState } from "react";
import type { UpsertForm, UserRow } from "../../types/types";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { SelectRole } from "../../components/ui/SelectRole";
import { DEPARTMENTS } from "../../types/types";
import { Edit3, Mail, User, Building, Lock } from "lucide-react";

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
    <Modal 
      title="แก้ไขข้อมูลผู้ใช้" 
      onClose={onClose}
      icon={<Edit3 className="w-5 h-5 text-white" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="อีเมล"
          type="email"
          value={form.email}
          onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          required
          icon={<Mail className="w-5 h-5" />}
        />

        <Input
          label="ชื่อผู้ใช้"
          value={form.username}
          onChange={(v) => setForm((s) => ({ ...s, username: v }))}
          required
          icon={<User className="w-5 h-5" />}
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              สังกัด/ภาควิชา
            </div>
          </label>
          <select
            required
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
            value={form.department}
            onChange={(e) =>
              setForm((s) => ({ ...s, department: e.target.value }))
            }
          >
            <option value="" disabled>
              -- เลือกคณะ --
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
          icon={<Lock className="w-5 h-5" />}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
