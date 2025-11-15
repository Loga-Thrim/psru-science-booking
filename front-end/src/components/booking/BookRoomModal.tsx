import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Room } from "../../types/types";

type Props = { room: Room; onClose: () => void; };

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

export function BookRoomModal({ room, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    alert(`คุณเลือกวันที่ ${selectedDate} เพื่อจองห้อง ${room.room_code}`);
    onClose();
  };

  return (
    <Modal title={`จองห้อง ${room.room_code}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="เลือกวันที่ต้องการจอง">
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </Field>

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
