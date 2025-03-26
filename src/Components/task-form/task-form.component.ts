import { ChangeDetectorRef, Component, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../Services/task.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  imports: [FormsModule],
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  fieldName: string = '';
  isEdit: boolean = false;
  taskToEdit: any = null;

  newTask: any = {};
  taskFields: any[] = [];
  tasks:any[]=[]
  @Input() getStages!: () => string[];  // Function from parent
  taskStages: string[] = [];
  @Output() closeForm = new EventEmitter<void>();// Event to notify parent
  @Input() taskData: any; 
  constructor(private route: ActivatedRoute, private taskService: TaskService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.fieldName = params.get('fieldName') || '';
    });
    this.loadTaskFields();
    console.log(this.taskData);
    console.log(this.isEdit);
    
    if (this.isEdit && this.taskToEdit) {
      this.newTask = { ...this.taskToEdit };
    }
  }

  loadTaskFields() {
    if (!this.fieldName) {
      console.error('Field name is empty, cannot load task fields.');
      return;
    }

    const storedKanbanFields = localStorage.getItem('kanbanFields');
    if (storedKanbanFields) {
      const kanbanFields = JSON.parse(storedKanbanFields);
      const selectedField = kanbanFields.find((field: any) => field.fieldName === this.fieldName);
      this.taskStages = selectedField.stages;
  
      if (selectedField && selectedField.taskFields) {
        this.taskFields = selectedField.taskFields;
        this.initializeTaskObject();
      } else {
        console.warn(`Field "${this.fieldName}" not found in localStorage or taskFields is missing.`);
        this.taskFields = [];
      }
    }

  }
  loadTasks() {
    if (!this.fieldName) return;
    
  }
  initializeTaskObject() {
    this.newTask = {};
    this.taskFields.forEach(field => {
      this.newTask[field.name] = field.type === 'Select' ? field.options[0] : '';
    });
  }

  addOrUpdateTask() {
  // console.log(this.isEdit);
  
    if (this.isEdit) {
      this.taskService.updateTask(this.fieldName, this.newTask);
    } else {
      this.taskService.addTask(this.fieldName, this.newTask);
    }
    console.log(this.newTask);

    this.closeTaskForm();
  }

  /** Close modal */
  closeTaskForm() {
    this.newTask = {};
    console.log("🔴 [TaskFormComponent] closeTaskForm() called, emitting closeForm event...");
    this.closeForm.emit();
  }

}
