import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the planning title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Planning hebdomadaire');
  });

  it('should show the default weekly total', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hours')?.textContent).toContain('37h00');
  });

  it('should force departure to 17:00 when sport is checked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;
    const lundi = app.days[0];

    app.schedule.lundi.sport = true;
    app.onSportToggle(lundi);

    expect(app.schedule.lundi.departure).toBe('17:00');
  });

  it('should update the weekly total when sport is checked on friday', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;
    const vendredi = app.days.find((day: any) => day.key === 'vendredi');

    app.schedule.vendredi.sport = true;
    app.onSportToggle(vendredi);

    expect(app.formatDuration(app.weeklyWorkedMinutes)).toBe('38h00');
  });
});
