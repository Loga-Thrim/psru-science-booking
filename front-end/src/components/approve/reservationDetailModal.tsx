import { useEffect, useRef } from "react";
import { reservationRow } from "../../types/types";
import { FileText, X, Calendar, Clock, Users, User, Building, Phone, Mail, MessageSquare, AlertCircle, Monitor, UserCheck, Info } from "lucide-react";

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

function Field({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
      {icon && <div className="text-slate-600 mt-0.5">{icon}</div>}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="font-semibold text-gray-900">{value || "-"}</span>
      </div>
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'รอดำเนินการ' },
      adminApproved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'แอดมินอนุมัติ' },
      approverApproved: { bg: 'bg-green-100', text: 'text-green-700', label: 'อนุมัติแล้ว' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'ไม่อนุมัติ' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
        className="w-full max-w-2xl rounded-3xl bg-white shadow-lg outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">รายละเอียดการจอง</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-gray-500">รหัสการจอง: <span className="font-mono font-medium text-gray-700">{row.reservation_id}</span></span>
            {getStatusBadge(row.reservation_status)}
          </div>

          {/* Room Info */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              ข้อมูลห้อง
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ชื่อห้อง" value={row.room_code || row.room_id} icon={<Building className="w-4 h-4" />} />
              <Field label="อาคาร" value={row.building} icon={<Building className="w-4 h-4" />} />
              <Field label="ชั้น" value={row.floor} icon={<Building className="w-4 h-4" />} />
              <Field label="ประเภทห้อง" value={row.room_type} icon={<FileText className="w-4 h-4" />} />
              <Field label="ความจุ" value={row.capacity ? `${row.capacity} คน` : undefined} icon={<Users className="w-4 h-4" />} />
              <Field label="เบอร์ติดต่อห้อง" value={row.contact_phone} icon={<Phone className="w-4 h-4" />} />
            </div>
            {row.equipment && (
              <div className="mt-3">
                <span className="text-xs font-medium text-gray-500 mb-2 block">อุปกรณ์ในห้อง</span>
                <div className="flex flex-wrap gap-2">
                  {row.equipment.split(",").map((eq, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      {eq.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {row.caretaker && (
              <div className="mt-3">
                <span className="text-xs font-medium text-gray-500 mb-2 block">ผู้ดูแลห้อง</span>
                <div className="flex flex-wrap gap-2">
                  {row.caretaker.split(",").map((ct, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {ct.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {row.description && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50/80">
                <span className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  รายละเอียดห้อง
                </span>
                <p className="text-sm text-gray-700">{row.description}</p>
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              ข้อมูลการจอง
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="วันที่" value={toThaiDateDDMMYYYY(row.booking_date)} icon={<Calendar className="w-4 h-4" />} />
              <Field label="เวลา" value={`${toHHmm(row.start_time)} - ${toHHmm(row.end_time)}`} icon={<Clock className="w-4 h-4" />} />
              <Field label="จำนวนผู้เข้าใช้งาน" value={String(row.number_of_users)} icon={<Users className="w-4 h-4" />} />
              <Field label="ประเภทการจอง" value={row.reservation_type} icon={<FileText className="w-4 h-4" />} />
            </div>
          </div>

          {/* User Info */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              ข้อมูลผู้จอง
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ชื่อผู้จอง" value={row.username} icon={<User className="w-4 h-4" />} />
              <Field label="ภาควิชา/หน่วยงาน" value={row.department} icon={<Building className="w-4 h-4" />} />
              <Field label="เบอร์โทรศัพท์" value={row.phone} icon={<Phone className="w-4 h-4" />} />
              <Field label="อีเมล" value={row.email} icon={<Mail className="w-4 h-4" />} />
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              เหตุผลการจอง
            </h3>
            <div className="rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4">
              <p className="whitespace-pre-wrap text-gray-700">
                {row.reservation_reason || "-"}
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          {row.rejection_reason && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                เหตุผลการปฏิเสธ
              </h3>
              <div className="rounded-xl border-2 border-red-100 bg-red-50/50 p-4">
                <p className="whitespace-pre-wrap text-red-700">
                  {row.rejection_reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}