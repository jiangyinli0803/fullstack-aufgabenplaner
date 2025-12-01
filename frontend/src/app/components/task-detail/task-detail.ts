import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/employee.model';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { UserComment } from '../../models/userComment.model';
import { Location } from '@angular/common';

export const AVAILABLE_VERSIONS = ['v1.0','v1.1', 'v1.2','v2.0','v2.1', 'v2.2', 'v3.0','v3.1','v3.2'];

@Component({
  selector: 'app-task-detail',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit{
  task : Task | undefined;
  employee: Employee | undefined ;
  employees : Employee[] = [];
  isEditMode = false;
  editedTask: Task | undefined;
  duration: number|undefined;
  dateError: string|undefined;

  //new parameters
  selectedTester: Employee|undefined = undefined;
  newCommentText: string = '';
  currentUser: string = 'Current User';
  currentUserId?: number = 1;
  availableVersions = AVAILABLE_VERSIONS;

    // 编辑评论相关 
  editingCommentText: string = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private employeeService: EmployeeService,

    private location: Location
  ){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const taskId = Number(params.get('id'));
      const allTasks = this.taskService.getCurrentTasks();     

      this.task = allTasks.find(t => t.id === taskId);
      
      if (this.task && this.task.employeeId) {
        this.employee = this.employeeService.getEmployeeById(this.task.employeeId);
      }
    });

    this.employees = this.employeeService.getCurrentEmployees();
  
    this.duration=this.taskService.calculateDuration(this.task!.startDate!,this.task!.endDate!);    
    this.loadTester();
    
    if (!this.task!.version){this.task!.version = 'v1.0';} 
  }

    goBack(){
      this.location.back();
    }

    onEmployeeChange(selectedEmployeeId: number | undefined) {
      if (selectedEmployeeId) {
        this.employee = this.employeeService.getEmployeeById(selectedEmployeeId);
      } else {
        this.employee = undefined;
      }
    }

    loadTester(){
      if(this.task?.testerId){
        this.selectedTester =  this.employeeService.getEmployeeById(this.task.testerId)  ;
      }else{
        this.selectedTester = undefined;
      }
    }
  

    // 添加评论（查看模式下可用）
    addComment() {
      if (!this.newCommentText.trim()) {
        return;
      }

      const comment: UserComment = {
        id: Date.now(),
        text: this.newCommentText,
        author: this.currentUser,
        timestamp: new Date().toISOString(),
        authorId: this.currentUserId
      };

      if (!this.task!.comments) {
        this.task!.comments = [];
      }

      this.task!.comments.push(comment);
      this.taskService.updateTask(this.task!);
      
      this.newCommentText = '';
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
          this.taskService.updateTask(this.task!);
        }
      }
    }
   }

  // 检查是否是评论作者
  isCommentAuthor(comment: UserComment): boolean {
    return comment.authorId === this.currentUserId;
  }

  // 删除评论
  deleteComment(commentId: number) {
    if (this.task?.comments) {
    this.task.comments = this.task.comments.filter(c => c.id !== commentId);
    
    // 如果在编辑模式，同步到 editedTask
    if (this.isEditMode && this.editedTask) {
      this.editedTask.comments = [...this.task.comments];
    }
    
    this.taskService.updateTask(this.task);
  }
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
 
  updateDuration() {
       if (!this.editedTask?.startDate || !this.editedTask?.endDate) {
        this.duration = undefined;
        return;
      }

      const start = new Date(this.editedTask.startDate);
      const end = new Date(this.editedTask.endDate);

      if (end < start) {
        // 显示提示, 从日历中选择的日期格式是yyyy-MM-dd
        this.dateError = 'Enddatum darf nicht vor dem Startdatum liegen!';
        this.duration = undefined;
      } else {
        this.dateError = undefined;
        this.duration = this.taskService.calculateDuration(
          this.editedTask.startDate,
          this.editedTask.endDate
        );
      }
    }   
    
// 创建一个副本用于编辑, 使用对象的展开（Object Spread）语法，可以不影响原数据
  enterEditMode(){   
    this.isEditMode = true;
    this.editedTask = JSON.parse(JSON.stringify(this.task)); 
    this.editedTask!.startDate = this.toInputDateFormat(this.task!.startDate);
    this.editedTask!.endDate = this.toInputDateFormat(this.task!.endDate);    
  }

  cancelEdit(){
    this.isEditMode = false;
    this.editedTask = undefined;
  }

  saveChanges(){
    if(this.editedTask){      
      this.taskService.updateTask(this.editedTask);

      // 更新本地 task?
      this.task = JSON.parse(JSON.stringify(this.editedTask));
   

         // 更新员工信息
      if (this.editedTask.employeeId) {
        this.employee = this.employeeService.getEmployeeById(this.editedTask.employeeId);
      } else {
        this.employee = undefined;
      }

      // 在编辑模式中更新测试人员
    if (this.editedTask?.testerId) {
      this.selectedTester = this.employeeService.getEmployeeById(this.editedTask.testerId);
    } else {
      this.selectedTester = undefined;
    } 
    this.loadTester();   
    this.updateDuration();

      this.isEditMode = false;
      
    }
  }

}
