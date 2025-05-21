import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Activity, BarChart3, Edit2, PlusCircle, ChevronLeft, ChevronRight, CheckCircle, Lock, LineChart, FileText, TrendingUp as TrendingUpIcon } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHabits, useModal, useTheme, usePremiumFeature } from '../App';
import { HabitCategory, HabitLog, SleepQuality, MeditationMood, Habit } from '../types';
// Fix: Import PREMIUM_FEATURE_LOCKED
import { HABIT_DEFINITIONS, PREMIUM_FEATURE_DEEP_DIVE_REPORTS, PREMIUM_FEATURE_DETAILED_ANALYTICS, PREMIUM_FEATURE_LOCKED } from '../constants';
import AdPlaceholder from '../components/AdPlaceholder';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ size?: number; color?: string; className?: string }>;
  colorClass: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, iconColor }) => (
  <div className="bg-themeCard p-4 rounded-lg shadow-lg flex items-center space-x-3 hover:shadow-xl transition-shadow">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {React.cloneElement(icon, { size: 20, color: iconColor || 'white' })}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-themeText">{value}</p>
    </div>
  </div>
);

const HabitLoggerModalContent: React.FC<{ date: string; habitCategory?: HabitCategory; onLogSuccess: () => void }> = ({ date, habitCategory, onLogSuccess }) => {
  const { addHabitLog } = useHabits();
  const { hideModal } = useModal();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | undefined>(habitCategory);
  const [value, setValue] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | undefined>();
  const [exerciseType, setExerciseType] = useState<string>('');
  const [meditationMood, setMeditationMood] = useState<MeditationMood | undefined>();
  const [error, setError] = useState<string>('');

  const habitDef = selectedCategory ? HABIT_DEFINITIONS[selectedCategory] : null;
  const formattedDisplayDate = new Date(date + 'T00:00:00').toLocaleDateString(t('general.locale', { returnObjects: false, defaultValue: undefined }) || undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedCategory || !habitDef) {
      setError(t('habit.error.selectCategory'));
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError(t('habit.error.invalidValue', { unit: t(habitDef.unitKey) }));
      return;
    }

    const logEntry: Omit<HabitLog, 'id'> = {
      date,
      habitCategory: selectedCategory,
      value: numValue,
      details: {},
    };

    if (selectedCategory === HabitCategory.SLEEP) {
      if (!sleepQuality) { setError(t('habit.error.sleepQuality')); return; }
      logEntry.details!.sleepQuality = sleepQuality;
    } else if (selectedCategory === HabitCategory.EXERCISE) {
      if (!exerciseType.trim()) { setError(t('habit.error.exerciseType')); return; }
      logEntry.details!.exerciseType = exerciseType.trim();
    } else if (selectedCategory === HabitCategory.MEDITATION) {
      if (!meditationMood) { setError(t('habit.error.meditationMood')); return; }
      logEntry.details!.meditationMood = meditationMood;
    }
    
    addHabitLog(logEntry);
    onLogSuccess();
    hideModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-themePrimary">{t('habit.logForDate', { date: formattedDisplayDate })}</h3>
      {!habitCategory && (
        <div>
          <label htmlFor="habitCategory" className="block text-sm font-medium text-gray-700 mb-1">{t('habit.selectCategory')}</label>
          <select
            id="habitCategory"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as HabitCategory)}
            className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm"
            required
          >
            <option value="" disabled>{t('habit.selectCategory')}</option>
            {Object.values(HABIT_DEFINITIONS).map(h => (
              <option key={h.id} value={h.id}>{t(h.nameKey)}</option>
            ))}
          </select>
        </div>
      )}
      {habitDef && (
        <>
          <div>
            <label htmlFor="habitValue" className="block text-sm font-medium text-gray-700 mb-1">{t(habitDef.nameKey)} ({t(habitDef.unitKey)})</label>
            <input
              type="number"
              id="habitValue"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm"
              placeholder={t('habit.enterUnit', { unit: t(habitDef.unitKey)})}
              required
              min="0.1"
              step="any"
            />
          </div>
          {selectedCategory === HabitCategory.SLEEP && (
            <div>
              <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-700 mb-1">{t('habit.sleepQuality')}</label>
              <select id="sleepQuality" value={sleepQuality || ''} onChange={e => setSleepQuality(e.target.value as SleepQuality)} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm" required>
                <option value="" disabled>{t('habit.selectQuality')}</option>
                {Object.values(SleepQuality).map(q => <option key={q} value={q}>{t(`sleepQuality.${q.toLowerCase()}`)}</option>)}
              </select>
            </div>
          )}
          {selectedCategory === HabitCategory.EXERCISE && (
            <div>
              <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">{t('habit.exerciseType')}</label>
              <input type="text" id="exerciseType" value={exerciseType} onChange={e => setExerciseType(e.target.value)} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm" placeholder={t('habit.exercisePlaceholder')} required/>
            </div>
          )}
          {selectedCategory === HabitCategory.MEDITATION && (
            <div>
              <label htmlFor="meditationMood" className="block text-sm font-medium text-gray-700 mb-1">{t('habit.meditationMood')}</label>
              <select id="meditationMood" value={meditationMood || ''} onChange={e => setMeditationMood(e.target.value as MeditationMood)} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm" required>
                <option value="" disabled>{t('habit.selectMood')}</option>
                {Object.values(MeditationMood).map(m => <option key={m} value={m}>{t(`meditationMood.${m.toLowerCase()}`)}</option>)}
              </select>
            </div>
          )}
        </>
      )}
      {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
      <button
        type="submit"
        disabled={!selectedCategory}
        className="w-full bg-themePrimary hover:opacity-90 text-white font-semibold py-2.5 px-4 rounded-md shadow-md disabled:opacity-60 transition-opacity"
      >
        {t('habit.submitLog')}
      </button>
    </form>
  );
};


