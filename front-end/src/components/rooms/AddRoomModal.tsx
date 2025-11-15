import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { ROOM_TYPE as ROOM_TYPES, ROOM_STATUS } from "../../types/types";

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    room_code: string;
    room_type: string;
    room_status: string;
    capacity: number;
    equipment: string;
    caretaker: string;
    description: string;
    images: File[];
  }) => Promise<void> | void;
};

export default function AddRoomModal({ onClose, onSubmit }: Props) {
  const [room_code, setRoomCode] = useState("");
  const [room_type, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [equipment, setEquipment] = useState("");
  const [caretaker, setCaretaker] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [room_status, setRoomStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        room_code,
        room_type,
        room_status,
        capacity: Number(capacity) || 0,
        equipment,
        caretaker,
        description,
        images,
      });
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="เพิ่มห้องใหม่" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="รหัส/ชื่อห้อง" value={room_code} onChange={setRoomCode} />

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

        <div className="md:col-span-2">
          <Input label="ผู้ดูแล" value={caretaker} onChange={setCaretaker} />
        </div>

        <div className="md:col-span-2">
          <Input
            label="อุปกรณ์ (คั่นด้วยจุลภาค เช่น โปรเจคเตอร์, ระบบเสียง)"
            value={equipment}
            onChange={setEquipment}
            placeholder="ไมค์ไร้สาย, เครื่องฉาย, เครื่องเสียง"
          />
        </div>

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

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            รูปภาพห้อง
          </label>
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
          <p className="text-xs text-gray-500">
            รองรับไฟล์ภาพหลายไฟล์ (JPG/PNG ฯลฯ)
          </p>
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
          บันทึก
        </button>
      </div>
    </Modal>
  );
}
