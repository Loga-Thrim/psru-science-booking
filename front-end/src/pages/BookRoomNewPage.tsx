import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { Room } from "../types/types";

const api = import.meta.env.VITE_API;

export default function BookRoomNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const roomIdFromQuery = searchParams.get("roomId");
  const roomFromState = (location.state as { room?: Room } | null)?.room;

  const [room, setRoom] = useState<Room | null>(roomFromState ?? null);
  const [loading, setLoading] = useState<boolean>(!roomFromState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!room && roomIdFromQuery) {
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const token = localStorage.getItem("token");
          const res = await fetch(`${api}/book-room/${roomIdFromQuery}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const data = await res.json() as Room;
          setRoom(data);
        } catch (e: any) {
          setError(e?.message ?? "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [room, roomIdFromQuery]);

  const handleDateSelect = (selectInfo: any) => {
    const startTime = format(selectInfo.start, "yyyy-MM-dd'T'HH:mm");
    const endTime = format(selectInfo.end, "yyyy-MM-dd'T'HH:mm");
    navigate(`/book-room/new/confirm?roomId=${room?.room_id}&start=${startTime}&end=${endTime}`, { state: { room } });
  };

  if (!room && !loading) {
    return (
      <div className="p-6 text-center text-red-600">
        ไม่พบข้อมูลห้องที่ต้องการจอง
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        จองห้อง {room ? room.room_code : "..."}
      </h1>

      {loading && <p>กำลังโหลดข้อมูลห้อง…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && room && (
        <div className="bg-white rounded-lg shadow p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            allDaySlot={false}
            slotMinTime="08:30:00"
            slotMaxTime="18:30:00"
            slotDuration="01:00:00"
            locale="th"
            height="auto"
            contentHeight={800}
            slotEventOverlap={false}
            expandRows={true}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}
            validRange={(nowDate) => ({
              start: nowDate
            })}
            selectAllow={(selectInfo) => {
              return selectInfo.start >= new Date();
            }}
          />
        </div>
      )}
    </div>
  );
}
