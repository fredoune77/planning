import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

type DayKey = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';

interface WorkDay {
  key: DayKey;
  label: string;
  arrivalMin: number;
  arrivalMax: number;
  departureMin: number;
  departureMax: number;
  defaultArrival: string;
  defaultDeparture: string;
}

interface DaySchedule {
  arrival: string;
  departure: string;
  sport: boolean;
  holiday: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected readonly lunchStart = '12:00';
  protected readonly lunchEnd = '13:00';
  protected readonly publicHolidayMinutes = 7 * 60 + 24;
  protected readonly weeklyTargetMinutes = 37 * 60;

  protected readonly days: WorkDay[] = [
    {
      key: 'lundi',
      label: 'Lundi',
      arrivalMin: this.toMinutes('08:00'),
      arrivalMax: this.toMinutes('09:30'),
      departureMin: this.toMinutes('16:30'),
      departureMax: this.toMinutes('17:30'),
      defaultArrival: '08:30',
      defaultDeparture: '17:20'
    },
    {
      key: 'mardi',
      label: 'Mardi',
      arrivalMin: this.toMinutes('08:00'),
      arrivalMax: this.toMinutes('09:30'),
      departureMin: this.toMinutes('16:30'),
      departureMax: this.toMinutes('17:30'),
      defaultArrival: '08:30',
      defaultDeparture: '17:20'
    },
    {
      key: 'mercredi',
      label: 'Mercredi',
      arrivalMin: this.toMinutes('08:00'),
      arrivalMax: this.toMinutes('09:30'),
      departureMin: this.toMinutes('16:30'),
      departureMax: this.toMinutes('17:30'),
      defaultArrival: '08:30',
      defaultDeparture: '17:20'
    },
    {
      key: 'jeudi',
      label: 'Jeudi',
      arrivalMin: this.toMinutes('08:00'),
      arrivalMax: this.toMinutes('09:30'),
      departureMin: this.toMinutes('16:30'),
      departureMax: this.toMinutes('17:30'),
      defaultArrival: '08:30',
      defaultDeparture: '17:20'
    },
    {
      key: 'vendredi',
      label: 'Vendredi',
      arrivalMin: this.toMinutes('08:00'),
      arrivalMax: this.toMinutes('09:30'),
      departureMin: this.toMinutes('15:30'),
      departureMax: this.toMinutes('16:00'),
      defaultArrival: '08:30',
      defaultDeparture: '16:00'
    }
  ];

  protected readonly schedule: Record<DayKey, DaySchedule> = this.days.reduce(
    (result, day) => {
      result[day.key] = {
        arrival: day.defaultArrival,
        departure: day.defaultDeparture,
        sport: false,
        holiday: false
      };
      return result;
    },
    {} as Record<DayKey, DaySchedule>
  );

  protected planningText = '';
  protected copyMessage = '';

  protected onTimeChange(day: WorkDay, field: 'arrival' | 'departure'): void {
    if (this.schedule[day.key].holiday) {
      return;
    }

    if (field === 'departure' && this.schedule[day.key].sport) {
      this.schedule[day.key].departure = '17:00';
      if (this.planningText) {
        this.generatePlanningText();
      }
      return;
    }

    const configMin = field === 'arrival' ? day.arrivalMin : day.departureMin;
    const configMax = field === 'arrival' ? day.arrivalMax : day.departureMax;
    const value = this.schedule[day.key][field];
    this.schedule[day.key][field] = this.normalizeTime(value, configMin, configMax);

    const arrival = this.toMinutes(this.schedule[day.key].arrival);
    const departure = this.toMinutes(this.schedule[day.key].departure);

    if (arrival >= departure) {
      if (field === 'arrival') {
        const adjustedDeparture = this.clamp(arrival + 60, day.departureMin, day.departureMax);
        this.schedule[day.key].departure = this.toTime(adjustedDeparture);
      } else {
        const adjustedArrival = this.clamp(departure - 60, day.arrivalMin, day.arrivalMax);
        this.schedule[day.key].arrival = this.toTime(adjustedArrival);
      }
    }

    if (this.planningText) {
      this.generatePlanningText();
    }
  }

