import dbConnect from "../configs/dbConnect";
import { loginStatus } from "../enum/aut";
import { RowDataPacket } from "mysql2";
import { loginResponse } from "../dto/aut";

export default async function loginRepo(email: string, password: string): Promise<loginResponse> {
  try {
    const connect = await dbConnect();
    const [emailCheck] = await connect.execute<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
    const [passCheck] = await connect.execute<RowDataPacket[]>("SELECT user_id, email, department, username, role FROM users WHERE password = ? AND email = ?", [password, email]);
    let result: loginStatus;
    let rows: RowDataPacket[] = passCheck;
    if (emailCheck.length > 0) {
      if (passCheck.length > 0) {
        result = loginStatus.pass;
        rows = passCheck;
      } else {
        result = loginStatus.wrongPassword;
        rows = [];
      }
    } else {
      result = loginStatus.emailNotFound;
        rows = [];
    }

    connect.end()
    return {result, rows:rows};
  } catch (error) {
    console.error(error);
    const result = loginStatus.notPass;
    return {result, rows: []};
  }
}
