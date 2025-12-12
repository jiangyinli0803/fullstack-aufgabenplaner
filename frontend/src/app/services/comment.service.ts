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
 
  // 公开的 Observable（只读）
  public comments$ = this.commentsSubject$.asObservable();
  

  constructor(private http: HttpClient) {}

  // 加载所有评论到缓存
  loadComments(filters?: any): void {  

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
      },
      error: (err) => {
        console.error('Error loading comments:', err);        
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

  // GET /api/comments/?task_id=72 - 根据task_id过滤评论
  getCommentsByTaskId(taskId: number): Observable<Comment[]> {
     const params = new HttpParams().set('task_id', taskId.toString());
     return this.http.get<Comment[]>(this.apiUrl + '/', { params }).pipe(
    tap(comments => this.commentsSubject$.next(comments))
  );
  }

  // GET /api/comments/{id}/ - 获取单个评论
  getCommentById(id: number): Observable<Comment> {
     return this.http.get<Comment>(`${this.apiUrl}/${id}/`);
  }

  // GET /api/comments/?author_id=1 - 按用户ID过滤评论
  getCommentsByAuthorId(authorId: number): Observable<Comment[]> {
    const params = new HttpParams().set('author_id', authorId.toString());
    return this.http.get<Comment[]>(this.apiUrl + '/', { params });
  }

  // ===== 修改操作（同时更新缓存和后端）=====

  createComment(comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl + '/', comment).pipe(
      tap({
      next: (newComment) => {
        const current = this.commentsSubject$.getValue();
        this.commentsSubject$.next([...current, newComment]);
      },
      error: (error) => {
        console.error('Failed to create comment:', error);
        // 不更新缓存
      }
      })
    );
  }

  updateComment(id: number, comment: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}/`, comment).pipe(
    tap({
      next: (updatedComment) => {
        const current = this.commentsSubject$.getValue();
        const updated = current.map(c => c.id === id ? updatedComment : c);
        this.commentsSubject$.next(updated);
      },
      error: (error) => {
        console.error('Failed to update comment:', error);
      }
    }),
    );
  }

  deleteCommentById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
    tap({
      next: () => {
        const current = this.commentsSubject$.getValue();
        this.commentsSubject$.next(current.filter(c => c.id !== id));
      },
      error: (error) => {
        console.error('Failed to delete comment:', error);
      }
    }),
    );
  }
}
