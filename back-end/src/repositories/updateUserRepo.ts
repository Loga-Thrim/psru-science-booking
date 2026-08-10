import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { updateStatus } from "../enum/aut";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export default async function updateUsersRepo(user_id: string, email: string, username: string, department: string, role: string, password: string | undefined) {
  const connect = await dbConnect();
  try {
    const [existing] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );
    if (existing.length === 0) return updateStatus.notFound;

    // Check uniqueness ourselves so the caller gets 409 instead of a raw driver error.
    const [emailClash] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ?",
      [email, user_id]
    );
    if (emailClash.length > 0) return updateStatus.duplicateEmail;

    const [nameClash] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE username = ? AND user_id <> ?",
      [username, user_id]
    );
    if (nameClash.length > 0) return updateStatus.duplicateUserName;

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await connect.execute<ResultSetHeader>(
        "UPDATE users SET email = ?, username = ?, department = ?, role = ?, password = ? WHERE user_id = ?",
        [email, username, department, role, hashedPassword, user_id]
      );
    } else {
      await connect.execute<ResultSetHeader>(
        "UPDATE users SET email = ?, username = ?, department = ?, role = ? WHERE user_id = ?",
        [email, username, department, role, user_id]
      );
    }

    // affectedRows is 0 when the submitted values match what is already stored,
    // which is still a successful update from the caller's point of view.
    return updateStatus.updated;
  } catch (err) {
    console.error(err);
    return updateStatus.canNotUpdate;
  } finally {
    connect.end();
  }
}
