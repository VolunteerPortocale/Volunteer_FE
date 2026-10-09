import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { GetCurrentUserGQL } from '../core/graphql/services.private';
import { UserSessionService } from './user-session.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserLoaderService {
  private readonly getCurrentUserGQL = inject(GetCurrentUserGQL);
  private readonly userSession = inject(UserSessionService);
  private readonly authService = inject(AuthService);

  private loadingPromise: Promise<void> | null = null;

  load(subject: string): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    const request = this.fetchCurrentUser(subject);

    this.loadingPromise = request;

    void request
      .finally(() => {
        if (this.loadingPromise === request) {
          this.loadingPromise = null;
        }
      })
      .catch(() => {});

    return request;
  }

  private async fetchCurrentUser(subject: string): Promise<void> {
    const { data } = await firstValueFrom(
      this.getCurrentUserGQL.fetch({
        fetchPolicy: 'network-only',
      }),
    );

    const user = data?.getCurrentUser;

    if (!user) {
      throw new Error('Current user not found');
    }

    this.userSession.setUser(subject, user);
  }

  async refresh(): Promise<void> {
    if (this.loadingPromise) {
      await this.loadingPromise.catch(() => {});
    }

    const subject = this.authService.getSubject();

    if (!subject) return;

    await this.load(subject);
  }
}
