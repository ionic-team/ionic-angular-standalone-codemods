import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotImportOnePage } from './not-import-one.page';

describe('NotImportOnePage', () => {
  let component: NotImportOnePage;
  let fixture: ComponentFixture<NotImportOnePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NotImportOnePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
