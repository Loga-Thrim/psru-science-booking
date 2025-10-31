import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function BookRoomNewPage() {
  const [searchParams] = useSearchParams();
  const room_id = searchParams.get('roomId') ?? '';
  const navigate = useNavigate();

  const handleDateClick = (arg: DateClickArg) => {
    const date = arg.dateStr;
    navigate(
      `/booking?date=${encodeURIComponent(date)}&roomId=${encodeURIComponent(room_id)}`
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        height="auto"
        headerToolbar={{ left: '', center: 'title', right: 'prev,next' }}
        initialView="dayGridMonth"
        locale="th"
        dateClick={handleDateClick}
        selectable={false}
        selectMirror={false}
        weekends={true}
        validRange={{ start: format(new Date(), 'yyyy-MM-dd') }}
      />
    </div>
  );
}
