import React, { useState } from "react";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_API;

/**
 * Staff sign-in. Bookers do not have accounts any more (they book with a name
 * and phone number), so there is no sign-up form here.
 */
function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Back to the staff page that sent the visitor here, else the approvals queue.
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/approvals";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigating during render warns in React; redirect as an effect instead.
  React.useEffect(() => {
    if (localStorage.getItem("user") && localStorage.getItem("token")) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
        // The API returns user_id; destructuring `id` left user_id undefined until reload.
        const [{ user_id, username, email, department, role }] = rows;
        await login(user_id, username, email, department, role, token);
        navigate(from, { replace: true });
      } else {
        const { message } = await res.json();
        setError(message);
      }
    } catch {
      setError("ไม่สามารถเข้าสู่ระบบได้ (โปรดตรวจสอบอีเมล/รหัสผ่าน)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/60">
          <div className="relative h-32 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                <LogIn className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบเจ้าหน้าที่</h2>
              <p className="text-emerald-50 text-sm mt-0.5">
                ระบบจองห้อง คณะวิทยาศาสตร์และเทคโนโลยี
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
                                  focus:bg-white focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
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
                                  focus:bg-white focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-2.5 rounded-xl
                              bg-gradient-to-r from-slate-700 to-slate-800 text-white
                              px-6 py-3.5 text-sm font-bold shadow-lg shadow-slate-600/20
                              hover:shadow-xl hover:shadow-slate-600/30 hover:from-slate-600 hover:to-slate-700
                              focus:outline-none focus:ring-4 focus:ring-slate-200
                              active:scale-[0.98] transition-all duration-200
                              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <LogIn className="h-5 w-5" />
                เข้าสู่ระบบ
              </button>
            </form>

            {/* Bookers who land here by mistake need no account at all. */}
            <div className="mt-6 text-center">
              <Link
                to="/book-room"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                จองห้อง (ไม่ต้องเข้าสู่ระบบ)
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          โปรดติดต่อผู้ดูแลระบบหากลืมรหัสผ่าน
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
