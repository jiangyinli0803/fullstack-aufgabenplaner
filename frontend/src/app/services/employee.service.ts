import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
   private employeesSource = new BehaviorSubject<Employee[]>([
    { id: 1, name: 'Anna Schmidt', department: 'Marketing'}, 
    { id: 2, name: 'Max Müller', department: 'HR'}, 
    { id: 3, name: 'Lisa Weber', department: 'Marketing'}, 
    { id: 4, name: 'Tom White', department: 'IT'}, 
    {id: 5, name: 'Sara Fissler', department: 'Sales'}, 
    { id: 6, name: 'Elena Richter', department: 'Project Management' }, 
    { id: 7, name: 'Miriam Bauer', department: 'Sales' }, 
    { id: 8, name: 'David Weber', department: 'HR' }, 
    { id: 9, name: 'Jonas Keller', department: 'Marketing' }, 
    { id: 10, name: 'Maximilian Vogt', department: 'IT' }
  ]);

  employees$ = this.employeesSource.asObservable();

  getCurrentEmployees(): Employee[] {
    return this.employeesSource.value;
  }
 
  getEmployeeById(id: number): Employee | undefined {
    return this.employeesSource.value.find(e => e.id === id);
  }
}
