import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onBackToUser?: () => void;
}

function AdminLoginPage({ onBackToUser }: AdminLoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Admin Login:', formData);
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
          <div className="relative h-36 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/20"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 shadow-2xl border border-white/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Admin Login
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                ระบบจัดการสำหรับผู้ดูแล
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-200">
                    อีเมลผู้ดูแลระบบ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/50 pl-11 pr-4 py-3 text-white placeholder-slate-400
                                 shadow-sm outline-none transition-all duration-200
                                 focus:bg-slate-900/70 focus:border-slate-400 focus:ring-4 focus:ring-slate-500/50"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/50 pl-11 pr-4 py-3 text-white placeholder-slate-400
                                 shadow-sm outline-none transition-all duration-200
                                 focus:bg-slate-900/70 focus:border-slate-400 focus:ring-4 focus:ring-slate-500/50"
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
                           bg-gradient-to-r from-slate-600 to-slate-700 text-white
                           px-6 py-3.5 text-sm font-bold shadow-lg shadow-slate-900/50
                           hover:shadow-xl hover:shadow-slate-900/60 hover:from-slate-500 hover:to-slate-600
                           focus:outline-none focus:ring-4 focus:ring-slate-500/50
                           active:scale-[0.98] transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                           border border-slate-500/30"
              >
                <Shield className="h-5 w-5" />
                เข้าสู่ระบบผู้ดูแล
              </button>
            </form>

            {onBackToUser && (
              <>
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/50 text-slate-400">หรือ</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={onBackToUser}
                    className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white font-medium transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    กลับไปหน้าผู้ใช้ทั่วไป
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          ระบบจัดการสำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
