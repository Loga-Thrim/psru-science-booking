export enum position {
  user,
  admin,
  manager
}

export enum loginStatus {
  pass = 1,
  notPass,
  wrongPassword,
  emailNotFound,
  // notVerify,
}

export enum registerStatus {
  notPass = 1,
  pass,
  alreadyHaveAcount,
  alreadyHaveUserName,
}

export enum deleteStatus {
  deleted,
  canNotDelete,
}

export enum updateStatus {
  updated,
  canNotUpdate,
  notFound,
  duplicateEmail,
  duplicateUserName,
  duplicateRoomCode,
}

export enum createRoomStatus {
  created,
  canNotCreate,
  errorRoomCode,
}
