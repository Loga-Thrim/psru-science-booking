import { reservationRow } from "../../types/types";

type Props = {
  rows: reservationRow[];
  onDetail: (row: reservationRow) => void;
  onApprove: (row: reservationRow) => void;
  onReject: (row: reservationRow) => void;
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

export default function ReservationTable({
  rows,
  onDetail,
  onApprove,
  onReject,
}: Props) {
  return (
    <table className="min-w-full border-separate border-spacing-0">
      <thead className="bg-gray-50 text-gray-700 border-b sticky top-0 z-10">
        <tr>
          <th className="text-left px-4 py-3 border-b font-semibold">ห้อง</th>
          <th className="text-center px-4 py-3 border-b font-semibold">วันที่/เวลา</th>
          <th className="text-left px-4 py-3 border-b font-semibold">ผู้จอง</th>
          <th className="text-center px-4 py-3 border-b font-semibold">เบอร์โทร</th>
          <th className="text-center px-4 py-3 border-b font-semibold">จำนวนคน</th>
          <th className="text-center px-4 py-3 border-b font-semibold">ดำเนินการ</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr
            key={(row as any).id ?? row.reservation_id ?? idx}
            className="hover:bg-amber-50/50 transition-colors"
          >
            <td className="border-b px-4 py-3 align-middle">
              <div className="font-semibold text-gray-900">{row.room_code || row.room_id}</div>
              <div className="text-xs text-gray-500">
                {row.building && <span>{row.building}</span>}
                {row.floor && <span> • ชั้น {row.floor}</span>}
              </div>
            </td>
            <td className="text-center border-b px-4 py-3 align-middle">
              <div className="font-medium text-gray-900">{toThaiDateDDMMYYYY(row.booking_date)}</div>
              <div className="text-sm text-amber-600 font-medium">
                {toHHmm(row.start_time)} - {toHHmm(row.end_time)}
              </div>
            </td>
            <td className="border-b px-4 py-3 align-middle">
              <div className="font-medium text-gray-900">{row.username}</div>
              <div className="text-xs text-gray-500">{row.department || row.email}</div>
            </td>
            <td className="text-center border-b px-4 py-3 align-middle text-sm text-gray-700">
              {row.phone || "-"}
            </td>
            <td className="text-center border-b px-4 py-3 align-middle">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                {row.number_of_users}
              </span>
            </td>
            <td className="px-3 py-3 text-center border-b">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onDetail(row)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ดูเพิ่มเติม
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(row)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  อนุมัติ
                </button>
                <button
                  type="button"
                  onClick={() => onReject(row)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  ปฏิเสธ
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
