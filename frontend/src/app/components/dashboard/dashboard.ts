import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TaskService } from '../../services000/task.service';
import { Overview } from '../overview/overview';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, RouterModule, Overview],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  statusCounts: any;

  constructor(private taskService: TaskService){}

  ngOnInit(): void {
    this.statusCounts = this.taskService.getAllStatusCounts();
  }
}
