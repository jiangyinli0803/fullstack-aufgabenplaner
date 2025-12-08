import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-overview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './overview-list.html',
  styleUrl: './overview-list.css',
})
export class OverviewList {
  tasks$!: Observable<Task[]>; //xxx$表示可观察对象（Observable）,可观察数据流
  employees$!: Observable<Employee[]>;
  loading$! : Observable<boolean>;
  error$! : Observable<string|null>;
  // ✅ 改为 Observable,自动响应 tasks$ 的变化
  tasksWithDuration$!: Observable<(Task & {duration?: number})[]>;//重新定义一个组合数组
  departments$!: Observable<string[]>; 
  
  selectedDepartment: string = 'alle'; 

  constructor( 
    private router: Router,  
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.taskService.loadTasks(); // 触发加载
    this.employeeService.loadEmployees();

    this.tasks$ = this.taskService.tasks$;//加载所有任务
    this.employees$ = this.employeeService.employees$;
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;     

    this.departments$ = this.employees$.pipe(
      map(employees => [
        'alle',
        ...new Set(employees.map(e => e.department))
      ])
    );   

    this.combineTasksWithDuration()     
  }   

  private combineTasksWithDuration() {
     this.tasksWithDuration$ = this.tasks$.pipe(
      map(tasks => tasks.map(task => ({
        ...task,
        duration: this.taskService.calculateDuration(
          task.start_date, 
          task.end_date
        )
      })))
    );      
  }
      
   viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

}
