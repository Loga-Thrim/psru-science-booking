import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Phone, Building, ArrowLeft, Calendar, Clock } from 'lucide-react';
import clsx from 'clsx';
const api = import.meta.env.VITE_API

type ReservationType = 'teaching' | 'exam' | 'activity' | 'other' | '';

interface FormData {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfUsers: number | "";
  reservationType: ReservationType;
  reservationReason: string;
  phoneNumber: string;
}

const bookingTypes: { value: ReservationType; label: string }[] = [
  { value: 'teaching', label: 'จัดการเรียนการสอน' },
  { value: 'exam', label: 'สอบย่อย/กลางภาค/ปลายภาค' },
  { value: 'activity', label: 'กิจกรรม/อบรม/ประชุม' },
  { value: 'other', label: 'อื่นๆ' },
];

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId') as string;
  const date = searchParams.get('date') as string;
  const start = searchParams.get('start') as string;
  const end = searchParams.get('end') as string;

  const [form, setForm] = useState<FormData>({
    roomId: roomId,
    date: date,
    startTime: start,
    endTime: end,
    numberOfUsers: '',
    reservationType: '',
    reservationReason: '',
    phoneNumber: '',
  });

  const formatDate = (ymd: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : ymd;
  };

  const formatTime = (t: string) => {
    const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(t);
    return m ? `${m[1]}:${m[2]}` : t;
  };

  const displayDate = useMemo(
    () => (form.date ? formatDate(form.date) : ''),
    [form.date]
  );

  const displayStart = useMemo(
    () => (form.startTime ? formatTime(form.startTime) : ''),
    [form.startTime]
  );

  const displayEnd = useMemo(
    () => (form.endTime ? formatTime(form.endTime) : ''),
    [form.endTime]
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const payload = {
      room_id: form.roomId,
      date: form.date,
      start_time: form.startTime,
      end_time: form.endTime,
      number_of_users: form.numberOfUsers,
      reservation_type: form.reservationType,
      reservation_reason: form.reservationReason,
      phone_number: form.phoneNumber,
    };

    console.log(payload);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept:"application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error('Create reservation failed:', res.status, msg);
        alert(`บันทึกไม่สำเร็จ (${res.status})`);
        return;
      }

      const data = await res.json().catch(() => null);
      console.log('Reservation created:', data);
      alert('บันทึกสำเร็จ');
      navigate(`/book-room?roomId=${form.roomId}&date=${form.date}`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => navigate('/book-room')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="กลับ"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">จองห้องใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">รายละเอียดจากการเลือก</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รหัสห้อง</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={form.roomId}
                readOnly
                aria-readonly
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                title="อ่านอย่างเดียว"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={displayDate}
                readOnly
                aria-readonly
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                title="อ่านอย่างเดียว"
              />
            </div>
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">เริ่มต้น</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={displayStart}
                  readOnly
                  aria-readonly
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  title="อ่านอย่างเดียว"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">สิ้นสุด</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={displayEnd}
                  readOnly
                  aria-readonly
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  title="อ่านอย่างเดียว"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">จำนวนผู้เข้าใช้</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                value={Number.isFinite(form.numberOfUsers) ? form.numberOfUsers : 1}
                onChange={(e) => {
                  const n = parseInt(e.target.value || '1', 10);
                  setForm((f) => ({ ...f, numberOfUsers: Number.isFinite(n) && n > 0 ? n : 1 }));
                }}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="จำนวนผู้เข้าใช้"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ประเภทการจอง</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {bookingTypes.map((type) => (
                <button
                  key={type.value || 'empty'}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, reservationType: type.value }))}
                  className={clsx(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    form.reservationType === type.value
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <input
              tabIndex={-1}
              className="sr-only"
              value={form.reservationType}
              onChange={() => { }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">เหตุผลในการจอง</label>
            <textarea
              rows={4}
              value={form.reservationReason}
              onChange={(e) => setForm((f) => ({ ...f, reservationReason: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="ระบุเหตุผลในการจอง"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์ติดต่อ</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                maxLength={10}
                type="tel"
                pattern="[0-9]{9,10}"
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0812345678"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/book-room')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ยืนยันการจอง
          </button>
        </div>
      </form>
    </div>
  );
}