const DashboardPage: React.FC = () => {
  const { getLogsForDate, userProfile, pointsAndBadges } = useHabits();
  const { showModal } = useModal();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { isPremium, requestPremiumAccess } = usePremiumFeature();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('calendar');
  // Add state for graph range, default to 7 days. Premium can unlock more.
  const [graphDays, setGraphDays] = useState(7); 

  const formattedDate = selectedDate.toISOString().split('T')[0];
  const logsForSelectedDate = useMemo(() => getLogsForDate(formattedDate), [getLogsForDate, formattedDate]);
  const currentLocale = i18n.language;

  const openLogModal = (category?: HabitCategory) => {
    const habitDef = category ? HABIT_DEFINITIONS[category] : undefined;
    const title = habitDef ? t('habit.logForDate', { date: t(habitDef.nameKey)}) : t('habit.logNew');
    showModal(
      <HabitLoggerModalContent date={formattedDate} habitCategory={category} onLogSuccess={() => {}} />,
      title
    );
  };

  const handleViewMoreHistory = () => {
    if (requestPremiumAccess(PREMIUM_FEATURE_DETAILED_ANALYTICS)) {
      // For now, just simulate changing graph days. In a real app, this would enable UI to select ranges.
      setGraphDays(prev => (prev === 7 ? 30 : 7)); 
      alert(t('premium.featureAccessGranted', {featureName: t(PREMIUM_FEATURE_DETAILED_ANALYTICS)}));
    }
  };
  
  const handleDeepDiveReport = () => {
    if (requestPremiumAccess(PREMIUM_FEATURE_DEEP_DIVE_REPORTS)) {
        // Placeholder for actual deep dive report functionality
        alert(t('premium.featureAccessGranted', {featureName: t(PREMIUM_FEATURE_DEEP_DIVE_REPORTS)}));
    }
  };


  const dailyCompletion = useMemo(() => {
    const goalHabitsCategories = Object.keys(userProfile.goals).filter(cat => userProfile.goals[cat as HabitCategory] !== undefined && userProfile.goals[cat as HabitCategory]! > 0) as HabitCategory[];
    if(goalHabitsCategories.length === 0) return 0;

    const completedCount = goalHabitsCategories.filter(cat => 
      logsForSelectedDate.some(log => log.habitCategory === cat && log.value >= (userProfile.goals[cat] ?? HABIT_DEFINITIONS[cat].goal))
    ).length;
    return (completedCount / goalHabitsCategories.length) * 100;
  }, [logsForSelectedDate, userProfile.goals]);

  const tileClassName = ({ date, view }: { date: Date, view: string }): string | null => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const logs = getLogsForDate(dateStr);
      if (logs.length > 0) {
        const goalHabitsCategories = Object.keys(userProfile.goals).filter(cat => userProfile.goals[cat as HabitCategory] !== undefined && userProfile.goals[cat as HabitCategory]! > 0) as HabitCategory[];
        if (goalHabitsCategories.length === 0 && logs.length > 0) return 'bg-blue-100 !text-blue-700 rounded-full';

        const allGoalsMet = goalHabitsCategories.every(cat => {
            const categoryGoal = userProfile.goals[cat] ?? HABIT_DEFINITIONS[cat].goal;
            const logForCat = logs.find(l => l.habitCategory === cat);
            return logForCat && logForCat.value >= categoryGoal;
        });
        if (allGoalsMet) return 'bg-green-200 !text-green-800 rounded-full font-semibold';
        return 'bg-blue-100 !text-blue-700 rounded-full';
      }
    }
    return null;
  };
  
  const graphData = useMemo(() => {
    const data: { date: string, [key: string]: number | string }[] = [];
    const today = new Date(selectedDate);
    today.setHours(0,0,0,0);
    const displayDays = isPremium ? graphDays : 7; // Premium users can see 'graphDays', free users always 7

    for (let i = displayDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dailyLogs = getLogsForDate(dateStr);
      const entry: { date: string, [key: string]: number | string } = { date: d.toLocaleDateString(currentLocale || undefined, {month: 'short', day: 'numeric'}) };
      Object.values(HabitCategory).forEach(catEnum => {
        const habitDefinition = HABIT_DEFINITIONS[catEnum];
        const log = dailyLogs.find(l => l.habitCategory === catEnum);
        entry[t(habitDefinition.nameKey)] = log ? log.value : 0;
      });
      data.push(entry);
    }
    return data;
  }, [getLogsForDate, selectedDate, t, currentLocale, isPremium, graphDays]);

  useEffect(() => {
    const styleId = 'dashboard-calendar-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = `
      .react-calendar-override { width: 100% !important; font-family: inherit; }
      .react-calendar-override .react-calendar__navigation button { color: ${theme.colors.primary}; font-weight: bold; font-size: 1rem; min-width: 40px; }
      .react-calendar-override .react-calendar__navigation button:hover,
      .react-calendar-override .react-calendar__navigation button:focus { background-color: ${theme.colors.background} !important; }
       .react-calendar-override .react-calendar__navigation button:disabled { background-color: transparent !important; color: ${theme.colors.text + '50'}; }
      .react-calendar-override .react-calendar__month-view__weekdays__weekday { color: ${theme.colors.text}; text-decoration: none !important; font-weight: 600; font-size: 0.75rem; padding-bottom: 0.5em; text-transform: uppercase; }
      .react-calendar-override .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; }
      .react-calendar-override .react-calendar__tile { border-radius: 0.375rem; padding: 0.5em 0.25em; height: auto; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; }
       .react-calendar-override .react-calendar__tile:enabled:hover,
       .react-calendar-override .react-calendar__tile:enabled:focus { background-color: ${theme.colors.primary + '20'} !important; color: ${theme.colors.primary}; }
      .react-calendar-override .react-calendar__tile--now { background-color: ${theme.colors.accent + '22'} !important;  color: ${theme.colors.accent} !important; font-weight: bold; }
      .react-calendar-override .react-calendar__tile--now:enabled:hover,
      .react-calendar-override .react-calendar__tile--now:enabled:focus { background-color: ${theme.colors.accent + '44'} !important; }
      .react-calendar-override .react-calendar__tile--active { background-color: ${theme.colors.primary} !important; color: white !important; font-weight: bold; }
      .react-calendar-override .react-calendar__tile--active:enabled:hover,
      .react-calendar-override .react-calendar__tile--active:enabled:focus { background-color: ${theme.colors.primary} !important; opacity: 0.9; }
      .react-calendar-override .react-calendar__month-view__days__day--weekend { color: ${theme.colors.accent}; }
      .react-calendar-override .react-calendar__month-view__days__day--neighboringMonth { color: ${theme.colors.text + '60'} !important; }
    `;
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [theme]);


  return (
    <div className="space-y-6 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={t('dashboard.goalProgress')} value={`${dailyCompletion.toFixed(0)}%`} icon={<CheckCircle />} colorClass="bg-emerald-100" iconColor={theme.colors.secondary} />
        <StatCard title={t('dashboard.totalPoints')} value={pointsAndBadges.totalPoints} icon={<Activity />} colorClass="bg-violet-100" iconColor={theme.colors.accent} />
        <StatCard title={t('dashboard.badgesUnlocked')} value={pointsAndBadges.badges.filter(b=>b.achieved).length} icon={<BarChart3 />} colorClass="bg-sky-100" iconColor={theme.colors.primary} />
      </div>

      <div className="my-6 flex justify-center">
        <AdPlaceholder type="mpu" />
      </div>

      <div className="bg-themeCard p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold text-themePrimary">{t('dashboard.title')}</h2>
          <button
            onClick={() => openLogModal()}
            className="w-full sm:w-auto bg-themePrimary hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            aria-label={t('dashboard.logHabit')}
          >
            <PlusCircle size={20} className="mr-2"/> {t('dashboard.logHabit')}
          </button>
        </div>
        
        <div className="mb-4 flex justify-center items-center space-x-2 sm:space-x-4">
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; })} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label={t('dashboard.previousDay')}><ChevronLeft size={24} color={theme.colors.text}/></button>
            <h3 className="text-lg font-medium text-center min-w-[180px] sm:min-w-[250px]" tabIndex={0}>{selectedDate.toLocaleDateString(currentLocale || undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; })} className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedDate.toDateString() === new Date().toDateString()} aria-label={t('dashboard.nextDay')}><ChevronRight size={24} color={theme.colors.text}/></button>
        </div>

        {logsForSelectedDate.length === 0 && (
          <p className="text-center text-gray-500 py-4">{t('dashboard.noHabitsLogged')}</p>
        )}
        <ul className="space-y-3 mb-6">
          {Object.values(HABIT_DEFINITIONS).map(habit => {
            const log = logsForSelectedDate.find(l => l.habitCategory === habit.id);
            const goal = userProfile.goals[habit.id] ?? habit.goal;
            const isCompleted = log && log.value >= goal;
            const habitName = t(habit.nameKey);
            const habitUnit = t(habit.unitKey);
            return (
              <li key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all">
                <div className="flex items-center">
                  <habit.icon size={22} color={theme.colors.primary} className="mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-themeText">{habitName}</p>
                    <p className="text-sm text-gray-500">
                      {log ? `${log.value} / ${goal} ${habitUnit}` : `${t('profile.currentGoal', { goal: goal, unit: habitUnit }).replace(t('profile.currentGoalLabel'), '')}`}
                      {log?.details?.sleepQuality && <span className="ml-2 text-xs text-gray-400">({t(`sleepQuality.${log.details.sleepQuality.toLowerCase()}`)})</span>}
                      {log?.details?.exerciseType && <span className="ml-2 text-xs text-gray-400">({log.details.exerciseType})</span>}
                      {log?.details?.meditationMood && <span className="ml-2 text-xs text-gray-400">({t(`meditationMood.${log.details.meditationMood.toLowerCase()}`)})</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                {isCompleted ? (
                    <CheckCircle size={22} className="text-themeSecondary" />
                ) : (
                    <button onClick={() => openLogModal(habit.id)} className="text-themePrimary hover:text-themeAccent p-1 rounded-full hover:bg-blue-50 transition-colors" aria-label={`${t('dashboard.logHabit')} ${habitName}`}>
                        <PlusCircle size={22} />
                    </button>
                )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Habit Deep Dive Reports (Premium) */}
       <div className="bg-themeCard p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-2">
          <FileText size={20} className="mr-2 text-themePrimary"/>
          <h2 className="text-xl font-semibold text-themePrimary">{t('premium.deepDiveReports')}</h2>
          {/* Fix: Wrap Lock icon in a span with title attribute and use imported PREMIUM_FEATURE_LOCKED */}
          {!isPremium && <span title={t(PREMIUM_FEATURE_LOCKED)}><Lock size={16} className="ml-2 text-yellow-500" /></span>}
        </div>
        <p className="text-sm text-gray-600 mb-3">{t('premium.deepDiveReportsDesc')}</p>
        <button
          onClick={handleDeepDiveReport}
          className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all ${
            isPremium ? 'bg-themeAccent text-white hover:opacity-90' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label={t('premium.deepDiveReports')}
        >
          {isPremium ? <TrendingUpIcon size={20} className="mr-2"/> : <Lock size={16} className="mr-2"/>}
          {t(PREMIUM_FEATURE_DEEP_DIVE_REPORTS)}
        </button>
      </div>


      <div className="bg-themeCard p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex items-center">
             <h2 className="text-xl font-semibold text-themePrimary">{t('dashboard.progressOverview')}</h2>
             {/* Fix: Wrap Lock icon in a span with title attribute and use imported PREMIUM_FEATURE_LOCKED */}
             {!isPremium && graphDays > 7 && <span title={t(PREMIUM_FEATURE_LOCKED)}><Lock size={16} className="ml-2 text-yellow-500" /></span>}
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-themePrimary text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{t('dashboard.calendarView')}</button>
            <button onClick={() => setViewMode('graph')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'graph' ? 'bg-themePrimary text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{t('dashboard.graphView', {days: isPremium ? graphDays : 7})}</button>
          </div>
        </div>
        
        {viewMode === 'graph' && (
           <div className="mb-4 text-right">
            <button
              onClick={handleViewMoreHistory}
              className={`text-sm py-1 px-3 rounded-md flex items-center ml-auto ${
                isPremium && graphDays > 7 ? 'bg-themeAccent text-white hover:opacity-90' : 
                isPremium ? 'bg-themeSecondary text-white hover:opacity-90' : 
                'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LineChart size={16} className="mr-1.5" />
              {isPremium ? (graphDays > 7 ? t('dashboard.show7DayGraph') : t('dashboard.show30DayGraph')) : t('dashboard.detailedAnalyticsCTA')}
              {!isPremium && <Lock size={12} className="ml-1.5"/>}
            </button>
          </div>
        )}


        {viewMode === 'calendar' ? (
          <ReactCalendar
            onChange={value => value && setSelectedDate(value as Date)}
            value={selectedDate}
            tileClassName={tileClassName}
            locale={currentLocale} // Set locale for ReactCalendar
            className="border-none react-calendar-override shadow-inner p-2 rounded-md bg-gray-50"
            aria-label={t('dashboard.calendarView')}
          />
        ) : (
          <div className="h-80 md:h-96 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.accent + '20'}/>
                  <XAxis dataKey="date" stroke={theme.colors.text} fontSize={12} />
                  <YAxis stroke={theme.colors.text} fontSize={12}/>
                  <Tooltip 
                    contentStyle={{backgroundColor: theme.colors.card, borderColor: theme.colors.accent, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                    labelStyle={{color: theme.colors.primary, fontWeight: 'bold'}}
                    itemStyle={{color: theme.colors.text}}
                  />
                  <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
                  {Object.values(HabitCategory).map((cat, index) => {
                    const habitDefinition = HABIT_DEFINITIONS[cat];
                    const colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, '#f59e0b']; // Ensure enough colors
                    return <Bar key={cat} dataKey={t(habitDefinition.nameKey)} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} barSize={15} />
                  })}
                </BarChart>
              </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;