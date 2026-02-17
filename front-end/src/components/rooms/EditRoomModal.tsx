import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Room, ROOM_TYPE as ROOM_TYPES, ROOM_STATUS, BUILDINGS, FLOORS, EQUIPMENT_OPTIONS, WEEKDAYS } from "../../types/types";
import { Edit3, Users, User, Camera, X, Building, Phone, Clock, Calendar, Plus, AlertCircle, DoorOpen } from "lucide-react";

const api = import.meta.env.VITE_API;

type CaretakerOption = {
  user_id: string;
  username: string;
  department: string;
  role: string;
};

type Props = {
  room: Room | null;
  onClose: () => void;
  onSubmit: (data: {
    room_id: string;
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

type RoomImage = {
  image_id?: string;
  room_id?: string;
  image_path?: string;
  image_url: string;
};

export default function EditRoomModal({ room, onClose, onSubmit }: Props) {
  const [room_code, setRoomCode] = useState("");
  const [room_type, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [caretaker, setCaretaker] = useState("");
  const [description, setDescription] = useState("");
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

  // Caretaker options
  const [caretakerOptions, setCaretakerOptions] = useState<CaretakerOption[]>([]);
  const [loadingCaretakers, setLoadingCaretakers] = useState(true);

  const [images, setImages] = useState<RoomImage[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const currentImage = useMemo(() => {
    if (previews[0]) return previews[0];
    return images[0]?.image_url ?? null;
  }, [previews, images]);

  // Fetch caretakers
  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
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

  useEffect(() => {
    if (!room) return;

    setRoomCode(room.room_code);
    setRoomType(room.room_type || "");
    setCapacity(String(room.capacity ?? 0));
    setCaretaker(room.caretaker || "");
    setDescription(room.description || "");
    setRoomStatus(room.status || "");
    
    // Parse equipment string to array
    const equipmentList = room.equipment ? room.equipment.split(", ").filter(e => e.trim()) : [];
    setSelectedEquipment(equipmentList);
    
    // New fields
    setBuilding(room.building || "");
    setFloor(room.floor || "");
    setContactPhone(room.contact_phone || "");
    setAvailableStartTime(room.available_start_time || "08:00");
    setAvailableEndTime(room.available_end_time || "17:00");
    setAvailableDays(room.available_days ? room.available_days.split(",") : ["mon", "tue", "wed", "thu", "fri"]);
    setAdvanceBookingDays(String(room.advance_booking_days ?? 3));
    setRestrictions(room.restrictions || "");

    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
    setNewFiles([]);

    const ac = new AbortController();
    fetchImages(room.room_id, ac.signal);

    return () => {
      ac.abort();
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [room?.room_id]);

  const fetchImages = async (room_id: string, signal?: AbortSignal) => {
    try {
      setImgLoading(true);
      setImgError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/room-image/${encodeURIComponent(room_id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`โหลดรูปไม่สำเร็จ (HTTP ${res.status})`);
      const data = (await res.json()) as any[];
      const cleaned: RoomImage[] = Array.isArray(data)
        ? data.filter((x) => typeof x?.image_url === "string" && x.image_url.length > 0)
        : [];
      setImages(cleaned);
    } catch (e: any) {
      if (e?.name !== "AbortError") setImgError(e?.message ?? "ไม่สามารถโหลดรูปได้");
    } finally {
      setImgLoading(false);
    }
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    newFiles.forEach((_, i) => {
      if (previews[i]) URL.revokeObjectURL(previews[i]);
    });
    const nextPreviews = files.map((f) => URL.createObjectURL(f));

    setNewFiles(files);
    setPreviews(nextPreviews);
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

  const handleSubmit = async () => {
    if (!room) return;
    setSubmitting(true);
    try {
      await onSubmit({
        room_id: room.room_id,
        room_code,
        room_type,
        room_status,
        capacity: Number(capacity) || 0,
        equipment: selectedEquipment.join(", "),
        caretaker,
        description,
        images: newFiles,
        building,
        floor,
        contact_phone: contactPhone,
        available_start_time: availableStartTime,
        available_end_time: availableEndTime,
        available_days: availableDays,
        advance_booking_days: Number(advanceBookingDays) || 3,
        restrictions,
      });
      previews.forEach((u) => URL.revokeObjectURL(u));
      onClose();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeNewFile = (index: number) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal 
      title="แก้ไขข้อมูลห้อง" 
      onClose={onClose}
      size="lg"
      icon={<Edit3 className="w-5 h-5 text-black" />}
    >
      {/* Section: รูปภาพห้อง */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <Camera className="w-4 h-4 text-slate-700" />
          รูปภาพห้อง
        </h3>
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {imgLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full gradient-primary animate-pulse" />
              </div>
            ) : imgError ? (
              <div className="flex h-full items-center justify-center text-sm text-red-600">{imgError}</div>
            ) : currentImage ? (
              <img src={currentImage} alt="room" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <Camera className="w-12 h-12 mb-2 opacity-50" />
                <span>ไม่มีรูปภาพ</span>
              </div>
            )}
          </div>
          <button type="button" onClick={handlePickImage} disabled={submitting}
            className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-white transition-colors">
            <Camera className="w-4 h-4" />เปลี่ยนรูป
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelected} />
          {newFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {newFiles.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-800 max-w-[150px] truncate">{f.name}</span>
                  <button type="button" onClick={() => removeNewFile(idx)} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section: ข้อมูลพื้นฐาน */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <DoorOpen className="w-4 h-4 text-slate-700" />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">อาคาร</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
              value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="">-- เลือกอาคาร --</option>
              {BUILDINGS.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ชั้น</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
              value={floor} onChange={(e) => setFloor(e.target.value)}>
              <option value="">-- เลือกชั้น --</option>
              {FLOORS.map((f) => (<option key={f} value={f}>ชั้น {f}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ประเภทห้อง</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
              value={room_type} onChange={(e) => setRoomType(e.target.value)}>
              <option value="" disabled>-- เลือกประเภทห้อง --</option>
              {ROOM_TYPES.map((rt) => (<option key={rt} value={rt}>{rt}</option>))}
            </select>
          </div>
          <Input label="ความจุ (ที่นั่ง)" type="number" value={capacity} onChange={setCapacity} icon={<Users className="w-4 h-4" />} />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">สถานะห้อง</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
              value={room_status} onChange={(e) => setRoomStatus(e.target.value)}>
              <option value="">-- เลือกสถานะ --</option>
              {ROOM_STATUS.map((st) => (<option key={st} value={st}>{st === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Section: ผู้ดูแลและการติดต่อ */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <User className="w-4 h-4 text-slate-700" />
          ผู้ดูแลและการติดต่อ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ผู้ดูแลห้อง</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none"
              value={caretaker} onChange={(e) => setCaretaker(e.target.value)} disabled={loadingCaretakers}>
              <option value="">-- เลือกผู้ดูแล --</option>
              {caretakerOptions.map((c) => (<option key={c.user_id} value={c.username}>{c.username} ({c.department})</option>))}
            </select>
          </div>
          <Input label="เบอร์โทรติดต่อห้อง" value={contactPhone} onChange={setContactPhone} placeholder="เช่น 055-123456 ต่อ 1234" icon={<Phone className="w-4 h-4" />} />
        </div>
      </div>

      {/* Section: อุปกรณ์ในห้อง */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <Building className="w-4 h-4 text-slate-700" />
          อุปกรณ์ในห้อง
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button key={eq} type="button" onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedEquipment.includes(eq) ? 'bg-slate-100 border-slate-500 text-slate-800' : 'bg-white border-gray-300 text-gray-600 hover:border-slate-400 hover:bg-slate-50'}`}>
                {selectedEquipment.includes(eq) && <span className="mr-1">✓</span>}{eq}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customEquipment} onChange={(e) => setCustomEquipment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEquipment())}
              placeholder="เพิ่มอุปกรณ์อื่นๆ..." className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none" />
            <button type="button" onClick={addCustomEquipment} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" />เพิ่ม
            </button>
          </div>
          {selectedEquipment.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-800 mb-2">อุปกรณ์ที่เลือก ({selectedEquipment.length} รายการ):</p>
              <div className="flex flex-wrap gap-1">
                {selectedEquipment.map((eq) => (
                  <span key={eq} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-400 text-xs text-slate-800">
                    {eq}<button type="button" onClick={() => toggleEquipment(eq)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
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
          <Clock className="w-4 h-4 text-slate-700" />
          เวลาและเงื่อนไขการจอง
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">เวลาเปิดให้จอง</label>
            <input type="time" value={availableStartTime} onChange={(e) => setAvailableStartTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">เวลาปิดให้จอง</label>
            <input type="time" value={availableEndTime} onChange={(e) => setAvailableEndTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ต้องจองล่วงหน้า (วัน)</label>
            <input type="number" min="0" max="30" value={advanceBookingDays} onChange={(e) => setAdvanceBookingDays(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700"><Calendar className="w-4 h-4 inline mr-1" />วันที่เปิดให้จอง</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button key={day.value} type="button" onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${availableDays.includes(day.value) ? 'bg-slate-100 border-slate-500 text-slate-800' : 'bg-white border-gray-300 text-gray-600 hover:border-slate-400'}`}>
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section: รายละเอียดเพิ่มเติม */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
          <AlertCircle className="w-4 h-4 text-slate-700" />
          รายละเอียดเพิ่มเติม
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รายละเอียดห้อง</label>
            <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none resize-none"
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับห้อง..." />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ข้อจำกัด/หมายเหตุการใช้งาน</label>
            <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none resize-none"
              rows={2} value={restrictions} onChange={(e) => setRestrictions(e.target.value)} placeholder="เช่น ห้ามนำอาหารเข้า, ต้องมีอาจารย์ที่ปรึกษากำกับ..." />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-300"
          onClick={onClose} disabled={submitting}>ยกเลิก</button>
        <button className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>
    </Modal>
  );
}
