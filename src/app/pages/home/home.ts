import { Component, inject, signal, OnInit, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QueryRef } from 'apollo-angular';
import { ProjectCardComponent } from './project-card/project-card';
import { FooterComponent } from '../../common/components/footer/footer';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { TranslationService } from '../../service/translation.service';
import {
  GetLastThreeActiveEventsGQL,
  GetLastThreeActiveEventsQuery,
  GetLastThreeActiveEventsQueryVariables,
} from '../../core/graphql/services.public';
import { EventFileType } from '../../core/graphql/types';
import { environment } from '../../../environments/environment';

export interface HomeProject {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  imageUrl: string | File;
}

const CATEGORY_IMAGES: Record<string, string> = {
  ANIMAL_CARE: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
  ENVIRONMENT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  EDUCATION: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  SCIENCE: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  HEALTH: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
  SOCIAL: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-home',
  imports: [ProjectCardComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly getLastThreeActiveEventsGQL = inject(GetLastThreeActiveEventsGQL);
  readonly translationService = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = signal<HomeProject[]>([]);
  private queryRef?: QueryRef<GetLastThreeActiveEventsQuery, GetLastThreeActiveEventsQueryVariables>;

  constructor() {
    effect(() => {
      // Re-fetch events when the user changes active language
      this.translationService.currentLang();
      if (this.queryRef) {
        this.queryRef.refetch().catch((err) => {
          console.warn('Could not refetch latest events on language change:', err);
        });
      }
    });
  }

  ngOnInit(): void {
    this.queryRef = this.getLastThreeActiveEventsGQL.watch({
      fetchPolicy: 'network-only',
    });

    this.queryRef.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const events = result.data?.getLastThreeActiveEvents;
          if (events && events.length > 0) {
            const validEvents = events.filter(
              (e): e is NonNullable<typeof e> => !!e && !!e.details
            );

            const mapped: HomeProject[] = validEvents.map((e) => {
              const coverFile = e.files?.find((f) => f.type === EventFileType.Cover);
              const imageUrl = coverFile?.id
                ? `${environment.apiUrl}/v1/files/${coverFile.id}/content`
                : ((e.category && CATEGORY_IMAGES[e.category]) || DEFAULT_IMAGE);

              return {
                id: e.id ?? '',
                title: e.details?.title || '',
                description: e.details?.description || '',
                location: e.details?.location || 'Chișinău, Moldova',
                category:
                  this.translationService.translate(`PROFILE.TAGLINE_CATEGORY.${e.category}`) ||
                  (e.category ?? ''),
                imageUrl,
              };
            });

            this.projects.set(mapped);
          } else {
            this.projects.set([]);
          }
        },
        error: () => {
          this.projects.set([]);
        },
      });
  }
}
