import { reservationRow } from "../../types/types";
export default function ReservationTable({ rows }: { rows: reservationRow[] }) {
  return (
    <table className="min-w-full ">
      <thead className="bg-gray-50 text-gray-600 border-b" >
        <tr>
          <th className="text-left px-4 py-2">RoomID</th>
          <th className="text-left px-4 py-2">วันที่</th>
          <th className="text-left px-4 py-2">เวลา</th>
          <th className="text-left px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td className="text-left border-b px-4 py-2">{row.room_id}</td>
            <td className="text-left border-b px-4 py-2">{row.booking_date}</td>
            <td className="text-left border-b px-4 py-2">{row.start_time + "-" + row.end_time}</td>
            <td className="text-left border-b px-4 py-2">{}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
