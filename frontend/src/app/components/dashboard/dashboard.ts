import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Overview } from '../overview/overview';
import { TaskService } from '../../services/task.service';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { STATUS_CHOICES } from '../../models/status';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, RouterModule, Overview, AsyncPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

 statusCounts$!: Observable<{
    'nicht_zugewiesen': number;
    'offen': number;
    'abgeschlossen': number;
    'archiviert': number;
  }>;

  statuses = STATUS_CHOICES;

  constructor(private taskService: TaskService){}

  ngOnInit(): void {
    this.statusCounts$ = this.taskService.statusCounts$;
  }
}
