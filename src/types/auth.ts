export interface AuthUser {
  id: string;
  email: string | null;
  role: string;
  displayName: string;
  fullName: string | null;
  patientId: string | null;
  doctorId: string | null;
}
