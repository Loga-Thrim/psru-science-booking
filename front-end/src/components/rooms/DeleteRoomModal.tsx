import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Room } from "../../types/types";
const api = import.meta.env.VITE_API;

type Props = {
  room: Room | null;
  onClose: () => void;
  onDeleted?: (room_id: string) => void;
};

export default function DeleteRoomModal({ room, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${api}/rooms/${room.room_id}`, {
        method: "DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("ลบห้องไม่สำเร็จ");
      onDeleted?.(room.room_id);
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="ยืนยันการลบห้อง" onClose={onClose}>
      <p className="text-gray-700">
        ต้องการลบห้อง <span className="font-semibold">{room?.room_code}</span> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={onClose} disabled={loading}>
          ยกเลิก
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          onClick={handleDelete}
          disabled={loading}
        >
          ลบ
        </button>
      </div>
    </Modal>
  );
}
