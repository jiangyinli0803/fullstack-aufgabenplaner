import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit{
  status!: string;
  tasks: Task[] = [];
  employees: Employee[] = [];
 
  //重新定义一个组合数组
  tasksWithEmployeesAndDuration: (Task & {duration?:number; employeeName?: string; employeeDepartment?: string })[] = [];

   constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    // 先加载员工数据
    this.employees = this.employeeService.getCurrentEmployees();
    
     // 然后订阅路由参数
    this.route.paramMap.subscribe(params => {
      this.status = params.get('status')!;
      this.loadTasks();
      this.combineTasksWithEmployeesAndDuration();
    });
   
  }

  loadTasks() {
     this.tasks = this.taskService.getTasksByStatus(this.status);
    };

  private combineTasksWithEmployeesAndDuration() {
       // ✅ 关键:将 map 的结果赋值给变量
      this.tasksWithEmployeesAndDuration = this.tasks.map(task => {
      const employee = this.employees.find(e => e.id === task.employeeId);
      const duration1 =this.taskService.calculateDuration(task.startDate, task.endDate);
      return {
        ...task,
        duration: duration1||undefined,
        employeeName: employee?.name || '-',
        employeeDepartment: employee?.department || '-'
      };
    });
  }

  viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

}


