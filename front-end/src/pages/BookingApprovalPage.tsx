import React, { useCallback, useEffect, useState } from "react";
import ReservationTable from "../components/approve/reservationTable";
import { useAuth } from "../contexts/AuthContext";
import { reservationRow } from "../types/types";
import ReservationDetailModal from "../components/approve/reservationDetailModal";
import ReservationApproveModal from "../components/approve/reservationApproveModal";
import ReservationRejectModal from "../components/approve/reservationRejectModal";

const api = import.meta.env.VITE_API;

function BookingApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [rows, setRows] = useState<reservationRow[]>([]);

  const [detailRow, setDetailRow] = useState<reservationRow | null>(null);
  const [approveRow, setApproveRow] = useState<reservationRow | null>(null);
  const [rejectRow, setRejectRow] = useState<reservationRow | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/reservation-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setErr("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        throw new Error(`Fetch failed: ${res.status}`);
      }
      const data = (await res.json()) as reservationRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleOpenDetail = (row: reservationRow) => setDetailRow(row);
  const handleOpenApprove = (row: reservationRow) => setApproveRow(row);
  const handleOpenReject = (row: reservationRow) => setRejectRow(row);

  const removeRow = (row: reservationRow) => {
    setRows((prev) =>
      prev.filter(
        (r) =>
          (r as any).id !== (row as any).id &&
          r.reservation_id !== row.reservation_id
      )
    );
  };

  const handleConfirmApprove = async (row: reservationRow) => {
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
        throw new Error("approve failed");
      }
      removeRow(row);
      setApproveRow(null);
    } catch (e) {
      console.error(e);
      alert("อนุมัติไม่สำเร็จ");
    }
  };

  const handleConfirmReject = async (row: reservationRow, reason: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservationId: row.reservation_id,
          rejectionReason: reason,
        }),
      });
      if (!res.ok) {
        throw new Error("reject failed");
      }
      removeRow(row);
      setRejectRow(null);
    } catch (e) {
      console.error(e);
      alert("ปฏิเสธไม่สำเร็จ");
    }
  };

  if (!user) {
    return <div className="p-6 text-red-600">โปรดเข้าสู่ระบบ</div>;
  }

  const canAccess = user.role === "admin" || user.role === "approver";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">อนุมัติการจอง</h1>

      <div className="bg-white rounded-lg shadow">
        {!canAccess ? (
          <div className="p-6 text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
        ) : loading ? (
          <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : err ? (
          <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {err}</div>
        ) : (
          <ReservationTable
            rows={rows}
            onDetail={handleOpenDetail}
            onApprove={handleOpenApprove}
            onReject={handleOpenReject}
          />
        )}
      </div>

      {detailRow && (
        <ReservationDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}

      {approveRow && (
        <ReservationApproveModal
          row={approveRow}
          onClose={() => setApproveRow(null)}
          onConfirm={handleConfirmApprove}
        />
      )}

      {rejectRow && (
        <ReservationRejectModal
          row={rejectRow}
          onClose={() => setRejectRow(null)}
          onConfirm={handleConfirmReject}
        />
      )}
    </div>
  );
}

export default BookingApprovalPage;
