import React, { useEffect, useRef, useState } from "react";
import { reservationRow } from "../../types/types";

type Props = {
  row: reservationRow;
  onClose: () => void;
  onConfirm?: (row: reservationRow, reason: string) => void;
};

function toThaiDateDDMMYYYY(input: string | number | Date) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toHHmm(t: string | number | Date) {
  const d = new Date(t);
  if (!isNaN(d.getTime())) {
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return String(t);
}

export default function ReservationRejectModal({ row, onClose, onConfirm }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");

  // ปิดด้วย Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      return;
    }
    onConfirm?.(row, trimmed);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">ยืนยันการปฏิเสธการจอง</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 hover:bg-gray-100"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-gray-700">
            คุณต้องการ<strong className="text-red-600">ปฏิเสธ</strong>การจองนี้ใช่หรือไม่?
          </p>

          <div className="rounded-xl border border-gray-200 p-3 text-sm space-y-1">
            <div>
              <span className="text-gray-500">ห้อง: </span>
              <span className="font-medium">{row.room_id}</span>
            </div>
            <div>
              <span className="text-gray-500">วันที่: </span>
              <span className="font-medium">
                {toThaiDateDDMMYYYY(row.booking_date)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">เวลา: </span>
              <span className="font-medium">
                {toHHmm(row.start_time)} - {toHHmm(row.end_time)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ผู้จอง: </span>
              <span className="font-medium">{row.username}</span>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">
              ระบุเหตุผลการปฏิเสธ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="เช่น ห้องถูกใช้งานซ้ำซ้อน, ไม่ครบเงื่อนไขการจอง ฯลฯ"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            ยืนยันการปฏิเสธ
          </button>
        </div>
      </div>
    </div>
  );
}
