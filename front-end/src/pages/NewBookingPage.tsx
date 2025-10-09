import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, Building, ArrowLeft, Calendar, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';
import { isSameDay, format } from 'date-fns';
import clsx from 'clsx';

type RoomType = 'building' | 'laboratory' | 'classroom';
type BookingType = 'teaching' | 'exam' | 'activity' | 'other';

interface BookingFormData {
  roomType: RoomType;
  bookingType: BookingType;
  course?: string;
  reason?: string;
  topic?: string;
  otherReason?: string;
  attendees: number;
  dateRange: [Date | null, Date | null];
  startPeriod: number;
  endPeriod: number;
  phoneNumber: string;
}

const roomTypes = [
  { value: 'building', label: 'อาคาร' },
  { value: 'laboratory', label: 'ห้องปฏิบัติการ' },
  { value: 'classroom', label: 'ห้องเรียน' },
];

const bookingTypes = [
  { value: 'teaching', label: 'จัดการเรียนการสอน' },
  { value: 'exam', label: 'สอบย่อย/สอบกลางภาค/สอบปลายภาค' },
  { value: 'activity', label: 'กิจกรรม/อบรม/ประชุม' },
  { value: 'other', label: 'อื่นๆ' },
];

const periods = Array.from({ length: 10 }, (_, i) => i + 1);

function NewBookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingFormData>({
    roomType: 'building',
    bookingType: 'teaching',
    attendees: 1,
    dateRange: [null, null],
    startPeriod: 1,
    endPeriod: 1,
    phoneNumber: '',
  });

  const isMultipleDays = useMemo(() => {
    const [start, end] = formData.dateRange;
    if (!start || !end) return false;
    return !isSameDay(start, end);
  }, [formData.dateRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    navigate('/book-room');
  };

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setFormData(prev => ({
      ...prev,
      dateRange: update,
      // Reset periods if multiple days are selected
      ...(update[0] && update[1] && !isSameDay(update[0], update[1]) && {
        startPeriod: 1,
        endPeriod: 1
      })
    }));
  };

  const formatDateRange = () => {
    const [start, end] = formData.dateRange;
    if (!start && !end) return '';
    if (start && !end) return format(start, 'dd/MM/yyyy');
    if (isSameDay(start!, end!)) return format(start!, 'dd/MM/yyyy');
    return `${format(start!, 'dd/MM/yyyy')} - ${format(end!, 'dd/MM/yyyy')}`;
  };

  const renderBookingTypeFields = () => {
    switch (formData.bookingType) {
      case 'teaching':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                รายวิชา
              </label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="รหัสและชื่อรายวิชา"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                เนื่องจาก
              </label>
              <input
                type="text"
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="เหตุผลในการจอง"
                required
              />
            </div>
          </div>
        );
      case 'exam':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              รายวิชา
            </label>
            <input
              type="text"
              value={formData.course || ''}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="รหัสและชื่อรายวิชา"
              required
            />
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              เรื่อง
            </label>
            <input
              type="text"
              value={formData.topic || ''}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="หัวข้อกิจกรรม/การอบรม/การประชุม"
              required
            />
          </div>
        );
      case 'other':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ระบุ
            </label>
            <input
              type="text"
              value={formData.otherReason || ''}
              onChange={(e) => setFormData({ ...formData, otherReason: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="ระบุเหตุผลในการจอง"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/book-room')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="กลับ"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">จองห้องใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        {/* Room Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            ประเภทห้อง
          </label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white"
              required
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Booking Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            ประเภทการจอง
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {bookingTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, bookingType: type.value as BookingType })}
                className={clsx(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  formData.bookingType === type.value
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Fields */}
        {renderBookingTypeFields()}

        {/* Attendees */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            จำนวนผู้เข้าใช้
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="number"
              min="1"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) })}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="จำนวนผู้เข้าใช้"
              required
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            ช่วงวันที่ต้องการจอง
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
            <DatePicker
              selectsRange={true}
              startDate={formData.dateRange[0]}
              endDate={formData.dateRange[1]}
              onChange={handleDateChange}
              locale={th}
              dateFormat="dd/MM/yyyy"
              placeholderText="เลือกช่วงวันที่"
              required
              minDate={new Date()}
              showPopperArrow={false}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              calendarClassName="shadow-xl border-0"
            />
            {formData.dateRange[0] && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {formatDateRange()}
              </div>
            )}
          </div>
          {isMultipleDays && (
            <p className="text-sm text-amber-600 flex items-center mt-2">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
              การจองหลายวันจะไม่สามารถระบุคาบเรียนได้
            </p>
          )}
        </div>

        {/* Time Periods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              คาบเรียนที่เริ่มต้น
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={formData.startPeriod}
                onChange={(e) => setFormData({ ...formData, startPeriod: parseInt(e.target.value) })}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
                required
                disabled={isMultipleDays}
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    คาบที่ {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              คาบเรียนที่สิ้นสุด
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={formData.endPeriod}
                onChange={(e) => setFormData({ ...formData, endPeriod: parseInt(e.target.value) })}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
                required
                disabled={isMultipleDays}
              >
                {periods.filter(period => period >= formData.startPeriod).map(period => (
                  <option key={period} value={period}>
                    คาบที่ {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            เบอร์โทรศัพท์ติดต่อ
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              pattern="[0-9]{9,10}"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="0812345678"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
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

export default NewBookingPage;