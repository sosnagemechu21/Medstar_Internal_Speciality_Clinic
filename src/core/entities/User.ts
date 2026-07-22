export interface UserEntity {
  id?: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
}

export interface PatientProfileInput {
  firstNameEn: string;
  lastNameEn: string;
  firstNameAm: string;
  lastNameAm: string;
  gender: string;
  dateOfBirth: Date;
}