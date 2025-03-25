import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from "../toast/toast.component";
import { TaskFormComponent } from "../task-form/task-form.component";

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterLink, ToastComponent, TaskFormComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

}
