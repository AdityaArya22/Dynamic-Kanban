import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldService, Field } from '../../Services/field.service';

@Component({
  selector: 'app-field-form',
  imports: [FormsModule],
  templateUrl: './field-form.component.html',
  styleUrl: './field-form.component.scss'
})
export class FieldFormComponent {
  router = inject(Router);
  numCount: number = 0;
  
  fields: { 
    fieldName: string; 
    stages: string[]; 
    taskFields: { 
      name: string; 
      type: string; 
      options: string[]; 
      optionCount?: number; 
    }[];
    allowedTransitions: { [key: string]: string[] };
  }[] = [
    { 
      fieldName: '', 
      stages: [], 
      taskFields: [{ name: '', type: 'Text', options: [], optionCount: 0 }], 
      allowedTransitions: {}
    }
  ];

  showStages: boolean = false;
  showTaskFields: boolean = false;
  currentFieldIndex: number = 0;
  stageCount: number = 0;
  stageInputVisible: boolean = false; 
  fieldTypes = ["Text", "Textarea", "Date", "Select"];

  generateFields() {
    this.fields = Array.from({ length: this.numCount }, () => ({
      fieldName: '',
      stages: [],
      taskFields: [],
      allowedTransitions: {}
    }));
  }

  proceedToStages(index: number) {
    this.currentFieldIndex = index;
    this.showStages = true;
    this.showTaskFields = false;
    this.stageCount = 0; 
    this.stageInputVisible = false; 
  }

  setStageCount() {
    if (this.stageCount > 0) {
      this.fields[this.currentFieldIndex].stages = new Array(this.stageCount).fill('');
      this.stageInputVisible = true;
    }
  }

  proceedToTaskFields() {
    this.showTaskFields = true;
  }

  addTaskField() {
    this.fields[this.currentFieldIndex].taskFields.push({ name: '', type: 'Text', options: [], optionCount: 0 });
  }

  removeTaskField(index: number) {
    this.fields[this.currentFieldIndex].taskFields.splice(index, 1);
  }

  generateOptions(field: any) {
    field.options = new Array(field.optionCount).fill('');
  }

  addDropdownOption(fieldIndex: number) {
    const taskField = this.fields[this.currentFieldIndex].taskFields[fieldIndex];
    taskField.options ??= [];
    taskField.options.push('');
  }

  // **✅ Allowed Transitions Functionality**
  toggleTransition(fieldIndex: number, fromStage: string, toStage: string) {
    const field = this.fields[fieldIndex];

    if (!field.allowedTransitions[fromStage]) {
      field.allowedTransitions[fromStage] = [];
    }

    const index = field.allowedTransitions[fromStage].indexOf(toStage);
    if (index > -1) {
      field.allowedTransitions[fromStage].splice(index, 1);
    } else {
      field.allowedTransitions[fromStage].push(toStage);
    }
  }

  allFieldsFilled(): boolean {
    return this.fields.every(field => field.fieldName.trim() !== '');
  }

  allStagesFilled(): boolean {
    return this.fields.every(field => field.stages.every(stage => stage.trim() !== ''));
  }

  allTaskFieldsFilled(): boolean {
    return this.fields.every(field =>
      field.taskFields.every(taskField => taskField.name.trim() !== '')
    );
  }

  saveFields() {
    if (this.stageCount < 1) return;
    if (this.allFieldsFilled() && this.allStagesFilled()) {
      this.fields.forEach(field => {
        field.taskFields.forEach(taskField => {
          console.log(taskField.options);
        });
      });

      // Save fields with allowed transitions
      this.kanbanService.addFields(this.fields);
      this.router.navigateByUrl("/");
    }
  }

  constructor(private kanbanService: FieldService) {}
}
