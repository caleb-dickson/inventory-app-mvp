import { Location } from "../inventory-app/models/location.model";

export class User {
  id: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  email: string;
  password: string | null;
  resetToken: String | null = null;
  resetTokenExpiration: Date | null = null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: number;
  department: string;
  photo: string | null;
  themePref: string | null;
  managerAt: Location[];
  staffAt: Location[]

  constructor(
    id: string | null,
    createdAt: number | null,
    updatedAt: number | null,
    email: string,
    password: string | null,
    resetToken: String | null,
    resetTokenExpiration: Date | null,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role: number,
    department: string,
    photo: string | null,
    themePref: string | null,
    managerAt: Location[],
    staffAt: Location[]
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.email = email;
    this.password = password;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.role = role;
    this.department = department;
    this.photo =  photo;
    this.themePref =  themePref;
    this.managerAt = managerAt;
    this.staffAt = staffAt;
  }
}
