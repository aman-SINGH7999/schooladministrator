import { Types } from "mongoose";

export type UserRole =
  | "super_admin"
  | "admin"
  | "school_admin"
  | "teacher"
  | "student"
  | "staff";

export interface IUser {
  _id?: Types.ObjectId | string;
  schoolId?: Types.ObjectId;
  name: string;
  email?: string;
  rollNo?: string; // only for students
  password?: string;
  role: UserRole;
  resetOtp?: string;
  lastLogin?: Date;
  isActive?: boolean;

  // Profile (common)
  profile?: {
    avatar?: string;
    phone?: string;
    gender?: "male" | "female" | "other";
  };

  // Student fields
  student?: {
    class?: string;
    section?: string;
    admissionNo?: string;
    dob: Date;
  };

  // Teacher fields
  teacher?: {
    moreInfo?: string;
    subjectSpecialization?: string[];
  };

  // Staff fields
  staff?: {
    moreInfo?: string;
    department?: string;
  };
}
