import React, { useCallback, useEffect, useState } from "react";
import { RoomTable } from "../components/rooms/RoomTable";
import AddRoomModal from "../components/rooms/AddRoomModal";
import EditRoomModal from "../components/rooms/EditRoomModal";
import DeleteRoomModal from "../components/rooms/DeleteRoomModal";
import { Room } from "../types/types";

const api = import.meta.env.VITE_API as string;

type CreateRoomPayload = {
  room_code: string;
  room_type: string;
  room_status: string;
  capacity: number;
  equipment: string;
  caretaker: string;
  description: string;
  images: File[];
};

type UpdateRoomPayload = {
  room_id: string;
  room_code: string;
  room_type: string;
  room_status: string;
  capacity: number;
  equipment: string;
  caretaker: string;
  description: string;
  images: File[];
};

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
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        throw new Error("โหลดข้อมูลห้องไม่สำเร็จ");
      }
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

  const handleCreate = async (payload: CreateRoomPayload) => {
    const token = localStorage.getItem("token");
    const body = {
      room_code: payload.room_code,
      room_type: payload.room_type,
      room_status: payload.room_status,
      capacity: payload.capacity,
      equipment: payload.equipment,
      caretaker: payload.caretaker,
      description: payload.description,
    };

    const res = await fetch(`${api}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let message = "สร้างห้องไม่สำเร็จ";
      try {
        const data = await res.json();
        if (data && typeof data.message === "string") {
          message = data.message;
        }
      } catch {
      }
      throw new Error(message);
    }

    const created = (await res.json()) as Room;
    const room_id = String((created as any).room_id ?? "");

    await fetchRooms();
    setOpenAdd(false);

    if (payload.images.length > 0 && room_id) {
      const form = new FormData();
      payload.images.forEach((file) => {
        if (file instanceof File) {
          form.append("images", file);
        }
      });

      const resImg = await fetch(`${api}/upload-image/${room_id}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: form,
      });
      if (!resImg.ok) {
        const err = await resImg.text().catch(() => "");
        throw new Error(err || "upload failed");
      }
    }
  };

  const handleUpdate = async (payload: UpdateRoomPayload) => {
    const token = localStorage.getItem("token");
    const body = {
      room_code: payload.room_code,
      room_type: payload.room_type,
      room_status: payload.room_status,
      capacity: payload.capacity,
      equipment: payload.equipment,
      caretaker: payload.caretaker,
      description: payload.description,
    };

    const res = await fetch(`${api}/rooms/${encodeURIComponent(payload.room_id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error("อัปเดตห้องไม่สำเร็จ");
    }

    await res.json();

    if (payload.images.length > 0) {
      const form = new FormData();
      payload.images.forEach((file) => {
        if (file instanceof File) {
          form.append("images", file);
        }
      });
      const resImg = await fetch(
        `${api}/rooms-image/${encodeURIComponent(payload.room_id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: form,
        }
      );
      if (!resImg.ok) {
        const err = await resImg.text().catch(() => "");
        throw new Error(err || "upload failed");
      }
    }

    await fetchRooms();
    setOpenEdit(false);
    setSelected(null);
  };

  const handleDelete = async (room_id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${api}/rooms/${encodeURIComponent(room_id)}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!res.ok) {
      throw new Error("ลบห้องไม่สำเร็จ");
    }
    await fetchRooms();
    setOpenDelete(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => setOpenAdd(true)}
        >
          + เพิ่มห้อง
        </button>
      </div>

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
          onSubmit={handleCreate}
        />
      )}

      {openEdit && selected && (
        <EditRoomModal
          room={selected}
          onClose={() => setOpenEdit(false)}
          onSubmit={handleUpdate}
        />
      )}

      {openDelete && selected && (
        <DeleteRoomModal
          room={selected}
          onClose={() => setOpenDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
