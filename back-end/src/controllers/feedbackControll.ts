import { Request, Response } from "express";
import { listFeedback, saveFeedback, TaskResult } from "../repositories/feedbackRepo";

/** The demo tasks a tester reports on. Unknown keys are dropped. */
const TASK_KEYS = ["book", "conflict", "status", "cancel"];
const TASK_RESULTS: TaskResult[] = ["done", "hard", "failed"];
const MAX_TEXT = 1000;

/**
 * Standard System Usability Scale score (0-100). Odd-numbered statements are
 * positive (score = answer - 1), even-numbered ones negative (score = 5 - answer).
 * Computed here rather than trusted from the client.
 */
export function susScore(answers: number[]): number {
  const sum = answers.reduce((acc, a, i) => acc + (i % 2 === 0 ? a - 1 : 5 - a), 0);
  return sum * 2.5;
}

function text(input: unknown): string {
  return typeof input === "string" ? input.trim().slice(0, MAX_TEXT) : "";
}

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { tester_code, sus_answers, tasks, liked, improve } = req.body ?? {};

    if (
      !Array.isArray(sus_answers) ||
      sus_answers.length !== 10 ||
      !sus_answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5)
    ) {
      return res.status(400).json({ message: "กรุณาตอบแบบประเมินให้ครบทั้ง 10 ข้อ" });
    }

    const cleanTasks: Record<string, TaskResult> = {};
    if (tasks && typeof tasks === "object") {
      for (const key of TASK_KEYS) {
        const value = (tasks as Record<string, unknown>)[key];
        if (TASK_RESULTS.includes(value as TaskResult)) cleanTasks[key] = value as TaskResult;
      }
    }

    await saveFeedback({
      tester_code: text(tester_code).slice(0, 20) || null,
      sus_answers,
      sus_score: susScore(sus_answers),
      tasks: cleanTasks,
      liked: text(liked),
      improve: text(improve),
    });
    return res.status(201).json({ message: "ขอบคุณสำหรับการประเมิน" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}

export async function getFeedback(_req: Request, res: Response) {
  try {
    return res.status(200).json(await listFeedback());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
