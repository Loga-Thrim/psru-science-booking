import React, { useCallback, useEffect, useState } from "react";
import { reservationRow } from "../../types/types";
import ReservationDetailModal from "./reservationDetailModal";
import ReservationApproveModal from "./reservationApproveModal";
import ReservationRejectModal from "./reservationRejectModal";

const api = import.meta.env.VITE_API;

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
  // รับได้ทั้ง "2025-11-12T13:00:00" หรือ "13:00"
  if (!isNaN(d.getTime())) {
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
  // ถ้าเป็น string รูปแบบ "13:00" ก็คืนกลับเลย
  return String(t);
}

export default function ReservationTable({ rows }: { rows: reservationRow[] }) {
  const [tableRows, setTableRows] = useState<reservationRow[]>(rows);
  const [reservation, setReservation] = useState<reservationRow | null>(null);
  const [selectDetail, setSelectDetail] = useState<boolean>(false);

  // state สำหรับ modal อนุมัติ / ปฏิเสธ
  const [approveTarget, setApproveTarget] = useState<reservationRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<reservationRow | null>(null);

  // sync rows จาก parent เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  // ----- Detail -----
  const handleDetail = useCallback((row: reservationRow) => {
    setReservation(row);
    setSelectDetail(true);
    console.log("detail", row);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectDetail(false);
    setReservation(null);
  }, []);

  // ----- Approve -----
  const handleApprove = useCallback((row: reservationRow) => {
    console.log("open approve modal for", row);
    setApproveTarget(row);
  }, []);

  const closeApproveModal = useCallback(() => {
    setApproveTarget(null);
  }, []);

  const confirmApprove = useCallback(async (row: reservationRow) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: row.room_id, user_id: row.user_id }),
      });

      if (!res.ok) {
        console.error("approve failed");
        return;
      }

      console.log("approve success");

      // ปิด modal
      setApproveTarget(null);

      // ลบ row ที่อนุมัติแล้วออกจาก table (ถือว่าไม่ต้องแสดงใน list นี้แล้ว)
      setTableRows((prev) =>
        prev.filter((r) => (r as any).id !== (row as any).id)
      );
    } catch (err) {
      console.error("approve error", err);
    }
  }, []);

  // ----- Reject -----
  const handleReject = useCallback((row: reservationRow) => {
    console.log("open reject modal for", row);
    setRejectTarget(row);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectTarget(null);
  }, []);

  const confirmReject = useCallback((row: reservationRow, reason: string) => {
    console.log("confirm reject", row, "reason:", reason);
    // TODO: เรียก API ปฏิเสธที่นี่ พร้อม reason ถ้าต้องการ
    setRejectTarget(null);
  }, []);

  return (
    <>
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
          {tableRows.map((row, idx) => (
            <tr key={(row as any).id ?? idx} className="even:bg-white odd:bg-gray-50">
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
                  onClick={() => handleDetail(row)}
                  className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  ดูเพิ่มเติม
                </button>
              </td>
              <td className="px-2 py-2 text-center border-b">
                <button
                  type="button"
                  onClick={() => handleApprove(row)}
                  className="px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  อนุมัติ
                </button>
              </td>
              <td className="px-2 py-2 text-center border-b">
                <button
                  type="button"
                  onClick={() => handleReject(row)}
                  className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  ปฏิเสธ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Modal */}
      {selectDetail && reservation && (
        <ReservationDetailModal row={reservation} onClose={closeDetail} />
      )}

      {/* Approve Modal */}
      {approveTarget && (
        <ReservationApproveModal
          row={approveTarget}
          onClose={closeApproveModal}
          onConfirm={confirmApprove}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <ReservationRejectModal
          row={rejectTarget}
          onClose={closeRejectModal}
          onConfirm={confirmReject}
        />
      )}
    </>
  );
}
