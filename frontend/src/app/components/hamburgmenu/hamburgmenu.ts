import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hamburgmenu',
  imports: [CommonModule, RouterLink],
  templateUrl: './hamburgmenu.html',
  styleUrl: './hamburgmenu.css',
})
export class Hamburgmenu {
   open = false;

  toggleMenu() {
    this.open = !this.open;
  }

  closeMenu() {
    this.open = false;
  }

}
