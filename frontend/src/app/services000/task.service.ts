import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

   private tasksSource = new BehaviorSubject<Task[]>([
    { id: 1, title: 'Website Redesign', description: 'Überarbeitung der Unternehmenswebsite für ein modernes Design.', status: 'offen', startDate: '22.10.2025', endDate: '28.11.2025', color: 'bg-blue-500', employeeId: 1 },
    { id: 2, title: 'Datenmigration', description: 'Übertragung alter Kundendaten in das neue CRM-System.', status: 'archiviert', startDate: '22.10.2025', endDate: '28.10.2025', color: 'bg-slate-500', employeeId: 2  },
    { id: 3, title: 'Marketingkampagne', description: 'Planung und Durchführung der Herbst-Werbekampagne.', status: 'abgeschlossen', startDate: '12.10.2025',  endDate: '15.10.2025', color: 'bg-green-500', employeeId: 2  },
    { id: 4, title: 'Schulung für neue Mitarbeiter', description: 'Vorbereitung und Durchführung eines Einführungsseminars.', status: 'nicht-zugewiesen', startDate: '22.11.2025', endDate: '12.12.2025', color: 'bg-yellow-500' , employeeId: 3} ,
    { id: 5, title: 'App-Testphase', description: 'Beta-Test der neuen mobilen App mit internen Nutzern.', status: 'nicht-zugewiesen', startDate: '01.12.2025',  endDate: '12.12.2025',  color: 'bg-yellow-500', employeeId: 4},
    { id: 6, title: 'Backend-Optimierung', description: 'Optimierung der Datenbankabfragen zur Leistungssteigerung.', status: 'offen', startDate: '22.10.2025',  endDate: '12.11.2025',  color: 'bg-blue-500', employeeId: 5},
     { 
    id: 7, 
    title: 'Frontend-Refactoring', 
    description: 'Überarbeitung des bestehenden Angular-Codes zur Verbesserung der Wartbarkeit.', 
    status: 'offen', 
    startDate: '05.11.2025', 
    endDate: '20.11.2025', 
    color: 'bg-blue-500', 
    employeeId: 2 
  },
  { 
    id: 8, 
    title: 'UI/UX-Testphase', 
    description: 'Durchführung von Benutzertests zur Optimierung der Benutzeroberfläche.', 
    status: 'offen', 
    startDate: '10.11.2025', 
    endDate: '18.11.2025', 
    color: 'bg-blue-500', 
    employeeId: 6 
  },
  { 
    id: 9, 
    title: 'API-Dokumentation', 
    description: 'Erstellung einer umfassenden Dokumentation für die REST-API-Endpunkte.', 
    status: 'abgeschlossen', 
    startDate: '01.10.2025', 
    endDate: '15.10.2025', 
    color: 'bg-green-500', 
    employeeId: 7 
  },
  { 
    id: 10, 
    title: 'Sicherheitsaudit', 
    description: 'Prüfung der Anwendung auf potenzielle Sicherheitslücken und Implementierung von Fixes.', 
    status: 'nicht-zugewiesen', 
    startDate: '08.11.2025', 
    endDate: '22.12.2025', 
    color: 'bg-yellow-500', 
    employeeId: 4 
  },
   ]);

  tasks$ = this.tasksSource.asObservable();  // 可被订阅的任务流

  // 灵活解析日期（支持两种格式，内部统一处理）
private parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  let date: Date;

  if (dateStr.includes('.')) {
    // 格式: DD.MM.YYYY
    const [day, month, year] = dateStr.split('.').map(Number);
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    // 格式: YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

  // 计算天数差异
  calculateDuration(startDate:string, endDate: string): number | undefined {
    if (!startDate || !endDate) {
      return;
    }

    const start = this.parseFlexibleDate(startDate);
    const end = this.parseFlexibleDate(endDate);

    if (!start || !end) {
      console.error('Ungültiges Datumsformat:', { startDate, endDate });
      return;
    }
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays+1 : undefined;  // ✅ 修复：同一天应该返回 1
  }

  // 辅助方法：转换为德语格式
private toDisplayDateFormat(dateStr: string): string {
  if (!dateStr) return '';
  
  // 如果已经是德语格式，直接返回
  if (dateStr.includes('.')) return dateStr;
  
  // 转换 YYYY-MM-DD -> DD.MM.YYYY
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

  // 获取当前数据（同步方式）
  getCurrentTasks(): Task[] {
    return this.tasksSource.value;
  }

  // 模拟按状态过滤, filter返回的是数组
  getTasksByStatus(status: string) {
    return this.tasksSource.value.filter(t => t.status === status);
  }

  getTaskById(id:number): Task|undefined{
    return this.tasksSource.value.find(t => t.id === id);
  }

   getTaskCountByStatus(status: string): number {
    return this.tasksSource.value.filter(t => t.status === status).length;
  }

  getAllStatusCounts() {
    const tasks = this.tasksSource.value;
    return {
      'nicht-zugewiesen': tasks.filter(t => t.status === 'nicht-zugewiesen').length,
      'offen': tasks.filter(t => t.status === 'offen').length,
      'abgeschlossen': tasks.filter(t => t.status === 'abgeschlossen').length,
      'archiviert': tasks.filter(t => t.status === 'archiviert').length
    };
  }

  // ✅ 新增:添加任务的方法
  addTask(task: Omit<Task, 'id'>): void {
    const currentTasks = this.tasksSource.value;
    
    // 生成新的 ID
    const newId = Math.max(...currentTasks.map(t => t.id)) + 1;
     
     const newTask: Task = {
      ...task,
      id: newId
    };

     // 更新任务列表
    this.tasksSource.next([...currentTasks, newTask]);
  }

  // ✅ 可选:更新任务
  updateTask(task: Task): void {
    const currentTasks = this.tasksSource.value;
    const index = currentTasks.findIndex(t => t.id === task.id);
    
    if (index !== -1) {
       const updatedTask = {
      ...task,
      startDate: this.toDisplayDateFormat(task.startDate),
      endDate: this.toDisplayDateFormat(task.endDate)
    };

      currentTasks[index] = updatedTask;
      this.tasksSource.next([...currentTasks]);
    }
  }

  // ✅ 可选:删除任务
  deleteTask(taskId: number): void {
    const currentTasks = this.tasksSource.value;
    const filteredTasks = currentTasks.filter(t => t.id !== taskId);
    this.tasksSource.next(filteredTasks);
  }
}
