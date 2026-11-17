import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

export type TaskResult = "done" | "hard" | "failed";

export interface FeedbackInput {
  tester_code: string | null;
  sus_answers: number[];
  sus_score: number;
  tasks: Record<string, TaskResult>;
  liked: string;
  improve: string;
}

export async function saveFeedback(f: FeedbackInput): Promise<void> {
  const connect = await dbConnect();
  try {
    await connect.execute(
      `INSERT INTO feedback (tester_code, sus_answers, sus_score, tasks, liked, improve)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [f.tester_code, JSON.stringify(f.sus_answers), f.sus_score, JSON.stringify(f.tasks), f.liked, f.improve]
    );
  } finally {
    connect.end();
  }
}

export async function listFeedback(): Promise<RowDataPacket[]> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>(
      `SELECT feedback_id, tester_code, sus_answers, sus_score, tasks, liked, improve,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM feedback ORDER BY created_at DESC`
    );
    return rows;
  } finally {
    connect.end();
  }
}
