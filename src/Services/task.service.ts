import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor() {}

  private taskKey(fieldName: string) {
    return `tasks_${fieldName}`;
  }

  private transitionKey(fieldName: string) {
    return `transitions_${fieldName}`;
  }

  addTask(fieldName: string, task: any) {
    let tasks = this.getTasks(fieldName);
    
    task.id = Date.now(); // Ensure unique ID
    tasks.push(task);

    this.saveTasks(fieldName, tasks);
  }

  getTasks(fieldName: string): any[] {
    return JSON.parse(localStorage.getItem(this.taskKey(fieldName)) || '[]');
  }

  updateTask(fieldName: string, updatedTask: any) {
    let tasks = this.getTasks(fieldName);
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(fieldName, tasks);
    }
  }

  deleteTask(fieldName: string, taskId: number) {
    let tasks = this.getTasks(fieldName);
    tasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(fieldName, tasks);
  }

  updateTaskStage(fieldName: string, updatedTask: any) {
    this.updateTask(fieldName, updatedTask);
  }

  saveTasks(fieldName: string, tasks: any[]) {
    localStorage.setItem(this.taskKey(fieldName), JSON.stringify(tasks));
  }
}
