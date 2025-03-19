import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  showToast(message:string, type: 'success' | 'danger' | 'warning' | 'info',delay?:number){
    const id = this.counter++;
    const newToast:Toast = {message,type,id} 
    this.toastsSubject.next([...this.toastsSubject.value,newToast])
    console.log(message);
    
    setTimeout(()=>{
      this.removeToast(id)
    },delay ? delay : 3000)
  }
fadeOutToast(id: number) {
  const updatedToasts = this.toastsSubject.value.map(t =>
    t.id === id ? { ...t, fadeOut: true } : t
  );
  this.toastsSubject.next(updatedToasts);

  // Wait for animation before removing the toast
  setTimeout(() => this.removeToast(id), 500);
}
  removeToast(id:number){
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id != id))
  }
  constructor() { }
}
interface Toast{
  message:string;
  type:"success"|"danger"|"warning"|"info",
  id:number;
}