  protected onSportToggle(day: WorkDay): void {
    const item = this.schedule[day.key];

    if (item.holiday) {
      item.sport = false;
      return;
    }

    if (item.sport) {
      item.departure = '17:00';
    } else {
      item.departure = this.normalizeTime(day.defaultDeparture, day.departureMin, day.departureMax);
    }

    const arrival = this.toMinutes(item.arrival);
    const departure = this.toMinutes(item.departure);

    if (arrival >= departure) {
      const maxArrival = item.sport ? this.toMinutes('16:00') : day.arrivalMax;
      item.arrival = this.toTime(this.clamp(departure - 60, day.arrivalMin, maxArrival));
    }

    if (this.planningText) {
      this.generatePlanningText();
    }
  }

  protected onHolidayToggle(day: WorkDay): void {
    const item = this.schedule[day.key];

    if (item.holiday && item.sport) {
      item.sport = false;
      item.departure = this.normalizeTime(day.defaultDeparture, day.departureMin, day.departureMax);
    }

    if (this.planningText) {
      this.generatePlanningText();
    }
  }

  protected getDayWorkedMinutes(day: WorkDay): number {
    const item = this.schedule[day.key];

    if (item.holiday) {
      return this.publicHolidayMinutes;
    }

    const dayMinutes = this.toMinutes(item.departure) - this.toMinutes(item.arrival);
    const lunchMinutes = this.toMinutes(this.lunchEnd) - this.toMinutes(this.lunchStart);
    return Math.max(0, dayMinutes - lunchMinutes);
  }

  protected get weeklyWorkedMinutes(): number {
    return this.days.reduce((total, day) => total + this.getDayWorkedMinutes(day), 0);
  }

  protected get weeklyDeltaMinutes(): number {
    return this.weeklyWorkedMinutes - this.weeklyTargetMinutes;
  }

  protected formatDuration(minutes: number): string {
    const sign = minutes < 0 ? '-' : '';
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h}h${m.toString().padStart(2, '0')}`;
  }

  protected formatBound(minutes: number): string {
    return this.toTime(minutes);
  }

  protected get weeklyDeltaLabel(): string {
    const delta = this.weeklyDeltaMinutes;
    if (delta === 0) {
      return 'Vous etes exactement a 37h.';
    }
    if (delta > 0) {
      return `${this.formatDuration(delta)} en plus`;
    }
    return `${this.formatDuration(Math.abs(delta))} en moins`;
  }

  protected generatePlanningText(): void {
    this.planningText = this.days
      .map((day) => {
        const item = this.schedule[day.key];

        if (item.holiday) {
          return `${day.label}: jour ferie (${this.formatDuration(this.publicHolidayMinutes)})`;
        }

        const sportLabel = item.sport ? ' - sport' : '';
        return `${day.label}: ${item.arrival} - ${this.lunchStart} / ${this.lunchEnd} - ${item.departure} (${this.formatDuration(this.getDayWorkedMinutes(day))}${sportLabel})`;
      })
      .join('\n');
    this.copyMessage = '';
  }

  protected async copyPlanningText(): Promise<void> {
    if (!this.planningText) {
      this.copyMessage = 'Generez le texte avant de copier.';
      return;
    }

    if (!navigator.clipboard) {
      this.copyMessage = 'Copie non disponible sur ce navigateur.';
      return;
    }

    try {
      await navigator.clipboard.writeText(this.planningText);
      this.copyMessage = 'Planning copie dans le presse-papiers.';
    } catch {
      this.copyMessage = 'Impossible de copier automatiquement.';
    }
  }

  private normalizeTime(value: string, min: number, max: number): string {
    const parsed = this.toMinutes(value);
    const rounded = Math.round(parsed / 5) * 5;
    return this.toTime(this.clamp(rounded, min, max));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map((n) => Number.parseInt(n, 10));
    return h * 60 + m;
  }

  private toTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
