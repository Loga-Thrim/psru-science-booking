import React from "react";
import { Room } from "../../types/types";

type Props = {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
};

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
              รหัส/ชื่อห้อง
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ประเภท
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ความจุ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              อุปกรณ์
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ผู้ดูแล
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              การทำงาน
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((r) => (
            <tr key={r.room_id}>
              <td className="px-6 py-3 whitespace-nowrap font-mono text-gray-700">
                {r.room_id}
              </td>
              <td className="px-6 py-3 whitespace-nowrap font-semibold text-gray-900">
                {r.room_code ?? "-"}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                {r.room_type ?? "-"}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                {r.capacity ?? "-"}
              </td>
              <td className="px-6 py-3 text-gray-700">
                {r.equipment ?? "-"}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">
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
              <td className="px-6 py-6 text-center text-gray-500" colSpan={7}>
                ไม่พบข้อมูลห้อง
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
