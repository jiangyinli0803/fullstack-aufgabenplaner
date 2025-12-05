import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  // 私有状态
  private employeeSubject$ = new BehaviorSubject<Employee[]>([]); //BehaviorSubject--RxJS Subject，能存储最新值
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  // 公开的 Observable（只读）
  public employees$ = this.employeeSubject$.asObservable();
  public loading$ = this.loadingSubject$.asObservable();
  public error$ = this.errorSubject$.asObservable();

  constructor(private http: HttpClient) {}

  // 加载所有任务到缓存
  loadEmployees(filters?: any): void {
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

      this.http.get<Employee[]>(this.apiUrl + '/', { params }).subscribe({ 
        next: (employees) => {
          this.employeeSubject$.next(employees); //将获取到的任务数组保存到缓存（BehaviorSubject）
          this.loadingSubject$.next(false);
        },
        error: (err) => {
          console.error('Error loading employees:', err);
          this.errorSubject$.next('Failed to load employees');
          this.loadingSubject$.next(false);
        }
      });
  }

  // 获取当前缓存的值（同步）, 不会跟着实时更新
  getEmployeesValue(): Employee[] {
      return this.employeeSubject$.getValue();
  }

  // 通过 pipe 查找
  getEmployeeById(id: number): Observable<Employee | undefined> {
    return this.employees$.pipe(
      map(employees => employees.find(employee => employee.id === id))
    );
  }

  //调用后端接口创建任务（POST）
    createEmployee(employee: Employee): Observable<Employee> {  
    return this.http.post<Employee>(this.apiUrl + '/', employee).pipe(
      tap(newEmployee => {
        const current = this.employeeSubject$.getValue();
        this.employeeSubject$.next([...current, newEmployee]); // 更新缓存
      })
    );
  }
  
    updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
     return this.http.patch<Employee>(`${this.apiUrl}/${id}/`, employee).pipe(
      tap(updatedEmployee => {
        const current = this.employeeSubject$.getValue();
        const updated = current.map(emp => emp.id === id ? updatedEmployee : emp);
        this.employeeSubject$.next(updated); // 更新缓存
      })
    );
    }
  
    deleteEmployeeById(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        const current = this.employeeSubject$.getValue();
        this.employeeSubject$.next(current.filter(emp => emp.id !== id)); // 更新缓存
      })
    );
  }

}
  

