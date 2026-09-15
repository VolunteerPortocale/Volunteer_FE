import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslatePipe } from './translate-pipe';
import { TranslationService } from '../../service/translation.service';

describe('TranslatePipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), TranslationService]
    });

    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
    expect(pipe).toBeTruthy();
  });
});