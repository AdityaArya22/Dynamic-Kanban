import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from "../toast/toast.component";

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterLink, ToastComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
