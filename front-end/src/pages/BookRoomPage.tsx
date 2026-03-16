import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room } from "../types/types";
import {
  Search,
  Filter,
  Users,
  Building,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  X,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const api = import.meta.env.VITE_API;

type BookingStep =
  | "select-room"
  | "select-datetime"
  | "fill-form"
  | "confirm"
  | "success";

type BookingForm = {
  room: Room | null;
  date: string;
  startTime: string;
  endTime: string;
  numberOfUsers: number;
  reservationType: string;
  reservationReason: string;
  phoneNumber: string;
  equipmentNeeds: string[];
  selectedApprover: string;
};

const BOOKING_TYPES = [
  { value: "teaching", label: "จัดการเรียนการสอน", icon: "📚" },
  { value: "exam", label: "สอบ", icon: "📝" },
  { value: "activity", label: "กิจกรรม/อบรม/ประชุม", icon: "👥" },
  { value: "other", label: "อื่นๆ", icon: "📋" },
];

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

function RoomCard({ room, onSelect }: { room: Room; onSelect: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isAvailable = (room.status ?? "").toLowerCase() === "available";
  const equipmentList = (room.equipment || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  
  const images = room.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 ${
        isAvailable
          ? "border-gray-200 hover:border-slate-400 hover:shadow-lg cursor-pointer"
          : "border-gray-200 opacity-60"
      }`}
      onClick={isAvailable ? onSelect : undefined}
    >
      {/* Room Image Carousel */}
      <div className="h-40 bg-gradient-to-br from-stone-100 to-slate-50 relative overflow-hidden group">
        {images.length > 0 ? (
          <img 
            src={images[currentImageIndex]} 
            alt={`${room.room_code} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="w-16 h-16 text-stone-300" />
          </div>
        )}
        
        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Image Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? "bg-white w-4" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
            {currentImageIndex + 1}/{images.length}
          </div>
        )}
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              ไม่พร้อมใช้งาน
            </span>
          </div>
        )}
        {isAvailable && (
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              ว่าง
            </span>
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">
          {room.room_code}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{room.building || "-"}</span>
          {room.floor && <span>• ชั้น {room.floor}</span>}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{room.capacity} ที่นั่ง</span>
          </div>
          <div className="text-gray-400">|</div>
          <span className="text-slate-600 font-medium">{room.room_type}</span>
        </div>

        {/* Equipment Tags */}
        {equipmentList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {equipmentList.slice(0, 3).map((eq, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {eq}
              </span>
            ))}
            {equipmentList.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                +{equipmentList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Book Button */}
        {isAvailable && (
          <button className="w-full mt-2 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all flex items-center justify-center gap-2">
            จองห้องนี้
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function RoomDetailModal({
  room,
  onClose,
  onBook,
}: {
  room: Room;
  onClose: () => void;
  onBook: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images || [];
  const hasMultipleImages = images.length > 1;
  const equipmentList = (room.equipment || "").split(",").map(e => e.trim()).filter(Boolean);
  const caretakerList = (room.caretaker || "").split(",").map(c => c.trim()).filter(Boolean);
  const availableDays = (room.available_days || "mon,tue,wed,thu,fri").split(",").map(d => d.trim());
  const isAvailable = (room.status ?? "").toLowerCase() === "available";

  const dayLabels: Record<string, string> = {
    sun: "อาทิตย์", mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
    thu: "พฤหัสบดี", fri: "ศุกร์", sat: "เสาร์"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{room.room_code}</h2>
            <p className="text-slate-300 text-sm">{room.building} • ชั้น {room.floor}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="h-64 bg-gradient-to-br from-stone-100 to-slate-50 rounded-xl relative overflow-hidden">
              {images.length > 0 ? (
                <img 
                  src={images[currentImageIndex]} 
                  alt={room.room_code}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-20 h-20 text-stone-300" />
                </div>
              )}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isAvailable ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
                  {isAvailable ? "ว่าง" : "ไม่พร้อมใช้งาน"}
                </span>
              </div>
            </div>
          </div>

          {/* Room Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200">ข้อมูลทั่วไป</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">ประเภทห้อง</p>
                    <p className="font-medium text-gray-900">{room.room_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">ความจุ</p>
                    <p className="font-medium text-gray-900">{room.capacity} ที่นั่ง</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">ที่ตั้ง</p>
                    <p className="font-medium text-gray-900">{room.building || "-"}, ชั้น {room.floor || "-"}</p>
                  </div>
                </div>
                {room.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-gray-500">เบอร์ติดต่อ</p>
                      <p className="font-medium text-gray-900">{room.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time & Availability */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200">เวลาและวันที่เปิดให้บริการ</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">เวลาเปิดบริการ</p>
                    <p className="font-medium text-gray-900">
                      {room.available_start_time || "08:00"} - {room.available_end_time || "17:00"} น.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500">วันที่เปิดให้จอง</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {availableDays.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                          {dayLabels[day] || day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {room.advance_booking_days && (
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">จองล่วงหน้าได้:</span>{" "}
                    <span className="font-medium">{room.advance_booking_days} วัน</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Equipment */}
          {equipmentList.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">อุปกรณ์ในห้อง</h3>
              <div className="flex flex-wrap gap-2">
                {equipmentList.map((eq, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Caretakers */}
          {caretakerList.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">ผู้ดูแลห้อง</h3>
              <div className="flex flex-wrap gap-2">
                {caretakerList.map((name, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm">
                    <Users className="w-4 h-4" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {room.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">รายละเอียดเพิ่มเติม</h3>
              <p className="text-gray-600 text-sm">{room.description}</p>
            </div>
          )}

          {/* Restrictions */}
          {room.restrictions && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">ข้อจำกัดการใช้งาน</h3>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm">{room.restrictions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            ปิด
          </button>
          {isAvailable && (
            <button
              onClick={onBook}
              className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              จองห้องนี้
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingModal({
  room,
  onClose,
  onSuccess,
}: {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<BookingStep>("select-datetime");
  const equipmentList = (room.equipment || "")
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean);
  const [form, setForm] = useState<BookingForm>({
    room,
    date: "",
    startTime: "",
    endTime: "",
    numberOfUsers: 1,
    reservationType: "",
    reservationReason: "",
    phoneNumber: "",
    equipmentNeeds: [],
    selectedApprover: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs().startOf("month"),
  );
  const [bookedSlots, setBookedSlots] = useState<Array<{ start_time: string; end_time: string; username?: string }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!form.date) {
        setBookedSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/check-conflict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            room_id: room.room_id,
            booking_date: form.date,
            start_time: "00:00",
            end_time: "23:59",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.conflictingBookings) {
            setBookedSlots(data.conflictingBookings.map((b: any) => ({
              start_time: b.start_time,
              end_time: b.end_time,
              username: b.username,
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [form.date, room.room_id]);

  // Check if a time slot conflicts with existing bookings
  const isTimeSlotBooked = (time: string) => {
    return bookedSlots.some((slot) => {
      const slotStart = slot.start_time.substring(0, 5);
      const slotEnd = slot.end_time.substring(0, 5);
      return time >= slotStart && time < slotEnd;
    });
  };

  // Check if selected time range conflicts
  const hasTimeConflict = () => {
    if (!form.startTime || !form.endTime) return false;
    return bookedSlots.some((slot) => {
      const slotStart = slot.start_time.substring(0, 5);
      const slotEnd = slot.end_time.substring(0, 5);
      return (
        (form.startTime < slotEnd && form.endTime > slotStart)
      );
    });
  };

  // Get caretakers from room data
  const roomCaretakers = (room.caretaker || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  // Get calendar data for current month view
  const getCalendarDays = () => {
    const today = dayjs();
    const startOfMonth = currentMonth.startOf("month");
    const startDay = startOfMonth.day(); // 0-6
    const daysInMonth = currentMonth.daysInMonth();

    const availableDaysConfig = (room.available_days || "mon,tue,wed,thu,fri")
      .split(",")
      .map((d) => d.trim().toLowerCase());
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const days: Array<{
      date: string;
      display: number | null;
      isCurrentMonth: boolean;
      isAvailable: boolean;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    // Add empty cells for days before start of month (no dates shown)
    for (let i = 0; i < startDay; i++) {
      days.push({
        date: "",
        display: null,
        isCurrentMonth: false,
        isAvailable: false,
        isToday: false,
        isPast: false,
      });
    }

    // Add days of current month only
    for (let d = 1; d <= daysInMonth; d++) {
      const date = currentMonth.date(d);
      const dayKey = dayMap[date.day()];
      const isPast = date.isBefore(today, "day");
      const isDayAllowed = availableDaysConfig.includes(dayKey);

      days.push({
        date: date.format("YYYY-MM-DD"),
        display: d,
        isCurrentMonth: true,
        isAvailable: !isPast && isDayAllowed,
        isToday: date.isSame(today, "day"),
        isPast,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  // No limit on how far ahead user can book
  const canGoNextMonth = true;

  const goToPrevMonth = () => {
    const thisMonth = dayjs().startOf("month");
    if (currentMonth.isAfter(thisMonth, "month")) {
      setCurrentMonth(currentMonth.subtract(1, "month"));
    }
  };

  const goToNextMonth = () => {
    if (canGoNextMonth) {
      setCurrentMonth(currentMonth.add(1, "month"));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.room_id,
          date: form.date,
          start_time: form.startTime,
          end_time: form.endTime,
          number_of_users: form.numberOfUsers,
          reservation_type: form.reservationType,
          reservation_reason: form.reservationReason,
          phone_number: form.phoneNumber,
          equipment_needs: form.equipmentNeeds.join(", "),
          caretaker_name: form.selectedApprover,
        }),
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง");
      }

      setStep("success");
      contentRef.current?.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToForm = form.date && form.startTime && form.endTime && !hasTimeConflict();
  const canSubmit =
    canProceedToForm && form.reservationType && form.phoneNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              จองห้อง {room.room_code}
            </h2>
            <p className="text-slate-300 text-sm">
              {room.building} • ชั้น {room.floor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {step === "success" ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                จองสำเร็จ!
              </h3>
              <p className="text-gray-600 mb-6">
                การจองของคุณถูกส่งไปยังผู้อนุมัติแล้ว
                <br />
                กรุณารอการอนุมัติ
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">ห้อง:</span>
                    <span className="ml-2 font-medium">{room.room_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">วันที่:</span>
                    <span className="ml-2 font-medium">
                      {dayjs(form.date).format("D MMM YYYY")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">เวลา:</span>
                    <span className="ml-2 font-medium">
                      {form.startTime} - {form.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">ประเภท:</span>
                    <span className="ml-2 font-medium">
                      {
                        BOOKING_TYPES.find(
                          (t) => t.value === form.reservationType,
                        )?.label
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                    navigate("/booking-status");
                  }}
                  className="px-6 py-2.5 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600"
                >
                  ดูสถานะการจอง
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    step === "select-datetime"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  เลือกวัน-เวลา
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    step === "fill-form"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  กรอกข้อมูล
                </div>
              </div>

              {step === "select-datetime" && (
                <div className="space-y-6">
                  {/* Date Selection - Calendar Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      เลือกวันที่
                    </label>

                    {/* Calendar Grid */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={goToPrevMonth}
                          disabled={currentMonth.isSame(
                            dayjs().startOf("month"),
                            "month",
                          )}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {currentMonth.format("MMMM YYYY")}
                        </h3>
                        <button
                          type="button"
                          onClick={goToNextMonth}
                          disabled={!canGoNextMonth}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day, i) => (
                          <div
                            key={day}
                            className={`text-center text-xs font-medium py-1 ${i === 0 || i === 6 ? "text-red-400" : "text-gray-500"}`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Date Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((d, idx) =>
                          d.display === null ? (
                            // Empty cell for alignment
                            <div
                              key={`empty-${idx}`}
                              className="aspect-square"
                            />
                          ) : (
                            <button
                              key={`${d.date}-${idx}`}
                              type="button"
                              disabled={!d.isAvailable}
                              onClick={() =>
                                d.isAvailable &&
                                setForm((f) => ({ ...f, date: d.date }))
                              }
                              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                                form.date === d.date
                                  ? "bg-slate-600 text-white shadow-md"
                                  : d.isAvailable
                                    ? "bg-white hover:bg-slate-100 text-gray-700 hover:text-slate-700 border border-gray-200"
                                    : d.isPast
                                      ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <span
                                className={`font-semibold ${d.isToday && form.date !== d.date ? "text-slate-600" : ""}`}
                              >
                                {d.display}
                              </span>
                              {d.isToday && (
                                <span
                                  className={`text-[9px] ${form.date === d.date ? "text-slate-200" : "text-slate-500"}`}
                                >
                                  วันนี้
                                </span>
                              )}
                            </button>
                          ),
                        )}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-white border border-gray-200"></div>
                          <span>เลือกได้</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-gray-100"></div>
                          <span>ไม่เปิดให้จอง</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-slate-600"></div>
                          <span>เลือกแล้ว</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Date Display */}
                    {form.date && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-700 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {dayjs(form.date).format("วันddddที่ D MMMM YYYY")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline mr-1" />
                      เลือกช่วงเวลา
                    </label>

                    {/* Booked Slots Warning */}
                    {loadingSlots && (
                      <div className="mb-3 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                        กำลังโหลดข้อมูลการจอง...
                      </div>
                    )}
                    {!loadingSlots && bookedSlots.length > 0 && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-800 mb-2">⚠️ ช่วงเวลาที่ถูกจองแล้ว:</p>
                        <div className="flex flex-wrap gap-2">
                          {bookedSlots.map((slot, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              {slot.username && <span className="text-red-500 ml-1">({slot.username})</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Time Range Card */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      {/* Start & End Time Inputs */}
                      <div className="flex items-center gap-3">
                        {/* Start Time */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1.5 font-medium">เริ่มต้น</div>
                          <div className="relative">
                            <select
                              value={form.startTime}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  startTime: e.target.value,
                                  endTime: "",
                                }))
                              }
                              className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-semibold text-gray-800 focus:border-slate-400 focus:ring-0 cursor-pointer hover:border-slate-300 transition-colors"
                            >
                              <option value="">--:--</option>
                              {TIME_SLOTS.slice(0, -1).map((t) => (
                                <option 
                                  key={t} 
                                  value={t}
                                  disabled={isTimeSlotBooked(t)}
                                  className={isTimeSlotBooked(t) ? "text-red-400 bg-red-50" : ""}
                                >
                                  {t} {isTimeSlotBooked(t) ? "(จองแล้ว)" : ""}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center pt-5">
                          <ArrowRight className="w-5 h-5 text-slate-500" />
                        </div>

                        {/* End Time */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1.5 font-medium">สิ้นสุด</div>
                          <div className="relative">
                            <select
                              value={form.endTime}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, endTime: e.target.value }))
                              }
                              disabled={!form.startTime}
                              className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-semibold text-gray-800 focus:border-slate-400 focus:ring-0 cursor-pointer hover:border-slate-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:border-gray-200"
                            >
                              <option value="">--:--</option>
                              {TIME_SLOTS.filter((t) => t > form.startTime).map((t) => {
                                const wouldConflict = bookedSlots.some((slot) => {
                                  const slotStart = slot.start_time.substring(0, 5);
                                  const slotEnd = slot.end_time.substring(0, 5);
                                  return form.startTime < slotEnd && t > slotStart;
                                });
                                return (
                                  <option 
                                    key={t} 
                                    value={t}
                                    disabled={wouldConflict}
                                    className={wouldConflict ? "text-red-400 bg-red-50" : ""}
                                  >
                                    {t} {wouldConflict ? "(ทับซ้อน)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conflict Warning */}
                      {hasTimeConflict() && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          ช่วงเวลาที่เลือกทับซ้อนกับการจองที่มีอยู่แล้ว
                        </div>
                      )}

                      {/* Quick Duration Chips */}
                      {form.startTime && !form.endTime && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">เลือกระยะเวลา:</div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "30 นาที", mins: 30 },
                              { label: "1 ชม.", mins: 60 },
                              { label: "1.5 ชม.", mins: 90 },
                              { label: "2 ชม.", mins: 120 },
                              { label: "3 ชม.", mins: 180 },
                              { label: "4 ชม.", mins: 240 },
                            ].map((preset) => {
                              const [h, m] = form.startTime.split(":").map(Number);
                              const startMins = h * 60 + m;
                              const endMins = startMins + preset.mins;
                              const endHour = Math.floor(endMins / 60);
                              const endMin = endMins % 60;
                              const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
                              const isValid = endHour <= 20;

                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  disabled={!isValid}
                                  onClick={() => setForm((f) => ({ ...f, endTime: endTimeStr }))}
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    isValid
                                      ? "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                                      : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visual Summary */}
                    {form.startTime && form.endTime && (
                      <div className="bg-gradient-to-r from-slate-50 to-stone-50 rounded-xl p-4 border border-slate-200">
                        {/* Timeline Bar */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500 w-10">
                            08:00
                          </span>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full relative overflow-hidden">
                            {(() => {
                              const startMins =
                                parseInt(form.startTime.split(":")[0]) * 60 +
                                parseInt(form.startTime.split(":")[1]);
                              const endMins =
                                parseInt(form.endTime.split(":")[0]) * 60 +
                                parseInt(form.endTime.split(":")[1]);
                              const dayStart = 8 * 60;
                              const dayEnd = 20 * 60;
                              const totalMins = dayEnd - dayStart;
                              const leftPercent =
                                ((startMins - dayStart) / totalMins) * 100;
                              const widthPercent =
                                ((endMins - startMins) / totalMins) * 100;
                              return (
                                <div
                                  className="absolute h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full"
                                  style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                  }}
                                />
                              );
                            })()}
                          </div>
                          <span className="text-xs text-gray-500 w-10">
                            20:00
                          </span>
                        </div>

                        {/* Summary Text */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">
                                {form.startTime} - {form.endTime} น.
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full text-xs font-medium">
                              {(() => {
                                const start =
                                  parseInt(form.startTime.split(":")[0]) * 60 +
                                  parseInt(form.startTime.split(":")[1]);
                                const end =
                                  parseInt(form.endTime.split(":")[0]) * 60 +
                                  parseInt(form.endTime.split(":")[1]);
                                const diff = end - start;
                                const hours = Math.floor(diff / 60);
                                const mins = diff % 60;
                                return hours > 0
                                  ? `${hours} ชม. ${mins > 0 ? `${mins} น.` : ""}`
                                  : `${mins} นาที`;
                              })()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                startTime: "",
                                endTime: "",
                              }))
                            }
                            className="text-xs text-gray-500 hover:text-red-500 underline"
                          >
                            เปลี่ยน
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === "fill-form" && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="font-medium">
                          {dayjs(form.date).format("D MMM YYYY")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="font-medium">
                          {form.startTime} - {form.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทการจอง <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BOOKING_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              reservationType: type.value,
                            }))
                          }
                          className={`p-3 rounded-lg border text-left transition-all ${
                            form.reservationType === type.value
                              ? "border-slate-500 bg-slate-50 text-slate-700"
                              : "border-gray-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caretaker Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      เลือกผู้ดูแลห้อง
                    </label>
                    {roomCaretakers.length === 0 ? (
                      <p className="text-xs text-gray-500">ห้องนี้ยังไม่มีผู้ดูแล</p>
                    ) : (
                      <div className="space-y-2">
                        {roomCaretakers.map((caretaker) => (
                          <button
                            key={caretaker}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                selectedApprover: caretaker,
                              }))
                            }
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              form.selectedApprover === caretaker
                                ? "border-slate-500 bg-slate-50 text-slate-700"
                                : "border-gray-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-500" />
                              <span className="font-medium">{caretaker}</span>
                              {form.selectedApprover === caretaker && (
                                <span className="ml-auto text-slate-600">✓</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Number of Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      จำนวนผู้เข้าใช้ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={room.capacity}
                      value={form.numberOfUsers}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          numberOfUsers: parseInt(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ความจุห้องสูงสุด {room.capacity} คน
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      เบอร์โทรติดต่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phoneNumber: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="0812345678"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  {/* Equipment Needs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อุปกรณ์ที่ต้องการใช้งาน
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {equipmentList.length === 0 ? (
                        <span className="text-sm text-gray-500">ห้องนี้ไม่ได้ระบุอุปกรณ์ไว้</span>
                      ) : (
                        equipmentList.map((eq) => (
                          <button
                            key={eq}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                equipmentNeeds: f.equipmentNeeds.includes(eq)
                                  ? f.equipmentNeeds.filter((e) => e !== eq)
                                  : [...f.equipmentNeeds, eq],
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                              form.equipmentNeeds.includes(eq)
                                ? "bg-slate-100 border-slate-500 text-slate-800"
                                : "bg-white border-gray-300 text-gray-600 hover:border-slate-400"
                            }`}
                          >
                            {form.equipmentNeeds.includes(eq) && (
                              <span className="mr-1">✓</span>
                            )}
                            {eq}
                          </button>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      เลือกอุปกรณ์ที่ต้องการใช้ (ถ้ามี)
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      เหตุผลในการจอง / รายละเอียดเพิ่มเติม
                    </label>
                    <textarea
                      rows={3}
                      value={form.reservationReason}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          reservationReason: e.target.value,
                        }))
                      }
                      placeholder="ระบุรายละเอียดเพิ่มเติม เช่น จุดประสงค์การใช้งาน, ข้อกำหนดพิเศษ (ถ้ามี)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {step !== "success" && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            {step === "fill-form" ? (
              <button
                onClick={() => { setStep("select-datetime"); contentRef.current?.scrollTo(0, 0); }}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                ย้อนกลับ
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
            )}

            {step === "select-datetime" ? (
              <button
                onClick={() => { setStep("fill-form"); contentRef.current?.scrollTo(0, 0); }}
                disabled={!canProceedToForm}
                className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "กำลังจอง..." : "ยืนยันการจอง"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBuilding, setFilterBuilding] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalView, setModalView] = useState<"detail" | "booking">("detail");

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/book-rooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลห้องได้");
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Get unique room types and buildings for filters
  const roomTypes = [...new Set(rooms.map((r) => r.room_type).filter(Boolean))];
  const buildings = [
    ...new Set(rooms.map((r) => r.building).filter(Boolean)),
  ] as string[];

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_code?.toLowerCase().includes(search.toLowerCase()) ||
      room.building?.toLowerCase().includes(search.toLowerCase()) ||
      room.room_type?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || room.room_type === filterType;
    const matchesBuilding =
      filterBuilding === "all" || room.building === filterBuilding;
    return matchesSearch && matchesType && matchesBuilding;
  });

  // Stats
  const availableCount = rooms.filter(
    (r) => (r.status || "").toLowerCase() === "available",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-slate-600" />
            จองห้อง
          </h1>
          <p className="text-gray-500 mt-1">
            เลือกห้องที่ต้องการจองและกรอกข้อมูลการจอง
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl px-4 py-3 border border-gray-200">
            <span className="text-2xl font-bold text-slate-700">
              {availableCount}
            </span>
            <span className="text-gray-500 ml-2">ห้องว่าง</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาห้อง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm appearance-none bg-white min-w-[160px]"
            >
              <option value="all">ทุกประเภท</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Building Filter */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterBuilding || "all"}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm appearance-none bg-white min-w-[200px]"
            >
              <option value="all">ทุกอาคาร</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-200 animate-pulse" />
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ไม่พบห้องที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.room_id}
              room={room}
              onSelect={() => setSelectedRoom(room)}
            />
          ))}
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && modalView === "detail" && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => {
            setSelectedRoom(null);
            setModalView("detail");
          }}
          onBook={() => setModalView("booking")}
        />
      )}

      {/* Booking Modal */}
      {selectedRoom && modalView === "booking" && (
        <BookingModal
          room={selectedRoom}
          onClose={() => {
            setSelectedRoom(null);
            setModalView("detail");
          }}
          onSuccess={() => {
            setModalView("detail");
          }}
        />
      )}
    </div>
  );
}
