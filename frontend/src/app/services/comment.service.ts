import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Comment } from '../models/comment.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;
 
  // 私有状态
  private commentsSubject$ = new BehaviorSubject<Comment[]>([]);
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  private errorSubject$ = new BehaviorSubject<string | null>(null);

  // 公开的 Observable（只读）
  public comments$ = this.commentsSubject$.asObservable();
  public loading$ = this.loadingSubject$.asObservable();
  public error$ = this.errorSubject$.asObservable();

  constructor(private http: HttpClient) {}

  // 加载所有评论到缓存
  loadComments(filters?: any): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    this.http.get<Comment[]>(this.apiUrl + '/', { params }).subscribe({
      next: (comments) => {
        this.commentsSubject$.next(comments);
        this.loadingSubject$.next(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.errorSubject$.next('Failed to load comments');
        this.loadingSubject$.next(false);
      }
    });
  }

  // 刷新数据
  refreshComments(filters?: any): void {
    this.loadComments(filters);
  }

  // 获取当前缓存的值（同步）
  getCommentsValue(): Comment[] {
    return this.commentsSubject$.getValue();
  }

  // 通过 pipe 按任务ID过滤评论
  getCommentsByTaskId(taskId: number): Observable<Comment[]> {
    return this.comments$.pipe(
      map(comments => comments.filter(comment => comment.task_id === taskId))
    );
  }

  // 通过 pipe 查找单个评论
  getCommentById(id: number): Observable<Comment | undefined> {
    return this.comments$.pipe(
      map(comments => comments.find(comment => comment.id === id))
    );
  }

  // 通过 pipe 按用户ID过滤评论（如果有user_id字段）
  getCommentsByUserId(userId: number): Observable<Comment[]> {
    return this.comments$.pipe(
      map(comments => comments.filter(comment => comment.author_id === userId))
    );
  }

  // ===== 修改操作（同时更新缓存和后端）=====

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl + '/', comment).pipe(
      tap(newComment => {
        const current = this.commentsSubject$.getValue();
        this.commentsSubject$.next([...current, newComment]); // 更新缓存
      })
    );
  }

  updateComment(id: number, comment: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}/`, comment).pipe(
      tap(updatedComment => {
        const current = this.commentsSubject$.getValue();
        const updated = current.map(c => c.id === id ? updatedComment : c);
        this.commentsSubject$.next(updated); // 更新缓存
      })
    );
  }

  deleteCommentById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        const current = this.commentsSubject$.getValue();
        this.commentsSubject$.next(current.filter(c => c.id !== id)); // 更新缓存
      })
    );
  }
}
