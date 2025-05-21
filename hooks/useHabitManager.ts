import { useState, useEffect, useCallback } from 'react';
import { HabitLog, HabitCategory, PointsBadge, UserProfile, SubscriptionStatus } from '../types';
import { HABIT_DEFINITIONS, INITIAL_BADGES, POINTS_PER_LOG, BONUS_POINTS_ALL_HABITS_DAY, DEFAULT_USER_PROFILE } from '../constants';
import i18n from '../i18n'; // Import i18n instance

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useHabitManager() {
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('vitalflow-habitLogs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      console.error("Failed to parse habitLogs from localStorage", e);
      return [];
    }
  });

  const [pointsAndBadges, setPointsAndBadges] = useState<PointsBadge>(() => {
    try {
      const savedPB = localStorage.getItem('vitalflow-pointsBadges');
      if (savedPB) {
        const parsed = JSON.parse(savedPB);
        const currentBadgeIds = new Set(parsed.badges.map((b:any) => b.id));
        const badgesToAdd = INITIAL_BADGES.filter(ib => !currentBadgeIds.has(ib.id));
        return { ...parsed, badges: [...parsed.badges, ...badgesToAdd] };
      }
      return { totalPoints: 0, badges: INITIAL_BADGES };
    } catch (e) {
      console.error("Failed to parse pointsAndBadges from localStorage", e);
      return { totalPoints: 0, badges: INITIAL_BADGES };
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('vitalflow-userProfile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const defaultGoals = DEFAULT_USER_PROFILE.goals;
        const currentGoals = { ...defaultGoals, ...parsed.goals };
        return { 
          ...DEFAULT_USER_PROFILE, 
          ...parsed, 
          goals: currentGoals, 
          language: parsed.language || DEFAULT_USER_PROFILE.language,
          subscriptionStatus: parsed.subscriptionStatus || DEFAULT_USER_PROFILE.subscriptionStatus,
        };
      }
      return DEFAULT_USER_PROFILE;
    } catch (e) {
      console.error("Failed to parse userProfile from localStorage", e);
      return DEFAULT_USER_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem('vitalflow-habitLogs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  useEffect(() => {
    localStorage.setItem('vitalflow-pointsBadges', JSON.stringify(pointsAndBadges));
  }, [pointsAndBadges]);

  useEffect(() => {
    localStorage.setItem('vitalflow-userProfile', JSON.stringify(userProfile));
    // Change language if profile language changes
    if (userProfile.language && i18n.language !== userProfile.language) {
      i18n.changeLanguage(userProfile.language);
    }
  }, [userProfile]);
  
  const updateProfile = useCallback((newProfileData: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updatedProfile = { ...prev, ...newProfileData };
      if (newProfileData.language && i18n.language !== newProfileData.language) {
        i18n.changeLanguage(newProfileData.language);
      }
      // If subscriptionStatus is explicitly being set, use that.
      // Otherwise, retain the existing subscriptionStatus.
      if(newProfileData.subscriptionStatus) {
        updatedProfile.subscriptionStatus = newProfileData.subscriptionStatus;
      }
      return updatedProfile;
    });
  }, []);

  const upgradeToPremium = useCallback(() => {
    updateProfile({ subscriptionStatus: 'premium' });
  }, [updateProfile]);

  const downgradeToFree = useCallback(() => {
    updateProfile({ subscriptionStatus: 'free' });
  }, [updateProfile]);

  const addHabitLog = useCallback((log: Omit<HabitLog, 'id'>) => {
    const newLog = { ...log, id: generateId() };
    setHabitLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog];
        
        setPointsAndBadges(prevPB => {
            let newTotalPoints = prevPB.totalPoints + POINTS_PER_LOG;
            const todayLogs = updatedLogs.filter(l => l.date === newLog.date);
            const loggedCategoriesToday = new Set(todayLogs.map(l => l.habitCategory));
            
            const allTrackedHabits = Object.keys(HABIT_DEFINITIONS) as HabitCategory[];
            const allHabitsLoggedToday = allTrackedHabits.every(cat => loggedCategoriesToday.has(cat));

            if (allHabitsLoggedToday) {
              const dailyBonusBadgeId = `allHabitsBonus-${newLog.date}`;
              const bonusAlreadyAwarded = prevPB.badges.find(b => b.id === dailyBonusBadgeId && b.achieved);
              if (!bonusAlreadyAwarded) {
                  newTotalPoints += BONUS_POINTS_ALL_HABITS_DAY;
              }
            }

            const updatedBadges = prevPB.badges.map(badge => {
              if (badge.achieved) return badge;

              let achieved = false;
              const todayStr = new Date().toISOString().split('T')[0];

              if (badge.id === 'firstLog' && updatedLogs.length > 0) achieved = true;
              if (badge.id === '100Points' && newTotalPoints >= 100) achieved = true;
              if (badge.id === '500Points' && newTotalPoints >= 500) achieved = true;
              
              if (badge.id === 'allHabitsDay' && allHabitsLoggedToday) {
                  achieved = true;
              }
              
              const checkStreak = (category?: HabitCategory, daysToAchieve?: number): boolean => {
                if (!daysToAchieve) return false;
            
                const relevantLogsForStreak = category 
                    ? updatedLogs.filter(l => l.habitCategory === category)
                    : updatedLogs;

                if (relevantLogsForStreak.length < daysToAchieve) return false;
                const uniqueLogDates = [...new Set(relevantLogsForStreak.map(l => l.date))].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
                if (uniqueLogDates.length < daysToAchieve) return false;
                
                const referenceDate = new Date(newLog.date + "T00:00:00");
                let consecutiveDays = 0;
                for (let i = 0; i < daysToAchieve; i++) {
                    const targetDate = new Date(referenceDate);
                    targetDate.setDate(referenceDate.getDate() - i);
                    const dateStr = targetDate.toISOString().split('T')[0];
                    if (uniqueLogDates.includes(dateStr)) {
                        consecutiveDays++;
                    } else {
                        break; 
                    }
                }
                return consecutiveDays >= daysToAchieve;
              };

              if (badge.id === '7DayStreak' && checkStreak(undefined, 7)) achieved = true;
              if (badge.id === 'waterWeek' && checkStreak(HabitCategory.WATER, 7)) achieved = true;
              if (badge.id === 'sleepWeek' && checkStreak(HabitCategory.SLEEP, 7)) achieved = true;
              if (badge.id === 'exerciseWeek' && checkStreak(HabitCategory.EXERCISE, 7)) achieved = true;
              if (badge.id === 'meditationWeek' && checkStreak(HabitCategory.MEDITATION, 7)) achieved = true;

              return achieved ? { ...badge, achieved: true, dateAchieved: todayStr } : badge;
            });

            return { totalPoints: newTotalPoints, badges: updatedBadges };
        });
        return updatedLogs;
    });
  }, []);

  const getLogsForDate = useCallback((date: string): HabitLog[] => {
    return habitLogs.filter(log => log.date === date);
  }, [habitLogs]);

  const getLogsForHabit = useCallback((habitCategory: HabitCategory): HabitLog[] => {
    return habitLogs.filter(log => log.habitCategory === habitCategory);
  }, [habitLogs]);
  
  const updateHabitGoal = useCallback((category: HabitCategory, newGoal: number) => {
    setUserProfile(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [category]: newGoal,
      }
    }));
  }, []);

  return { 
    habitLogs, 
    addHabitLog, 
    getLogsForDate, 
    getLogsForHabit, 
    pointsAndBadges,
    userProfile,
    updateProfile,
    updateHabitGoal,
    upgradeToPremium, // expose simulated subscription functions
    downgradeToFree,   // expose simulated subscription functions
  };
}