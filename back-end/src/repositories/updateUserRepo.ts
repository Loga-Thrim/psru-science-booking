import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { updateStatus } from "../enum/aut";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export default async function updateUsersRepo(user_id: number, email: string, username: string, department: string,role: string, password: string | undefined) {
  try {
    const connect = await dbConnect();
    if (password != undefined) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const [result] = await connect.execute<ResultSetHeader>("UPDATE users SET email = ?, username = ?, department = ?, role = ?, password = ? WHERE user_id = ?",
        [email, username, department, role, hashedPassword, user_id]);
      if (result.affectedRows && result.affectedRows > 0) {
        connect.end();
        return updateStatus.updated;
      } else {
        connect.end();
        return updateStatus.canNotUpdate;
      }
    } else {
      const [result] = await connect.execute<ResultSetHeader>("UPDATE users SET email = ?, username = ?, department = ?, role = ? WHERE user_id = ?",
        [email, username, department, role, user_id ]);
      if (result.affectedRows && result.affectedRows > 0) {
        connect.end();
        return updateStatus.updated;
      } else {
        connect.end();
        return updateStatus.canNotUpdate;
      }
    }
  } catch (err) {
    console.error(err);
    return updateStatus.canNotUpdate;
  }
}
