import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Room } from "../../types/types";
import { ROOM_TYPE as ROOM_TYPES, ROOM_STATUS } from "../../types/types";

const api = import.meta.env.VITE_API;

type Props = {
  room: Room | null;
  onClose: () => void;
  onUpdated?: (room: Room) => void;
};

type RoomImage = {
  image_id?: string;
  room_id?: string;
  image_path?: string;
  image_url: string;
};

export default function EditRoomModal({ room, onClose, onUpdated }: Props) {
  const [room_code, setRoomCode] = useState("");
  const [room_type, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [equipment, setEquipment] = useState("");
  const [caretaker, setCaretaker] = useState("");
  const [description, setDescription] = useState("");
  const [room_status, setRoomStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState<RoomImage[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const currentImage = useMemo(() => {
    if (previews[0]) return previews[0];
    return images[0]?.image_url ?? null;
  }, [previews, images]);

  useEffect(() => {
    if (!room) return;

    setRoomCode(room.room_code);
    setRoomType(room.room_type || "");
    setCapacity(String(room.capacity ?? 0));
    setEquipment(room.equipment || "");
    setCaretaker(room.caretaker || "");
    setDescription(room.description || "");
    setRoomStatus(room.status || "");

    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
    setNewFiles([]);

    const ac = new AbortController();
    fetchImages(room.room_id, ac.signal);

    return () => {
      ac.abort();
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [room?.room_id]);

  const fetchImages = async (room_id: string, signal?: AbortSignal) => {
    try {
      setImgLoading(true);
      setImgError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/room-image/${encodeURIComponent(room_id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`โหลดรูปไม่สำเร็จ (HTTP ${res.status})`);
      const data = (await res.json()) as any[];
      const cleaned: RoomImage[] = Array.isArray(data)
        ? data.filter((x) => typeof x?.image_url === "string" && x.image_url.length > 0)
        : [];
      setImages(cleaned);
    } catch (e: any) {
      if (e?.name !== "AbortError") setImgError(e?.message ?? "ไม่สามารถโหลดรูปได้");
    } finally {
      setImgLoading(false);
    }
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // replace selection (ถ้าต้องการให้สะสมไฟล์ ให้เปลี่ยนเป็นการ concat)
    newFiles.forEach((_, i) => {
      if (previews[i]) URL.revokeObjectURL(previews[i]);
    });
    const nextPreviews = files.map((f) => URL.createObjectURL(f));

    setNewFiles(files);
    setPreviews(nextPreviews);
  };

  const uploadImagesIfNeeded = async (room_id: string) => {
    if (!newFiles.length) return;

    const token = localStorage.getItem("token");
    const form = new FormData();
    newFiles.forEach((f) => form.append("images", f, f.name));

    console.log(`${api}/rooms-image/${room_id}`)
    const resImg = await fetch(`${api}/rooms-image/${room_id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!resImg.ok) {
      const err = await resImg.text().catch(() => "");
      throw new Error(err || "upload failed");
    }
  };

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

      const res = await fetch(`${api}/rooms/${encodeURIComponent(room.room_id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("อัปเดตห้องไม่สำเร็จ");
      const updated: Room = await res.json();

      await uploadImagesIfNeeded(encodeURIComponent(room.room_id));

      onUpdated?.(updated);
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
      previews.forEach((u) => URL.revokeObjectURL(u));
    }
  };

  return (
    <Modal title="แก้ไขข้อมูลห้อง" onClose={onClose}>
      {/* ===== รูปภาพ ===== */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">รูปภาพ</label>
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-gray-50">
            {imgLoading ? (
              <div className="h-full w-full animate-pulse" />
            ) : imgError ? (
              <div className="flex h-full items-center justify-center text-sm text-red-600">
                {imgError}
              </div>
            ) : currentImage ? (
              <img src={currentImage} alt="room" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePickImage}
            disabled={submitting}
            className="absolute right-3 top-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            เปลี่ยนรูป
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelected}
          />

          {/* preview chips / filenames */}
          {newFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {newFiles.map((f, idx) => (
                <span
                  key={idx}
                  className="max-w-[18rem] truncate rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
                  title={f.name}
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== ฟอร์มรายละเอียด ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="รหัส/ชื่อห้อง" value={room_code} onChange={setRoomCode} />

        {/* ประเภทห้อง */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">ประเภท</label>
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

        {/* ความจุ */}
        <Input label="ความจุ (ที่นั่ง)" type="number" value={capacity} onChange={setCapacity} />

        {/* สถานะห้อง */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">สถานะห้อง</label>
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

        {/* ผู้ดูแล */}
        <div className="md:col-span-2">
          <Input label="ผู้ดูแล" value={caretaker} onChange={setCaretaker} />
        </div>

        {/* อุปกรณ์ */}
        <div className="md:col-span-2">
          <Input
            label="อุปกรณ์ (คั่นด้วยจุลภาค เช่น โปรเจคเตอร์, ระบบเสียง)"
            value={equipment}
            onChange={setEquipment}
            placeholder="ไมค์ไร้สาย, เครื่องฉาย, เครื่องเสียง"
          />
        </div>

        {/* รายละเอียด */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
          disabled={submitting}
        >
          ยกเลิก
        </button>
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={submitting}
        >
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </Modal>
  );
}
