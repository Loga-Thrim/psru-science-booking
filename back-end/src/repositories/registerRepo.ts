import type { RowDataPacket, ResultSetHeader } from "mysql2";
import dbConnect from "../configs/dbConnect";
import { registerStatus } from "../enum/aut";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export default async function registerRepo(email: string, password: string, username: string, department: string):Promise<registerStatus>{
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
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await connect.execute<ResultSetHeader>("INSERT INTO users (email, password, username, department) VALUES (?, ?, ?, ?)", [email, hashedPassword, username, department]);
      connect.end()
      return registerStatus.pass;
    }
  } catch (error) {
    console.error(error);
    return registerStatus.notPass;
  }
}
