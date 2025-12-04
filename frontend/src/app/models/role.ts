export interface Role {
  value: string;
  label: string;
}

export const ROLE_CHOICES: Role[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];