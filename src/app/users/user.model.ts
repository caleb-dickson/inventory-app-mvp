export class User {
  _id: string | null;
  userId: string | null;
  email: string;
  password: string | null;
  userProfile: {
    role: number;
    department: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    themePref: string | null;
    userPhoto: string | null;
  };
  resetToken?: String;
  resetTokenExpiration?: Date;

  constructor(
    _id: string | null,
    userId: string | null,
    email: string,
    password: string,
    userProfile: {
      role: number,
      department: string,
      firstName: string,
      lastName: string,
      phoneNumber: string,
      themePref: string | null,
      userPhoto: string | null
    },
    resetToken?: String | null,
    resetTokenExpiration?: Date | null,
  ) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.userProfile = userProfile;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }


}
