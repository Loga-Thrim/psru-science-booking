import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../components/ui/Input";
import { RoomDetailsModal } from "../components/booking/RoomDetailsModal";
import { Room } from "../types/types";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_API;

export default function RoomBookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/book-rooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = (await res.json()) as Room[];
        setRooms(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e?.message ?? "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      const hay = [
        r.room_id,
        r.room_code,
        r.description,
        r.room_type,
        r.equipment,
        r.caretaker,
        r.capacity?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rooms, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จองห้อง</h1>
        <div className="w-full sm:w-80">
          <Input
            label="ค้นหา"
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาด้วย ID, รหัสห้อง, ประเภท, รายละเอียด..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>รหัสห้อง</Th>
                <Th>ประเภท</Th>
                <Th className="text-center">ความจุ</Th>
                <Th>อุปกรณ์</Th>
                <Th>ผู้ดูแล</Th>
                <Th className="max-w-[320px]">รายละเอียด</Th>
                <Th className="w-px text-right pr-6">การทำงาน</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-red-600">{error}</td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    ไม่พบรายการห้องที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.map((r) => {
                const isAvailable = (r.status ?? "").toLowerCase() === "available";
                return (
                  <tr key={r.room_id} className="hover:bg-gray-50/70">
                    <Td>
                      <div className="font-semibold text-gray-900">{r.room_code}</div>
                    </Td>
                    <Td>
                      <span className="text-gray-700">{r.room_type || "-"}</span>
                    </Td>
                    <Td className="text-center">
                      <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {r.capacity ?? "-"}
                      </span>
                    </Td>
                    <Td>
                      {r.equipment ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {r.equipment}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </Td>
                    <Td className="text-gray-700">{r.caretaker || "-"}</Td>
                    <Td className="max-w-[320px]">
                      <span
                        className="block max-w-[320px] whitespace-nowrap overflow-hidden text-ellipsis text-gray-700"
                        title={r.description || ""}
                      >
                        {r.description || "-"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button
                          onClick={() => setSelectedRoomForDetails(r)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          รายละเอียด
                        </button>
                        <button
                          onClick={() => navigate(`/book-room/new?roomId=${r.room_id}`)}
                          disabled={!isAvailable}
                          className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                            isAvailable ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          จอง
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRoomForDetails && (
        <RoomDetailsModal room={selectedRoomForDetails} onClose={() => setSelectedRoomForDetails(null)} />
      )}
    </div>
  );
}

function Th({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-6 py-4 align-middle text-sm text-gray-700 ${className}`}>{children}</td>;
}
