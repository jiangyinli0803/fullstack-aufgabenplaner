import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services000/task.service';
import { EmployeeService } from '../../services000/employee.service';
import { Router, RouterModule } from '@angular/router';
import { Employee } from '../../models/employee.model';



@Component({
  selector: 'app-new-task',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.css',
})
export class NewTask implements OnInit {
  taskForm!: FormGroup;
  employees: Employee[] = [];
  currentTasks: Task[] = [];
  duration:number|undefined=undefined;
  
  statusOptions = [
    { value: 'nicht-zugewiesen', label: 'Nicht zugewiesen', color: 'bg-yellow-500' },
    { value: 'offen', label: 'Offen', color: 'bg-blue-500' },
    { value: 'abgeschlossen', label: 'Abgeschlossen', color: 'bg-green-500' },
    { value: 'archiviert', label: 'Archiviert', color: 'bg-slate-500' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentTasks = this.taskService.getCurrentTasks();
    this.employees = this.employeeService.getCurrentEmployees();
    
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['nicht-zugewiesen', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      employeeId: [null]
    }, {
      validators: this.dateRangeValidator
    });
  }

    // ✅ 自定义日期验证器
      dateRangeValidator = (control: AbstractControl): ValidationErrors | null => {
        const startDate = control.get('startDate')?.value;
        const endDate = control.get('endDate')?.value;

        if (!startDate || !endDate) {
          return null;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        return end < start ? { dateRange: true } : null;
      };


       // 获取日期范围错误
       get dateRangeError(){
       return this.taskForm.hasError('dateRange') && 
           (this.taskForm.get('startDate')?.touched || this.taskForm.get('endDate')?.touched);
     }


     onSubmit() {
      if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      // 计算持续天数
      const start = new Date(formValue.startDate);
      const end = new Date(formValue.endDate);
      this.duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // 根据状态设置颜色
      const selectedStatus = this.statusOptions.find(s => s.value === formValue.status);
      
      // 格式化日期为 DD.MM.YYYY
      const formatDate = (date: string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };
      
      const newTask = {       
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        startDate: formatDate(formValue.startDate),
        endDate: formatDate(formValue.endDate),       
        color: selectedStatus?.color || 'bg-gray-500',
        employeeId: formValue.employeeId
      };
      
      // 添加任务
      this.taskService.addTask(newTask);
      
      // 导航回列表页
      this.router.navigate(['/tasks', newTask.status]);
    }else {
      // 标记所有字段为已触摸,显示所有错误
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
