export interface UserProfilesType {
  id: string;
  name: string;
  role: "siswa" | "admin" | "superadmin";
  email: string;
}
