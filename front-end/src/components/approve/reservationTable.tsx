import { reservationRow, UserRole } from "../../types/types";
import { Info, Check, X } from "lucide-react";
import StatusBadge from "../booking/StatusBadge";

type Props = {
  rows: reservationRow[];
  userRole: UserRole;
  onDetail: (row: reservationRow) => void;
  onApprove: (row: reservationRow) => void;
  onReject: (row: reservationRow) => void;
};

function isActionable(status: string, role: UserRole) {
  if (role === "admin") return status === "pending";
  if (role === "approver") return status === "adminApproved";
  return false;
}

function toThaiDateDDMMYYYY(input: string | number | Date) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toHHmm(t: string) {
  return (t ?? "").slice(0, 5);
}

export default function ReservationTable({
  rows,
  userRole,
  onDetail,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-800">
          <tr>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-left text-base font-bold">
              ห้อง
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-center text-base font-bold">
              วันที่ / เวลา
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-left text-base font-bold">
              ผู้จอง
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-center text-base font-bold">
              เบอร์โทร
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-center text-base font-bold">
              จำนวนคน
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-center text-base font-bold">
              สถานะ
            </th>
            <th className="border-b-2 border-stone-200 px-4 py-4 text-center text-base font-bold">
              ดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const canAction = isActionable(row.reservation_status, userRole);
            return (
              <tr
                key={row.reservation_id ?? idx}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="border-b border-stone-200 px-4 py-4 align-middle">
                  <div className="text-base font-bold text-slate-900">
                    {row.room_code || row.room_id}
                  </div>
                  <div className="text-sm text-slate-600">
                    {row.building && <span>{row.building}</span>}
                    {row.floor && <span> • ชั้น {row.floor}</span>}
                  </div>
                </td>
                <td className="border-b border-stone-200 px-4 py-4 text-center align-middle">
                  <div className="text-base font-semibold text-slate-900">
                    {toThaiDateDDMMYYYY(row.booking_date)}
                  </div>
                  <div className="text-base text-slate-700">
                    {toHHmm(row.start_time)} - {toHHmm(row.end_time)} น.
                  </div>
                </td>
                <td className="border-b border-stone-200 px-4 py-4 align-middle">
                  <div className="text-base font-semibold text-slate-900">
                    {row.username || "(ผู้ใช้ถูกลบแล้ว)"}
                  </div>
                  <div className="text-sm text-slate-600">
                    {row.department || row.email}
                  </div>
                </td>
                <td className="border-b border-stone-200 px-4 py-4 text-center align-middle text-base text-slate-800">
                  {row.phone || "-"}
                </td>
                <td className="border-b border-stone-200 px-4 py-4 text-center align-middle">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-900">
                    {row.number_of_users}
                  </span>
                </td>
                <td className="border-b border-stone-200 px-4 py-4 text-center align-middle">
                  <StatusBadge status={row.reservation_status} />
                </td>
                <td className="border-b border-stone-200 px-3 py-4 text-center">
                  <div className="flex flex-col items-stretch justify-center gap-2 xl:flex-row">
                    <button
                      type="button"
                      onClick={() => onDetail(row)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-stone-300 px-4 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <Info className="h-5 w-5" aria-hidden="true" />
                      รายละเอียด
                    </button>
                    {canAction && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(row)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-800"
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                          อนุมัติ
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(row)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-red-800"
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                          ไม่อนุมัติ
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
