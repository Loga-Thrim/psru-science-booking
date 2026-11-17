/**
 * The usability questionnaire used for demo sessions.
 *
 * SUS (System Usability Scale): ten fixed statements, answered 1-5. Odd ones
 * are positive, even ones negative; the server turns them into the standard
 * 0-100 score. The order must not change, or old scores stop being comparable.
 */
export const SUS_STATEMENTS = [
  "ฉันคิดว่าอยากใช้ระบบนี้บ่อยๆ",
  "ระบบนี้ซับซ้อนเกินความจำเป็น",
  "ระบบนี้ใช้งานง่าย",
  "ฉันคิดว่าต้องมีคนช่วยถึงจะใช้ระบบนี้ได้",
  "ส่วนต่างๆ ของระบบทำงานเข้ากันได้ดี",
  "ระบบนี้มีส่วนที่ไม่สอดคล้องกันมากเกินไป",
  "ฉันคิดว่าคนส่วนใหญ่จะเรียนรู้วิธีใช้ระบบนี้ได้เร็ว",
  "ระบบนี้ใช้งานยุ่งยาก",
  "ฉันรู้สึกมั่นใจตอนใช้ระบบนี้",
  "ฉันต้องเรียนรู้หลายอย่างก่อนจะใช้ระบบนี้ได้",
];

/** The demo tasks, in the order the task sheet lists them. Keys match the API. */
export const DEMO_TASKS = [
  { key: "book", label: "จองห้อง" },
  { key: "conflict", label: "ดูว่าช่วงเวลาไหนมีคนจองแล้ว" },
  { key: "status", label: "ดูสถานะการจองด้วยเบอร์โทร" },
  { key: "cancel", label: "ยกเลิกการจอง" },
] as const;

export const TASK_RESULTS = [
  { value: "done", label: "ทำได้" },
  { value: "hard", label: "ทำได้แต่ยาก" },
  { value: "failed", label: "ทำไม่ได้" },
] as const;

export type TaskResult = (typeof TASK_RESULTS)[number]["value"];

/** Rough reading of a SUS score: 68 is the usual average across systems. */
export function susGrade(score: number): string {
  if (score >= 80.3) return "ดีมาก";
  if (score >= 68) return "ดี (สูงกว่าค่าเฉลี่ย)";
  if (score >= 51) return "พอใช้ (ต่ำกว่าค่าเฉลี่ย)";
  return "ควรปรับปรุง";
}
