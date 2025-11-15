import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Room } from "../../types/types";

const api = import.meta.env.VITE_API;

type Props = {
  room: Room;
  onClose: () => void;
};

type RoomImage = {
  image_id: string;
  room_id: string;
  image_path: string;
  image_url: string;
};

export function RoomDetailsModal({ room, onClose }: Props) {
  const equipments = useMemo(
    () =>
      (room.equipment ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [room.equipment]
  );

  const [images, setImages] = useState<RoomImage[]>([]);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchImages() {
      setImgLoading(true);
      setImgError(null);
      try {
        const id = room.room_id;
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/room-image/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid response body");
        const cleaned = data.filter(
          (x: any) =>
            typeof x?.image_url === "string" && x.image_url.length > 0
        );
        setImages(cleaned);
        setActiveIndex(0);
      } catch (err: any) {
        if (err?.name !== "AbortError")
          setImgError(err?.message ?? "ไม่สามารถโหลดรูปได้");
      } finally {
        setImgLoading(false);
      }
    }

    fetchImages();
    return () => ac.abort();
  }, [room]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((i) => (i + 1) % images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  const openLightbox = (index?: number) => {
    if (!images.length) return;
    if (typeof index === "number") setActiveIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const zoomIn = () => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const zoomReset = () => setZoom(1);

  const currentImage = images[activeIndex];

  return (
    <>
      <Modal title={`รายละเอียดห้อง ${room.room_code ?? ""}`} onClose={onClose}>
        <div className="flex flex-col gap-6 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">รูปภาพ</h3>
              <button
                type="button"
                onClick={() => openLightbox()}
                disabled={images.length === 0 || imgLoading || !!imgError}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="ขยายภาพ"
              >
                ขยายภาพ
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
              {imgLoading ? (
                <div className="h-full w-full animate-pulse bg-gray-100" />
              ) : imgError ? (
                <div className="flex h-full items-center justify-center text-sm text-red-600">
                  {imgError}
                </div>
              ) : images.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  ไม่มีรูปภาพ
                </div>
              ) : (
                <img
                  src={currentImage?.image_url}
                  alt={`รูปห้อง ${room.room_code ?? room.room_id}`}
                  className="h-full w-full cursor-zoom-in object-cover"
                  onClick={() => openLightbox(activeIndex)}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((im, idx) => (
                  <button
                    key={im.image_id ?? im.image_url ?? idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border ${
                      activeIndex === idx ? "ring-2 ring-emerald-500" : ""
                    }`}
                    aria-label={`เลือกภาพที่ ${idx + 1}`}
                  >
                    <img
                      src={im.image_url}
                      alt={`ตัวอย่างรูป ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">รายละเอียด</h3>
            <div className="rounded-xl border p-4">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-500">รหัสห้อง</dt>
                  <dd className="font-medium">{room.room_code}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">ประเภท</dt>
                  <dd className="font-medium">{room.room_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">ความจุ</dt>
                  <dd className="font-medium">{room.capacity}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">ผู้ดูแล</dt>
                  <dd className="font-medium">{room.caretaker ?? "-"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500">คำอธิบาย</dt>
                  <dd className="max-h-40 overflow-auto break-all whitespace-pre-wrap rounded-md bg-gray-50 p-3">
                    {room.description ?? "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">อุปกรณ์</h3>
            <div className="rounded-xl border p-4">
              {equipments.length === 0 ? (
                <p className="text-sm text-gray-500">-</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {equipments.map((eq, i) => (
                    <li
                      key={`${eq}-${i}`}
                      className="rounded-full border px-3 py-1 text-sm"
                    >
                      {eq}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              ปิด
            </button>
          </div>
        </div>
      </Modal>

      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80"
          aria-modal
          role="dialog"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-white/20"
            title="ปิด"
          >
            ปิด
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(
                    (i) => (i - 1 + images.length) % images.length
                  );
                  setZoom(1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20"
                title="ก่อนหน้า"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                  setZoom(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20"
                title="ถัดไป"
              >
                ›
              </button>
            </>
          )}

          <div
            className="flex h-full w-full items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] max-w-[95vw]">
              <img
                src={currentImage.image_url}
                alt={`รูปห้องขยาย ${room.room_code ?? room.room_id}`}
                className="h-full w-full select-none object-contain"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                draggable={false}
              />
            </div>
          </div>

          <div className="pointer-events-auto absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomOut();
                }}
                className="rounded-full px-3 py-1.5 hover:bg-white/20"
                title="ซูมออก"
              >
                −
              </button>
              <span className="min-w-[60px] text-center text-sm">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
                className="rounded-full px-3 py-1.5 hover:bg-white/20"
                title="ซูมเข้า"
              >
                +
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomReset();
                }}
                className="ml-1 rounded-full px-3 py-1.5 text-sm hover:bg-white/20"
                title="รีเซ็ตซูม"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomDetailsModal;