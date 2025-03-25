import { Component, OnInit } from '@angular/core';
import { FieldService, Field } from '../../Services/field.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fields-list',
  imports: [RouterLink],
  templateUrl: './fields-list.component.html',
  styleUrl: './fields-list.component.scss'
})
export class FieldsListComponent implements OnInit {
  fields: Field[] = [];

  constructor(private fieldService: FieldService) {}

  ngOnInit(): void {
    // Subscribe to field changes
    this.fieldService.fields$.subscribe((updatedFields) => {
      this.fields = updatedFields;
    });
  }

  deleteField(index: number): void {
    this.fieldService.deleteField(index);
  }
}
