import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Location } from '@angular/common';
import { Task } from '../../models/task.model';
import { Employee } from '../../models/employee.model';
import { Comment } from '../../models/comment.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { Observable, switchMap } from 'rxjs';
import { CommentService } from '../../services/comment.service';

export const AVAILABLE_VERSIONS = ['v1.0','v1.1', 'v1.2','v2.0','v2.1', 'v2.2', 'v3.0','v3.1','v3.2'];

@Component({
  selector: 'app-task-detail',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit{
  // 响应式数据流
  task$!: Observable<Task | undefined>;
  employees$!: Observable<Employee[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  // 本地状态
  task?: Task;
  employee?: Employee;
  selectedTester?: Employee;
  duration?: number;
  
  // 编辑模式
  isEditMode = false;
  editedTask?: Task;
  dateError?: string;

  // 评论相关
  comments: Comment[] = [];  // 评论单独管理
  newCommentText = '';
  editingCommentId?: number;
  editingCommentText = '';

  // 当前用户信息（从认证服务获取）
  currentUser = 'Current User'; // TODO: 从 AuthService 获取
  currentUserId = 123; // TODO: 从 AuthService 获取
  destroy$: any;

  constructor(
   private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private taskService: TaskService,
     private commentService: CommentService,
    private employeeService: EmployeeService
  ){}

  ngOnInit(): void {
     // 1️⃣ 确保数据已加载
    this.taskService.loadTasks();
    this.employeeService.loadEmployees();

    // 2️⃣ 获取响应式数据流
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;
    this.employees$ = this.employeeService.employees$;

    // 3️⃣ 监听路由参数变化，获取任务详情
    this.route.paramMap.pipe(
      switchMap(params => {
        const taskId = Number(params.get('id'));
        return this.taskService.getTaskById(taskId);
      })
      
    ).subscribe({
      next: (task) => {
        if (task) {
          this.task = task;
          this.loadEmployeeInfo();
          this.loadComments(); 
          this.loadTester();
          this.calculateDuration();
        } else {
          console.error('Task not found');
          this.router.navigate(['/tasks']);
        }
      },
      error: (err) => {
        console.error('Error loading task:', err);
      }
    });
  }
  
      ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
      }
  // ========== 辅助方法 ==========
  private loadComments(): void {
    if (!this.task?.id) return;

    this.commentService.getCommentsByTaskId(this.task.id)
        .subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (err) => {
          console.error('Error loading comments:', err);
        }
      });
  }

  private loadEmployeeInfo(): void {
    if (this.task?.employee?.id) {
      this.employeeService.getEmployeeById(this.task.employee.id)
          .subscribe(employee => {
          this.employee = employee;
        });
    }
  }

  private loadTester(): void {
    if (this.task?.tester?.id) {
      this.employeeService.getEmployeeById(this.task.tester.id)       
        .subscribe(tester => {
          this.selectedTester = tester;
        });
    } else {
      this.selectedTester = undefined;
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
      this.location.back();
    }

   // ========== 编辑模式 ==========

  enterEditMode(): void {
    if (!this.task) return;
    
    this.isEditMode = true;
    // 深拷贝任务对象
    this.editedTask = JSON.parse(JSON.stringify(this.task));
    
    // 转换日期格式为 input[type="date"] 需要的格式 (yyyy-MM-dd)
    if (this.editedTask?.start_date) {
      this.editedTask.start_date = this.toInputDateFormat(this.editedTask.start_date);
    }
    if (this.editedTask?.end_date) {
      this.editedTask.end_date = this.toInputDateFormat(this.editedTask.end_date);
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

     // ✅ 调用后端 API 更新任务
    this.taskService.updateTask(this.task.id, this.editedTask)
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
          this.editedTask = undefined;
          this.dateError = undefined;
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('保存失败，请重试');
        }
      });
  }

  onEmployeeChange(selectedEmployeeId: number | undefined): void {
    if (selectedEmployeeId) {
      this.employeeService.getEmployeeById(selectedEmployeeId)
          .subscribe(employee => {
          this.employee = employee;
          
          // 如果在编辑模式，更新 editedTask
          if (this.isEditMode && this.editedTask) {
            this.editedTask.employee = employee;
          }
        });
    } else {
      this.employee = undefined;
      if (this.isEditMode && this.editedTask) {
        this.editedTask.employee = undefined;
      }
    }
  }

   onTesterChange(selectedTesterId: number | undefined): void {
    if (selectedTesterId) {
      this.employeeService.getEmployeeById(selectedTesterId)       
        .subscribe(tester => {
          this.selectedTester = tester;          
          if (this.isEditMode && this.editedTask) {
            this.editedTask.tester = tester;
          }
        });
    } else {
      this.selectedTester = undefined;
      if (this.isEditMode && this.editedTask) {
        this.editedTask.tester = undefined;
      }
    }
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
    // ✅ 添加评论（正确版本）
 addComment(): void {
  if (!this.newCommentText.trim() || !this.task) {
    return;
  }

  const newComment: Comment = {
    id: -Date.now(),  // 临时负数 ID
    task_id: this.task.id,
    task_title: this.task.title,
    text: this.newCommentText,
    author_id: this.currentUserId,
    author_name: this.currentUser,
    is_edited: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  this.commentService.createComment(newComment)
     .subscribe({
      next: (comment) => {  // ✅ comment 是完整的 Comment 类型（后端返回）
        console.log('Comment created:', comment);
        this.comments.push(comment);  // ✅ 现在没有类型错误了
        this.newCommentText = '';
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        alert('添加评论失败，请重试');
      }
    });
}

     // 保存编辑后的评论
   saveEditComment(commentId: number) {
    if (!this.editingCommentText.trim()) {
      return;
    }

    const targetTask = this.isEditMode ? this.editedTask : this.task;
    
    if (targetTask?.comments) {
      const comment = targetTask.comments.find(c => c.id === commentId);
      if (comment) {
        comment.text = this.editingCommentText;
        comment.timestamp = new Date().toISOString();  // 更新时间戳
        
        if (!this.isEditMode) {
          this.taskService.updateTask(this.task!.id, { comments: this.task?.comments });
        }
      }
    }
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
          // 从本地列表移除
          this.comments = this.comments.filter(c => c.id !== commentId);
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          alert('Kommentar konnte nicht gelöscht werden, bitte versuchen Sie es erneut.');
        }
      });
  }

  //
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

    return `${day}.${month}.${year}`; // 输出格式: '22.10.2025'
  }

  // 将我的日期格式转换成标准的ISO格式yyyy-MM-dd
  toInputDateFormat(dateStr: string): string {
      if (!dateStr) return '';     
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month}-${day}`;
    }
 
// 创建一个副本用于编辑, 使用对象的展开（Object Spread）语法，可以不影响原数据
 
}


