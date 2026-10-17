import { Component, inject, signal, OnDestroy, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Html5Qrcode } from 'html5-qrcode';
import { EnrollmentService } from '../../../service/enrollment.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.scss',
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly platformId = inject(PLATFORM_ID);
  private scanner: Html5Qrcode | null = null;

  readonly status = signal<'scanning' | 'success' | 'error'>('scanning');
  readonly message = signal<string>('');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scanner = new Html5Qrcode('qr-reader');
      this.startCamera();
    }
  }

  async startCamera(): Promise<void> {
    this.status.set('scanning');
    try {
      await this.scanner?.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (code) => this.onScan(code),
        () => {}
      );
    } catch {
      this.status.set('error');
      this.message.set('Nu s-a putut accesa camera. Asigură-te că ai permis accesul camerei și folosești conexiune HTTPS.');
    }
  }

  async onScan(code: string): Promise<void> {
    await this.scanner?.stop();
    try {
      const ok = await this.enrollmentService.confirmVolunteerPresence(code);
      this.status.set(ok ? 'success' : 'error');
      this.message.set(ok ? 'Prezență confirmată!' : 'Cod invalid sau deja confirmat.');
    } catch {
      this.status.set('error');
      this.message.set('Eroare la confirmare.');
    }
  }

  async scanNext(): Promise<void> {
    await this.startCamera();
  }

  ngOnDestroy(): void {
    if (this.scanner?.isScanning) {
      this.scanner.stop().catch(() => {});
    }
  }
}
