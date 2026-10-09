import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileOverview } from './profile-overview';
import { AuthService } from '../../../service/auth.service';

describe('ProfileOverview', () => {
  let component: ProfileOverview;
  let fixture: ComponentFixture<ProfileOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileOverview],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: { currentUser: () => null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
