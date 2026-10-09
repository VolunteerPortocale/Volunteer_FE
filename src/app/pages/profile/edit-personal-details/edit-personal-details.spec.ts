import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPersonalDetails } from './edit-personal-details';

describe('EditPersonalDetails', () => {
  let component: EditPersonalDetails;
  let fixture: ComponentFixture<EditPersonalDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPersonalDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPersonalDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
