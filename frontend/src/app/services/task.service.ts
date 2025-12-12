import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Task, TaskUpdateDTO } from '../models/task.model';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  // 私有状态
  private tasksSubject$ = new BehaviorSubject<Task[]>([]); //BehaviorSubject--RxJS Subject，能存储最新值
  private loadingSubject$ = new BehaviorSubject<boolean>(false); //xxx$表示可观察对象（Observable）,可观察数据流
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  // 公开的 Observable（只读）
  public tasks$ = this.tasksSubject$.asObservable();
  public loading$ = this.loadingSubject$.asObservable();
  public error$ = this.errorSubject$.asObservable();

  constructor(private http: HttpClient) {}

  // 加载所有任务到缓存
  loadTasks(filters?: any): void {
      this.loadingSubject$.next(true); //设置初始状态：进入加载中，清空错误
      this.errorSubject$.next(null);

      let params = new HttpParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params = params.set(key, filters[key]);
          }
        });
      }

      this.http.get<Task[]>(this.apiUrl + '/', {params}).subscribe({ 
        next: (tasks) => {
          this.tasksSubject$.next(tasks); //将获取到的任务数组保存到缓存（BehaviorSubject）
          this.loadingSubject$.next(false);
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
          this.errorSubject$.next('Failed to load tasks');
          this.loadingSubject$.next(false);
        }
      });
  }

  refreshTasks(filters?: any): void {
  this.loadTasks(filters);
}

  // 获取当前缓存的值（同步）, 不会跟着实时更新
  getTasksValue(): Task[] {
      return this.tasksSubject$.getValue();
  }

  // 🔥 改为直接调用后端 API
getTasksByStatus(status: string): Observable<Task[]> {
  return this.http.get<Task[]>(`${this.apiUrl}/status/${status}/`).pipe(
    catchError(err => {
      console.error('Error loading tasks by status:', err);
      return of([]);
    })
  );
}

  statusCounts$ = this.tasks$.pipe(
    map(tasks => ({
      'nicht_zugewiesen': tasks.filter(t => t.status === 'nicht_zugewiesen').length,
      'offen': tasks.filter(t => t.status === 'offen').length,
      'abgeschlossen': tasks.filter(t => t.status === 'abgeschlossen').length,
      'archiviert': tasks.filter(t => t.status === 'archiviert').length
    }))
  );

  getTasksByDepartment(department: string): Observable<Task[]> {
  return this.http.get<Task[]>(`${this.apiUrl}/department/${department}/`).pipe(
    catchError(err => {
      console.error('Error loading tasks by department:', err);
      return of([]);
    })
  );
}
  
  getTaskById(id: number): Observable<Task> {
  return this.http.get<Task>(`${this.apiUrl}/${id}/`);
}

  // 通过 pipe 过滤任务（按员工）
  getTasksByEmployee(employeeId: number): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.employee?.id === employeeId))
    );

  }
  //调用后端接口创建任务（POST）
  createTask(task: Task): Observable<Task> {  
  return this.http.post<Task>(this.apiUrl + '/', task).pipe(
    tap(newTask => {   //后端返回的任务数据（newTask）与传入的 task 不完全一样
      const current = this.tasksSubject$.getValue();
      this.tasksSubject$.next([...current, newTask]); // 更新缓存
    })
  );
}

updateTask(id: number, taskDto: Partial<Task> | TaskUpdateDTO): Observable<Task> {
  return this.http.patch<Task>(`${this.apiUrl}/${id}/`, taskDto).pipe(
    tap(updatedTask => {
      const current = this.tasksSubject$.getValue();
      const index = current.findIndex(t => t.id === id);
      if (index !== -1) {
        current[index] = updatedTask;
        this.tasksSubject$.next([...current]); // 更新缓存
      }
    })
  );
}

  deleteTaskById(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
    tap(() => {
      const current = this.tasksSubject$.getValue();
      this.tasksSubject$.next(current.filter(t => t.id !== id)); // 更新缓存
    })
  );
}

  // 灵活解析日期（支持两种格式，内部统一处理）
private parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  let date: Date;

  if (dateStr.includes('.')) {
    // 格式: DD.MM.YYYY
    const [day, month, year] = dateStr.split('.').map(Number);
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    // 格式: YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

  // 计算天数差异
  calculateDuration(startDate:string, endDate: string): number | undefined {
    if (!startDate || !endDate) {
      return;
    }

    const start = this.parseFlexibleDate(startDate);
    const end = this.parseFlexibleDate(endDate);

    if (!start || !end) {
      console.error('Ungültiges Datumsformat:', { startDate, endDate });
      return;
    }
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays+1 : undefined;  // ✅ 修复：同一天应该返回 1
  }
  
}
