import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActionsMenuItemComponent } from './user-actions-menu-item.component';

describe('UserActionsMenuItemComponent', () => {
  let component: UserActionsMenuItemComponent;
  let fixture: ComponentFixture<UserActionsMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserActionsMenuItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActionsMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
