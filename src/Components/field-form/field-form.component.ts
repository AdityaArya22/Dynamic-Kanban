import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldService,Field } from '../../Services/field.service';
@Component({
  selector: 'app-field-form',
  imports: [FormsModule],
  templateUrl: './field-form.component.html',
  styleUrl: './field-form.component.css'
})
export class FieldFormComponent {
  router = inject(Router)
  numCount: number = 0;
  fields: { fieldName: string; stages: string[] }[] = [
    { fieldName: '', stages: [] }
  ];
  showStages: boolean = false;
  currentFieldIndex: number = 0;
  stageCount: number = 0;
  stageInputVisible: boolean = false; // Controls visibility of stage input fields

  generateFields() {
    this.fields = Array.from({ length: this.numCount }, () => ({
      fieldName: '',
      stages: [],
    }));
  }

  proceedToStages(index: number) {
    this.currentFieldIndex = index;
    this.showStages = true;
    this.stageCount = 0; // Reset stage count
    this.stageInputVisible = false; // Hide previous stage inputs
  }

  setStageCount() {
    if (this.stageCount > 0) {
      this.fields[this.currentFieldIndex].stages = new Array(this.stageCount).fill('');
      this.stageInputVisible = true; // Now show input fields for stage names
    }
  }


  allFieldsFilled(): boolean {
    return this.fields.every(field => field.fieldName.trim() !== '');
  }

  allStagesFilled(): boolean {
    return this.fields.every(field => field.stages.every(stage => stage.trim() !== ''));
  }
  saveStages() {
    this.showStages = false; // Hide stage input after completing
  }
  saveFields() {
    if (this.allFieldsFilled() && this.allStagesFilled()) {
      // Use the service to add fields instead of modifying localStorage directly
      this.kanbanService.addFields(this.fields);
  
      // Navigate without forcing a reload
      this.router.navigateByUrl("/");
    }
  }
  
  

  constructor(private kanbanService:FieldService){

  }
}
