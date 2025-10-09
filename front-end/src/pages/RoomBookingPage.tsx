import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

function RoomBookingPage() {
  const navigate = useNavigate();

  const handleDateSelect = (selectInfo: any) => {
    const startTime = format(selectInfo.start, "yyyy-MM-dd'T'HH:mm");
    const endTime = format(selectInfo.end, "yyyy-MM-dd'T'HH:mm");
    navigate(`/book-room/new?start=${startTime}&end=${endTime}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">จองห้อง</h1>
        <button
          onClick={() => navigate('/book-room/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          จองห้องใหม่
        </button>
      </div>

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
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>
    </div>
  );
}

export default RoomBookingPage;