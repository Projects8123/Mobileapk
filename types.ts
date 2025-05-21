export enum HabitCategory {
  SLEEP = 'Sleep',
  WATER = 'Water',
  EXERCISE = 'Exercise',
  MEDITATION = 'Meditation',
}

export enum SleepQuality {
  POOR = 'Poor',
  FAIR = 'Fair',
  GOOD = 'Good',
  EXCELLENT = 'Excellent',
}

export enum MeditationMood {
  STRESSED = 'Stressed',
  NEUTRAL = 'Neutral',
  CALM = 'Calm',
  FOCUSED = 'Focused',
}

export interface Habit {
  id: HabitCategory;
  nameKey: string; // Translation key for habit name e.g. "habit.sleep.name"
  unitKey: string; // Translation key for unit e.g. "habit.sleep.unit"
  goal: number; // Daily goal
  icon: React.ComponentType<{ className?: string, size?: number, color?: string }>;
}

export interface HabitLog {
  id: string; // Unique ID for the log entry
  date: string; // YYYY-MM-DD
  habitCategory: HabitCategory;
  value: number;
  details?: {
    sleepQuality?: SleepQuality;
    exerciseType?: string;
    meditationMood?: MeditationMood;
  };
}

export type SubscriptionStatus = 'free' | 'premium';

export interface UserProfile {
  name: string;
  goals: Partial<Record<HabitCategory, number>>;
  theme: string; // Theme name
  language: string; // e.g., 'en', 'bg'
  subscriptionStatus: SubscriptionStatus;
}

export interface PointsBadge {
  totalPoints: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  nameKey: string; // Translation key for badge name
  descriptionKey: string; // Translation key for badge description
  achieved: boolean;
  icon: React.ComponentType<{ className?: string, size?: number, color?: string }>;
  dateAchieved?: string;
}

export interface Theme {
  name: string; // Theme name itself might not need translation if it's a code identifier
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
  };
}

export interface AICoachMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

// Not used in current implementation, but kept for potential future use
export interface DateRange {
  startDate: Date;
  endDate: Date;
}