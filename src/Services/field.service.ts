import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Field {
  fieldName: string;
  stages: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private fieldsSubject = new BehaviorSubject<Field[]>(this.loadFieldsFromStorage());
  fields$ = this.fieldsSubject.asObservable(); // Observable for real-time updates

  constructor() {}

  private loadFieldsFromStorage(): Field[] {
    const storedFields = localStorage.getItem('kanbanFields');
    return storedFields ? JSON.parse(storedFields) : [];
  }

  getFields(): Field[] {
    return this.fieldsSubject.getValue();
  }

  addFields(newFields: Field[]): void {
    const updatedFields = [...this.getFields(), ...newFields];
    this.fieldsSubject.next(updatedFields);
    localStorage.setItem('kanbanFields', JSON.stringify(updatedFields));
  }

  deleteField(index: number): void {
    const updatedFields = this.getFields().filter((_, i) => i !== index);
    this.fieldsSubject.next(updatedFields); // Emit updated list
    localStorage.setItem('kanbanFields', JSON.stringify(updatedFields));
  }
}
