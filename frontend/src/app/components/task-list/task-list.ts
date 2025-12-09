import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { map, Observable, switchMap } from 'rxjs';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CommonModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit{
  tasks$!: Observable<Task[]>;
  currentStatus$!: Observable<string | null>;
  currentDepartment$!: Observable<string | null>;
 
   constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private taskService: TaskService,
  
  ) {}

  ngOnInit() {
      // ✅ 创建独立的 Observable
    this.currentStatus$ = this.route.paramMap.pipe(
      map(params => params.get('status'))
    );

    this.currentDepartment$ = this.route.paramMap.pipe(
      map(params => params.get('department'))
    );
    
      this.tasks$ = this.route.paramMap.pipe(
      switchMap(params => {
        const status = params.get('status');
        const department = params.get('department');

        if (status) {
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


