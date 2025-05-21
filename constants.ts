import { HabitCategory, Theme, Badge, Habit, UserProfile } from './types';
import { Bed, Droplets, Dumbbell, Brain, Award, ShieldCheck, Star, Trophy, TrendingUp } from 'lucide-react';

export const APP_NAME = "VitalFlow"; // App name might be translated in HTML title or elsewhere if needed

export const HABIT_DEFINITIONS: Record<HabitCategory, Habit> = {
  [HabitCategory.SLEEP]: {
    id: HabitCategory.SLEEP,
    nameKey: 'habit.sleep.name',
    unitKey: 'habit.sleep.unit',
    goal: 7,
    icon: Bed,
  },
  [HabitCategory.WATER]: {
    id: HabitCategory.WATER,
    nameKey: 'habit.water.name',
    unitKey: 'habit.water.unit',
    goal: 8,
    icon: Droplets,
  },
  [HabitCategory.EXERCISE]: {
    id: HabitCategory.EXERCISE,
    nameKey: 'habit.exercise.name',
    unitKey: 'habit.exercise.unit',
    goal: 30,
    icon: Dumbbell,
  },
  [HabitCategory.MEDITATION]: {
    id: HabitCategory.MEDITATION,
    nameKey: 'habit.meditation.name',
    unitKey: 'habit.meditation.unit',
    goal: 10,
    icon: Brain,
  },
};

export const THEMES: Record<string, Theme> = {
  vitalBlue: {
    name: 'Vital Blue', // Theme names are often identifiers, can be translated if displayed prominently
    colors: {
      primary: '#3b82f6', 
      secondary: '#10b981',
      accent: '#8b5cf6', 
      background: '#f0f9ff',
      text: '#0f172a', 
      card: '#ffffff', 
    },
  },
  sereneGreen: {
    name: 'Serene Green',
    colors: {
      primary: '#22c55e', 
      secondary: '#6366f1',
      accent: '#ec4899', 
      background: '#f0fdf4',
      text: '#1e293b', 
      card: '#ffffff',
    },
  },
  calmLavender: {
    name: 'Calm Lavender',
    colors: {
      primary: '#a855f7', 
      secondary: '#06b6d4',
      accent: '#f59e0b', 
      background: '#f5f3ff',
      text: '#1c1917', 
      card: '#ffffff',
    },
  },
};

export const INITIAL_BADGES: Badge[] = [
  { id: 'firstLog', nameKey: 'badge.firstLog.name', descriptionKey: 'badge.firstLog.description', achieved: false, icon: Star },
  { id: '7DayStreak', nameKey: 'badge.7DayStreak.name', descriptionKey: 'badge.7DayStreak.description', achieved: false, icon: TrendingUp },
  { id: 'waterWeek', nameKey: 'badge.waterWeek.name', descriptionKey: 'badge.waterWeek.description', achieved: false, icon: Droplets },
  { id: 'sleepWeek', nameKey: 'badge.sleepWeek.name', descriptionKey: 'badge.sleepWeek.description', achieved: false, icon: Bed },
  { id: 'exerciseWeek', nameKey: 'badge.exerciseWeek.name', descriptionKey: 'badge.exerciseWeek.description', achieved: false, icon: Dumbbell },
  { id: 'meditationWeek', nameKey: 'badge.meditationWeek.name', descriptionKey: 'badge.meditationWeek.description', achieved: false, icon: Brain },
  { id: 'allHabitsDay', nameKey: 'badge.allHabitsDay.name', descriptionKey: 'badge.allHabitsDay.description', achieved: false, icon: Award },
  { id: '100Points', nameKey: 'badge.100Points.name', descriptionKey: 'badge.100Points.description', achieved: false, icon: ShieldCheck },
  { id: '500Points', nameKey: 'badge.500Points.name', descriptionKey: 'badge.500Points.description', achieved: false, icon: Trophy },
];

export const POINTS_PER_LOG = 10;
export const BONUS_POINTS_ALL_HABITS_DAY = 50;

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'User',
  goals: {
    [HabitCategory.SLEEP]: HABIT_DEFINITIONS[HabitCategory.SLEEP].goal,
    [HabitCategory.WATER]: HABIT_DEFINITIONS[HabitCategory.WATER].goal,
    [HabitCategory.EXERCISE]: HABIT_DEFINITIONS[HabitCategory.EXERCISE].goal,
    [HabitCategory.MEDITATION]: HABIT_DEFINITIONS[HabitCategory.MEDITATION].goal,
  },
  theme: 'vitalBlue',
  language: 'en', // Default language
  subscriptionStatus: 'free', // Default subscription status
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bg', name: 'Български' },
];

// Translation Keys for Premium Features (used in CTAs etc.)
export const PREMIUM_FEATURE_DETAILED_ANALYTICS = "premium.detailedAnalytics";
export const PREMIUM_FEATURE_CUSTOM_AI_PLANS = "premium.customAIPlans";
export const PREMIUM_FEATURE_DEEP_DIVE_REPORTS = "premium.deepDiveReports";
export const PREMIUM_UPGRADE_CTA = "premium.upgradeCTA";
export const PREMIUM_UNLOCK_FEATURE = "premium.unlockFeature";
export const PREMIUM_CURRENT_PLAN = "premium.currentPlan";
export const PREMIUM_PLAN_FREE = "premium.planFree";
export const PREMIUM_PLAN_PREMIUM = "premium.planPremium";
export const PREMIUM_UPGRADE_BUTTON = "premium.upgradeButton";
export const PREMIUM_MANAGE_BUTTON = "premium.manageButton";
export const PREMIUM_DOWNGRADE_BUTTON = "premium.downgradeButton"; // For simulation
export const PREMIUM_FEATURE_LOCKED = "premium.featureLocked";
