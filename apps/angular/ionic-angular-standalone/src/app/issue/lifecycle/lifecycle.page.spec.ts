import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LifecyclePage } from './lifecycle.page';

describe('LifecyclePage', () => {
  let component: LifecyclePage;
  let fixture: ComponentFixture<LifecyclePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LifecyclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
