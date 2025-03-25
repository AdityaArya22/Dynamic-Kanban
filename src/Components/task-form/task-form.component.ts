import { Component } from '@angular/core';
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
  fieldName: string = ''; // Field name from URL
  showTaskForm: boolean = false;
  isEdit: boolean = false;
  taskToEdit: any = null; // Existing task data for editing

  newTask: any = {}; // Object to store form data
  taskFields: any[] = []; // Stores the fields dynamically
  
  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  ngOnInit() {
    // Read the field name from route parameters
    this.route.paramMap.subscribe(params => {
      this.fieldName = params.get('fieldName') || '';
      this.loadTaskFields();
    });

    if (this.isEdit && this.taskToEdit) {
      this.newTask = { ...this.taskToEdit }; // Load existing task data
    }
  }

  /** Load task fields from localStorage */
  loadTaskFields() {
    const storedKanbanFields = localStorage.getItem('kanbanFields');
    if (storedKanbanFields) {
      const kanbanFields = JSON.parse(storedKanbanFields);
      const selectedField = kanbanFields.find((field: any) => field.fieldName === this.fieldName);

      console.log(this.fieldName);
      if (selectedField) {
        this.taskFields = selectedField.taskFields;
        
        this.initializeTaskObject();
      }
    }
  }

  initializeTaskObject() {
    this.newTask = {}; // Reset task object
    this.taskFields.forEach(field => {
      this.newTask[field.name] = field.type === 'Select' ? field.options[0] : ''; // Default values
    });
  }

  /** Save or update task */
  addOrUpdateTask() {
    if (this.isEdit) {
      this.taskService.updateTask(this.fieldName, this.newTask);
    } else {
      this.taskService.addTask(this.fieldName, this.newTask);
    }
    this.closeTaskForm();
  }

  /** Close modal */
  closeTaskForm() {
    this.showTaskForm = false;
    this.newTask = {}; // Reset form
  }
}
