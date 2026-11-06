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
  Info,
  Plus,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import clsx from "clsx";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";
import { thaiFullDate, thaiShortDate, thaiMonthYear } from "../constants/dates";

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

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = sh * 60 + (sm || 0);
  const endMins = eh * 60 + (em || 0);
  while (mins <= endMins) {
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    mins += 30;
  }
  return slots;
}

function formatTime(value: string): string {
  if (!value) return "";
  // Already "HH:MM" format
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  // "HH:MM:SS" format
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.substring(0, 5);
  // ISO datetime string from JSON-serialized Date (e.g. "1970-01-01T01:30:00.000Z")
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return value.substring(0, 5);
}

const LAST_PHONE_KEY = "lastBookingPhone";

// Storage can be unavailable (private mode, blocked site data); the form then just starts empty.
function readLastPhone(): string {
  try {
    return localStorage.getItem(LAST_PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveLastPhone(phone: string) {
  try {
    localStorage.setItem(LAST_PHONE_KEY, phone);
  } catch {
    // Remembering the number is a convenience only.
  }
}

function RoomCard({
  room,
  onBook,
  onInfo,
}: {
  room: Room;
  onBook: () => void;
  onInfo: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isAvailable = (room.status ?? "").toLowerCase() === "available";

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
      className={`flex flex-col bg-white rounded-xl border overflow-hidden transition-all duration-200 ${
        isAvailable
          ? "border-gray-200 hover:border-slate-400 hover:shadow-lg cursor-pointer"
          : "border-gray-200 opacity-60"
      }`}
      onClick={isAvailable ? onBook : undefined}
    >
      {/* Room Image Carousel. Without photos the empty placeholder only pushed the
          room list down, so the card starts straight at the room code. */}
      {images.length > 0 && (
      <div className="h-40 bg-gradient-to-br from-stone-100 to-slate-50 relative overflow-hidden group">
        <img
          src={images[currentImageIndex]}
          alt={`${room.room_code} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

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
        
      </div>
      )}

      {/* Room Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-slate-900">{room.room_code}</h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInfo();
            }}
            aria-label={`ข้อมูลห้อง ${room.room_code}`}
            title="ข้อมูลห้อง"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Info className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Only the exception is labelled: an open room needs no badge saying so. */}
        {!isAvailable && (
          <p className="mb-2 inline-block rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            ปิดปรับปรุง
          </p>
        )}

        <div className="mb-2 flex items-start gap-1.5 text-base text-slate-600">
          <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
          {/* One text run so a long building name wraps as a sentence, not as two columns. */}
          <span>
            {room.building || "-"}
            {room.floor && ` ชั้น ${room.floor}`}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-700">
          <div className="flex items-center gap-1.5">
            <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <span>{room.capacity} คน</span>
          </div>
          <span className="font-medium text-slate-700">{room.room_type}</span>
        </div>

        {/* Book Button: goes straight to picking a time; room details sit behind the info icon. */}
        {isAvailable && (
          <button className="w-full mt-auto py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all flex items-center justify-center gap-2">
            จอง
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
                      {formatTime(room.available_start_time || "08:00")} - {formatTime(room.available_end_time || "17:00")} น.
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

const SHORT_DAY_LABELS: Record<string, string> = {
  sun: "อา", mon: "จ", tue: "อ", wed: "พ", thu: "พฤ", fri: "ศ", sat: "ส",
};

/**
 * The room facts someone may need while booking, folded to one line by default.
 * Restrictions stay visible because they can decide whether the booking is allowed at all.
 */
function RoomInfoPanel({ room }: { room: Room }) {
  const [open, setOpen] = useState(false);
  const equipment = (room.equipment || "").split(",").map((e) => e.trim()).filter(Boolean);
  const days = (room.available_days || "mon,tue,wed,thu,fri")
    .split(",")
    .map((d) => SHORT_DAY_LABELS[d.trim()] || d.trim())
    .join(" ");
  const hours = `${formatTime(room.available_start_time || "08:00")}–${formatTime(room.available_end_time || "17:00")} น.`;
  const contact = [room.caretaker, room.contact_phone].filter(Boolean).join(" · ");

  return (
    <div className="mb-5 space-y-2">
      {room.restrictions && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {room.restrictions}
        </p>
      )}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-500" aria-hidden="true" />
            ข้อมูลห้อง
          </span>
          <ChevronDown className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        {open && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-gray-200 px-3 py-3 text-sm">
            <dt className="text-gray-500">เปิด</dt>
            <dd className="text-gray-900">{days} {hours}</dd>
            {equipment.length > 0 && (
              <>
                <dt className="text-gray-500">อุปกรณ์</dt>
                <dd className="text-gray-900">{equipment.join(", ")}</dd>
              </>
            )}
            {contact && (
              <>
                <dt className="text-gray-500">ติดต่อ</dt>
                <dd className="text-gray-900">{contact}</dd>
              </>
            )}
            {room.description && (
              <>
                <dt className="text-gray-500">อื่นๆ</dt>
                <dd className="text-gray-900">{room.description}</dd>
              </>
            )}
          </dl>
        )}
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
  const timeSectionRef = useRef<HTMLDivElement>(null);

  // The time slots sit below a tall calendar, out of view. Bring them up so the
  // next thing to do is on screen, not something the user has to discover.
  // Scrolls only the modal body: the page behind is locked and must not move.
  const scrollToTime = useCallback(() => {
    const container = contentRef.current;
    const target = timeSectionRef.current;
    if (!container || !target) return;
    const from = container.scrollTop;
    const to =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      from -
      12;
    // Animated by hand: the browser's own smooth scroll is too quick to follow,
    // and the point is for the user to see where the page went.
    const duration = 900;
    const start = performance.now();
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      container.scrollTop = from + (to - from) * ease(t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  const [step, setStep] = useState<BookingStep>("select-datetime");
  const timeSlots = generateTimeSlots(
    room.available_start_time || "08:00",
    room.available_end_time || "17:00",
  );
  const equipmentList = (room.equipment || "")
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean);
  // Get caretakers from room data
  const roomCaretakers = (room.caretaker || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const [form, setForm] = useState<BookingForm>({
    room,
    date: "",
    startTime: "",
    endTime: "",
    numberOfUsers: 1,
    reservationType: "",
    reservationReason: "",
    // Most people book with the same number every time, so offer the last one.
    phoneNumber: readLastPhone(),
    equipmentNeeds: [],
    // With a single caretaker there is nothing to choose, so the field stays hidden.
    selectedApprover: roomCaretakers.length === 1 ? roomCaretakers[0] : "",
  });
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    if (form.date) scrollToTime();
  }, [form.date, scrollToTime]);
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

  // A slot is unusable as a start time only if a booking is actually running then.
  // The end boundary is exclusive: a booking that ends at 15:00 leaves 15:00 free.
  const isTimeSlotBooked = (time: string) => {
    return bookedSlots.some((slot) => {
      const slotStart = formatTime(slot.start_time);
      const slotEnd = formatTime(slot.end_time);
      return time >= slotStart && time < slotEnd;
    });
  };

  // Two ranges overlap when each starts strictly before the other ends, so
  // back-to-back bookings (09:00-11:00 and 11:00-12:00) are allowed.
  const hasTimeConflict = () => {
    if (!form.startTime || !form.endTime) return false;
    return bookedSlots.some((slot) => {
      const slotStart = formatTime(slot.start_time);
      const slotEnd = formatTime(slot.end_time);
      return form.startTime < slotEnd && form.endTime > slotStart;
    });
  };

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

    // The room's advance_booking_days is a real limit; the server rejects anything beyond it.
    const advanceDays = Number(room.advance_booking_days);
    const lastBookable =
      Number.isFinite(advanceDays) && advanceDays > 0 ? today.add(advanceDays, "day") : null;

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
      const isTooFarAhead = lastBookable ? date.isAfter(lastBookable, "day") : false;

      days.push({
        date: date.format("YYYY-MM-DD"),
        display: d,
        isCurrentMonth: true,
        isAvailable: !isPast && isDayAllowed && !isTooFarAhead,
        isToday: date.isSame(today, "day"),
        isPast,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  // Don't page past the last month that still contains a bookable day.
  const advanceLimitDays = Number(room.advance_booking_days);
  const lastBookableDay =
    Number.isFinite(advanceLimitDays) && advanceLimitDays > 0
      ? dayjs().add(advanceLimitDays, "day")
      : null;
  const canGoNextMonth = lastBookableDay
    ? currentMonth.add(1, "month").isBefore(lastBookableDay.endOf("month"))
    : true;

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
        // The API explains exactly which rule failed; showing that beats a generic retry message.
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง");
      }

      saveLastPhone(form.phoneNumber);
      setStep("success");
      contentRef.current?.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const overCapacity =
    Number.isFinite(form.numberOfUsers) && form.numberOfUsers > room.capacity;

  const canProceedToForm = form.date && form.startTime && form.endTime && !hasTimeConflict();
  const canSubmit =
    canProceedToForm &&
    form.reservationType &&
    form.phoneNumber &&
    form.numberOfUsers >= 1 &&
    !overCapacity;

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
              {room.building} ชั้น {room.floor} · {room.capacity} คน · {room.room_type}
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
                ส่งคำขอจองแล้ว
              </h3>
              <p className="text-gray-600 mb-6">
                ห้องยังไม่ถูกจองจนกว่าจะได้รับอนุมัติ
                <br />
                ติดตามผลได้ที่หน้าสถานะการจอง
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
                      {thaiShortDate(form.date)}
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
              <RoomInfoPanel room={room} />

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
                          {thaiMonthYear(currentMonth.toDate())}
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
                    </div>

                    {/* Without this the greyed-out days and the dead "next month" arrow look like a bug. */}
                    {lastBookableDay && (
                      <p className="mt-2 text-sm text-slate-500">
                        ห้องนี้จองล่วงหน้าได้ถึง {thaiShortDate(lastBookableDay.format("YYYY-MM-DD"))}
                      </p>
                    )}

                    {/* Selected Date Display */}
                    {form.date && (
                      <div ref={timeSectionRef} className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-700 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {thaiFullDate(form.date)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Time Selection: hidden until a date is picked, otherwise a chosen
                      time leaves "ถัดไป" disabled with nothing saying why. */}
                  {form.date && (
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      เลือกช่วงเวลา
                    </label>

                    <TimeSlotPicker
                      slots={timeSlots}
                      booked={bookedSlots}
                      startTime={form.startTime}
                      endTime={form.endTime}
                      loading={loadingSlots}
                      onChange={(startTime, endTime) =>
                        setForm((f) => ({ ...f, startTime, endTime }))
                      }
                    />
                  </div>
                  )}

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
                          {thaiShortDate(form.date)}
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
                          aria-pressed={form.reservationType === type.value}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            form.reservationType === type.value
                              ? "border-slate-700 bg-slate-700 text-white"
                              : "border-gray-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caretaker Selection: only when there is a real choice to make. */}
                  {roomCaretakers.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      ผู้ดูแลห้อง
                    </label>
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
                  </div>
                  )}

                  {/* Number of Users */}
                  <div>
                    <label htmlFor="number-of-users" className="field-label flex items-center gap-2">
                      <Users className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      จำนวนผู้เข้าใช้ <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="number-of-users"
                      type="number"
                      min={1}
                      max={room.capacity}
                      value={form.numberOfUsers}
                      aria-invalid={overCapacity || undefined}
                      aria-describedby="number-of-users-hint"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          numberOfUsers: parseInt(e.target.value),
                        }))
                      }
                      className={clsx(
                        "input-luxury",
                        overCapacity && "border-red-500 focus:border-red-600 focus:ring-red-200"
                      )}
                    />
                    {/* The browser's `max` does not stop typing, so say it here
                        rather than letting the server reject it after submit. */}
                    {overCapacity ? (
                      <p id="number-of-users-hint" className="field-error" role="alert">
                        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                        เกินความจุ (สูงสุด {room.capacity} คน)
                      </p>
                    ) : (
                      <p id="number-of-users-hint" className="field-hint">
                        สูงสุด {room.capacity} คน
                      </p>
                    )}
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

                  {/* Equipment Needs: visible, since the caretaker prepares it, but marked optional. */}
                  {equipmentList.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อุปกรณ์ที่ต้องใช้ <span className="font-normal text-gray-500">(ไม่บังคับ)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {equipmentList.map((eq) => (
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
                        ))}
                    </div>
                  </div>
                  )}

                  {/* The free-text note stays folded away; most bookings need none. */}
                  {!showExtras ? (
                    <button
                      type="button"
                      onClick={() => setShowExtras(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      เพิ่มหมายเหตุ (ไม่บังคับ)
                    </button>
                  ) : (
                  <>
                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      หมายเหตุ
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
                      placeholder="เช่น ชื่อวิชา หรือหัวข้อประชุม"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none"
                    />
                  </div>
                  </>
                  )}

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Calendar className="w-8 h-8 text-slate-600" />
        จองห้อง
      </h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Wraps instead of squeezing: on narrow laptops the fixed-width selects left the search box a few characters wide. */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative w-full md:w-auto md:min-w-[18rem] md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา เช่น SC2-101, ประชุม"
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
              onBook={() => {
                setSelectedRoom(room);
                setModalView("booking");
              }}
              onInfo={() => {
                setSelectedRoom(room);
                setModalView("detail");
              }}
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
