import React, { useEffect, useState, useCallback } from "react";
import { RoomTable } from "../components/rooms/RoomTable";
import AddRoomModal from "../components/rooms/AddRoomModal";
import EditRoomModal from "../components/rooms/EditRoomModal";
import DeleteRoomModal from "../components/rooms/DeleteRoomModal";
import { Room } from "../types/types";

const api = import.meta.env.VITE_API;

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/rooms`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("โหลดข้อมูลห้องไม่สำเร็จ");
      const { rows } = await res.json();
      setRooms(rows as Room[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreated = async (_room: Room) => {
    await fetchRooms();
    setOpenAdd(false);
  };

  const handleUpdated = async (_room: Room) => {
    await fetchRooms();
    setOpenEdit(false);
    setSelected(null);
  };

  const handleDeleted = async (_room_id: string) => {
    await fetchRooms();
    setOpenDelete(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* header ให้เหมือนหน้า UserManagement */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => setOpenAdd(true)}
        >
          + เพิ่มห้อง
        </button>
      </div>

      {/* การ์ดแสดงตาราง/สถานะ โหลด/เออร์เรอร์ */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>
        ) : (
          <RoomTable
            rooms={rooms}
            onEdit={(room) => {
              setSelected(room);
              setOpenEdit(true);
            }}
            onDelete={(room) => {
              setSelected(room);
              setOpenDelete(true);
            }}
          />
        )}
      </div>

      {openAdd && (
        <AddRoomModal
          onClose={() => setOpenAdd(false)}
          onCreated={handleCreated}
        />
      )}

      {openEdit && selected && (
        <EditRoomModal
          room={selected}
          onClose={() => setOpenEdit(false)}
          onUpdated={handleUpdated}
        />
      )}

      {openDelete && selected && (
        <DeleteRoomModal
          room={selected}
          onClose={() => setOpenDelete(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
