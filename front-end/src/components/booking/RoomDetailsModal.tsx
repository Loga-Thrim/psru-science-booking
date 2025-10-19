import React from "react";
import { Modal } from "../ui/Modal";
import { Room } from "../../types/types";

export function RoomDetailsModal({
  room,
  onClose,
}: {
  room: Room;
  onClose: () => void;
}) {
  return (
    <Modal title={`รายละเอียดห้อง ${room.room_code}`} onClose={onClose}>
      <div className="space-y-3">
        <Row label="ประเภทห้อง" value={room.room_type || "-"} />
        <Row label="ความจุ" value={`${room.capacity ?? "-"}`} />
        <Row label="อุปกรณ์" value={room.equipment || "-"} />
        <Row label="ผู้ดูแล" value={room.caretaker || "-"} />
        <Row label="คำอธิบาย" value={room.description || "-"} />
        <Row label="สถานะ" value={room.status || "-"} />
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          ปิด
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-4 text-sm font-medium text-gray-600">{label}</div>
      <div className="col-span-8 text-sm text-gray-800">{value}</div>
    </div>
  );
}
