import React from "react";
import type { UserRow } from "../../types/types";
import { Modal } from "../../components/ui/Modal";

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserRow;
  onClose: () => void;
  onConfirm: (user_id: number) => Promise<void> | void;
}) {
  async function handleDelete() {
    try {
      await onConfirm(user.user_id);
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "ลบผู้ใช้ไม่สำเร็จ");
    }
  }

  return (
    <Modal title="ยืนยันการลบ" onClose={onClose}>
      <div className="space-y-4">
        <p>
          ต้องการลบผู้ใช้ <span className="font-semibold">{user.email}</span>{" "}
          ใช่หรือไม่?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            ลบ
          </button>
        </div>
      </div>
    </Modal>
  );
}
