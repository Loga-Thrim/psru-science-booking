import React from "react";
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
          <th className="text-center px-4 py-2 border-b">ห้อง</th>
          <th className="text-center px-4 py-2 border-b">วันที่</th>
          <th className="text-center px-4 py-2 border-b">เริ่มต้น</th>
          <th className="text-center px-4 py-2 border-b">สิ้นสุด</th>
          <th className="text-center px-4 py-2 border-b">ชื่อผู้จอง</th>
          <th className="text-center px-4 py-2 border-b">เบอร์มือถือ</th>
          <th className="text-center px-4 py-2 border-b">จำนวนผู้เข้าใช้งาน</th>
          <th className="text-center px-4 py-2 border-b">รายละเอียด</th>
          <th className="text-center px-4 py-2 border-b">อนุมัติ</th>
          <th className="text-center px-4 py-2 border-b">ปฏิเสธ</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr
            key={(row as any).id ?? row.reservation_id ?? idx}
            className="even:bg-white odd:bg-gray-50"
          >
            <td className="text-center border-b px-4 py-2 align-middle">
              {row.room_id}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {toThaiDateDDMMYYYY(row.booking_date)}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {toHHmm(row.start_time)}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {toHHmm(row.end_time)}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {row.username}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {row.phone}
            </td>
            <td className="text-center border-b px-4 py-2 align-middle">
              {row.number_of_users}
            </td>
            <td className="px-2 py-2 text-center border-b">
              <button
                type="button"
                onClick={() => onDetail(row)}
                className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                ดูเพิ่มเติม
              </button>
            </td>
            <td className="px-2 py-2 text-center border-b">
              <button
                type="button"
                onClick={() => onApprove(row)}
                className="px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                อนุมัติ
              </button>
            </td>
            <td className="px-2 py-2 text-center border-b">
              <button
                type="button"
                onClick={() => onReject(row)}
                className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
