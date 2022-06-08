export class User {
  userId: string | null;
  email: string;
  password: string;
  userProfile: {
    role: number;
    department: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    themePref: string | null;
  };

  constructor(
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
    },
  ) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.userProfile = userProfile;
  }


}
