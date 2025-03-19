import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../Services/toast.service';
@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {

  constructor(public toastService:ToastService){
  }
}