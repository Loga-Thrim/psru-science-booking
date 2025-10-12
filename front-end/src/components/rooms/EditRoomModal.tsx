// EditRoomModal.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Room } from "../../types/types";
import { ROOM_TYPE as ROOM_TYPES } from "../../types/types";
import { ROOM_STATUS } from "../../types/types";
const api = import.meta.env.VITE_API;

type Props = {
  room: Room | null;
  onClose: () => void;
  onUpdated?: (room: Room) => void;
};

export default function EditRoomModal({ room, onClose, onUpdated }: Props) {
  const [room_code, setRoomCode] = useState("");
  const [room_type, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [equipment, setEquipment] = useState("");
  const [caretaker, setCaretaker] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [room_status, setRoomStatus] = useState("");


  useEffect(() => {
    if (room) {
      setRoomCode(room.room_code);
      setRoomType(room.room_type || "");
      setCapacity(String(room.capacity ?? 0));
      setEquipment(room.equipment || "");
      setCaretaker(room.caretaker || "");
      setDescription(room.description || "");
      setRoomStatus(room.status || "");
    }
  }, [room]);

  const handleSubmit = async () => {
    if (!room) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const body = {
        room_code,
        room_type,
        room_status,
        capacity: Number(capacity) || 0,
        equipment,
        caretaker,
        description,
      };

      const res = await fetch(`${api}/rooms/${room.room_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("อัปเดตห้องไม่สำเร็จ");
      const data: Room = await res.json();
      onUpdated?.(data);
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="แก้ไขข้อมูลห้อง" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* แถว 1 */}
        <Input label="รหัส/ชื่อห้อง" value={room_code} onChange={setRoomCode} />

        {/* ประเภทห้อง */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            ประเภท
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={room_type}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="" disabled>
              -- เลือกประเภทห้อง --
            </option>
            {ROOM_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        {/* แถว 2: ซ้าย = ความจุ, ขวา = สถานะห้อง (ให้เหมือน Add Room) */}
        <Input
          label="ความจุ (ที่นั่ง)"
          type="number"
          value={capacity}
          onChange={setCapacity}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            สถานะห้อง
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={room_status}
            onChange={(e) => setRoomStatus(e.target.value)}
          >
            <option value="" disabled>
              -- เลือกสถานะ --
            </option>
            {ROOM_STATUS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* แถว 3: ผู้ดูแลเต็มแถว */}
        <div className="md:col-span-2">
          <Input label="ผู้ดูแล" value={caretaker} onChange={setCaretaker} />
        </div>

        {/* อุปกรณ์: เต็มแถว */}
        <div className="md:col-span-2">
          <Input
            label="อุปกรณ์ (คั่นด้วยจุลภาค เช่น โปรเจคเตอร์, ระบบเสียง)"
            value={equipment}
            onChange={setEquipment}
            placeholder="ไมค์ไร้สาย, เครื่องฉาย, เครื่องเสียง"
          />
        </div>

        {/* รายละเอียด: เต็มแถว */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            รายละเอียด
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          onClick={onClose}
          disabled={submitting}
        >
          ยกเลิก
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={submitting}
        >
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </Modal>
  );
}
