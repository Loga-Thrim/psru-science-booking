import type { RowDataPacket, ResultSetHeader } from "mysql2";
import dbConnect from "../configs/dbConnect";
import { registerStatus } from "../enum/aut";

export default async function createUserRepo(email: string, password: string, username: string, department: string, role: string):Promise<registerStatus>{
  try {
    const connect = await dbConnect();
    const [emailRows] = await connect.execute<RowDataPacket[]>("SELECT email FROM users WHERE email = ?;", [email]);
    const [userNameRows] = await connect.execute<RowDataPacket[]>("SELECT username FROM users WHERE username = ?;", [username]);

    if(emailRows.length > 0){
      connect.end()
      return registerStatus.alreadyHaveAcount;
    }else if(userNameRows.length > 0){
      connect.end()
      return registerStatus.alreadyHaveUserName;
    }else {
      await connect.execute<ResultSetHeader>("INSERT INTO users (email, password, username, department, role) VALUES (?, ?, ?, ?, ?)", [email, password, username, department, role]);
      connect.end()
      return registerStatus.pass;
    }
  } catch (error) {
    console.error(error);
    return registerStatus.notPass;
  }
}
