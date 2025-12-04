import { Employee } from "./employee";
import { Priority } from "./priority";


export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  start_date: string;
  end_date: string; 
  employee?: Employee|null; 
  tester?: Employee|null; 
  created_by?: Employee|null; 
  updated_by?: Employee|null; 
  comments: Comment|null;
  version?: string;
  status_color: string;
  is_overdue: boolean;
  created_at?: string;
  updated_at?: string;
}
