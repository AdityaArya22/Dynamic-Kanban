import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../Services/task.service';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragMove, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ToastService } from '../../Services/toast.service'; // Import ToastService
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-kanbanboard',
  imports: [FormsModule, DragDropModule, DatePipe],
  templateUrl: './kanbanboard.component.html',
  styleUrls: ['./kanbanboard.component.scss']
})
export class KanbanboardComponent implements OnInit {

@ViewChild('kanbanContainer',{static:true}) kanbanContainer!:ElementRef;
 private scrollSpeed = 20;

 onDragMove(event:CdkDragMove){
  const container = this.kanbanContainer.nativeElement;
  const scrollThreshold = 200;
  const {x} = event.pointerPosition;
  if (x < container.offsetLeft + scrollThreshold) {
    container.scrollLeft -= this.scrollSpeed;
  } else if (x > container.offsetLeft + container.clientWidth - scrollThreshold) {
    container.scrollLeft += this.scrollSpeed;
  }
 }
// Fields related to task management
fieldName: string = '';
stages: string[] = [];
tasks: any[] = [];
connectedDropLists: string[] = [];

// Task-related properties
newTask: Task = {
  id: 0,
  title: '',
  description: '',
  stage: '',
  priority: 'Low',
  dueDate: '',
  assignedTo: ''
};
draggedTask: any | null = null;
draggedStage: string | null = null; 
// Task form and editing states
showTaskForm: boolean = false;
isEdit: boolean = false;

// Transition properties
allowedTransitions: { [key: string]: string[] } = {}; // Store allowed transitions

// User-related properties
isAdmin: boolean = true;

// Dragging state
isDragging: boolean = false;

// Priority and selection
selectedPriority: string = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private toastService: ToastService, // Inject ToastService
    private cdr:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fieldName = this.route.snapshot.paramMap.get('fieldName') || "";
    this.loadStages();
    this.loadTasks();
    this.loadAllowedTransitions()
    this.setupConnectedDropLists();
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
    console.log(this.fieldName);
    
    const storedTransitions = localStorage.getItem(`transitions_${this.fieldName}`);
    console.log(storedTransitions);
    
    if (storedTransitions) {
      this.allowedTransitions = JSON.parse(storedTransitions);
      console.log(this.allowedTransitions);
      
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
      this.newTask = { id: 0, title: '', description: '', stage: '', priority: 'Low', dueDate: '', assignedTo: '' };
    }
    this.showTaskForm = true;
  }

  closeTaskForm() {
    this.showTaskForm = false;
  }

  addOrUpdateTask() {
    if (!this.newTask.title.trim()) {
      this.toastService.showToast("Title is required!", "danger");
      return;
    }

    if (!this.newTask.stage.trim()) {
      this.toastService.showToast("Stage is required!", "danger");
      return;
    }

    if (!this.newTask.assignedTo.trim()) {
      this.toastService.showToast("Assigned to is required!", "danger");
      return;
    }


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
    const draggedItem = event.previousContainer.data[event.previousIndex];

    // ❌ If move is invalid, allow CDK to place it but instantly move it back
    if (draggedItem.stage !== stage &&
      this.allowedTransitions[draggedItem.stage] &&
      !this.allowedTransitions[draggedItem.stage].includes(stage)) {

        this.toastService.showToast(
          `Invalid move! You can only drop the task in highlighted stages.`,
          "warning", 
          5000
        );
        

      // 🔥 Allow CDK to place it, then return it instantly
      setTimeout(() => {
        event.previousContainer.data.splice(event.previousIndex, 0, draggedItem); // Restore to original position
        event.container.data.splice(event.currentIndex, 1); // Remove from invalid column
        this.tasks = [...this.tasks]; // Force UI refresh to prevent glitches
      }, 50); // Small delay to avoid visual flicker

      return;
    }

    // ✅ If rearranging within the same column, move normally
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const sameStageTasks = this.tasks.filter(task => task.stage === draggedItem.stage);

      const draggedIndexInTasks = this.tasks.findIndex(task => task.id === draggedItem.id);

      if (draggedIndexInTasks !== -1) {
        const updatedTasks = [...this.tasks];
        const [movedTask] = updatedTasks.splice(draggedIndexInTasks, 1); // Remove item
        updatedTasks.splice(event.currentIndex, 0, movedTask); // Insert item at new position

        this.tasks = updatedTasks;
      }
    } else {
      // ✅ If moving between valid columns, apply the move
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      event.container.data[event.currentIndex].stage = stage;
    }

    this.taskService.saveTasks(this.fieldName, this.tasks);
  }

  getFilteredTasks(stage: string) {
    let tasks = this.getTasksForStage(stage);
    if (this.selectedPriority) {
      return tasks.filter(task => task.priority === this.selectedPriority);
    }
    return tasks;
  }
  getDueStatus(dueDate: string | null | undefined): string {
    if (!dueDate) return "No Due Date";

    const today = new Date();
    const due = new Date(dueDate);

    // Reset time to midnight for accurate date-only comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "Overdue";
    if (due.getTime() === today.getTime()) return "Due Today";

    return "Upcoming";
  }


  getBadgeClass(dueDate: string | null | undefined): string {
    if (!dueDate) return "badge-secondary"; // Default gray badge

    const today = new Date();
    const due = new Date(dueDate);

    // Reset time to midnight for accurate date-only comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "badge-danger"; // Overdue: Red badge
    if (due.getTime() === today.getTime()) return "badge-warning"; // Due Today: Yellow badge

    return "badge-success"; // Upcoming: Green badge
  }
 onDragStart(task:any) {
  this.isDragging = true; 
  this.draggedTask = task;
  this.draggedStage = task.stage;
}

// Reset when dragging ends
onDragEnd() {
    this.isDragging = false; 
    this.draggedTask = null;
    this.draggedStage = null

  }
  isStageAllowed(stage: string): boolean {
    if (!this.draggedTask) return false;

 console.log( this.allowedTransitions[this.draggedTask.stage]?.includes(stage) );
 
    // ✅ Only allow highlighted transitions
    return this.allowedTransitions[this.draggedTask.stage]?.includes(stage) ?? false;
  }
  
  
  toggleTransition(stage: string, otherStage: string) {
    this.taskService.toggleTransition(this.fieldName, stage, otherStage);
    this.allowedTransitions = this.taskService.getAllowedTransitions(this.fieldName); // Refresh UI
  }

}

interface Task {
  id: number;
  title: string;
  description: string;
  stage: string;
  priority: string;
  dueDate?: string;
  assignedTo: string;  // Add this property
}

