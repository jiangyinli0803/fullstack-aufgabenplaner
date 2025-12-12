import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Comment } from '../../models/comment.model';
import { FormsModule } from '@angular/forms';

import { Location } from '@angular/common';
import { Task, TaskUpdateDTO } from '../../models/task.model';
import { Employee } from '../../models/employee.model';

import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { catchError, finalize, Observable, of, pipe, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import { PriorityLabelPipe } from '../../pipes/priority-label.pipe';

export const AVAILABLE_VERSIONS = ['V1.0','V1.1', 'V1.2','V2.0','V2.1', 'V2.2', 'V3.0','V3.1','V3.2'];

@Component({
  selector: 'app-task-detail',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule, PriorityLabelPipe],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit{

  employees$? : Observable<Employee[]>;
  comments$?: Observable<Comment[]>;  
  private destroy$ = new Subject<void>();

  // 本地状态
  task?: Task;
  selectedEmployee?: Employee | null;
  employees: Employee[] = []
  selectedTester?: Employee | null;
  duration?: number;
  availableVersions = AVAILABLE_VERSIONS;
  
  // 编辑模式
  isEditMode = false;
  editedTask?: Task;
  dateError?: string;
  editedTaskEmployeeId?: number | null;
  editedTaskTesterId: number | null = null;

  // 评论相关
 
  comments: Comment[] = [];  // 评论单独管理
  newCommentText = '';
  editingCommentId?: number | null;
  editingCommentText = '';

  // 当前用户信息（从认证服务获取）
  currentUser = 'Current User'; // TODO: 从 AuthService 获取
  currentUserId = 9; // TODO: 从 AuthService 获取
   
 
  constructor(
   private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private taskService: TaskService,
    private commentService: CommentService,
    private employeeService: EmployeeService,
  ){  
  }


  ngOnInit(): void {
        // 绑定到 async 管道   
   this.employees$ = this.employeeService.employees$; 
     
   this. comments$ = this.commentService.comments$;
  
    // ✅ 1. 加载所有员工（不需要订阅，因为已经在 service 内部处理了）
    this.employeeService.loadEmployees();

    //  监听路由参数变化，获取任务详情
     this.route.paramMap.pipe(      
      switchMap(params => {
        const taskId = Number(params.get('id'));
        console.log('请求任务 ID:', taskId);
        return this.taskService.getTaskById(taskId);
      }),
      catchError(err => {      
        console.error('Error loading task:', err);       
        return of(null);
      }),
      finalize(() => {
         console.log('完成加载，设置 loading = false');        
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (task) => {
        console.log('收到任务数据:...');
        if (task) {
          this.task = task;   //current Task
          this.loadEmployeeInfo();
          this.loadComments(); 
          this.loadTester();
          this.calculateDuration();
        } else {
          console.error('Task not found');
          this.router.navigate(['/tasks']);
        }
      }
    });
  }
        
  // ========== 辅助方法 ==========
  private loadComments(): void {
    if (!this.task?.id) return;

    this.commentService.getCommentsByTaskId(this.task.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (comments) => console.log('Comments loaded:', comments),
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  private loadEmployeeInfo(): void {
    if (this.task?.employee) {
      this.selectedEmployee = this.task?.employee;       
    } else {
      this.selectedEmployee = null;
    }
  }
  
  private loadTester(): void {
    if (this.task?.tester) {
      this.selectedTester = this.task?.tester;       
    } else {
      this.selectedTester = null;
    }
  }

  private calculateDuration(): void {
    if (this.task?.start_date && this.task?.end_date) {
      this.duration =this.taskService.calculateDuration(
        this.task.start_date,
        this.task.end_date
      );
    }
  }
  goBack(){
      if (window.history.length > 1) {
    this.location.back();
  } else {
    // 如果没有历史记录,返回默认列表页
    this.router.navigate(['/tasks']);
  }
    }  
    
     ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
      }

   // ========== 编辑模式 ==========

  enterEditMode(): void {
    if (!this.task) return;
    console.log('Original Task Employee ID:', this.task.employee?.id);
    this.isEditMode = true;
    // 浅拷贝任务对象
    this.editedTask = {...this.task };
    if (this.editedTask.employee) {      
      this.editedTaskEmployeeId = this.editedTask.employee.id; 
    }
    if (this.editedTask.tester) {      
      this.editedTaskTesterId = this.editedTask.tester.id; 
    }      
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editedTask = undefined;
    this.dateError = undefined;
  }

  saveChanges(): void {
    if (!this.editedTask || !this.task) return;

    // 验证日期
    if (this.editedTask.start_date && this.editedTask.end_date) {
      const start = new Date(this.editedTask.start_date);
      const end = new Date(this.editedTask.end_date);
      
      if (end < start) {
        this.dateError = 'Enddatum darf nicht vor dem Startdatum liegen!';
        return;
      }
    }

    // ✅ 关键：将编辑的 employeeId 赋给 editedTask.employeeId      
     /*  this.editedTask!.employee = this.employees.find(e => e.id === this.editedTaskEmployeeId) || null;  
      this.editedTask!.tester = this.employees.find(e => e.id === this.editedTaskTesterId) || null;
 */
    const updateData : TaskUpdateDTO = {
      title: this.editedTask.title,
      description: this.editedTask.description,
      status: this.editedTask.status,
      priority: this.editedTask.priority,
      start_date: this.editedTask.start_date,
      end_date: this.editedTask.end_date,
      version: this.editedTask.version,
      employee_id: this.editedTaskEmployeeId || null,  // ✅ 使用 employee_id
      tester_id: this.editedTaskTesterId || null      // ✅ 使用 tester_id
  };

     // ✅ 调用后端 API 更新任务
    this.taskService.updateTask(this.task.id, updateData)
        .subscribe({
        next: (updatedTask) => {
          console.log('Task updated successfully:', updatedTask);
          
          // 更新本地状态
          this.task = updatedTask;
          this.loadEmployeeInfo();
          this.loadTester();
          this.calculateDuration();
          
          // 退出编辑模式
          this.isEditMode = false;
          this.dateError = undefined;
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('保存失败，请重试');
        }
      });
  }

  updateDuration(): void {
    if (!this.editedTask?.start_date || !this.editedTask?.end_date) {
      this.duration = undefined;
      return;
    }

    const start = new Date(this.editedTask.start_date);
    const end = new Date(this.editedTask.end_date);

    if (end < start) {
      this.dateError = 'Enddatum darf nicht vor dem Startdatum liegen!';
      this.duration = undefined;
    } else {
      this.dateError = undefined;
      this.duration = this.taskService.calculateDuration(
        this.editedTask.start_date,
        this.editedTask.end_date
      );
    }
  }
    // ✅ 添加评论
 addComment(): void {
  if (!this.newCommentText.trim() || !this.task) {
    return;
  }

  const newComment: Partial<Comment> = {
    task_id: this.task.id,   
    text: this.newCommentText,
    author_id: this.currentUserId,   
  };

  this.commentService.createComment(newComment)
     .subscribe({
      next: (comment) => {  // ✅ comment 是完整的 Comment 类型（后端返回）
        this.loadComments();  //加上这个之后，最新的评论能放最前
        console.log('Comment created:', comment);
        this.newCommentText = '';
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        alert('添加评论失败，请重试');
      }
    });
}

    //进入编辑评论模式
  enterEditComment(comment: Comment){
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.text;
  }

  cancelEditComment(){
    this.editingCommentId = null;
    this.editingCommentText = '';
  }
  

     // 保存编辑后的评论
  saveEditComment(commentId: number) {
    if (!this.editingCommentText.trim()) {
      return;
    }

    const updatedData: Partial<Comment> = {
    text: this.editingCommentText
    }      
        
    this.commentService.updateComment(commentId, updatedData)
    .subscribe({
      next: (updatedComment) => {
        console.log('Comment updated:', updatedComment);
             // 退出编辑模式
        this.editingCommentId = null;
        this.editingCommentText = '';

        this.loadComments(); // 重新加载评论，让 UI 反映更新
      },
      error: (err) => {
        console.error('Error updating comment:', err);        
      }
    });
}
  

  // 检查是否是评论作者
  isCommentAuthor(comment: Comment): boolean {
    return comment?.author_id === this.currentUserId;
  }

  // 删除评论
  deleteComment(commentId: number): void {
    if (!confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      return;
    }

    this.commentService.deleteCommentById(commentId)
        .subscribe({
        next: () => {
          console.log('Comment deleted');
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          alert('Kommentar konnte nicht gelöscht werden, bitte versuchen Sie es erneut.');
        }
      });
  }

  //转换成德国日期显示格式
    formatTimestamp(timestamp: string): string {
     // 确保是 Date 对象
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    // 防止无效日期
    if (isNaN(date.getTime())) {
      console.error('Ungültiges Datum:', timestamp);
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`; // 输出格式: '22.10.2025 12:00'
  }

  // 将我的日期格式转换成标准的ISO格式yyyy-MM-dd
  toInputDateFormat(dateStr: string): string {
      if (!dateStr) return '';     
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month}-${day}`;
    }
 
// 创建一个副本用于编辑, 使用对象的展开（Object Spread）语法，可以不影响原数据
 
 
}


