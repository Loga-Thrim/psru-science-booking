import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  Phone,
  Building,
  ArrowLeft,
  Calendar,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import { ReservationType } from "../types/types";

const api = import.meta.env.VITE_API as string;

type BookingFormState = {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfUsers: number;
  reservationType: ReservationType;
  reservationReason: string;
  phoneNumber: string;
};

const BOOKING_TYPES: { value: ReservationType; label: string }[] = [
  { value: "teaching", label: "จัดการเรียนการสอน" },
  { value: "exam", label: "สอบย่อย/กลางภาค/ปลายภาค" },
  { value: "activity", label: "กิจกรรม/อบรม/ประชุม" },
  { value: "other", label: "อื่นๆ" },
];

export default function RoomBookingCreateFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialForm: BookingFormState = useMemo(
    () => ({
      roomId: (searchParams.get("roomId") as string) ?? "",
      date: (searchParams.get("date") as string) ?? "",
      startTime: (searchParams.get("start") as string) ?? "",
      endTime: (searchParams.get("end") as string) ?? "",
      numberOfUsers: 1,
      reservationType: "" as ReservationType,
      reservationReason: "",
      phoneNumber: "",
    }),
    [searchParams]
  );

  const [form, setForm] = useState<BookingFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const displayDate = useMemo(
    () => (form.date ? dayjs(form.date).format("DD/MM/YYYY") : ""),
    [form.date]
  );

  const displayStart = useMemo(
    () =>
      form.startTime
        ? dayjs(`1970-01-01T${form.startTime}`).format("HH:mm")
        : "",
    [form.startTime]
  );

  const displayEnd = useMemo(
    () =>
      form.endTime ? dayjs(`1970-01-01T${form.endTime}`).format("HH:mm") : "",
    [form.endTime]
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitting(true);

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

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Create reservation failed:", res.status, msg);
        setSubmitError(`บันทึกไม่สำเร็จ (${res.status})`);
        setSubmitting(false);
        return;
      }

      await res.json().catch(() => null);
      setSubmitSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setSubmitting(false);
    }
  };

  const disabledAfterSuccess = submitting || submitSuccess;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => navigate("/book-room")}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="กลับ"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">จองห้องใหม่</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            รายละเอียดจากการเลือก
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              รหัสห้อง
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.roomId}
                readOnly
                aria-readonly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pl-12 pr-4 text-gray-700"
                title="อ่านอย่างเดียว"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              วันที่
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={displayDate}
                readOnly
                aria-readonly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pl-12 pr-4 text-gray-700"
                title="อ่านอย่างเดียว"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                เริ่มต้น
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={displayStart}
                  readOnly
                  aria-readonly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pl-12 pr-4 text-gray-700"
                  title="อ่านอย่างเดียว"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                สิ้นสุด
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={displayEnd}
                  readOnly
                  aria-readonly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pl-12 pr-4 text-gray-700"
                  title="อ่านอย่างเดียว"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={clsx("space-y-6", submitSuccess && "opacity-70")}>
          <h2 className="text-lg font-semibold text-gray-900">
            ข้อมูลเพิ่มเติม
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              จำนวนผู้เข้าใช้
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min={1}
                value={
                  Number.isFinite(form.numberOfUsers) ? form.numberOfUsers : 1
                }
                onChange={(e) => {
                  const n = parseInt(e.target.value || "1", 10);
                  setForm((f) => ({
                    ...f,
                    numberOfUsers: Number.isFinite(n) && n > 0 ? n : 1,
                  }));
                }}
                disabled={disabledAfterSuccess}
                className="w-full rounded-lg border border-gray-200 py-2 pl-12 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="จำนวนผู้เข้าใช้"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ประเภทการจอง
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {BOOKING_TYPES.map((type) => (
                <button
                  key={type.value || "empty"}
                  type="button"
                  onClick={() =>
                    !disabledAfterSuccess &&
                    setForm((f) => ({
                      ...f,
                      reservationType: type.value,
                    }))
                  }
                  className={clsx(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    form.reservationType === type.value
                      ? "border-2 border-blue-500 bg-blue-50 text-blue-700"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
                    disabledAfterSuccess && "cursor-not-allowed opacity-60"
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
              onChange={() => {}}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              เหตุผลในการจอง
            </label>
            <textarea
              rows={4}
              value={form.reservationReason}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reservationReason: e.target.value,
                }))
              }
              disabled={disabledAfterSuccess}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="ระบุเหตุผลในการจอง"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                maxLength={10}
                type="tel"
                pattern="[0-9]{9,10}"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phoneNumber: e.target.value,
                  }))
                }
                disabled={disabledAfterSuccess}
                className="w-full rounded-lg border border-gray-200 py-2 pl-12 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="0812345678"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/book-room")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            disabled={submitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting || submitSuccess}
          >
            {submitting ? "กำลังบันทึก..." : "ยืนยันการจอง"}
          </button>
        </div>
      </form>

      {(submitSuccess || submitError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2
              className={clsx(
                "text-lg font-semibold",
                submitSuccess ? "text-emerald-700" : "text-red-700"
              )}
            >
              {submitSuccess ? "บันทึกการจองสำเร็จ" : "บันทึกไม่สำเร็จ"}
            </h2>

            <p className="mt-2 text-sm text-gray-700">
              {submitSuccess
                ? "ระบบบันทึกการจองของคุณเรียบร้อยแล้ว"
                : submitError}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              {!submitSuccess && (
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ปิด
                </button>
              )}
              {submitSuccess && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ปิด
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/book-room?roomId=${form.roomId}&date=${form.date}`
                      )
                    }
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    ไปหน้ารายการจอง
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
