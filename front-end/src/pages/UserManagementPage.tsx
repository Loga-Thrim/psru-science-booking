import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRow, UpsertForm } from "../types/types";
import { UserTable } from "../components/users/UserTable";
import { AddUserModal } from "../components/users/AddUserModal";
import { EditUserModal } from "../components/users/EditUserModal";
import { DeleteUserModal } from "../components/users/DeleteUserModal";
import { Users, Plus, Search, Shield, UserCheck, UserX } from "lucide-react";

const api = import.meta.env.VITE_API as string;

function UserManagementPage() {
  const { user } = useAuth();
  
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setErr(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}` ,
        },
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

  const handleCreate = async (form: UpsertForm) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${api}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}` ,
      },
      body: JSON.stringify({...form }),
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
    const body: any = {
      user_id: payload.user_id,
      email: payload.email,
      username: payload.username,
      department: payload.department,
      role: payload.role,
    };
    if (payload.password) body.password = payload.password;

    const res = await fetch(`${api}/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}` ,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("แก้ไขผู้ใช้ไม่สำเร็จ");
    setIsEditOpen(false);
    await loadUsers();
  };

  const handleDelete = async (user_id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${api}/users`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}` ,
      },
      body: JSON.stringify({ user_id }),
    });
    if (!res.ok) throw new Error("ลบผู้ใช้ไม่สำเร็จ");
    setIsDeleteOpen(false);
    setUsers((prev) => prev.filter((x) => x.user_id !== user_id));
    setSelected(null);
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const approverCount = users.filter(u => u.role === 'approver').length;
  const userCount = users.filter(u => u.role === 'user').length;

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
        <p className="text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    </div>
  );
  
  if (user.role !== "admin") return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <UserX className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-gray-500 mt-1">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              <p className="text-sm text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approverCount}</p>
              <p className="text-sm text-gray-500">ผู้อนุมัติ</p>
            </div>
          </div>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-info flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
              <p className="text-sm text-gray-500">ผู้ใช้ทั่วไป</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="luxury-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้ตามชื่อ, อีเมล หรือแผนก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury pl-12"
          />
        </div>
      </div>

      {/* Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
              <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : err ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">เกิดข้อผิดพลาด: {err}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">ไม่พบผู้ใช้ที่ค้นหา</p>
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
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
