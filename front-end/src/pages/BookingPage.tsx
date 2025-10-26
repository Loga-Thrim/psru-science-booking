import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

function BookingPage() {
    const [searchParams] = useSearchParams();
    const room_id = searchParams.get('roomId') ?? '';
    const date = searchParams.get('date') ?? undefined;
    const calendarRef = useRef<any>(null);

    useEffect(() => {
        if (!date) return;
        const api = calendarRef.current?.getApi?.();
        if (api) {
            api.changeView('timeGridDay');
            api.gotoDate(date);
        }
    }, [date]);

    return (
        <>
            <div className="space-y-6 mb-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">จองห้อง</h1>
                    <button
                        onClick={() => console.log("จองงงงงงงงงงงงงงงง")}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        จองห้องใหม่
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    headerToolbar={{ left: '', center: 'title', right: '' }}
                    initialDate={date}
                    locale="th"
                    selectable={true}
                    selectMirror={true}
                    weekends={true}
                    slotMinTime="08:30:00"
                    slotMaxTime="18:30:00"
                    slotDuration="01:00:00"
                    height="auto"
                // ตัวอย่างดึงอีเวนต์ตาม room_id (ถ้ามี API)
                //   events={(info, success, failure) => {
                //     fetch(`/api/events?roomId=${encodeURIComponent(room_id)}&start=${info.startStr}&end=${info.endStr}`)
                //       .then(r => r.json()).then(success).catch(failure);
                //   }}
                />
            </div>
        </>
    );
}

export default BookingPage;
