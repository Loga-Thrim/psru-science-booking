import React from "react";
import { Room } from "../../types/types";
import { Building, Users, MapPin, Edit2, Trash2 } from "lucide-react";

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

  if (items.length === 0) return <span className="text-gray-400 text-xs">-</span>;

  const displayItems = items.slice(0, 3);
  const remaining = items.length - 3;

  return (
    <div className="flex flex-wrap gap-1 max-w-[200px]">
      {displayItems.map((it, idx) => (
        <span
          key={`${it}-${idx}`}
          className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-800 text-xs"
        >
          {it}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-xs">
          +{remaining}
        </span>
      )}
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
    className: "border-slate-200 bg-slate-50 text-slate-800",
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
        <thead className="bg-gradient-to-r from-stone-50 to-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ห้อง
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ที่ตั้ง
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ประเภท
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ความจุ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              อุปกรณ์
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              สถานะ
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {rooms.map((r) => (
            <tr key={r.room_id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{r.room_code ?? "-"}</span>
                  <span className="text-xs text-gray-500">{r.caretaker ? `ผู้ดูแล: ${r.caretaker}` : ""}</span>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col text-sm">
                  <span className="text-gray-700 flex items-center gap-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    {r.building || "-"}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    ชั้น {r.floor || "-"}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {r.room_type ?? "-"}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{r.capacity ?? "-"} ที่นั่ง</span>
                </div>
              </td>

              <td className="px-4 py-3">
                <EquipmentChips value={r.equipment} />
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={r.status as Room["status"]} />
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-slate-100 text-gray-600 hover:text-slate-800 transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(r)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {rooms.length === 0 && (
            <tr>
              <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
                ไม่พบข้อมูลห้อง
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
