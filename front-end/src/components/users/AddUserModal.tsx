import { useState } from "react";
import type { UpsertForm } from "../../types/types";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { SelectRole } from "../../components/ui/SelectRole";
import { DEPARTMENTS } from "../../types/types";
import { UserPlus, Mail, User, Building, Lock } from "lucide-react";

export function AddUserModal({ onClose, onSubmit}: { onClose: () => void; onSubmit: (data: UpsertForm) => Promise<void> | void;}) {
  const [form, setForm] = useState<UpsertForm>({
    email: "",
    username: "",
    department: "",
    role: "user",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "สร้างผู้ใช้ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal 
      title="เพิ่มผู้ใช้ใหม่" 
      onClose={onClose}
      icon={<UserPlus className="w-5 h-5 text-white" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="อีเมล"
          type="email"
          value={form.email}
          onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          required
          placeholder="example@email.com"
          icon={<Mail className="w-5 h-5" />}
        />

        <Input
          label="ชื่อผู้ใช้"
          value={form.username}
          onChange={(v) => setForm((s) => ({ ...s, username: v }))}
          required
          placeholder="ชื่อ-นามสกุล"
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
          label="รหัสผ่าน"
          type="password"
          value={form.password ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, password: v }))}
          required
          placeholder="••••••••"
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
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
