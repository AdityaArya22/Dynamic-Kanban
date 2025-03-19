  import { Component, OnInit } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { TaskService } from '../../Services/task.service';
  import { FormsModule } from '@angular/forms';
  import { DragDropModule } from '@angular/cdk/drag-drop';
  import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
  import { ToastService } from '../../Services/toast.service'; // Import ToastService

  @Component({
    selector: 'app-kanbanboard',
    imports: [FormsModule, DragDropModule],
    templateUrl: './kanbanboard.component.html',
    styleUrls: ['./kanbanboard.component.css']
  })
  export class KanbanboardComponent implements OnInit {
    fieldName: string = '';
    stages: string[] = [];
    tasks: any[] = [];
    connectedDropLists: string[] = []; 
    selectedPriority: string = '';
    showTaskForm: boolean = false;
    isEdit: boolean = false;
    allowedTransitions: { [key: string]: string[] } = {}; // Store allowed transitions
    newTask: Task = {
      id: 0,
      title: '',
      description: '',
      stage: '',
      priority: 'Low',
      dueDate: ''
    };

    constructor(
      private route: ActivatedRoute, 
      private taskService: TaskService,
      private toastService: ToastService // Inject ToastService
    ) {}

    ngOnInit(): void {
      this.fieldName = this.route.snapshot.paramMap.get('fieldName') || "";
      this.loadStages();
      this.loadTasks();
      this.setupConnectedDropLists();
      this.allowedTransitions = this.taskService.getAllowedTransitions(this.fieldName); // Load transitions
    }
    
  
    

    loadStages() {
      const storedFields = localStorage.getItem('kanbanFields');
      if (storedFields) {
        const fields = JSON.parse(storedFields);
        const selectedField = fields.find((f: any) => f.fieldName === this.fieldName);
        this.stages = selectedField ? selectedField.stages || [] : [];
      }
    }

    loadAllowedTransitions() {
      const storedTransitions = localStorage.getItem(`transitions-${this.fieldName}`);
      if (storedTransitions) {
        this.allowedTransitions = JSON.parse(storedTransitions);
      }
    }

    refreshBoard() {
      this.tasks = [...this.tasks]; 
    }
    
    loadTasks() {
      this.tasks = this.taskService.getTasks(this.fieldName);
    }

    setupConnectedDropLists() {
      this.connectedDropLists = this.stages.map(stage => `dropList-${stage}`);
    }

    openTaskForm(taskID?: number) {
      if (taskID !== undefined) {
        const taskToEdit = this.tasks.find((task: any) => task.id === taskID);
        if (taskToEdit) {
          this.isEdit = true;
          this.newTask = { ...taskToEdit };
        }
      } else {
        this.isEdit = false;
        this.newTask = { id: 0, title: '', description: '', stage: '', priority: 'Low', dueDate: '' };
      }
      this.showTaskForm = true;
    }

    closeTaskForm() {
      this.showTaskForm = false;
    }

    addOrUpdateTask() {
      if (!this.newTask.title.trim() || !this.newTask.stage) return;

      if (this.isEdit) {
        this.taskService.updateTask(this.fieldName, { ...this.newTask });
        this.toastService.showToast("Task updated successfully!", "success");
      } else {
        this.taskService.addTask(this.fieldName, { ...this.newTask });
        this.toastService.showToast("Task added successfully!", "success");
      }

      this.loadTasks();
      this.closeTaskForm();
    }

    deleteTask(taskId: number) {
      this.taskService.deleteTask(this.fieldName, taskId);
      this.loadTasks();
      this.toastService.showToast("Task deleted!", "danger");
    }

    getTasksForStage(stage: string) {
      return this.tasks.filter(task => task.stage === stage);
    }

    drop(event: CdkDragDrop<any[]>, stage: string) {
      const movedTask = event.previousContainer.data[event.previousIndex];
      console.log(this.allowedTransitions);
      
      if (this.allowedTransitions[movedTask.stage] && !this.allowedTransitions[movedTask.stage].includes(stage)) {
        this.toastService.showToast(`Cannot move directly from ${movedTask.stage} to ${stage}.`, "warning");
        return;
      }

      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        event.container.data[event.currentIndex].stage = stage;
      }

      this.taskService.saveTasks(this.fieldName, this.tasks);
      this.toastService.showToast(`Task moved to ${stage}!`, "info");
    }
    toggleTransition(stage: string, otherStage: string) {
      this.taskService.toggleTransition(this.fieldName, stage, otherStage);
      this.allowedTransitions = this.taskService.getAllowedTransitions(this.fieldName); // Refresh UI
    }
    getFilteredTasks(stage: string) {
      let tasks = this.getTasksForStage(stage);
      if (this.selectedPriority) {
        return tasks.filter(task => task.priority === this.selectedPriority);
      }
      return tasks;
    }
  }

  interface Task {
    id: number;
    title: string;
    description: string;
    stage: string;
    priority: string;
    dueDate?: string;
  }
