import { useEffect, useMemo, useState } from "react";

const api = import.meta.env.VITE_API;

type User = {
  user_id: string;
  email: string;
  username: string;
  department?: string;
  role?: string;
};

type Reservation = {
  reservation_id: string;
  room_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  number_of_users: number;
  reservation_type: "teaching" | "meeting" | "other" | string;
  reservation_status: | "pending" | "adminApproved" | "approverApproved" | "rejected" | string;
  reservation_reason: string | null;
  rejection_reason: string | null;
  phone: string | null;
};

type Room = {
  room_id: string;
  room_code: string;
  capacity: number;
  description?: string;
  room_type: string;
  equipment?: string;
  caretaker: string;
  status?: string;
};

type ApiBlock = { user?: User[]; reservation?: Reservation[]; rooms?: Room[] };
type ApiShape = ApiBlock | ApiBlock[];

const normalizeStatus = (s: string) => (s === "canceled" ? "cancelled" : s);

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  } catch {
    return iso;
  }
}

function formatTime(t: string) {
  return (t ?? "").slice(0, 5);
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-36 shrink-0 text-gray-500">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Reservation["reservation_status"] }) {
  const s = normalizeStatus(status);
  const map: Record<string, string> = {
    approverApproved: "bg-green-100 text-green-700 ring-green-600/20",
    pending: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
    rejected: "bg-red-100 text-red-700 ring-red-600/20",
    adminApproved: "bg-gray-100 text-gray-600 ring-gray-500/20",
  };
  const labelMap: Record<string, string> = {
    approverApproved: "อนุมัติ",
    pending: "รอดำเนินการ",
    rejected: "ไม่อนุมัติ",
    adminApproved: "แอดมินอนุมัติแล้ว",
  };
  const cls = map[s] ?? "bg-gray-100 text-gray-600 ring-gray-500/20";
  const label = labelMap[s] ?? s;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

export default function BookingStatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/booking-list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok)
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      const data: ApiShape = await res.json();

      let u: User | null = null;
      let r: Reservation[] = [];
      let rm: Room[] = [];

      const pushFromBlock = (block?: ApiBlock) => {
        if (!block) return;
        if (block.user?.length) u = block.user[0];
        if (block.reservation?.length) r = r.concat(block.reservation);
        if (block.rooms?.length) rm = rm.concat(block.rooms);
      };

      Array.isArray(data) ? data.forEach(pushFromBlock) : pushFromBlock(data);

      const dedupRooms = Object.values(
        rm.reduce<Record<string, Room>>((acc, x) => {
          acc[x.room_id] = acc[x.room_id] ?? x;
          return acc;
        }, {})
      );

      setUser(u);
      setReservations(r);
      setRooms(dedupRooms);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fullName = useMemo(() => {
    if (!user) return "";
    const parts = [
      user.username,
      user.department ? `(${user.department})` : "",
    ].filter(Boolean);
    return parts.join(" ");
  }, [user]);

  const roomById = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((x) => map.set(x.room_id, x));
    return map;
  }, [rooms]);

  const roomCodeOf = (id: string) => roomById.get(id)?.room_code ?? id;

  async function handleCancel(resv: Reservation) {
    if (normalizeStatus(resv.reservation_status) === "cancelled") return;

    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${api}/booking/${resv.reservation_id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!(resp.status === 204 || (resp.ok && resp.status === 200))) {
        const msg = `Cancel failed: ${resp.status} ${resp.statusText}`;
        throw new Error(msg);
      }

      setReservations((prev) =>
        prev.filter((x) => x.reservation_id !== resv.reservation_id)
      );

      await fetchBookings();

      setConfirmCancel(null);
      setDetail(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "ยกเลิกไม่สำเร็จ");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">สถานะการจอง</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-gray-500">กำลังโหลดข้อมูล…</div>
        ) : error ? (
          <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>
        ) : reservations.length === 0 ? (
          <div className="p-6 text-gray-500">ยังไม่มีรายการจอง</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รหัสห้อง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    เวลา
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ประเภท
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    จำนวนคน
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {reservations.map((r) => (
                  <tr key={r.reservation_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {roomCodeOf(r.room_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(r.booking_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(r.start_time)}–{formatTime(r.end_time)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.reservation_type === "teaching"
                        ? "สอน"
                        : r.reservation_type === "meeting"
                          ? "ประชุม"
                          : "อื่นๆ"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.number_of_users}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.reservation_status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setDetail(r)}
                        className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => setConfirmCancel(r)}
                        disabled={
                          normalizeStatus(r.reservation_status) ===
                          "cancelled" || isCancelling
                        }
                        className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium ${normalizeStatus(r.reservation_status) ===
                            "cancelled" || isCancelling
                            ? "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                      >
                        ยกเลิก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDetail(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-4xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
            <div className="rounded-t-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold">
                    รายละเอียดการจอง
                  </h2>
                  <p className="mt-1 text-white/90 text-sm">
                    รหัสการจอง:{" "}
                    <span className="font-medium">
                      {detail.reservation_id}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
                  aria-label="Close"
                  title="ปิด"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 pt-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900">
                    ข้อมูลการจอง
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Item
                      label="รหัสห้อง"
                      value={roomCodeOf(detail.room_id)}
                    />
                    <Item
                      label="วันที่"
                      value={formatDate(detail.booking_date)}
                    />
                    <Item
                      label="เวลา"
                      value={`${formatTime(detail.start_time)}–${formatTime(
                        detail.end_time
                      )}`}
                    />
                    <Item
                      label="ประเภท"
                      value={
                        detail.reservation_type === "teaching" ? "สอน"
                          : detail.reservation_type === "meeting" ? "ประชุม"
                            : "อื่นๆ"
                      }
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900">
                    ติดต่อ & สถานะ
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <Item label="ผู้จอง" value={fullName || "-"} />
                    <Item label="โทรศัพท์" value={detail.phone ?? "-"} />
                    <div className="flex items-start gap-2">
                      <div className="w-36 shrink-0 text-gray-500">
                        สถานะ
                      </div>
                      <div className="text-gray-900">
                        <StatusBadge status={detail.reservation_status} />
                      </div>
                    </div>
                    <Item
                      label="จำนวนผู้ใช้"
                      value={String(detail.number_of_users)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">
                  เหตุผลการจอง
                </h3>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-inset ring-gray-200">
                  {detail.reservation_reason ?? "-"}
                </p>
              </div>

              {normalizeStatus(detail.reservation_status) === "rejected" &&
                detail.rejection_reason && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">
                      เหตุผลการไม่อนุมัติ
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-inset ring-gray-200">
                      {detail.rejection_reason}
                    </p>
                  </div>
                )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDetail(null)}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isCancelling && setConfirmCancel(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start gap-3">
              <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                !
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  ยืนยันการยกเลิกการจอง?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  การจองห้อง{" "}
                  <span className="font-medium">
                    {roomCodeOf(confirmCancel.room_id)}
                  </span>{" "}
                  วันที่ {formatDate(confirmCancel.booking_date)} เวลา{" "}
                  {formatTime(confirmCancel.start_time)}–
                  {formatTime(confirmCancel.end_time)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={isCancelling}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                ไม่ยกเลิก
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={isCancelling}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}