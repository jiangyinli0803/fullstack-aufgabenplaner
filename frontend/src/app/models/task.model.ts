import { Employee } from "./employee.model";
import { Priority, PriorityKey } from "./priority";
import { StatusKey } from "./status";
import { Comment } from "./comment.model";


export interface Task {
  id: number;
  title: string;
  description: string;
  status: StatusKey;
  priority: PriorityKey;
  start_date: string;
  end_date: string; 
  employee?: Employee|null; 
  tester?: Employee|null; 
  created_by?: Employee|null; 
  updated_by?: Employee|null; 
  comments: Comment[]|null;
  version?: string;
  status_color: string;
  is_overdue: boolean;
  created_at?: string;
  updated_at?: string;
}

// ✅ POST/PATCH 请求体
export interface TaskUpdateDTO {
  title?: string;
  description?: string;
  status?: StatusKey;
  priority?: PriorityKey;
  start_date?: string;
  end_date?: string;
  employee_id?: number | null;  // ✅ 对应后端的 write_only 字段
  tester_id?: number | null;    // ✅ 对应后端的 write_only 字段
 // created_by?: number | null; 
  //updated_by?: number | null; 
  version?: string;
}
 