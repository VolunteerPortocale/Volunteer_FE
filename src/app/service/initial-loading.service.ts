import { Injectable, inject, signal, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitialLoadingService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Loading state signals
  readonly isLoading = signal<boolean>(true);
  readonly isExiting = signal<boolean>(false);
  readonly isDone = signal<boolean>(false);
  readonly loadingMessage = signal<string>('Se pregătește platforma...');

  private readonly pendingTasks = new Set<string>();
  private readonly startTime = Date.now();
  private readonly minDurationMs = 500; // Smooth minimal threshold to prevent jarring micro-flash
  private readonly maxTimeoutMs = 2800; // Failsafe timeout ensuring page always reveals even if backend hangs
  private hasFinished = false;
  private navigationFinished = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      // In SSR / server context, don't run browser timers
      this.isDone.set(true);
      this.isLoading.set(false);
      return;
    }

    // Safety timeout: unconditionally reveals the page if any task gets stuck
    const safetyTimer = window.setTimeout(() => {
      this.finish();
    }, this.maxTimeoutMs);

    this.destroyRef.onDestroy(() => {
      window.clearTimeout(safetyTimer);
    });

    // Listen for the initial router navigation completion
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
        this.navigationFinished = true;
        // Allow a brief tick for page components to register any data tasks
        window.setTimeout(() => {
          this.checkIfReady();
        }, 120);
      });
  }

  /**
   * Registers an async initialization task (e.g. 'home-events', 'home-auth-events')
   */
  registerTask(taskName: string): void {
    if (this.hasFinished) return;
    this.pendingTasks.add(taskName);
  }

  /**
   * Marks a registered task as completed and checks readiness
   */
  markReady(taskName?: string): void {
    if (this.hasFinished) return;

    if (taskName) {
      this.pendingTasks.delete(taskName);
    }

    this.checkIfReady();
  }

  /**
   * Updates the progress message shown on the loading stage
   */
  setMessage(message: string): void {
    this.loadingMessage.set(message);
  }

  private checkIfReady(): void {
    if (this.hasFinished) return;

    if (this.navigationFinished && this.pendingTasks.size === 0) {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.minDurationMs - elapsed);

      window.setTimeout(() => {
        this.finish();
      }, remaining);
    }
  }

  /**
   * Concludes the initial loading stage with a smooth exit transition
   */
  finish(): void {
    if (this.hasFinished) return;
    this.hasFinished = true;

    // Start exit transition
    this.isExiting.set(true);

    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        this.isLoading.set(false);
        this.isDone.set(true);
      }, 450);
    } else {
      this.isLoading.set(false);
      this.isDone.set(true);
    }
  }
}
