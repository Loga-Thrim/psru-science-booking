import { useCallback, useEffect, useState } from "react";
import ReservationTable from "../components/approve/reservationTable";
import { useAuth } from "../contexts/AuthContext";
import { reservationRow } from "../types/types";
import ReservationDetailModal from "../components/approve/reservationDetailModal";
import ReservationApproveModal from "../components/approve/reservationApproveModal";
import ReservationRejectModal from "../components/approve/reservationRejectModal";
import { ClipboardCheck, Clock, CheckCircle, XCircle, Search, ShieldX } from "lucide-react";

const api = import.meta.env.VITE_API;

function BookingApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [rows, setRows] = useState<reservationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
      setApproveRow(null);
      await fetchReservations();
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
      setRejectRow(null);
      await fetchReservations();
    } catch (e) {
      console.error(e);
      alert("ปฏิเสธไม่สำเร็จ");
    }
  };

  const filteredRows = rows.filter(row =>
    row.room_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = rows.filter(r => r.reservation_status === 'pending').length;
  const adminApprovedCount = rows.filter(r => r.reservation_status === 'adminApproved').length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
          <p className="text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  const canAccess = user.role === "admin" || user.role === "approver";

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-purple-600" />
          อนุมัติการจอง
        </h1>
        <p className="text-gray-500 mt-1">ตรวจสอบและอนุมัติคำขอจองห้องประชุม</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              <p className="text-sm text-gray-500">รอดำเนินการทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">รอการอนุมัติ</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminApprovedCount}</p>
              <p className="text-sm text-gray-500">แอดมินอนุมัติแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="luxury-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาตามห้องหรือชื่อผู้จอง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury pl-12"
          />
        </div>
      </div>

      {/* Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
              <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : err ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">เกิดข้อผิดพลาด: {err}</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-500 font-medium">ไม่มีรายการรอการอนุมัติ</p>
            <p className="text-gray-400 text-sm mt-1">รายการทั้งหมดได้รับการดำเนินการแล้ว</p>
          </div>
        ) : (
          <ReservationTable
            rows={filteredRows}
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
