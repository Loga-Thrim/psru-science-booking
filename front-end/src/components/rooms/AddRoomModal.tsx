import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { ROOM_TYPE as ROOM_TYPES, ROOM_STATUS, BUILDINGS, FLOORS, EQUIPMENT_OPTIONS, WEEKDAYS } from "../../types/types";
import { DoorOpen, Users, User, ImagePlus, X, Building, Phone, Clock, Calendar, Plus, AlertCircle } from "lucide-react";

const api = import.meta.env.VITE_API;

type CaretakerOption = {
  user_id: string;
  username: string;
  department: string;
  role: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (data: {
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
  }) => Promise<void> | void;
};

export default function AddRoomModal({ onClose, onSubmit }: Props) {
  const [room_code, setRoomCode] = useState("");
  const [room_type, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [caretaker, setCaretaker] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [room_status, setRoomStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // New fields
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [availableStartTime, setAvailableStartTime] = useState("08:00");
  const [availableEndTime, setAvailableEndTime] = useState("17:00");
  const [availableDays, setAvailableDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [advanceBookingDays, setAdvanceBookingDays] = useState("3");
  const [restrictions, setRestrictions] = useState("");
  
  // Caretaker options from API
  const [caretakerOptions, setCaretakerOptions] = useState<CaretakerOption[]>([]);
  const [loadingCaretakers, setLoadingCaretakers] = useState(true);

  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to get admins and approvers as potential caretakers
          const filtered = data.filter((u: CaretakerOption) => 
            u.role === "admin" || u.role === "approver" || u.role === "caretaker"
          );
          setCaretakerOptions(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch caretakers:", err);
      } finally {
        setLoadingCaretakers(false);
      }
    };
    fetchCaretakers();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        room_code,
        room_type,
        room_status,
        capacity: Number(capacity) || 0,
        equipment: selectedEquipment.join(", "),
        caretaker,
        description,
        images,
        building,
        floor,
        contact_phone: contactPhone,
        available_start_time: availableStartTime,
        available_end_time: availableEndTime,
        available_days: availableDays,
        advance_booking_days: Number(advanceBookingDays) || 3,
        restrictions,
      });
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev => 
      prev.includes(item) 
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !selectedEquipment.includes(customEquipment.trim())) {
      setSelectedEquipment(prev => [...prev, customEquipment.trim()]);
      setCustomEquipment("");
    }
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Modal 
      title="เพิ่มห้องใหม่" 
      onClose={onClose}
      size="lg"
      icon={<DoorOpen className="w-5 h-5 text-black" />}
    >
      {/* Section: ข้อมูลพื้นฐาน */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <DoorOpen className="w-4 h-4 text-amber-600" />
          ข้อมูลพื้นฐาน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              รหัส/ชื่อห้อง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={room_code}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="เช่น ห้อง 101"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              อาคาร <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
            >
              <option value="" disabled>-- เลือกอาคาร --</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ชั้น <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            >
              <option value="" disabled>-- เลือกชั้น --</option>
              {FLOORS.map((f) => (
                <option key={f} value={f}>ชั้น {f}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ประเภทห้อง <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              value={room_type}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="" disabled>-- เลือกประเภทห้อง --</option>
              {ROOM_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          <Input
            label="ความจุ (ที่นั่ง)"
            type="number"
            value={capacity}
            onChange={setCapacity}
            icon={<Users className="w-4 h-4" />}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              สถานะห้อง
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              value={room_status}
              onChange={(e) => setRoomStatus(e.target.value)}
            >
              <option value="">-- เลือกสถานะ --</option>
              {ROOM_STATUS.map((st) => (
                <option key={st} value={st}>
                  {st === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section: ผู้ดูแลและการติดต่อ */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <User className="w-4 h-4 text-amber-600" />
          ผู้ดูแลและการติดต่อ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ผู้ดูแลห้อง
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              value={caretaker}
              onChange={(e) => setCaretaker(e.target.value)}
              disabled={loadingCaretakers}
            >
              <option value="">-- เลือกผู้ดูแล --</option>
              {caretakerOptions.map((c) => (
                <option key={c.user_id} value={c.username}>
                  {c.username} ({c.department}) - {c.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้อนุมัติ'}
                </option>
              ))}
            </select>
            {loadingCaretakers && (
              <p className="text-xs text-gray-500">กำลังโหลดรายชื่อผู้ดูแล...</p>
            )}
          </div>

          <Input
            label="เบอร์โทรติดต่อห้อง"
            value={contactPhone}
            onChange={setContactPhone}
            placeholder="เช่น 055-123456 ต่อ 1234"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Section: อุปกรณ์ในห้อง */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <Building className="w-4 h-4 text-amber-600" />
          อุปกรณ์ในห้อง
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  selectedEquipment.includes(eq)
                    ? 'bg-amber-100 border-amber-400 text-amber-800'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                {selectedEquipment.includes(eq) && <span className="mr-1">✓</span>}
                {eq}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customEquipment}
              onChange={(e) => setCustomEquipment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEquipment())}
              placeholder="เพิ่มอุปกรณ์อื่นๆ..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCustomEquipment}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </button>
          </div>

          {selectedEquipment.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 mb-2">อุปกรณ์ที่เลือก ({selectedEquipment.length} รายการ):</p>
              <div className="flex flex-wrap gap-1">
                {selectedEquipment.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-amber-300 text-xs text-amber-800"
                  >
                    {eq}
                    <button
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section: เวลาและเงื่อนไขการจอง */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <Clock className="w-4 h-4 text-amber-600" />
          เวลาและเงื่อนไขการจอง
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              เวลาเปิดให้จอง
            </label>
            <input
              type="time"
              value={availableStartTime}
              onChange={(e) => setAvailableStartTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              เวลาปิดให้จอง
            </label>
            <input
              type="time"
              value={availableEndTime}
              onChange={(e) => setAvailableEndTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ต้องจองล่วงหน้า (วัน)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={advanceBookingDays}
              onChange={(e) => setAdvanceBookingDays(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            วันที่เปิดให้จอง
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  availableDays.includes(day.value)
                    ? 'bg-amber-100 border-amber-400 text-amber-800'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section: รายละเอียดเพิ่มเติม */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          รายละเอียดเพิ่มเติม
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              รายละเอียดห้อง
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับห้อง..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ข้อจำกัด/หมายเหตุการใช้งาน
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              rows={2}
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="เช่น ห้ามนำอาหารเข้า, ต้องมีอาจารย์ที่ปรึกษากำกับ, สงวนสิทธิ์เฉพาะบุคลากร..."
            />
          </div>
        </div>
      </div>

      {/* Section: รูปภาพห้อง */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <ImagePlus className="w-4 h-4 text-amber-600" />
          รูปภาพห้อง
        </h3>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setImages(prev => [...prev, ...files]);
              }}
              className="hidden"
              id="room-images"
            />
            <label
              htmlFor="room-images"
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-amber-400 transition-all duration-200"
            >
              <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ</span>
              <span className="text-xs text-gray-400">รองรับ JPG, PNG หลายไฟล์</span>
            </label>
          </div>
          
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <span className="text-sm text-amber-700 max-w-[150px] truncate">
                    {f.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1 rounded-full hover:bg-amber-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-300"
          onClick={onClose}
          disabled={submitting}
        >
          ยกเลิก
        </button>
        <button
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลห้อง'}
        </button>
      </div>
    </Modal>
  );
}
