import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import ReservationTable from "../components/approve/reservationTable";
import { useAuth } from "../contexts/AuthContext";
import { reservationRow } from "../types/types";
import ReservationDetailModal from "../components/approve/reservationDetailModal";
import ReservationApproveModal from "../components/approve/reservationApproveModal";
import ReservationRejectModal from "../components/approve/reservationRejectModal";
import { ClipboardCheck, Clock, CheckCircle, XCircle, Search, ShieldX, Ban, CalendarDays } from "lucide-react";

const api = import.meta.env.VITE_API;

/** Which rows the four summary cards select. "todo" is whatever *this* role can act on. */
type StatusFilter = "todo" | "pending" | "adminApproved" | "approverApproved" | "rejected";
type DateFilter = "all" | "today" | "week" | "month";

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "ทุกวัน" },
  { key: "today", label: "วันนี้" },
  { key: "week", label: "7 วันข้างหน้า" },
  { key: "month", label: "เดือนนี้" },
];

function matchesDateFilter(bookingDate: string, filter: DateFilter) {
  if (filter === "all") return true;
  const d = dayjs(bookingDate);
  const today = dayjs().startOf("day");
  if (filter === "today") return d.isSame(today, "day");
  if (filter === "week")
    return !d.isBefore(today, "day") && d.diff(today, "day") <= 7;
  return d.isSame(today, "month");
}

function BookingApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [rows, setRows] = useState<reservationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todo");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

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
        body: JSON.stringify({ reservationId: row.reservation_id }),
      });
      if (!res.ok) {
        throw new Error("approve failed");
      }
      setApproveRow(null);
      fetchReservations();
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
      fetchReservations();
    } catch (e) {
      console.error(e);
      alert("ปฏิเสธไม่สำเร็จ");
    }
  };

  const pendingCount = rows.filter(r => r.reservation_status === 'pending').length;
  const adminApprovedCount = rows.filter(r => r.reservation_status === 'adminApproved').length;
  const approvedCount = rows.filter(r => r.reservation_status === 'approverApproved').length;
  const rejectedCount = rows.filter(r => r.reservation_status === 'rejected').length;

  /** The status this role is expected to act on, used by the "รอฉันดำเนินการ" card. */
  const myTodoStatus = user?.role === "approver" ? "adminApproved" : "pending";
  const myTodoCount = rows.filter(r => r.reservation_status === myTodoStatus).length;

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (statusFilter === "todo") return row.reservation_status === myTodoStatus;
        return row.reservation_status === statusFilter;
      })
      .filter((row) => matchesDateFilter(row.booking_date, dateFilter))
      .filter((row) => {
        if (!term) return true;
        return (
          row.room_code?.toLowerCase().includes(term) ||
          row.room_id?.toLowerCase().includes(term) ||
          row.building?.toLowerCase().includes(term) ||
          row.username?.toLowerCase().includes(term) ||
          row.department?.toLowerCase().includes(term)
        );
      })
      // Soonest booking first: an approver works through the nearest dates.
      .sort((a, b) =>
        `${a.booking_date}T${a.start_time}`.localeCompare(
          `${b.booking_date}T${b.start_time}`
        )
      );
  }, [rows, statusFilter, dateFilter, searchTerm, myTodoStatus]);

  const summaryCards = [
    {
      key: "todo" as StatusFilter,
      label: "รอฉันดำเนินการ",
      count: myTodoCount,
      icon: ClipboardCheck,
      tone: "bg-amber-100 text-amber-700",
      ring: "ring-amber-500",
    },
    {
      key: (user?.role === "approver" ? "pending" : "adminApproved") as StatusFilter,
      label: user?.role === "approver" ? "รอแอดมินตรวจสอบ" : "รอผู้อนุมัติ",
      count: user?.role === "approver" ? pendingCount : adminApprovedCount,
      icon: Clock,
      tone: "bg-blue-100 text-blue-700",
      ring: "ring-blue-500",
    },
    {
      key: "approverApproved" as StatusFilter,
      label: "อนุมัติแล้ว",
      count: approvedCount,
      icon: CheckCircle,
      tone: "bg-emerald-100 text-emerald-700",
      ring: "ring-emerald-500",
    },
    {
      key: "rejected" as StatusFilter,
      label: "ไม่อนุมัติ",
      count: rejectedCount,
      icon: Ban,
      tone: "bg-red-100 text-red-700",
      ring: "ring-red-500",
    },
  ];

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
        <p className="text-gray-500 mt-1">ตรวจสอบและอนุมัติคำขอจองห้อง มรพส.</p>
      </div>

      {/* The cards double as the status filter, which is how an approver
          actually navigates: "show me the ones waiting on me". */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const active = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(card.key)}
              className={clsx(
                "luxury-card p-5 text-left transition-all",
                active
                  ? `ring-4 ${card.ring} shadow-md`
                  : "hover:ring-2 hover:ring-stone-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={clsx(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                    card.tone
                  )}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold text-slate-900">{card.count}</p>
                  <p className="text-base font-medium text-slate-600">{card.label}</p>
                </div>
              </div>
              {active && (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  ● กำลังแสดงรายการกลุ่มนี้
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="luxury-card space-y-4 p-5">
        <div>
          <label htmlFor="approval-search" className="field-label">
            ค้นหา
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="approval-search"
              type="text"
              placeholder="พิมพ์ชื่อห้อง อาคาร ชื่อผู้จอง หรือคณะ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-luxury pl-12"
            />
          </div>
        </div>

        <div>
          <span className="field-label flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden="true" />
            ช่วงวันที่จอง
          </span>
          <div className="flex flex-wrap gap-3">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={dateFilter === f.key}
                onClick={() => setDateFilter(f.key)}
                className={clsx(
                  "rounded-xl px-5 py-3 text-base font-semibold transition-colors",
                  dateFilter === f.key
                    ? "bg-slate-800 text-white shadow-md"
                    : "bg-white text-slate-700 ring-2 ring-stone-300 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <ClipboardCheck className="h-9 w-9 text-slate-400" aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold text-slate-700">
              {statusFilter === "todo"
                ? "ไม่มีรายการที่รอคุณดำเนินการ"
                : "ไม่พบรายการในกลุ่มนี้"}
            </p>
            <p className="mt-2 text-base text-slate-600">
              {searchTerm || dateFilter !== "all"
                ? "ลองล้างคำค้นหาหรือเลือกช่วงวันที่ให้กว้างขึ้น"
                : "เมื่อมีคำขอเข้ามาใหม่ จะแสดงที่นี่"}
            </p>
            {(searchTerm || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("all");
                }}
                className="btn-secondary mt-6"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <ReservationTable
            rows={filteredRows}
            userRole={user.role}
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
