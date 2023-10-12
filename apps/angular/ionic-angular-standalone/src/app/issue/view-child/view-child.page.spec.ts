import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewChildPage } from './view-child.page';

describe('ViewChildPage', () => {
  let component: ViewChildPage;
  let fixture: ComponentFixture<ViewChildPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ViewChildPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
