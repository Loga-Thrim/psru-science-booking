import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  CalendarDays,
  Clock,
  Users,
  DoorOpen,
  Info,
  Trash2,
  Plus,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import clsx from "clsx";
import StatusBadge from "../components/booking/StatusBadge";
import ApprovalStepper from "../components/booking/ApprovalStepper";
import { getReservationTypeLabel } from "../constants/bookingStatus";
import { useScrollLock } from "../hooks/useScrollLock";

const api = import.meta.env.VITE_API;

type Reservation = {
  reservation_id: string;
  room_id: string;
  booker_name: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  number_of_users: number;
  reservation_type: string;
  reservation_status: string;
  reservation_reason: string | null;
  rejection_reason: string | null;
  phone: string | null;
  equipment_needs?: string | null;
  caretaker_name?: string | null;
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

type ApiBlock = { reservation?: Reservation[]; rooms?: Room[] };
type ApiShape = ApiBlock | ApiBlock[];

type TabKey = "upcoming" | "past";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
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
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3">
      <div className="w-40 shrink-0 font-medium text-slate-600">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

/** The number used on the last booking, so a returning booker sees their bookings at once. */
function lastBookerPhone(): string {
  try {
    return JSON.parse(localStorage.getItem("lastBooker") ?? "null")?.phone ?? "";
  } catch {
    return "";
  }
}

/** A guest may cancel anything still ahead of them that was not turned down. */
function canCancel(r: Reservation) {
  return !isPast(r) && r.reservation_status !== "rejected";
}

/** A booking is "past" once its end time has gone by. */
function isPast(r: Reservation) {
  return dayjs(`${r.booking_date}T${r.end_time}`).isBefore(dayjs());
}

export default function BookingStatusPage() {
  const [searchParams] = useSearchParams();
  // Bookers have no accounts: the phone number given when booking finds them.
  const [phoneInput, setPhoneInput] = useState(
    () => searchParams.get("phone") ?? lastBookerPhone()
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [tab, setTab] = useState<TabKey>("upcoming");

  // These two dialogs are rendered inline rather than as components, so the
  // lock is driven by their own visibility.
  useScrollLock(Boolean(detail));
  useScrollLock(Boolean(confirmCancel));

  const fetchBookings = async (forPhone: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${api}/booking-list?phone=${encodeURIComponent(forPhone)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `โหลดข้อมูลไม่สำเร็จ (${res.status})`);
      }
      const data: ApiShape = await res.json();

      let r: Reservation[] = [];
      let rm: Room[] = [];

      const pushFromBlock = (block?: ApiBlock) => {
        if (!block) return;
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

      setPhone(forPhone);
      setReservations(r);
      setRooms(dedupRooms);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // Arriving from a fresh booking (or with a remembered number): look up straight away.
  useEffect(() => {
    if (phoneInput.length >= 9) fetchBookings(phoneInput);
    // Only on first load; later lookups come from the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 9) {
      setError("กรุณากรอกเบอร์โทร 9-10 หลัก");
      return;
    }
    fetchBookings(phoneInput);
  };

  const roomById = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((x) => map.set(x.room_id, x));
    return map;
  }, [rooms]);

  const roomCodeOf = (id: string) => roomById.get(id)?.room_code ?? id;

  // Upcoming sorted soonest-first, so the next thing you need is at the top.
  // History sorted newest-first.
  const { upcoming, past } = useMemo(() => {
    const up: Reservation[] = [];
    const old: Reservation[] = [];
    reservations.forEach((r) => (isPast(r) ? old : up).push(r));

    const key = (r: Reservation) => `${r.booking_date}T${r.start_time}`;
    up.sort((a, b) => key(a).localeCompare(key(b)));
    old.sort((a, b) => key(b).localeCompare(key(a)));
    return { upcoming: up, past: old };
  }, [reservations]);

  const visible = tab === "upcoming" ? upcoming : past;

  async function handleCancel(resv: Reservation) {
    setIsCancelling(true);
    try {
      // The phone number the booking was made with is the proof of ownership.
      const resp = await fetch(`${api}/booking/${resv.reservation_id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (!resp.ok) {
        let msg = `ยกเลิกไม่สำเร็จ (${resp.status})`;
        try {
          const body = await resp.json();
          if (body?.message) msg = body.message;
        } catch {
          /* keep the status-code message */
        }
        throw new Error(msg);
      }

      if (phone) await fetchBookings(phone);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <CalendarDays className="h-8 w-8 text-slate-700" aria-hidden="true" />
            สถานะการจองของฉัน
          </h1>
        </div>
        <Link to="/book-room" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-5 w-5" aria-hidden="true" />
          จองห้องใหม่
        </Link>
      </div>

      {/* Lookup by the phone number given when booking: there are no accounts. */}
      <form onSubmit={handleLookup} className="luxury-card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="lookup-phone" className="field-label">
            เบอร์โทรที่ใช้จอง
          </label>
          <input
            id="lookup-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
            placeholder="0812345678"
            className="input-luxury"
          />
        </div>
        <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={loading}>
          <Search className="h-5 w-5" aria-hidden="true" />
          ดูการจอง
        </button>
      </form>

      {phone && (
      <>
      {/* Two plain tabs. "ที่กำลังจะถึง" is what almost everyone opens this page for. */}
      <div
        className="flex flex-wrap gap-3"
        role="tablist"
        aria-label="กรองรายการจอง"
      >
        {(
          [
            { key: "upcoming", label: "ที่กำลังจะถึง", count: upcoming.length },
            { key: "past", label: "ที่ผ่านมาแล้ว", count: past.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "rounded-xl px-6 py-3 text-base font-semibold transition-colors",
              tab === t.key
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white text-slate-700 ring-2 ring-stone-300 hover:bg-slate-50"
            )}
          >
            {t.label}
            <span
              className={clsx(
                "ml-2 rounded-full px-2.5 py-0.5 text-sm font-bold",
                tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      </>
      )}

      {loading ? (
        <div className="luxury-card p-10 text-center text-lg text-slate-600">
          กำลังโหลดข้อมูล…
        </div>
      ) : error ? (
        <div className="luxury-card p-10 text-center">
          <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-red-500" aria-hidden="true" />
          <p className="text-lg font-semibold text-red-700">เกิดข้อผิดพลาด: {error}</p>
          <button onClick={() => fetchBookings(phoneInput)} className="btn-secondary mt-5">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : !phone ? null : visible.length === 0 ? (
        <div className="luxury-card p-12 text-center">
          <CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-300" aria-hidden="true" />
          <p className="text-xl font-semibold text-slate-700">
            {tab === "upcoming"
              ? "ไม่พบการจองที่กำลังจะถึงของเบอร์นี้"
              : "ไม่พบประวัติการจองของเบอร์นี้"}
          </p>
          {tab === "upcoming" && (
            <>
              <p className="mt-2 text-base text-slate-600">
                เริ่มจองห้องได้เลย ใช้เวลาไม่ถึงหนึ่งนาที
              </p>
              <Link
                to="/book-room"
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                ไปหน้าจองห้อง
              </Link>
            </>
          )}
        </div>
      ) : (
        /* Cards rather than a dense table: bigger text, bigger buttons, and it
           reflows on a phone without horizontal scrolling. */
        <div className="space-y-4">
          {visible.map((r) => (
            <div key={r.reservation_id} className="luxury-card p-5 sm:p-6">
              {/* Side by side only from xl: below that the sidebar leaves too little room and the details collapse under the buttons. */}
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 text-xl font-bold text-slate-900">
                      <DoorOpen className="h-6 w-6 text-slate-500" aria-hidden="true" />
                      ห้อง {roomCodeOf(r.room_id)}
                    </span>
                    <StatusBadge status={r.reservation_status} />
                  </div>

                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-base text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      {formatDate(r.booking_date)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      {formatTime(r.start_time)} – {formatTime(r.end_time)} น.
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Info className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      {getReservationTypeLabel(r.reservation_type)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      {r.number_of_users} คน
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    onClick={() => setDetail(r)}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Info className="h-5 w-5" aria-hidden="true" />
                    ดูรายละเอียด
                  </button>
                  {/* To change a time, cancel and book again: one less flow to learn. */}
                  {canCancel(r) && (
                    <button
                      onClick={() => setConfirmCancel(r)}
                      disabled={isCancelling}
                      className="btn-danger inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      ยกเลิกการจอง
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDetail(null)}
            aria-hidden
          />
          <div
            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="flex items-start justify-between gap-4 rounded-t-2xl bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white">
              <div>
                <h2 id="detail-title" className="text-2xl font-bold">
                  รายละเอียดการจอง
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  รหัสการจอง: {detail.reservation_id}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg p-2 hover:bg-white/20"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <section>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  ขั้นตอนการอนุมัติ
                </h3>
                <ApprovalStepper status={detail.reservation_status} />
              </section>

              <section className="rounded-xl border-2 border-stone-200 p-5">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  ข้อมูลการจอง
                </h3>
                <div className="space-y-2.5 text-base">
                  <Item label="ห้อง" value={roomCodeOf(detail.room_id)} />
                  <Item label="วันที่" value={formatDate(detail.booking_date)} />
                  <Item
                    label="เวลา"
                    value={`${formatTime(detail.start_time)} – ${formatTime(detail.end_time)} น.`}
                  />
                  <Item
                    label="ประเภทการจอง"
                    value={getReservationTypeLabel(detail.reservation_type)}
                  />
                  <Item label="จำนวนผู้ใช้" value={`${detail.number_of_users} คน`} />
                  {detail.equipment_needs && (
                    <Item label="อุปกรณ์ที่ขอใช้" value={detail.equipment_needs} />
                  )}
                  {detail.caretaker_name && (
                    <Item label="ผู้ดูแลที่เลือก" value={detail.caretaker_name} />
                  )}
                </div>
              </section>

              <section className="rounded-xl border-2 border-stone-200 p-5">
                <h3 className="mb-3 text-lg font-bold text-slate-900">ผู้จอง</h3>
                <div className="space-y-2.5 text-base">
                  <Item label="ชื่อผู้จอง" value={detail.booker_name || "-"} />
                  <Item label="เบอร์โทรศัพท์" value={detail.phone ?? "-"} />
                </div>
              </section>

              <section className="rounded-xl border-2 border-stone-200 p-5">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  เหตุผลในการจอง
                </h3>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-base text-slate-800">
                  {detail.reservation_reason?.trim() || "ไม่ได้ระบุ"}
                </p>
              </section>

              {detail.reservation_status === "rejected" &&
                detail.rejection_reason && (
                  <section className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-red-900">
                      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                      เหตุผลที่ไม่อนุมัติ
                    </h3>
                    <p className="whitespace-pre-wrap rounded-lg bg-white p-4 text-base text-slate-900">
                      {detail.rejection_reason}
                    </p>
                  </section>
                )}

              <div className="flex justify-end">
                <button onClick={() => setDetail(null)} className="btn-secondary">
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isCancelling && setConfirmCancel(null)}
            aria-hidden
          />
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 id="cancel-title" className="text-xl font-bold text-slate-900">
                  ต้องการยกเลิกการจองนี้ใช่ไหม?
                </h3>
                <p className="mt-2 text-base text-slate-700">
                  ห้อง <strong>{roomCodeOf(confirmCancel.room_id)}</strong>
                  <br />
                  {formatDate(confirmCancel.booking_date)}
                  <br />
                  เวลา {formatTime(confirmCancel.start_time)} –{" "}
                  {formatTime(confirmCancel.end_time)} น.
                </p>
                <p className="mt-3 text-base font-semibold text-red-700">
                  ยกเลิกแล้วจะกู้คืนไม่ได้ ต้องจองใหม่เท่านั้น
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={isCancelling}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                ไม่ยกเลิก เก็บการจองไว้
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={isCancelling}
                className="btn-danger disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling ? "กำลังยกเลิก..." : "ใช่ ยกเลิกการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
