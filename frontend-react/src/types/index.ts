export interface WeekendPlan {
  title: string;
  description?: string;
  day: 'saturday' | 'sunday';
  time?: string;
}

export interface WeekdayEvent {
  title: string;
  description?: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  time?: string;
}

export interface SportsEvent {
  child_name: string;
  sport: string;
  day: string;
  time: string;
  location: string;
}

export interface Week {
  week_start: string;
  week_end: string;
  has_libby_mary: boolean;
  has_sylvie: boolean;
  weekend_plans: WeekendPlan[];
  weekday_events: WeekdayEvent[];
  sports: SportsEvent[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeekUpdate {
  has_libby_mary?: boolean;
  has_sylvie?: boolean;
  weekend_plans?: WeekendPlan[];
  weekday_events?: WeekdayEvent[];
  sports?: SportsEvent[];
  notes?: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
