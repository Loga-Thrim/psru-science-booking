import { useEffect, useRef, useState } from "react";
import { reservationRow } from "../../types/types";
import { XCircle, X, Calendar, Clock, User, Building, MessageSquare } from "lucide-react";

type Props = {
  row: reservationRow;
  onClose: () => void;
  onConfirm?: (row: reservationRow, reason: string) => void | Promise<void>;
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

export default function ReservationRejectModal({
  row,
  onClose,
  onConfirm,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onConfirm?.(row, trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-white shadow-lg outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">ปฏิเสธการจอง</h3>
          <p className="text-gray-600">คุณต้องการปฏิเสธการจองนี้ใช่หรือไม่?</p>
        </div>

        {/* Booking Details */}
        <div className="px-6 pb-4">
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">ห้อง:</span>
              <span className="font-semibold text-gray-900">{row.room_id}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">วันที่:</span>
              <span className="font-semibold text-gray-900">{toThaiDateDDMMYYYY(row.booking_date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">เวลา:</span>
              <span className="font-semibold text-gray-900">{toHHmm(row.start_time)} - {toHHmm(row.end_time)}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">ผู้จอง:</span>
              <span className="font-semibold text-gray-900">{row.username}</span>
            </div>
          </div>
        </div>

        {/* Reason Input */}
        <div className="px-6 pb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            ระบุเหตุผลการปฏิเสธ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none resize-none"
            placeholder="เช่น ห้องถูกใช้งานซ้ำซ้อน, ไม่ครบเงื่อนไขการจอง ฯลฯ"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className="btn-danger flex items-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
          </button>
        </div>
      </div>
    </div>
  );
}
