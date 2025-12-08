import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Overview } from '../overview/overview';
import { TaskService } from '../../services/task.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, RouterModule, Overview],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

 statusCounts$!: Observable<{
    'nicht-zugewiesen': number;
    'offen': number;
    'abgeschlossen': number;
    'archiviert': number;
  }>;

  constructor(private taskService: TaskService){}

  ngOnInit(): void {
    this.statusCounts$ = this.taskService.statusCounts$;
  }
}
