import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputListItemComponent } from './input-list-item.component';

describe('InputListItemComponent', () => {
  let component: InputListItemComponent;
  let fixture: ComponentFixture<InputListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
