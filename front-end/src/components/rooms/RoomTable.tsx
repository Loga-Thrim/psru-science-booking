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
  // ใช้ CSS line-clamp แบบไม่ต้องติดตั้งปลั๊กอิน
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

export const RoomTable: React.FC<Props> = ({ rooms, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              รหัสห้อง
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              รายละเอียด
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              ประเภท
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
              ความจุ
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              อุปกรณ์
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              ผู้ดูแล
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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

              {/* รายละเอียด (description) — แสดง 2 บรรทัด + tooltip */}
              <td className="px-6 py-3">
                <TwoLineClamp text={(r as any).description} />
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                {r.room_type ?? "-"}
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-center">
                {typeof r.capacity === "number" ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-700">
                    {r.capacity}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              <td className="px-6 py-3">
                <EquipmentChips value={r.equipment} />
              </td>

              <td className="px-6 py-3 whitespace-nowrap text-gray-700 text-center">
                {r.caretaker ?? "-"}
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
              <td className="px-6 py-6 text-center text-gray-500" colSpan={8}>
                ไม่พบข้อมูลห้อง
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
