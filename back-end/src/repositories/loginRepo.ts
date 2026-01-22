import dbConnect from "../configs/dbConnect";
import { loginStatus } from "../enum/aut";
import { RowDataPacket } from "mysql2";
import { loginResponse } from "../dto/aut";
import bcrypt from "bcrypt";

export default async function loginRepo(email: string, password: string): Promise<loginResponse> {
  try {
    const connect = await dbConnect();
    const [userRows] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id, email, department, username, role, password FROM users WHERE email = ?", 
      [email]
    );
    
    let result: loginStatus;
    let rows: RowDataPacket[] = [];
    
    if (userRows.length === 0) {
      result = loginStatus.emailNotFound;
    } else {
      const user = userRows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        result = loginStatus.pass;
        rows = [{
          user_id: user.user_id,
          email: user.email,
          department: user.department,
          username: user.username,
          role: user.role
        }] as RowDataPacket[];
      } else {
        result = loginStatus.wrongPassword;
      }
    }

    connect.end();
    return { result, rows };
  } catch (error) {
    console.error(error);
    return { result: loginStatus.notPass, rows: [] };
  }
}
