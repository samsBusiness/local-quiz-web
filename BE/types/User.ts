export interface Provider {
  type: string;
  providerId: string;
}

export interface User {
  _id?: string;
  email: string;
  name: string;
  providers?: Provider[];
  createdAt?: Date;
  updatedAt?: Date;
}

export enum USER_ROLES {
  QM = "QM",
  SUPER_ADMIN = "SUPER_ADMIN",
}
