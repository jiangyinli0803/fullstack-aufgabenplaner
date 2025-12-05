import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './overview-list.html',
  styleUrl: './overview-list.css',
})
export class OverviewList {
   tasks$!: Observable<Task[]>;
    employees$!: Observable<Employee[]>;
    loading$! : Observable<boolean>;
    error$! : Observable<string|null>;
  
  selectedDepartment: string = 'alle';
  departments: string[] = [];
 //重新定义一个组合数组
  tasksWithDuration: (Task & {duration?:number;})[] = [];

  constructor( 
    private router: Router,  
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
  this.tasks$ = this.taskService.tasks$;//xxx$表示可观察对象（Observable）,可观察数据流
    this.employees$ = this.employeeService.employees$;
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;  
    

    this.taskService.loadTasks(); // 触发加载
    this.employeeService.loadEmployees();

    this.departments = [
      'alle',
      ...new Set(this.employees.map(e => e.department))
    ];

    this.combineTasksWithDuration();
       
  }

   

  private combineTasksWithDuration() {
       // ✅ 关键:将 map 的结果赋值给变量
      this.tasksWithDuration = this.tasks.map(task => {
        const duration =this.taskService.calculateDuration(task.start_date, task.end_date);

        // 🔍 调试：检查哪些任务 duration 为空
        if (duration === undefined) {
          console.log('Duration 计算失败:', task);
        }
      
        return {
          ...task,
          duration     
        };
    });
  }
      
   viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

}
