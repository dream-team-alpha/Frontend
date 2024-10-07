import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubAdminsComponent } from './manage-sub-admins.component';

describe('ManageSubAdminsComponent', () => {
  let component: ManageSubAdminsComponent;
  let fixture: ComponentFixture<ManageSubAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageSubAdminsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
