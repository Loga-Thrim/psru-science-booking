import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { deleteStatus } from "../enum/aut";
export default async function deleteUsersRepo(id: number) {
  try {
    const connect = await dbConnect();
    const [result] = await connect.execute<ResultSetHeader>("DELETE FROM users WHERE user_id = ?", [id]);

    if (result.affectedRows && result.affectedRows > 0) {
      connect.end();
      return deleteStatus.deleted;
    } else {
      connect.end();
      return deleteStatus.canNotDelete;
    }
  } catch (err) {
    console.log(err);
    return deleteStatus.canNotDelete;
  }
}
