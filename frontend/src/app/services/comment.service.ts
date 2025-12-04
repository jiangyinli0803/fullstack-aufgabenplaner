import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(): Observable<Comment[]> {
      return this.http.get<Comment[]>(this.apiUrl + '/');
    }

   getCommentsByTaskId(taskId?: number): Observable<Comment[]> {
    let params = new HttpParams();
    if (taskId) {
      params = params.set('task_id', taskId.toString());
    }
    return this.http.get<Comment[]>(this.apiUrl + '/', { params });
  }

   createComment(comment: Comment): Observable<Comment> {
      return this.http.post<Comment>(this.apiUrl + '/', comment);
    }
  
    updateComment(id: number, comment: Partial<Comment>): Observable<Comment> {
      return this.http.patch<Comment>(`${this.apiUrl}/${id}/`, comment);
    }
  
    deleteCommentById(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}/`);
    }
}
