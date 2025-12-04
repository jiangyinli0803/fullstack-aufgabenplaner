import { Role } from "./role";

export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  full_name: string;
  role: Role;
  department: string;
  is_active: boolean;
}
