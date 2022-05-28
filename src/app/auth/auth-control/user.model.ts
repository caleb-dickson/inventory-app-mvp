export class User {
  userId: string | null;
  email: string;
  password: string;
  userProfile: {
    role: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    themePref: string | null;
    business: string | null;
    // ^^^ OWNERS ONLY ^^^
    userLocationId: string | null;
    // ^^^ NOT FOR OWNERS. ^^^ LOCATION DOC ID WHERE THIS USER HAS ACCESS
  };

  constructor(
    userId: string | null,
    email: string,
    password: string,
    userProfile: {
      role: number,
      firstName: string,
      lastName: string,
      phoneNumber: string,
      themePref: string | null,
      business: string | null,
      userLocationId: string | null
    },
  ) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.userProfile = userProfile;
  }


}
