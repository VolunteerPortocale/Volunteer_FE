import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPreferences } from './edit-preferences';

describe('EditPreferences', () => {
  let component: EditPreferences;
  let fixture: ComponentFixture<EditPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPreferences],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPreferences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
