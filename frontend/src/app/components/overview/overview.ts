import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Task } from '../../models/task.model';
import { Employee } from '../../models/employee.model';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

interface Day{
  date: string;
  weekday: string;
  fullDate: Date;
}

@Component({
  selector: 'app-overview',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})

export class Overview implements OnInit {
  tasks$!: Observable<Task[]>;
  employees$!: Observable<Employee[]>;
  loading$! : Observable<boolean>;
  error$! : Observable<string|null>;
  currentTasks!: Task[];
 
  constructor(
    private taskService: TaskService,
    private employeeService : EmployeeService
  ){
   
  }; 
  timelineDays: Day[] = [];  
  selectedDay: Date = new Date(); // 当前选中的日期
  weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];   

  ngOnInit() {
    this.taskService.loadTasks(); // 触发加载

    this.tasks$ = this.taskService.tasks$;//xxx$表示可观察对象（Observable）,可观察数据流
    this.employees$ = this.employeeService.employees$;
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;  
    this.currentTasks = this.taskService.getTasksValue(); 

    this.generateCalendar();
    // 初始化时默认显示今天为中心
    const today = new Date();     
    this.generateTimeline(today);
  }

  refreshData(): void {
    // 刷新数据
    this.taskService.refreshTasks();
  }
  createNewTask(): void {
    const newTaskData: Partial<Task> = {};
    this.taskService.createTask(newTaskData as Task).subscribe({
      next: (task) => {
        console.log('Task created successfully:', task);
        // 因为 Service 内部已经更新了 tasksSubject$ 缓存，所以 tasks$ 会自动更新
      },
      error: (err) => console.error('Failed to create task:', err)
    });
  }
  
  // 点击日历格子时调用
 onSelectDay(day: Date) {
  this.selectedDay = day;
  this.generateTimeline(day);
}

// 生成横向时间轴，从选中日期前 2 天开始
  generateTimeline(selectedDay: Date) {  
   this.timelineDays = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(selectedDay); // 每次都创建新的 Date 对象
    date.setDate(date.getDate() - 2 + i); // 从前天开始

    // ✅ 关键优化：统一归零时间，避免时间戳比较问题
    date.setHours(0, 0, 0, 0);

    return {
      date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      weekday: this.weekdays[date.getDay()],
      fullDate: date
    };
  });
  }

    // 向前滚动（查看之前的日期）
  scrollBackward(days: number ) {
    const newStartDate = this.selectedDay;
    newStartDate.setDate(newStartDate.getDate() - days);
    this.generateTimeline(newStartDate);
  }

  // 向后滚动（查看之后的日期）
  scrollForward(days: number) {
    const newStartDate = this.selectedDay;
    newStartDate.setDate(newStartDate.getDate() + days);
    this.generateTimeline(newStartDate);
  }

  currentDate = new Date();
  currentMonth = '';
  currentYear = 0;
  calendarDays: Date[] = [];

   generateCalendar() {  
    this.currentMonth = this.currentDate.toLocaleDateString('de-DE', { month: 'long' });
    this.currentYear = this.currentDate.getFullYear();

    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);  //the 0 Day of next month --> the last day of this month
    
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; //getDay 返回星期几（0 表示星期日，1 表示星期一，... 6 表示星期六）
    
    this.calendarDays = [];
    for (let i = 0; i < startDay; i++) { //这个循环主要是为了补齐上个月的最后几天
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (startDay - i));
      this.calendarDays.push(prevDate);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) { //从 1 一直循环到最后一天
      this.calendarDays.push(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i));
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  }

  previousMonth(){
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(){
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  // 解析 "DD.MM.YYYY" 格式的日期字符串
  parseDate(dateStr: string): Date {
    const [dd, mm, yyyy] = dateStr.split('.').map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    date.setHours(0,0,0,0);
    return date;
  }

  // 检查日期是否在时间轴范围内
  isDateInRange(dateStr: string): boolean {
    const date = this.parseDate(dateStr);
    const firstDay = this.timelineDays[0]?.fullDate;
    const lastDay = this.timelineDays[this.timelineDays.length - 1]?.fullDate;
    
    if (!firstDay || !lastDay) return false;
    
    return date >= firstDay && date <= lastDay;
  }

  // 获取任务在时间轴上的起始列
  getTaskStartColumn(taskStartDate: string): number{
    const startDate = this.parseDate(taskStartDate);
    const firstDate = this.timelineDays[0].fullDate;
    const lastDate = this.timelineDays[this.timelineDays.length-1].fullDate;

    // 如果任务开始日期在时间轴之前，从第0列开始
    if(startDate < firstDate) return 0;
    if(startDate > lastDate) return -1;
    
    // 查找任务开始的列， 
    // findIndex回调函数需要添加return！！！或使用箭头函数简写（推荐）.findIndex(day =>day.fullDate.getTime() === startDate.getTime());
    return this.timelineDays.findIndex(day => {
      return day.fullDate.getTime() === startDate.getTime();
    });
      
  }

  // 获取任务在时间轴上的结束列
  getTaskEndColumn(taskEndDate: string): number{
    const endDate = this.parseDate(taskEndDate);
    const firstDate = this.timelineDays[0].fullDate;
    const lastDate = this.timelineDays[this.timelineDays.length - 1].fullDate;

    if(endDate > lastDate) return this.timelineDays.length - 1;
    if(endDate < firstDate) return -1;

    return this.timelineDays.findIndex(day => 
     day.fullDate.getTime() === endDate.getTime()
    );   
  }

  getEmployeeTasksForGrid(employeeId: number){
    return this.currentTasks    
      .filter(task => task.employee?.id === employeeId)
      .map((task) => {
      const startCol = this.getTaskStartColumn(task.start_date);
      const endCol = this.getTaskEndColumn(task.end_date);
     
      // ✅ 完全不可见的任务：开始和结束都不在范围内
      if (startCol === -1 || endCol === -1) return null;      
      
      const span = endCol - startCol + 1;
     
      if (span <= 0) return null; // 过滤无效任务

      // 检查任务是否被截断
      const taskStartDate = this.parseDate(task.start_date);
      const taskEndDate = this.parseDate(task.end_date);
      const firstDate = this.timelineDays[0].fullDate;
      const lastDate = this.timelineDays[this.timelineDays.length - 1].fullDate;
      
      const isTruncatedLeft = taskStartDate < firstDate;  // 左侧被截断
      const isTruncatedRight = taskEndDate > lastDate;    // 右侧被截断
      
      return {
        ...task, //对象展开（object spread syntax）, 下面可覆盖原字段或添加新字段
        gridColumnStart :startCol +1,
        gridColumnSpan : span, 
        isTruncatedLeft,   // 添加左侧截断标记
        isTruncatedRight,  // 添加右侧截断标记      
      }      
    })
    .filter(task=> task !== null); 
  }

}
