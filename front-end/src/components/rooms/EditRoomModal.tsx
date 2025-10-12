import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Room } from "../../types/types";
import { ROOM_TYPE } from "../../types/types";
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
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // รองรับทั้ง enum และ array
  const ROOM_TYPES: string[] = Array.isArray(ROOM_TYPE)
    ? ROOM_TYPE
    : (Object.values(ROOM_TYPE).filter((v) => typeof v === "string") as string[]);

  useEffect(() => {
    if (room) {
      setRoomCode(room.room_code);
      setRoomType(room.room_type || "");
      setCapacity(String(room.capacity ?? 0));
      setEquipment(room.equipment || "");
      setCaretaker(room.caretaker || "");
      setDescription(room.description || "");
    }
  }, [room]);

  const handleSubmit = async () => {
    if (!room) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let res: Response;

      if (images.length > 0) {
        // ถ้ามีไฟล์ -> ส่งแบบ FormData
        const form = new FormData();
        form.append("room_code", room_code);
        form.append("room_type", room_type);
        form.append("capacity", String(Number(capacity) || 0));
        form.append("equipment", equipment);
        form.append("caretaker", caretaker);
        form.append("description", description);
        images.forEach((f) => form.append("images", f)); // ฟิลด์ "images"

        res = await fetch(`${api}/rooms/${room.room_id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } else {
        // ไม่มีไฟล์ -> ส่ง JSON ตามเดิม
        const body = {
          room_code,
          room_type,
          capacity: Number(capacity) || 0,
          equipment,
          caretaker,
          description,
        };

        res = await fetch(`${api}/rooms/${room.room_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

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
        <Input label="รหัส/ชื่อห้อง" value={room_code} onChange={setRoomCode} />

        {/* ประเภทห้อง */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">ประเภท</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={room_type}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="" disabled>-- เลือกประเภทห้อง --</option>
            {ROOM_TYPES.map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>

        <Input label="ความจุ (ที่นั่ง)" type="number" value={capacity} onChange={setCapacity} />
        <Input label="ผู้ดูแล" value={caretaker} onChange={setCaretaker} />

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
          <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* รูปภาพ: เต็มแถว + เลือกได้หลายไฟล์ */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">รูปภาพห้อง</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setImages(files);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {images.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50"
                  title={`${f.name} • ${Math.round(f.size / 1024)} KB`}
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">อัปโหลดได้หลายไฟล์ (JPG/PNG เป็นต้น)</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={onClose} disabled={submitting}>
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
