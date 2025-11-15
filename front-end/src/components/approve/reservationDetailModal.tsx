import React, { useEffect, useRef } from "react";
import { reservationRow } from "../../types/types";

type Props = {
  row: reservationRow;
  onClose: () => void;
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

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value || "-"}</span>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      <div className="rounded-xl border border-gray-200 p-3">{children}</div>
    </div>
  );
}

export default function ReservationDetailModal({ row, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">รายละเอียดการจอง</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 hover:bg-gray-100"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="รหัสการจอง" value={row.reservation_id} />
            <Field label="ห้อง" value={row.room_id} />
            <Field
              label="วันที่"
              value={toThaiDateDDMMYYYY(row.booking_date)}
            />
            <Field label="ตั้งแต่" value={toHHmm(row.start_time)} />
            <Field label="ถึง" value={toHHmm(row.end_time)} />
            <Field
              label="จำนวนผู้เข้าใช้งาน"
              value={String(row.number_of_users)}
            />
            <Field label="ประเภทการจอง" value={row.reservation_type} />
            <Field label="สถานะ" value={row.reservation_status} />
            <Field label="ผู้จอง" value={row.username} />
            <Field label="ภาควิชา/หน่วยงาน" value={row.department} />
            <Field label="เบอร์มือถือ" value={row.phone} />
            <Field label="อีเมล" value={row.email} />
          </div>

          <Section label="เหตุผลการจอง">
            <p className="whitespace-pre-wrap text-gray-700">
              {row.reservation_reason || "-"}
            </p>
          </Section>

          {row.rejection_reason && (
            <Section label="เหตุผลการปฏิเสธ (เดิม)">
              <p className="whitespace-pre-wrap text-gray-700">
                {row.rejection_reason}
              </p>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}