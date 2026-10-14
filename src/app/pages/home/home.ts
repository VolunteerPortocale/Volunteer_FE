import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectCardComponent } from './project-card/project-card';
import { FooterComponent } from '../../common/components/footer/footer';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { TranslationService } from '../../service/translation.service';
import { GetLastThreeActiveEventsGQL } from '../../core/graphql/services.public';
import { EventFileType } from '../../core/graphql/types';
import { environment } from '../../../environments/environment';

export interface HomeProject {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  imageUrl: File;
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
  private readonly translationService = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = signal<HomeProject[]>([]);

  ngOnInit(): void {
    this.getLastThreeActiveEventsGQL
      .watch({ fetchPolicy: 'cache-and-network' })
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (result) => {
          const events = result.data?.getLastThreeActiveEvents;
          if (events && events.length > 0) {
            const validEvents = events.filter(
              (e): e is NonNullable<typeof e> => !!e && !!e.details
            );

            const mapped: HomeProject[] = await Promise.all(
              validEvents.map(async (e) => {
                const coverFile = e?.files?.find((f) => f.type === EventFileType.Cover);
                const file = await this.getEventCoverFile(coverFile, e.category);

                return {
                  id: e.id ?? '',
                  title: e.details?.title ?? '',
                  description: e.details?.description ?? '',
                  location: e.details?.location || 'Chișinău, Moldova',
                  category:
                    this.translationService.translate(`PROFILE.TAGLINE_CATEGORY.${e.category}`) ||
                    (e.category ?? ''),
                  imageUrl: file,
                };
              })
            );

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

  private async getEventCoverFile(
    coverFile?: { id?: string; originalName?: string; contentType?: string } | null,
    category?: string | null
  ): Promise<File> {
    if (coverFile?.id) {
      try {
        const res = await fetch(`${environment.apiUrl}/v1/files/${coverFile.id}/content`);
        if (res.ok) {
          const blob = await res.blob();
          return new File([blob], coverFile.originalName || 'cover.jpg', {
            type: coverFile.contentType || blob.type || 'image/jpeg',
          });
        }
      } catch (err) {
        console.warn('Could not fetch cover file from storage endpoint:', err);
      }
    }

    // Default / fallback image converted to a File object
    const fallbackUrl = (category && CATEGORY_IMAGES[category]) || DEFAULT_IMAGE;
    try {
      const res = await fetch(fallbackUrl);
      const blob = await res.blob();
      return new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' });
    } catch {
      return new File([], 'cover.jpg', { type: 'image/jpeg' });
    }
  }
}
