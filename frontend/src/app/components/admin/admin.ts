import { Component } from '@angular/core';
import { Overview } from '../overview/overview';
import { OverviewList } from '../overview-list/overview-list';

@Component({
  selector: 'app-admin',
  imports: [Overview, OverviewList],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

}
