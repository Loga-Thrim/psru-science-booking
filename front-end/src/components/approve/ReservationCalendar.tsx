import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { CalendarDays, DoorOpen } from "lucide-react";
import { reservationRow } from "../../types/types";
import { getStatusInfo, getReservationTypeLabel } from "../../constants/bookingStatus";

/** Fill colours per status. Text is white on all of them, so all are dark. */
const STATUS_COLORS: Record<string, string> = {
  pending: "#b45309",
  adminApproved: "#1d4ed8",
  approverApproved: "#047857",
  rejected: "#b91c1c",
};

/**
 * Month/week view of every reservation, so an approver can see what a room
 * already has on it instead of reading a flat list of dates.
 */
export default function ReservationCalendar({
  rows,
  onSelect,
}: {
  rows: reservationRow[];
  onSelect: (row: reservationRow) => void;
}) {
  const [roomFilter, setRoomFilter] = useState("all");

  const rooms = useMemo(() => {
    const seen = new Map<string, string>();
    rows.forEach((r) => {
      if (r.room_id) seen.set(r.room_id, r.room_code || r.room_id);
    });
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const visible = useMemo(
    () => (roomFilter === "all" ? rows : rows.filter((r) => r.room_id === roomFilter)),
    [rows, roomFilter]
  );

  const events: EventInput[] = useMemo(
    () =>
      visible.map((r) => {
        const date = String(r.booking_date).slice(0, 10);
        const color = STATUS_COLORS[r.reservation_status] ?? "#475569";
        return {
          id: r.reservation_id,
          // Room code first: on a month grid the title is clipped, and the room
          // is what an approver scans for.
          title: `${r.room_code || r.room_id} · ${r.username || "ไม่ทราบผู้จอง"}`,
          start: `${date}T${String(r.start_time).slice(0, 8)}`,
          end: `${date}T${String(r.end_time).slice(0, 8)}`,
          backgroundColor: color,
          borderColor: color,
          textColor: "#ffffff",
          extendedProps: { row: r },
        };
      }),
    [visible]
  );

  const handleClick = (arg: EventClickArg) => {
    const row = arg.event.extendedProps.row as reservationRow | undefined;
    if (row) onSelect(row);
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="calendar-room" className="field-label flex items-center gap-2">
          <DoorOpen className="h-5 w-5 text-slate-500" aria-hidden="true" />
          ดูเฉพาะห้อง
        </label>
        <select
          id="calendar-room"
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          className="input-luxury sm:max-w-md"
        >
          <option value="all">ทุกห้อง ({rows.length} รายการ)</option>
          {rooms.map(([id, code]) => (
            <option key={id} value={id}>
              {code} ({rows.filter((r) => r.room_id === id).length} รายการ)
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
        {(["pending", "adminApproved", "approverApproved", "rejected"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span
              className="h-4 w-4 rounded"
              style={{ backgroundColor: STATUS_COLORS[s] }}
            />
            {getStatusInfo(s).label}
          </span>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-10 text-center">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-slate-300" aria-hidden="true" />
          <p className="text-lg font-semibold text-slate-700">
            ไม่มีการจองในกลุ่มที่เลือก
          </p>
        </div>
      ) : (
        <div className="psru-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            buttonText={{
              today: "วันนี้",
              month: "รายเดือน",
              week: "รายสัปดาห์",
            }}
            locale="th"
            locales={[thLocale]}
            events={events}
            eventClick={handleClick}
            height="auto"
            dayMaxEvents={4}
            moreLinkText={(n) => `อีก ${n} รายการ`}
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            weekends
            firstDay={0}
          />
        </div>
      )}

      <p className="text-base text-slate-600">
        แตะที่รายการในปฏิทินเพื่อดูรายละเอียดและอนุมัติ
      </p>
    </div>
  );
}
