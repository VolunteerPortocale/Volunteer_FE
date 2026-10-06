import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { EventService } from '../../service/event.service';
import { USER_ROLES } from '../../config/roles.config';

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
    FooterComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);

  // Profile role is determined strictly from authentication and user role
  readonly isNgo = computed<boolean>(() => {
    return this.authService.canManageEvents() || this.authService.hasRole(USER_ROLES.NGO);
  });
  readonly isEditing = signal<boolean>(false);
  readonly saveSuccess = signal<boolean>(false);
  readonly activeTab = signal<ProfileTab>('overview');

  // Editable Volunteer Profile State
  readonly volunteerName = signal<string>('Pavel Ciobanu');
  readonly volunteerTitle = signal<string>('Voluntar Activ • Pasionat de Ecologie');
  readonly volunteerBio = signal<string>(
    'Pasionat de protecția mediului, împădurire și sprijin comunitar. Cred în inițiative locale și în puterea fiecăruia dintre noi de a crea un impact pozitiv durabil.'
  );
  readonly volunteerPhone = signal<string>('+373 69 123 456');
  readonly volunteerCity = signal<string>('Chișinău, Republica Moldova');
  readonly volunteerSkills = signal<string[]>([
    'Protecția Mediului',
    'Plantare Arbori',
    'Prim Ajutor',
    'Organizare Evenimente',
    'Traducere (RO/EN/RU)',
    'Lucru în Echipă'
  ]);
  newSkillInput = signal<string>('');

  // Editable NGO Profile State
  readonly ngoName = signal<string>('Asociația Obștească «Eco Moldova»');
  readonly ngoTagline = signal<string>('Protejăm natura și regenerăm comunitățile verzi');
  readonly ngoMission = signal<string>(
    'Misiunea Eco Moldova este protejarea biodiversității, împădurirea zonelor degradate și promovarea educației ecologice în rândul tinerilor din Republica Moldova prin acțiuni civice concrete.'
  );
  readonly ngoIdno = signal<string>('1012600045892');
  readonly ngoEmail = signal<string>('contact@ecomoldova.md');
  readonly ngoPhone = signal<string>('+373 22 890 123');
  readonly ngoWebsite = signal<string>('https://ecomoldova.md');
  readonly ngoCity = signal<string>('Chișinău, str. Veronica Micle 10');
  readonly ngoCoordinator = signal<string>('Elena Moraru (Coordonator Voluntari)');
  readonly ngoDomains = signal<string[]>([
    'Ecologie & Mediu',
    'Educație Civică',
    'Regenerare Urbană',
    'Tineret & Sustenabilitate'
  ]);
  newDomainInput = signal<string>('');

  // Volunteer Metrics
  readonly volunteerStats = {
    hoursLogged: 48,
    nextMilestoneHours: 60,
    eventsAttended: 12,
    causesSupported: 5,
    badgesCount: 6,
    level: 'Nivel 3: Voluntar Senior'
  };

  // Badges Earned
  readonly badges = signal<VolunteerBadge[]>([
    {
      id: 'eco-hero',
      name: 'Erou al Naturii',
      icon: 'park',
      color: '#2e7d32',
      description: 'Peste 50 de puieți plantați în acțiuni ecologice.',
      dateEarned: 'Octombrie 2025'
    },
    {
      id: 'community-champ',
      name: 'Sprijin Comunitar',
      icon: 'volunteer_activism',
      color: '#e65100',
      description: 'Participare activă la 5+ campanii sociale pentru familii defavorizate.',
      dateEarned: 'Decembrie 2025'
    },
    {
      id: 'reliable-helper',
      name: 'Ajutor de Încredere',
      icon: 'verified_user',
      color: '#1565c0',
      description: 'Rată de prezență de 100% la evenimentele confirmate.',
      dateEarned: 'Ianuarie 2026'
    },
    {
      id: 'mentor-youth',
      name: 'Mentor Educațional',
      icon: 'school',
      color: '#6a1b9a',
      description: 'Peste 10 ore dedicate atelierelor de robotică și alfabetizare digitală.',
      dateEarned: 'Februarie 2026'
    }
  ]);

  // Volunteer Activity History
  readonly volunteerActivities = signal<ActivityHistoryItem[]>([
    {
      id: 'eco-forest',
      title: 'Plantăm păduri comunitare',
      organization: 'Eco Moldova',
      date: '3 Octombrie 2026',
      location: 'Strășeni, Moldova',
      hours: 6,
      status: 'confirmed',
      role: 'Voluntar plantare puieți'
    },
    {
      id: 'senior-digital',
      title: 'Atelier digital pentru seniori',
      organization: 'Asociația Seniori Activi',
      date: '10 Octombrie 2026',
      location: 'Chișinău, Biblioteca Națională',
      hours: 4,
      status: 'confirmed',
      role: 'Tutor digital smartphone'
    },
    {
      id: 'clean-bic',
      title: 'Marea Curățenie pe malul Râului Bâc',
      organization: 'Chișinău Verde',
      date: '15 Septembrie 2026',
      location: 'Chișinău, sector Râșcani',
      hours: 5,
      status: 'completed',
      role: 'Voluntar sortare deșeuri reciclabile'
    },
    {
      id: 'animal-shelter',
      title: 'Ziua Porților Deschise la Adăpostul de Câini',
      organization: 'Prietenii Neîndemânatici',
      date: '28 August 2026',
      location: 'Bălți, Moldova',
      hours: 7,
      status: 'completed',
      role: 'Asistent îngrijire și plimbare câini'
    }
  ]);

  // NGO Metrics
  readonly ngoStats = {
    eventsPublished: 8,
    volunteersMobilized: 240,
    completedProjects: 6,
    activeVolunteers: 45,
    averageRating: 4.9
  };

  // NGO Projects List
  readonly ngoProjects = computed<NgoProjectItem[]>(() => {
    return [
      {
        id: 'eco-forest',
        title: 'Plantăm păduri comunitare',
        date: '3 Octombrie 2026, 09:00',
        location: 'Strășeni, Moldova',
        volunteersNeeded: 40,
        volunteersRegistered: 32,
        status: 'active'
      },
      {
        id: 'clean-durlesti',
        title: 'Ecologizare Pădurea Durlești',
        date: '24 Octombrie 2026, 10:00',
        location: 'Durlești, Chișinău',
        volunteersNeeded: 25,
        volunteersRegistered: 18,
        status: 'active'
      },
      {
        id: 'green-schools',
        title: 'Grădini școlare senzoriale',
        date: '12 Noiembrie 2026, 11:00',
        location: 'Liceul «Gheorghe Asachi», Chișinău',
        volunteersNeeded: 15,
        volunteersRegistered: 15,
        status: 'in_progress'
      },
      {
        id: 'clean-bic-summer',
        title: 'Campania Bâc Curat — Ediția de Vară',
        date: '20 Iulie 2026',
        location: 'Chișinău',
        volunteersNeeded: 50,
        volunteersRegistered: 50,
        status: 'completed'
      }
    ];
  });

  // User details from AuthService
  readonly userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'PC';
    return user.initials || 'PC';
  });

  ngOnInit(): void {
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
    this.isEditing.update(v => !v);
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
      this.volunteerSkills.update(skills => [...skills, val]);
      this.newSkillInput.set('');
    }
  }

  removeSkill(skill: string): void {
    this.volunteerSkills.update(skills => skills.filter(s => s !== skill));
  }

  addDomain(): void {
    const val = this.newDomainInput().trim();
    if (val && !this.ngoDomains().includes(val)) {
      this.ngoDomains.update(domains => [...domains, val]);
      this.newDomainInput.set('');
    }
  }

  removeDomain(domain: string): void {
    this.ngoDomains.update(domains => domains.filter(d => d !== domain));
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
