import React, { useState, useEffect } from 'react';
import ReservationTable from '../components/approve/reservationTable';
import { useAuth } from '../contexts/AuthContext';
const api = import.meta.env.VITE_API;

function BookingApprovalPage() {

  const {user} = useAuth();
  if(!user)return <div className="p-6 text-red-600">โปรดเข้าสู่ระบบ</div>;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${api}/reservation-list`, {
        
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setErr("เกิดข้อผิดพลาดในการโหลดข้อมูล");
          throw new Error(`Fetch failed: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.error(err);
        setErr(err as string);
      } finally {
        setLoading(false);
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">อนุมัติการจอง</h1>
      <div className="bg-white rounded-lg shadow p-6">

        {user.role !== "admin" && user.role !== "approver" ? (
          <div className="p-6 text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
        )
        : loading ? (
          <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : err ? (
          <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {err}</div>
        ) : (
          <ReservationTable></ReservationTable>
        )}

      </div>
    </div>
  );
}

export default BookingApprovalPage;