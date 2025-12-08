import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { Observable, switchMap } from 'rxjs';
import { SrvRecord } from 'dns';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit{
  tasks$!: Observable<Task[]>;
  status: string | null = null;
 
   constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private taskService: TaskService,
  
  ) {}

  ngOnInit() {
      this.tasks$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.status = params.get('status');
        const department = params.get('department');

        if (this.status) {
          return this.taskService.getTasksByStatus(status);
        }

        if (department) {
          return this.taskService.getTasksByDepartment(department);
        }

        // 默认显示全部
        return this.taskService.tasks$;
      })
    );
     
  }  
  viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

}


