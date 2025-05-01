export interface UserProfilesType {
  id: number;
  name: string;
  role: "siswa" | "admin" | "superadmin";
  email: string;
}

