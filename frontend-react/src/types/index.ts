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

export interface ChildGroup {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export interface Week {
  week_start: string;
  week_end: string;
  children_present: string[];
  weekend_plans: WeekendPlan[];
  weekday_events: WeekdayEvent[];
  sports: SportsEvent[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeekUpdate {
  children_present?: string[];
  weekend_plans?: WeekendPlan[];
  weekday_events?: WeekdayEvent[];
  sports?: SportsEvent[];
  notes?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export type ViewMode = 'list' | 'calendar';

export interface DayEvents {
  weekendPlans: WeekendPlan[];
  weekdayEvents: WeekdayEvent[];
  sports: SportsEvent[];
  childrenPresent: string[];
}

export interface UserSettings {
  child_groups: ChildGroup[];
}
