import { useCallback, useEffect, useMemo, useState } from "react";

const api = import.meta.env.VITE_API as string;

export type ScheduleEntry = {
  reservation_id: string;
  room_id: string;
  room_code: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  reservation_status: string;
  reservation_type: string;
  number_of_users: number;
  /** Only present for admins. */
  username?: string;
  department?: string;
  reservation_reason?: string;
};

const toMinutes = (t: string) => {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

export type DayOccupancy = {
  entries: ScheduleEntry[];
  /** Share of the room's opening hours already taken, 0..1. */
  ratio: number;
  level: "free" | "partial" | "full";
};

/**
 * Loads every booking for a room across a date range in one request.
 *
 * The booking modal used to ask check-conflict for a single day, so the month
 * grid could not show anything until a date was clicked. Fetching the range up
 * front is what lets the calendar mark busy days before the user picks one.
 */
export function useRoomSchedule(params: {
  from: string;
  to: string;
  roomId?: string | null;
  enabled?: boolean;
}) {
  const { from, to, roomId = null, enabled = true } = params;
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !from || !to) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const qs = new URLSearchParams({ from, to });
      if (roomId) qs.set("room_id", roomId);
      const res = await fetch(`${api}/room-schedule?${qs}`, {
        // Public: guests have no token. An admin's adds department and reason.
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`โหลดตารางห้องไม่สำเร็จ (${res.status})`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "โหลดตารางห้องไม่สำเร็จ");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, roomId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    entries.forEach((e) => {
      const key = e.booking_date.slice(0, 10);
      const list = map.get(key);
      list ? list.push(e) : map.set(key, [e]);
    });
    return map;
  }, [entries]);

  return { entries, byDate, loading, error, reload: load };
}

/**
 * How busy one day is, relative to the hours that room is actually open.
 * "full" is deliberately generous: with under half an hour left there is no
 * usable slot, so the day is worth showing as taken.
 */
export function dayOccupancy(
  entries: ScheduleEntry[] | undefined,
  openTime: string,
  closeTime: string
): DayOccupancy {
  const list = entries ?? [];
  if (list.length === 0) return { entries: list, ratio: 0, level: "free" };

  const open = toMinutes(openTime || "08:00");
  const close = toMinutes(closeTime || "17:00");
  const span = Math.max(close - open, 1);

  // Merge overlaps so two bookings on the same slot are not counted twice.
  const ranges = list
    .map((e) => [
      Math.max(toMinutes(e.start_time), open),
      Math.min(toMinutes(e.end_time), close),
    ])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  let booked = 0;
  let cursorStart = -1;
  let cursorEnd = -1;
  for (const [s, e] of ranges) {
    if (cursorEnd < s) {
      if (cursorEnd > cursorStart) booked += cursorEnd - cursorStart;
      cursorStart = s;
      cursorEnd = e;
    } else {
      cursorEnd = Math.max(cursorEnd, e);
    }
  }
  if (cursorEnd > cursorStart) booked += cursorEnd - cursorStart;

  const ratio = Math.min(booked / span, 1);
  const level = span - booked < 30 ? "full" : ratio > 0 ? "partial" : "free";
  return { entries: list, ratio, level };
}
