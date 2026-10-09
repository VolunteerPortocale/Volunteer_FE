import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { EditPreferences } from './edit-preferences';
import { AuthService } from '../../../service/auth.service';
import { UpdateUserPreferencesGQL } from '../../../core/graphql/services.private';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';
import { UserSessionService } from '../../../service/user-session.service';

describe('EditPreferences', () => {
  let component: EditPreferences;
  let fixture: ComponentFixture<EditPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPreferences],
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

    fixture = TestBed.createComponent(EditPreferences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
