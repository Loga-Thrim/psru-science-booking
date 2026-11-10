import dayjs from "dayjs";
import { thaiShortDate } from "../../constants/dates";

/**
 * How far ahead a room can be booked: today plus N more days.
 *
 * The number alone was read as "must book N days ahead" (a minimum), while the
 * system treats it as the furthest bookable day. Showing the resulting date
 * under the field removes the guesswork about whether today counts.
 */
export default function AdvanceDaysField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const days = Number(value);
  const valid = Number.isInteger(days) && days >= 1;

  return (
    <div className="space-y-2">
      <label htmlFor="advance-days" className="block text-sm font-medium text-gray-700">
        จองล่วงหน้าได้สูงสุด (วัน)
      </label>
      <input
        id="advance-days"
        type="number"
        min="1"
        max="365"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby="advance-days-hint"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
      />
      <p id="advance-days-hint" className={valid ? "text-xs text-gray-500" : "text-xs text-red-600"}>
        {valid
          ? `จองได้ถึง ${thaiShortDate(dayjs().add(days, "day").format("YYYY-MM-DD"))}`
          : "กรอกอย่างน้อย 1 วัน"}
      </p>
    </div>
  );
}
