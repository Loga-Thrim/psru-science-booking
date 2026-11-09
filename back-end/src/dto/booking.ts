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
  booker_name: string,
  /** Set only when a signed-in admin books; guests have no account. */
  user_id: string | null,
  equipment_needs?: string,
  caretaker_name?: string
}

export interface bookingResponse {
    status: bookingStatus
}
