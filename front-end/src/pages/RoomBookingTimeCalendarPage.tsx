import React, { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { DateSelectArg } from "@fullcalendar/core";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toTimeOnly = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;

export default function RoomBookingTimeCalendarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") as string;
  const date = searchParams.get("date") as string;
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (!date) return;
    const api = calendarRef.current?.getApi?.();
    if (api) {
      api.changeView("timeGridDay");
      api.gotoDate(date);
    }
  }, [date]);

  const handleSelect = (info: DateSelectArg) => {
    const { start, end, allDay } = info;
    const startTime = allDay ? "08:30:00" : toTimeOnly(start);
    const endTime = allDay ? "18:30:00" : toTimeOnly(end);
    const dateParam = date;

    navigate(
      `/book-room/new/form?start=${startTime}&end=${endTime}&date=${dateParam}&roomId=${roomId}`
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        headerToolbar={{ left: "", center: "title", right: "" }}
        initialDate={date}
        locale="th"
        locales={[thLocale]}
        selectable
        selectMirror
        select={handleSelect}
        weekends
        allDaySlot
        slotMinTime="08:30:00"
        slotMaxTime="18:30:00"
        slotDuration="01:00:00"
        height="auto"
      />
    </div>
  );
}