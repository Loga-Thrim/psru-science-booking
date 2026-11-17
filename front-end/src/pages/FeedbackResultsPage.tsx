import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Download } from "lucide-react";
import { SUS_STATEMENTS, DEMO_TASKS, TASK_RESULTS, susGrade } from "../constants/feedback";

const api = import.meta.env.VITE_API;

type FeedbackRow = {
  feedback_id: string;
  tester_code: string | null;
  sus_answers: number[] | string;
  sus_score: number | string;
  tasks: Record<string, string> | string | null;
  liked: string | null;
  improve: string | null;
  created_at: string;
};

// mysql2 usually returns JSON columns parsed, but not on every server setup.
const asJson = <T,>(v: unknown, fallback: T): T => {
  if (typeof v !== "string") return (v as T) ?? fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
};

export default function FeedbackResultsPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${api}/feedback`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`โหลดไม่สำเร็จ (${res.status})`);
        setRows(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        sus_answers: asJson<number[]>(r.sus_answers, []),
        sus_score: Number(r.sus_score),
        tasks: asJson<Record<string, string>>(r.tasks, {}),
      })),
    [rows]
  );

  const avgSus = data.length ? data.reduce((a, r) => a + r.sus_score, 0) / data.length : 0;

  const downloadCsv = () => {
    const header = ["เวลา", "เลขบัตร", "SUS", ...DEMO_TASKS.map((t) => t.label), ...SUS_STATEMENTS.map((_, i) => `ข้อ${i + 1}`), "ชอบ", "ควรปรับปรุง"];
    const label = (v?: string) => TASK_RESULTS.find((r) => r.value === v)?.label ?? "";
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = data.map((r) =>
      [r.created_at, r.tester_code, r.sus_score, ...DEMO_TASKS.map((t) => label(r.tasks[t.key])), ...r.sus_answers, r.liked, r.improve]
        .map(cell)
        .join(",")
    );
    // BOM so Excel opens the Thai text correctly.
    const blob = new Blob(["﻿" + [header.map(cell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ผลประเมินระบบจองห้อง.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <div className="luxury-card p-10 text-center text-slate-600">กำลังโหลด…</div>;
  if (error) return <div className="luxury-card p-10 text-center text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <ClipboardList className="h-8 w-8 text-slate-700" aria-hidden="true" />
          ผลประเมินระบบ
        </h1>
        {data.length > 0 && (
          <button onClick={downloadCsv} className="btn-secondary inline-flex items-center gap-2">
            <Download className="h-5 w-5" aria-hidden="true" />
            ดาวน์โหลด CSV
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="luxury-card p-10 text-center text-slate-600">ยังไม่มีผู้ประเมิน</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="luxury-card p-5">
              <p className="text-sm text-slate-500">ผู้ประเมิน</p>
              <p className="text-3xl font-bold text-slate-900">{data.length} คน</p>
            </div>
            <div className="luxury-card p-5">
              <p className="text-sm text-slate-500">คะแนนความง่ายในการใช้งาน (SUS เต็ม 100)</p>
              <p className="text-3xl font-bold text-slate-900">
                {avgSus.toFixed(1)} <span className="text-base font-semibold text-slate-600">· {susGrade(avgSus)}</span>
              </p>
            </div>
          </div>

          <section className="luxury-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">ผลแต่ละภารกิจ</h2>
            <div className="space-y-3">
              {DEMO_TASKS.map((t) => {
                const answered = data.filter((r) => r.tasks[t.key]);
                const pct = (v: string) =>
                  answered.length ? Math.round((answered.filter((r) => r.tasks[t.key] === v).length / answered.length) * 100) : 0;
                return (
                  <div key={t.key} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{t.label}</span>
                    <span className="text-sm text-slate-600">
                      ทำได้ {pct("done")}% · ยาก {pct("hard")}% · ทำไม่ได้ {pct("failed")}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="luxury-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">ความคิดเห็น</h2>
            <div className="space-y-3">
              {data
                .filter((r) => r.liked || r.improve)
                .map((r) => (
                  <div key={r.feedback_id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="mb-1 text-xs text-slate-500">
                      {r.created_at}
                      {r.tester_code && ` · บัตร ${r.tester_code}`} · SUS {r.sus_score}
                    </p>
                    {r.liked && <p><span className="font-semibold text-emerald-700">ชอบ:</span> {r.liked}</p>}
                    {r.improve && <p><span className="font-semibold text-amber-700">ควรปรับปรุง:</span> {r.improve}</p>}
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
