import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { CheckCircle, ClipboardList, AlertCircle } from "lucide-react";
import { SUS_STATEMENTS, DEMO_TASKS, TASK_RESULTS, TaskResult } from "../constants/feedback";

const api = import.meta.env.VITE_API;

/**
 * Usability questionnaire for people trying the system, e.g. students in a
 * demo session. Lives inside the booking site itself so testers use the same
 * link that already works on their network. No account needed.
 */
export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const [testerCode, setTesterCode] = useState(searchParams.get("code") ?? "");
  const [tasks, setTasks] = useState<Record<string, TaskResult>>({});
  const [sus, setSus] = useState<(number | null)[]>(() => SUS_STATEMENTS.map(() => null));
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const susComplete = sus.every((a) => a !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!susComplete) {
      setError("กรุณาตอบข้อ 1–10 ให้ครบ");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${api}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tester_code: testerCode, sus_answers: sus, tasks, liked, improve }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "ส่งไม่สำเร็จ กรุณาลองใหม่");
      }
      setDone(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="luxury-card mx-auto max-w-xl p-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900">ขอบคุณที่ช่วยประเมินครับ</h1>
        <Link to="/book-room" className="btn-secondary mt-6 inline-flex">
          กลับไปหน้าจองห้อง
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
        <ClipboardList className="h-8 w-8 text-slate-700" aria-hidden="true" />
        ประเมินระบบจองห้อง
      </h1>

      <div className="luxury-card p-5">
        <label htmlFor="tester-code" className="field-label">
          เลขบัตรผู้ทดสอบ (ถ้ามี)
        </label>
        <input
          id="tester-code"
          type="text"
          maxLength={20}
          value={testerCode}
          onChange={(e) => setTesterCode(e.target.value)}
          placeholder="เช่น 12"
          className="input-luxury max-w-xs"
        />
      </div>

      <section className="luxury-card space-y-4 p-5">
        <h2 className="text-lg font-bold text-slate-900">ภารกิจที่ลองทำ</h2>
        {DEMO_TASKS.map((task) => (
          <div key={task.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-slate-800">{task.label}</span>
            <div className="flex gap-2" role="radiogroup" aria-label={task.label}>
              {TASK_RESULTS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={tasks[task.key] === r.value}
                  onClick={() => setTasks((t) => ({ ...t, [task.key]: r.value }))}
                  className={clsx(
                    "rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors",
                    tasks[task.key] === r.value
                      ? "border-slate-700 bg-slate-700 text-white"
                      : "border-stone-300 bg-white text-slate-700 hover:border-slate-500"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="luxury-card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ความคิดเห็นต่อระบบ</h2>
          <p className="text-sm text-slate-500">1 = ไม่เห็นด้วยอย่างยิ่ง · 5 = เห็นด้วยอย่างยิ่ง</p>
        </div>
        {SUS_STATEMENTS.map((statement, i) => (
          <div key={i} className="space-y-2">
            <p className="font-medium text-slate-800">
              {i + 1}. {statement}
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label={statement}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={sus[i] === n}
                  onClick={() => setSus((s) => s.map((v, j) => (j === i ? n : v)))}
                  className={clsx(
                    "h-11 w-11 rounded-lg border-2 text-base font-bold transition-colors",
                    sus[i] === n
                      ? "border-slate-700 bg-slate-700 text-white"
                      : "border-stone-300 bg-white text-slate-700 hover:border-slate-500"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="luxury-card space-y-4 p-5">
        <div>
          <label htmlFor="liked" className="field-label">ชอบอะไรในระบบนี้ (ไม่บังคับ)</label>
          <textarea id="liked" rows={2} maxLength={1000} value={liked} onChange={(e) => setLiked(e.target.value)} className="input-luxury resize-none" />
        </div>
        <div>
          <label htmlFor="improve" className="field-label">อยากให้ปรับปรุงอะไร (ไม่บังคับ)</label>
          <textarea id="improve" rows={2} maxLength={1000} value={improve} onChange={(e) => setImprove(e.target.value)} className="input-luxury resize-none" />
        </div>
      </section>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? "กำลังส่ง..." : "ส่งแบบประเมิน"}
      </button>
    </form>
  );
}
