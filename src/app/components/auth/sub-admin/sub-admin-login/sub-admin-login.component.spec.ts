import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAdminLoginComponent } from './sub-admin-login.component';

describe('SubAdminLoginComponent', () => {
  let component: SubAdminLoginComponent;
  let fixture: ComponentFixture<SubAdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubAdminLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
