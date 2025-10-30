import { bookingStatus } from "../enum/booking"
export interface bookingRequest {
  room_id: string,
  date: string,
  start_time: string,
  end_time: string,
  number_of_users: number,
  reservation_type: string,
  reservation_reason: string, 
  phone_number: string,
  user_id: string
}

export interface bookingResponse {
    status: bookingStatus
}