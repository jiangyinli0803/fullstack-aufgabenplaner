import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { BehaviorSubject, catchError, debounceTime, delay, distinctUntilChanged, finalize, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';


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

  //  新增: 加载状态和错误处理
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);
  private destroy$ = new Subject<void>();
  
   constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private taskService: TaskService,
  
  ) {}

  ngOnInit() {

      // ✅ 创建独立的 Observable
    this.currentStatus$ = this.route.paramMap.pipe(
      map(params => params.get('status')),
      takeUntil(this.destroy$)
    );

    this.currentDepartment$ = this.route.paramMap.pipe(
      map(params => params.get('department')),
      takeUntil(this.destroy$)
    );
    
    this.tasks$ = this.route.paramMap.pipe(
      map(pm => ({
        status: pm.get('status'),
        department: pm.get('department')
      })),
      debounceTime(0),
      distinctUntilChanged((a, b) =>
        a.status === b.status && a.department === b.department
      ),   
     
      tap(()=>{
         console.log('TRACE: 1. tasks$ 流开始执行，设置 loading=true');
        this.loading$.next(true); 
        this.error$.next(null);

      }),     
      
      switchMap(({ status, department })  => {          
      let dataObservable: Observable<Task[]>;   
      if (status) {
            console.log('TRACE: 3a. 走 HTTP (status) 分支');
            dataObservable = this.taskService.getTasksByStatus(status);
        } else if (department) {
            console.log('TRACE: 3b. 走 HTTP (department) 分支');
            dataObservable = this.taskService.getTasksByDepartment(department);
        } else {
            // 默认分支：手动关闭 loading，只取 Subject 的第一个值
            console.log('TRACE: 3c. 走默认 (Subject) 分支');
            this.loading$.next(false);
            return this.taskService.tasks$.pipe(take(1)); 
        }

        // 🔥 关键修复：将错误和完成处理直接绑定到 HTTP Observable 上
        return dataObservable.pipe(
            catchError(error => {
                console.error('TRACE: 4. 捕获到错误！设置 loading=false', error);
                this.error$.next('Der Ladevorgang ist fehlgeschlagen.');
                this.loading$.next(false); // 错误时关闭 loading
                return of([]); 
            }),
            finalize(() => {
                console.log('TRACE: 5. HTTP 请求完成/错误，设置 loading=false');
                this.loading$.next(false); // 无论成功失败都关闭 loading
            })
        );
        }),
      takeUntil(this.destroy$)   

    );
    // status加载为空页的问题》XHR/Fetch 为空，说明 tasks$ 流根本没有被模板的 | async 管道激活（订阅）。loading immer true.
   
  }  

  viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

// 清理订阅
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


