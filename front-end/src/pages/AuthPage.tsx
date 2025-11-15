import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, GraduationCap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../types/types";

const api = import.meta.env.VITE_API;

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    department: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (user && token) navigate("/dashboard");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(`${api}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        if (res.ok) {
          const { token, rows } = await res.json();
          localStorage.setItem("token", token);
          const [{ id, username, email, department, role }] = rows;
          await login(id, username, email, department, role);
          navigate("/dashboard");
        } else {
          const { message } = await res.json();
          setError(message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("รหัสผ่านไม่ตรงกัน");
          setLoading(false);
          return;
        }
        const res = await fetch(`${api}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: formData.fullName,
            email: formData.email,
            password: formData.password,
            department: formData.department,
          }),
        });
        if (res.ok) {
          setSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบเพื่อใช้งาน");
          setIsLogin(true);
          setFormData({
            email: "",
            password: "",
            fullName: "",
            confirmPassword: "",
            department: "",
          });
        } else {
          const { message } = await res.json();
          setError(message);
        }
      }
    } catch (err) {
      setError(isLogin ? "ไม่สามารถเข้าสู่ระบบได้ (โปรดตรวจสอบอีเมล/รหัสผ่าน)" : "เกิดข้อผิดพลาดในการสมัครสมาชิก (โปรดตรวจสอบข้อมูล)");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setFormData({
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
      department: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/50">
          <div className="relative h-32 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                {isLogin ? (
                  <LogIn className="h-7 w-7 text-white" />
                ) : (
                  <UserPlus className="h-7 w-7 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h2>
              <p className="text-emerald-50 text-sm mt-0.5">
                ระบบจองห้อง คณะวิทยาศาสตร์และเทคโนโลยี
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 animate-in fade-in slide-in-from-top-1 duration-300">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="fullName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        ชื่อ-นามสกุล
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400
                                      shadow-sm outline-none transition-all duration-200
                                      focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          placeholder="กรอกชื่อ-นามสกุล"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="department"
                        className="text-sm font-semibold text-gray-700"
                      >
                        คณะ
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="department"
                          name="department"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-10 py-3 text-gray-900
                                    shadow-sm outline-none transition-all duration-200 focus:bg-white focus:border-emerald-500
                                    focus:ring-4 focus:ring-emerald-100 appearance-none"
                          value={formData.department}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>
                            เลือกคณะ
                          </option>
                          {DEPARTMENTS.map((dep) => (
                            <option key={dep} value={dep}>
                              {dep}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    อีเมล
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400
                                  shadow-sm outline-none transition-all duration-200
                                  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400
                                  shadow-sm outline-none transition-all duration-200
                                  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-gray-700"
                    >
                      ยืนยันรหัสผ่าน
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400
                                    shadow-sm outline-none transition-all duration-200
                                    focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-2.5 rounded-xl
                              bg-gradient-to-r from-emerald-600 to-green-600 text-white
                              px-6 py-3.5 text-sm font-bold shadow-lg shadow-emerald-600/30
                              hover:shadow-xl hover:shadow-emerald-600/40 hover:from-emerald-500 hover:to-green-500
                              focus:outline-none focus:ring-4 focus:ring-emerald-200
                              active:scale-[0.98] transition-all duration-200
                              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLogin ? (
                  <>
                    <LogIn className="h-5 w-5" />
                    เข้าสู่ระบบ
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    สมัครสมาชิก
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                {isLogin ? (
                  <>
                    ยังไม่มีบัญชี?{" "}
                    <span className="text-emerald-600 font-semibold hover:underline">
                      สมัครสมาชิกที่นี่
                    </span>
                  </>
                ) : (
                  <>
                    มีบัญชีอยู่แล้ว?{" "}
                    <span className="text-emerald-600 font-semibold hover:underline">
                      เข้าสู่ระบบ
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isLogin && (
          <p className="text-xs text-center text-gray-500 mt-4">
            โปรดติดต่อผู้ดูแลระบบหากลืมรหัสผ่าน
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;