import { useMemo } from "react";
import clsx from "clsx";
import { Clock, Check, Ban, RotateCcw } from "lucide-react";

export type BookedSlot = { start_time: string; end_time: string };

type Props = {
  /** Clock times the room is open, e.g. ["08:00","08:30",...,"17:00"]. */
  slots: string[];
  booked: BookedSlot[];
  startTime: string;
  endTime: string;
  loading?: boolean;
  onChange: (startTime: string, endTime: string) => void;
};

const hhmm = (t: string) => (t ?? "").slice(0, 5);

/**
 * Grid of tappable half-hour blocks instead of two <select> menus.
 *
 * The dropdowns hid the day's shape: you had to open a menu and read
 * "(จองแล้ว)" on each option one at a time. Here the whole day is visible at
 * once, and every target is a large button rather than a menu row.
 *
 * Interaction is deliberately forgiving: the first tap books that single
 * block, a second tap further along extends the range, and tapping before the
 * current start simply begins a new selection.
 *
 * Once a start is picked, the blocks from there on are labelled by the time
 * they end ("ถึง 16:00"). Labelled by start time, someone booking 13:00–16:00
 * tapped "16:00" and silently got until 16:30.
 */
export default function TimeSlotPicker({
  slots,
  booked,
  startTime,
  endTime,
  loading = false,
  onChange,
}: Props) {
  // Each cell covers [cell, nextCell). The final clock time is an end-only
  // boundary, so it never becomes a cell of its own.
  const cells = useMemo(() => slots.slice(0, -1), [slots]);
  const nextOf = (time: string) => slots[slots.indexOf(time) + 1] ?? time;

  const isBlockBooked = (cell: string) => {
    const cellEnd = nextOf(cell);
    return booked.some((b) => {
      const bs = hhmm(b.start_time);
      const be = hhmm(b.end_time);
      return cell < be && cellEnd > bs;
    });
  };

  const bookedCells = useMemo(() => {
    const set = new Set<string>();
    cells.forEach((c) => isBlockBooked(c) && set.add(c));
    return set;
  }, [cells, booked]);

  /** Extending from the current start to `cell` must not cross a booked block. */
  const canExtendTo = (cell: string) => {
    if (!startTime) return true;
    const from = cells.indexOf(startTime);
    const to = cells.indexOf(cell);
    if (from < 0 || to < from) return true;
    return cells.slice(from, to + 1).every((c) => !bookedCells.has(c));
  };

  const inSelection = (cell: string) =>
    Boolean(startTime && endTime && cell >= startTime && cell < endTime);

  const handleTap = (cell: string) => {
    if (bookedCells.has(cell)) return;

    // No start yet, or the tap is before the current start: begin fresh.
    if (!startTime || cell < startTime) {
      onChange(cell, nextOf(cell));
      return;
    }
    if (!canExtendTo(cell)) return;
    onChange(startTime, nextOf(cell));
  };

  const durationLabel = useMemo(() => {
    if (!startTime || !endTime) return "";
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    if (mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h} ชั่วโมง ${m} นาที`;
    if (h) return `${h} ชั่วโมง`;
    return `${m} นาที`;
  }, [startTime, endTime]);

  if (loading) {
    return (
      <div className="rounded-xl bg-slate-100 p-6 text-center text-base text-slate-700">
        กำลังตรวจสอบเวลาที่ว่าง…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-blue-50 px-4 py-3 text-base font-medium text-blue-900 ring-1 ring-blue-200">
        {!startTime
          ? "1. แตะเวลาเริ่มใช้ห้อง"
          : `2. แตะเวลาเลิกใช้ห้อง (เริ่ม ${startTime} น.)`}
      </p>

      <div
        className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5"
        role="group"
        aria-label="เลือกช่วงเวลา"
      >
        {cells.map((cell) => {
          const isBooked = bookedCells.has(cell);
          const selected = inSelection(cell);
          const blocked = !isBooked && !selected && !canExtendTo(cell);
          const isStart = cell === startTime;
          const showsEnd = Boolean(startTime) && cell > startTime && !isBooked;

          return (
            <button
              key={cell}
              type="button"
              disabled={isBooked || blocked}
              aria-pressed={selected}
              aria-label={`${cell} ถึง ${nextOf(cell)}${isBooked ? " มีคนจองแล้ว" : ""}`}
              onClick={() => handleTap(cell)}
              className={clsx(
                "flex flex-col items-center justify-center rounded-xl border-2 px-2 py-3 text-base font-bold transition-all",
                selected &&
                  "border-emerald-700 bg-emerald-600 text-white shadow-md",
                !selected &&
                  !isBooked &&
                  !blocked &&
                  "border-stone-300 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50",
                isBooked &&
                  "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500",
                blocked &&
                  "cursor-not-allowed border-stone-200 bg-stone-50 text-slate-400"
              )}
            >
              <span>{isStart ? `เริ่ม ${cell}` : showsEnd ? `ถึง ${nextOf(cell)}` : cell}</span>
              {isBooked && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold">
                  <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                  จองแล้ว
                </span>
              )}
              {selected && (
                <Check className="mt-0.5 h-4 w-4" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {startTime && endTime && (
        <div className="flex flex-col gap-3 rounded-xl bg-emerald-50 px-5 py-4 ring-2 ring-emerald-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-lg font-bold text-emerald-900">
            <Clock className="h-6 w-6" aria-hidden="true" />
            {startTime} – {endTime} น.
            <span className="text-base font-semibold text-emerald-800">
              (รวม {durationLabel})
            </span>
          </p>
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-300 bg-white px-4 py-2.5 text-base font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            เลือกใหม่
          </button>
        </div>
      )}
    </div>
  );
}
