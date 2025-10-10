import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { updateStatus } from "../enum/aut";
export default async function updateUsersRepo(user_id: number, email: string, username: string, department: string,role: string, password: string | undefined) {
  try {
    const connect = await dbConnect();
    if (password != undefined) {
      const [result] = await connect.execute<ResultSetHeader>("UPDATE users SET email = ?, username = ?, department = ?, password = ? WHERE user_id = ?", [email, username, department, password, user_id]);
      if (result.affectedRows && result.affectedRows > 0) {
        connect.end();
        return updateStatus.updated;
      } else {
        connect.end();
        return updateStatus.canNotUpdate;
      }
    } else {
      const [result] = await connect.execute<ResultSetHeader>("UPDATE users SET email = ?, username = ?, department = ? WHERE user_id = ?", [email, username, department, user_id ]);
      if (result.affectedRows && result.affectedRows > 0) {
        connect.end();
        return updateStatus.updated;
      } else {
        connect.end();
        return updateStatus.canNotUpdate;
      }
    }
  } catch (err) {
    console.log(err);
    return updateStatus.canNotUpdate;
  }
}
