import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanboardComponent } from './kanbanboard.component';

describe('KanbanboardComponent', () => {
  let component: KanbanboardComponent;
  let fixture: ComponentFixture<KanbanboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
