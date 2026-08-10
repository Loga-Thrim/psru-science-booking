import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { X, CalendarDays, AlertCircle, Users } from "lucide-react";
import TimeSlotPicker from "./TimeSlotPicker";

const api = import.meta.env.VITE_API as string;

type Reservation = {
  reservation_id: string;
  room_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  number_of_users: number;
  reservation_type: string;
  reservation_reason: string | null;
  phone: string | null;
  equipment_needs?: string | null;
  caretaker_name?: string | null;
};

type RoomRules = {
  room_code: string;
  capacity: number;
  available_start_time?: string | null;
  available_end_time?: string | null;
  available_days?: string | null;
  advance_booking_days?: number | null;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Buddhist-era wording, matching every other date shown in the app. */
function thaiFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function buildSlots(open: string, close: string): string[] {
  const out: string[] = [];
  const [oh, om] = open.slice(0, 5).split(":").map(Number);
  const [ch, cm] = close.slice(0, 5).split(":").map(Number);
  for (let m = oh * 60 + om; m <= ch * 60 + cm; m += 30) {
    out.push(
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
    );
  }
  return out;
}

/**
 * Lets the owner move a still-pending booking instead of cancelling and
 * rebooking, which risked losing the slot to someone else in between.
 */
export default function RescheduleModal({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [room, setRoom] = useState<RoomRules | null>(null);
  const [date, setDate] = useState(reservation.booking_date);
  const [startTime, setStartTime] = useState(reservation.start_time.slice(0, 5));
  const [endTime, setEndTime] = useState(reservation.end_time.slice(0, 5));
  const [attendees, setAttendees] = useState(reservation.number_of_users);
  const [booked, setBooked] = useState<{ start_time: string; end_time: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const res = await fetch(`${api}/book-room/${reservation.room_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const rows = await res.json();
        if (Array.isArray(rows) && rows[0]) setRoom(rows[0]);
      } catch {
        /* the form still works; the calendar just shows fewer hints */
      }
    };
    loadRoom();
  }, [reservation.room_id, token]);

  // Re-read the day's bookings whenever the date changes, excluding this
  // reservation so its own current slot is not shown as taken.
  useEffect(() => {
    const loadSlots = async () => {
      if (!date) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`${api}/check-conflict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            room_id: reservation.room_id,
            booking_date: date,
            start_time: "00:00",
            end_time: "23:59",
            exclude_reservation_id: reservation.reservation_id,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setBooked(
          (data.conflictingBookings ?? []).map((b: any) => ({
            start_time: b.start_time,
            end_time: b.end_time,
          }))
        );
      } catch {
        setBooked([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [date, reservation.room_id, reservation.reservation_id, token]);

  const slots = useMemo(
    () =>
      buildSlots(
        room?.available_start_time?.slice(0, 5) || "08:00",
        room?.available_end_time?.slice(0, 5) || "17:00"
      ),
    [room]
  );

  const allowedDays = useMemo(
    () =>
      String(room?.available_days || "mon,tue,wed,thu,fri")
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    [room]
  );

  const advanceDays = Number(room?.advance_booking_days ?? 0);

  /** Same window the server enforces, so the picker cannot offer a rejected date. */
  const selectableDates = useMemo(() => {
    const today = dayjs().startOf("day");
    const horizon = advanceDays > 0 ? advanceDays : 30;
    const out: { value: string; label: string }[] = [];
    for (let i = 0; i <= horizon; i++) {
      const d = today.add(i, "day");
      if (!allowedDays.includes(DAY_KEYS[d.day()])) continue;
      out.push({
        value: d.format("YYYY-MM-DD"),
        label: thaiFullDate(d.format("YYYY-MM-DD")),
      });
    }
    return out;
  }, [allowedDays, advanceDays]);

  const overCapacity = Boolean(room && attendees > room.capacity);
  const canSave =
    Boolean(date) && Boolean(startTime) && Boolean(endTime) && attendees >= 1 && !overCapacity;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${api}/booking/${reservation.reservation_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          start_time: startTime,
          end_time: endTime,
          number_of_users: attendees,
          reservation_type: reservation.reservation_type,
          reservation_reason: reservation.reservation_reason ?? "",
          phone_number: reservation.phone ?? "",
          equipment_needs: reservation.equipment_needs ?? "",
          caretaker_name: reservation.caretaker_name ?? "",
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || `แก้ไขไม่สำเร็จ (${res.status})`);
      }
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "แก้ไขไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-title"
      >
        <div className="flex items-start justify-between gap-4 rounded-t-2xl bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white">
          <div>
            <h2 id="reschedule-title" className="text-2xl font-bold">
              เปลี่ยนวันและเวลา
            </h2>
            <p className="mt-1 text-base text-white/80">
              ห้อง {room?.room_code ?? reservation.room_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/20"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <label htmlFor="reschedule-date" className="field-label flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden="true" />
              เลือกวันใหม่
            </label>
            <select
              id="reschedule-date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStartTime("");
                setEndTime("");
              }}
              className="input-luxury"
            >
              {/* Keep the original date listed even if it now falls outside the
                  window, so the field is never blank on open. */}
              {!selectableDates.some((d) => d.value === date) && (
                <option value={date}>{thaiFullDate(date)} (วันเดิม)</option>
              )}
              {selectableDates.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            {advanceDays > 0 && (
              <p className="field-hint">
                ห้องนี้จองล่วงหน้าได้ไม่เกิน {advanceDays} วัน
              </p>
            )}
          </div>

          <div>
            <span className="field-label">เลือกเวลาใหม่</span>
            <TimeSlotPicker
              slots={slots}
              booked={booked}
              startTime={startTime}
              endTime={endTime}
              loading={loadingSlots}
              onChange={(s, e) => {
                setStartTime(s);
                setEndTime(e);
              }}
            />
          </div>

          <div>
            <label htmlFor="reschedule-attendees" className="field-label flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" aria-hidden="true" />
              จำนวนผู้เข้าใช้
            </label>
            <input
              id="reschedule-attendees"
              type="number"
              min={1}
              max={room?.capacity}
              value={attendees}
              aria-invalid={overCapacity || undefined}
              onChange={(e) => setAttendees(parseInt(e.target.value))}
              className={clsx("input-luxury", overCapacity && "border-red-500")}
            />
            {overCapacity ? (
              <p className="field-error" role="alert">
                <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                ห้องนี้รับได้สูงสุด {room?.capacity} คน
              </p>
            ) : (
              room && (
                <p className="field-hint">ห้องนี้รับได้สูงสุด {room.capacity} คน</p>
              )
            )}
          </div>

          {error && (
            <p
              className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-800 ring-2 ring-red-200"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={onClose} disabled={saving} className="btn-secondary">
              ยกเลิก ไม่เปลี่ยน
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
