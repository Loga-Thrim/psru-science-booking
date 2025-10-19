import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Room } from "../../types/types";

export function BookRoomModal({
  room,
  onClose,
}: {
  room: Room;
  onClose: () => void;
}) {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: เชื่อม API การสร้างคำขอจอง
    // ตัวอย่าง payload:
    // const payload = { room_id: room.room_id, start, end, purpose }
    // await fetch("/api/bookings", { method: "POST", body: JSON.stringify(payload) })
    alert("ส่งคำขอจอง (ตัวอย่าง) — ยังไม่เชื่อม API ครับ");
    onClose();
  };

  return (
    <Modal title={`จองห้อง ${room.room_code}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="เริ่มต้น">
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
          <Field label="สิ้นสุด">
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
        </div>

        <Field label="วัตถุประสงค์">
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="เช่น อบรมภายใน, ประชุมทีม ฯลฯ"
            className="min-h-[90px] w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </Field>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            ยืนยันการจอง
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
