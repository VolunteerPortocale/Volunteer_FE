import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { EditPersonalDetails } from './edit-personal-details';
import { AuthService } from '../../../service/auth.service';
import { UpdateUserGQL, UpdateUserPreferencesGQL } from '../../../core/graphql/services.private';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';
import { UserSessionService } from '../../../service/user-session.service';

describe('EditPersonalDetails', () => {
  let component: EditPersonalDetails;
  let fixture: ComponentFixture<EditPersonalDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPersonalDetails],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            currentUser: () => null,
            getSubject: () => 'test-sub',
          },
        },
        {
          provide: UpdateUserGQL,
          useValue: { mutate: () => of({ data: { updateUser: {} } }) },
        },
        {
          provide: UpdateUserPreferencesGQL,
          useValue: { mutate: () => of({ data: { updateUserPreferences: {} } }) },
        },
        {
          provide: CurrentUserLoaderService,
          useValue: { refresh: () => Promise.resolve() },
        },
        {
          provide: UserSessionService,
          useValue: { setUser: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPersonalDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
