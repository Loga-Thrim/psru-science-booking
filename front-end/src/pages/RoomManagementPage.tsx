import { useCallback, useEffect, useState } from "react";
import { RoomTable } from "../components/rooms/RoomTable";
import AddRoomModal from "../components/rooms/AddRoomModal";
import EditRoomModal from "../components/rooms/EditRoomModal";
import DeleteRoomModal from "../components/rooms/DeleteRoomModal";
import { Room } from "../types/types";
import { DoorOpen, Plus, Search, Filter } from "lucide-react";

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
  building: string;
  floor: string;
  contact_phone: string;
  available_start_time: string;
  available_end_time: string;
  available_days: string[];
  advance_booking_days: number;
  restrictions: string;
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
  building: string;
  floor: string;
  contact_phone: string;
  available_start_time: string;
  available_end_time: string;
  available_days: string[];
  advance_booking_days: number;
  restrictions: string;
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
      building: payload.building,
      floor: payload.floor,
      contact_phone: payload.contact_phone,
      available_start_time: payload.available_start_time,
      available_end_time: payload.available_end_time,
      available_days: payload.available_days.join(","),
      advance_booking_days: payload.advance_booking_days,
      restrictions: payload.restrictions,
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
      building: payload.building,
      floor: payload.floor,
      contact_phone: payload.contact_phone,
      available_start_time: payload.available_start_time,
      available_end_time: payload.available_end_time,
      available_days: payload.available_days.join(","),
      advance_booking_days: payload.advance_booking_days,
      restrictions: payload.restrictions,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || room.room_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const roomTypes = [...new Set(rooms.map(r => r.room_type).filter(Boolean))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-amber-600" />
            จัดการห้องประชุม
          </h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลห้องประชุมทั้งหมดในระบบ</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setOpenAdd(true)}
        >
          <Plus className="w-5 h-5" />
          เพิ่มห้องใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              <p className="text-sm text-gray-500">ห้องทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => r.status === 'avaliable' || !r.status).length}
              </p>
              <p className="text-sm text-gray-500">พร้อมใช้งาน</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{roomTypes.length}</p>
              <p className="text-sm text-gray-500">ประเภทห้อง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="luxury-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาห้อง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-luxury pl-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-luxury pl-12 pr-8 w-full sm:w-48"
            >
              <option value="all">ทุกประเภท</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
              <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <DoorOpen className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">เกิดข้อผิดพลาด: {error}</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <DoorOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">ไม่พบห้องที่ค้นหา</p>
          </div>
        ) : (
          <RoomTable
            rooms={filteredRooms}
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
