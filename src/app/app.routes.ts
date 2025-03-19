import { Routes } from '@angular/router';
import { FieldsListComponent } from '../Components/fields-list/fields-list.component';
import { FieldFormComponent } from '../Components/field-form/field-form.component';
import { KanbanboardComponent } from '../Components/kanbanboard/kanbanboard.component';
import { NavbarComponent } from '../Components/navbar/navbar.component';

export const routes: Routes = [
   {path:"",component:NavbarComponent, children:[
    {path:'',component:FieldsListComponent},
    {path:'create',component:FieldFormComponent},
    {path:'kanban/:fieldName',component:KanbanboardComponent},
   ]}
];
