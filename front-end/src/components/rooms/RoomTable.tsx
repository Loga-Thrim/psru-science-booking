import React from "react";
import { Room } from "../../types/types";

type Props = {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
};

function EquipmentChips({ value }: { value?: string | null }) {
  const items = (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length === 0) return <span className="text-gray-400">-</span>;

  return (
    <div className="flex flex-wrap gap-1.5 max-w-[520px]">
      {items.map((it, idx) => (
        <span
          key={`${it}-${idx}`}
          className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function TwoLineClamp({
  text,
  className = "",
}: {
  text?: string | null;
  className?: string;
}) {
  if (!text) return <span className="text-gray-400">-</span>;
  return (
    <div
      className={`max-w-[520px] text-gray-700 ${className}`}
      title={text}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {text}
    </div>
  );
}

const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  available: {
    label: "ว่าง",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  unavailable: {
    label: "จองแล้ว",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

function StatusBadge({ status }: { status?: Room["status"] | null }) {
  const key = String(status ?? "").toLowerCase().trim();
  const meta = STATUS_META[key];
  if (!meta) return <span className="text-gray-400">-</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export const RoomTable: React.FC<Props> = ({ rooms, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              รหัสห้อง
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              รายละเอียด
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ประเภท
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
              ความจุ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ผู้ดูแล
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              การทำงาน
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((r) => (
            <tr key={r.room_id} className="hover:bg-gray-50">
              <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-gray-700">
                {r.room_id}
              </td>

              <td className="px-6 py-3 whitespace-nowrap">
                <div className="font-semibold text-gray-900">
                  {r.room_code ?? "-"}
                </div>
              </td>

              <td className="px-6 py-3">
                <TwoLineClamp text={(r as any).description} />
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                {r.room_type ?? "-"}
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-left">
                {typeof r.capacity === "number" ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-700">
                    {r.capacity}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-gray-700 text-left">
                {r.caretaker ?? "-"}
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-left">
                <StatusBadge status={r.status as Room["status"]} />
              </td>

              <td className="px-6 py-3 whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => onDelete(r)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {rooms.length === 0 && (
            <tr>
              <td className="px-6 py-6 text-left text-gray-500" colSpan={9}>
                ไม่พบข้อมูลห้อง
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
