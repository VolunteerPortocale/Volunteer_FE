import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { GetCurrentUserGQL } from '../../core/graphql';

export type ProfileTab = 'overview' | 'events' | 'badges' | 'about';

export interface VolunteerBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  dateEarned: string;
}

export interface ActivityHistoryItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  location: string;
  hours: number;
  status: 'confirmed' | 'completed' | 'in_progress';
  role: string;
}

export interface NgoProjectItem {
  id: string;
  title: string;
  date: string;
  location: string;
  volunteersNeeded: number;
  volunteersRegistered: number;
  status: 'active' | 'in_progress' | 'completed';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslatePipe,
    FooterComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private userProfile = String;

  private readonly getCurrentUserGql = inject(GetCurrentUserGQL);

  // User details from AuthService
  readonly userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'PC';
    return user.initials || 'PC';
  });

  ngOnInit(): void {

    this.getCurrentUserGql.query().subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.data?.createUser) {
          this.isSubmitted.set(true);
          this.router.navigate(['/' + this.routes.OTP], {
            queryParams: { email: input.email },
          });
        } else if (result.error) {
          this.errorMessage.set(result.error.message);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.graphQLErrors?.[0]?.message || err?.message || '';
        if (msg.includes('already exists') || msg.includes('E409_001')) {
          this.errorMessage.set(
            this.translationService.translate('SIGNUP.ERRORS.EMAIL_EXISTS') ||
              'Un cont cu această adresă de email există deja.',
          );
        } else {
          this.errorMessage.set(
            msg || 'A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.',
          );
        }
      },
    });
    const current = this.authService.currentUser();
    if (current?.name) {
      if (this.isNgo()) {
        this.ngoName.set(current.name);
      } else {
        this.volunteerName.set(current.name);
      }
    }
    if (current?.email && this.isNgo()) {
      this.ngoEmail.set(current.email);
    }
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  toggleEdit(): void {
    this.isEditing.update((v) => !v);
    this.saveSuccess.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.saveSuccess.set(false);
  }

  saveProfile(): void {
    this.isEditing.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.saveSuccess.set(false);
    }, 4000);
  }

  addSkill(): void {
    const val = this.newSkillInput().trim();
    if (val && !this.volunteerSkills().includes(val)) {
      this.volunteerSkills.update((skills) => [...skills, val]);
      this.newSkillInput.set('');
    }
  }

  removeSkill(skill: string): void {
    this.volunteerSkills.update((skills) => skills.filter((s) => s !== skill));
  }

  addDomain(): void {
    const val = this.newDomainInput().trim();
    if (val && !this.ngoDomains().includes(val)) {
      this.ngoDomains.update((domains) => [...domains, val]);
      this.newDomainInput.set('');
    }
  }

  removeDomain(domain: string): void {
    this.ngoDomains.update((domains) => domains.filter((d) => d !== domain));
  }

  downloadCertificate(activity: ActivityHistoryItem): void {
    const textContent = `
=====================================================
          ADEVERINȚĂ DE VOLUNTARIAT
              VOLUNTEERIO MOLDOVA
=====================================================

Prin prezenta se certifică faptul că voluntarul:
Nume / Prenume: ${this.volunteerName()}
Email: ${this.authService.currentUser()?.email || 'voluntar@volunteerio.md'}

A participat activ în cadrul proiectului:
Proiect: "${activity.title}"
Organizație gazdă: ${activity.organization}
Locație: ${activity.location}
Data desfășurării: ${activity.date}
Rol îndeplinit: ${activity.role}

Număr de ore de voluntariat validate: ${activity.hours} ORE

Emitent: Platforma Națională de Voluntariat VOLUNTEERIO
Document generat electronic: ${new Date().toLocaleDateString('ro-RO')}
Cod validare: MD-VOL-${Math.random().toString(36).substring(2, 9).toUpperCase()}
=====================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Adeverinta_Voluntariat_${activity.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  administerEvent(id: string): void {
    this.router.navigate(['/administrare-eveniment', id]);
  }

  editEvent(id: string): void {
    this.router.navigate(['/editeaza-eveniment', id]);
  }

  addNewEvent(): void {
    this.router.navigate(['/adauga-eveniment']);
  }
}
