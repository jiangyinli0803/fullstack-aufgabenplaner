import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Task } from '../../models/task.model';

import { Router, RouterModule } from '@angular/router';
import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';



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
  duration: number | undefined = undefined;

  statusOptions = [
    { value: 'nicht-zugewiesen', label: 'Nicht zugewiesen', color: 'bg-yellow-500', hex: '#eab308' },
    { value: 'offen', label: 'Offen', color: 'bg-blue-500', hex: '#3b82f6' },
    { value: 'abgeschlossen', label: 'Abgeschlossen', color: 'bg-green-500', hex: '#22c55e' },
    { value: 'archiviert', label: 'Archiviert', color: 'bg-slate-500', hex: '#64748b' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentTasks = this.taskService.getTasksValue();
    this.employees = this.employeeService.getEmployeesValue();

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      status: ['nicht-zugewiesen', Validators.required],
      priority: ['medium', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      employeeId: [null],
      testerId: [null]
    }, {
      validators: this.dateRangeValidator
    });
  }

  // 日期范围校验器
  dateRangeValidator = (control: AbstractControl): ValidationErrors | null => {
    const start_date = control.get('start_date')?.value;
    const end_date = control.get('end_date')?.value;

    if (!start_date || !end_date) return null;

    const start = new Date(start_date);
    const end = new Date(end_date);

    return end < start ? { dateRange: true } : null;
  };

  get dateRangeError() {
    return this.taskForm.hasError('dateRange') &&
      (this.taskForm.get('start_date')?.touched ||
       this.taskForm.get('end_date')?.touched);
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;

      // 计算持续天数
      const start = new Date(formValue.start_date);
      const end = new Date(formValue.end_date);
      this.duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const selectedStatus = this.statusOptions.find(s => s.value === formValue.status);

      // 格式化 YYYY-MM-DD
      const formatDate = (date: string) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      };

      // 🔥 完整符合 Task 模型的 newTask
      const newTask: Task = {
        id: Date.now(), // 简单生成唯一ID
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,

        start_date: formatDate(formValue.start_date),
        end_date: formatDate(formValue.end_date),

        // 前端根据 employeeId 关联对象
        employee: this.employees.find(e => e.id === formValue.employeeId) ?? null,
        tester: this.employees.find(e => e.id === formValue.testerId) ?? null,

        created_by: null,
        updated_by: null,

        comments: null,

        version: "v1.0",
        status_color: selectedStatus?.hex ?? "#000000",

        is_overdue: new Date(formValue.end_date) < new Date(),

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 添加任务
      this.taskService.createTask(newTask);

      // 跳转到按 status 过滤的列表
      this.router.navigate(['/tasks', newTask.status]);

    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
