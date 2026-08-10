export enum bookingStatus {
    success,
    fail,
    roomNotFound,
    roomUnavailable,
    invalidTimeRange,
    pastDate,
    dayNotAllowed,
    outsideOpeningHours,
    overCapacity,
    tooFarAhead,
    conflict,
    invalidInput
}

export enum reservationState {
    pending = "pending",
    adminApproved = "adminApproved",
    approverApproved = "approverApproved",
    rejected = "rejected"
}
