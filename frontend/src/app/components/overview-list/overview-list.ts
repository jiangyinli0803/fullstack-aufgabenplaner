import { Component } from '@angular/core';
import { Task } from '../../models/task.model';
import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './overview-list.html',
  styleUrl: './overview-list.css',
})
export class OverviewList {
  tasks: Task[] = [];
  employees: Employee[] = [];
  selectedDepartment: string = 'alle';
  departments: string[] = [];
 //重新定义一个组合数组
  tasksWithEmployeesAndDuration: (Task & {duration?:number; employeeName?: string; employeeDepartment?: string })[] = [];

  constructor( 
    private router: Router,  
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    // 先加载员工数据
    this.employees = this.employeeService.getCurrentEmployees();
    this.tasks = this.taskService.getCurrentTasks();

    this.departments = [
      'alle',
      ...new Set(this.employees.map(e => e.department))
    ];

    this.combineTasksWithEmployeesAndDuration();
       
  }

  private combineTasksWithEmployeesAndDuration() {
       // ✅ 关键:将 map 的结果赋值给变量
      this.tasksWithEmployeesAndDuration = this.tasks.map(task => {
      const employee = this.employees.find(e => e.id === task.employeeId);
      const duration =this.taskService.calculateDuration(task.startDate, task.endDate);

      // 🔍 调试：检查哪些任务 duration 为空
      if (duration === undefined) {
        console.log('Duration 计算失败:', task);
      }
    
      return {
        ...task,
        duration,
        employeeName: employee?.name || '-',
        employeeDepartment: employee?.department || '-'
      };
    });
  }

     // 🔥 AUTOMATISCH aktualisierte Filterliste
 get filteredTasksbyDepartment(){
    if(this.selectedDepartment === 'alle'){
      return this.tasksWithEmployeesAndDuration;
    }
    return this.tasksWithEmployeesAndDuration.filter(t => t.employeeDepartment === this.selectedDepartment);
  }

   viewTaskDetail(taskId: number){
    this.router.navigate(['/tasks', 'detail', taskId]);
  }

}
