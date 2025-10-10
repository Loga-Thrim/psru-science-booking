import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, UserRow, UpsertForm } from "../types/types";
import { UserTable } from "../components/users/UserTable";
import { AddUserModal } from "../components/users/AddUserModal";
import { EditUserModal } from "../components/users/EditUserModal";
import { DeleteUserModal } from "../components/users/DeleteUserModal";

const api = import.meta.env.VITE_API as string;

function UserManagementPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // selected user (for edit/delete)
  const [selected, setSelected] = useState<UserRow | null>(null);

  // guards
  if (!user) return <p className="text-gray-500">กำลังตรวจสอบสิทธิ์...</p>;
  if (user.role !== "admin")
    return <p className="text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>;

  // fetch users (เดิม)
  const loadUsers = async () => {
    setLoading(true);
    setErr(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/get-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setUsers((data?.rows ?? []) as UserRow[]);
    } catch (e: any) {
      setErr(e?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // submit handlers (เดิม) — ถูกส่งต่อเข้าโมดอล
  const handleCreate = async (form: UpsertForm) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${api}/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, ...form }),
    });
    if (!res.ok) {
      const {message} = await res.json();
      throw new Error(message);
    }
    setIsAddOpen(false);
    await loadUsers();
  };

  const handleUpdate = async (payload: UpsertForm & { user_id: number }) => {
    const token = localStorage.getItem("token");
    // ส่ง password เฉพาะกรณีที่กรอก
    const body: any = {
      token,
      user_id: payload.user_id,
      email: payload.email,
      username: payload.username,
      department: payload.department,
      role: payload.role,
    };
    if (payload.password) body.password = payload.password;

    const res = await fetch(`${api}/update-user`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("แก้ไขผู้ใช้ไม่สำเร็จ");
    setIsEditOpen(false);
    await loadUsers();
  };

  const handleDelete = async (user_id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${api}/delete-user`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, user_id }),
    });
    if (!res.ok) throw new Error("ลบผู้ใช้ไม่สำเร็จ");
    setIsDeleteOpen(false);
    setUsers((prev) => prev.filter((x) => x.user_id !== user_id)); // optimistic update เหมือนเดิม
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + เพิ่มผู้ใช้
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : err ? (
          <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {err}</div>
        ) : (
          <UserTable
            users={users}
            onEdit={(u) => {
              setSelected(u);
              setIsEditOpen(true);
            }}
            onDelete={(u) => {
              setSelected(u);
              setIsDeleteOpen(true);
            }}
          />
        )}
      </div>

      {isAddOpen && (
        <AddUserModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {isEditOpen && selected && (
        <EditUserModal
          user={selected}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}

      {isDeleteOpen && selected && (
        <DeleteUserModal
          user={selected}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default UserManagementPage;
