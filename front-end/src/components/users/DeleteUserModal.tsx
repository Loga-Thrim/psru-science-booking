import { useState } from "react";
import type { UserRow } from "../../types/types";
import { Trash2, AlertTriangle, X } from "lucide-react";

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserRow;
  onClose: () => void;
  onConfirm: (user_id: number) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await onConfirm(user.user_id);
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "ลบผู้ใช้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบผู้ใช้</h3>
          <p className="text-gray-600">
            คุณต้องการลบผู้ใช้ <span className="font-semibold text-gray-900">{user.email}</span> ใช่หรือไม่?
          </p>
          <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className="btn-danger flex items-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'กำลังลบ...' : 'ลบผู้ใช้'}
          </button>
        </div>
      </div>
    </div>
  );
}
