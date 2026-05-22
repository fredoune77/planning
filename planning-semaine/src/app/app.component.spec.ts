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

  it('should count a holiday as 7h24', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;
    const lundi = app.days[0];

    app.schedule.lundi.holiday = true;
    app.onHolidayToggle(lundi);

    expect(app.formatDuration(app.getDayWorkedMinutes(lundi))).toBe('7h24');
    expect(app.formatDuration(app.weeklyWorkedMinutes)).toBe('36h44');
  });

  it('should disable arrival, departure and sport when holiday is checked', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;

    app.schedule.lundi.holiday = true;
    app.onHolidayToggle(app.days[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const arrival = compiled.querySelector('#lundi-arrival') as HTMLInputElement;
    const departure = compiled.querySelector('#lundi-departure') as HTMLInputElement;
    const sport = compiled.querySelector('#lundi-sport') as HTMLInputElement;

    expect(arrival.disabled).toBeTrue();
    expect(departure.disabled).toBeTrue();
    expect(sport.disabled).toBeTrue();
  });

  it('should display a holiday badge on the day card when holiday is checked', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;

    app.schedule.lundi.holiday = true;
    app.onHolidayToggle(app.days[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.holiday-day .holiday-badge');

    expect(badge?.textContent).toContain('Ferie');
  });

  it('should generate a dedicated export line for a holiday', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any;
    const lundi = app.days[0];

    app.schedule.lundi.holiday = true;
    app.onHolidayToggle(lundi);
    app.generatePlanningText();

    expect(app.planningText).toContain('Lundi: jour ferie (7h24)');
  });
});
