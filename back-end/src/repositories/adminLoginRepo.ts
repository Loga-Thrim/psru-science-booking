import {RowDataPacket} from "mysql2"
import dbConnect from "../configs/dbConnect";
export default async function adminLoginRepo(email:string, password:string):Promise<boolean>{
  try {
    const connect = await dbConnect();
    const [res] = await connect.execute<RowDataPacket[]>("SELECT * FROM admin WHERE username = ? AND password = ?",[email, password]);
    if(res.length > 0){
      return true;
    }else {
      return false;
    }

  }catch(err){
    console.error(err);
    return false;
  }
}