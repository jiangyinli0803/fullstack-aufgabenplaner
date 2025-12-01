import { UserComment } from "./userComment.model";


export interface Task{
  id: number;
  title:string;
  description?: string;
  status: string;
  startDate: string;
  endDate:string;  
  color: string;
  employeeId?: number;
  comments?: UserComment[];
  testerId?: number;
  version?:string
}