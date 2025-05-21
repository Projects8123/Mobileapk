import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Palette, ShieldCheck, Edit3, Save, Target, Check, X, Globe, Star as StarIcon, Gem } from 'lucide-react';
import { useHabits, useTheme } from '../App';
import { HabitCategory } from '../types';
import { HABIT_DEFINITIONS, THEMES, SUPPORTED_LANGUAGES, PREMIUM_CURRENT_PLAN, PREMIUM_PLAN_FREE, PREMIUM_PLAN_PREMIUM, PREMIUM_UPGRADE_BUTTON, PREMIUM_MANAGE_BUTTON, PREMIUM_DOWNGRADE_BUTTON } from '../constants';

const ProfilePage: React.FC = () => {
  const { userProfile, updateProfile, pointsAndBadges, updateHabitGoal, subscriptionStatus, upgradeToPremium, downgradeToFree } = useHabits();
  const { theme, setTheme: applyTheme, themeName } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [editingGoals, setEditingGoals] = useState<Partial<Record<HabitCategory, string>>>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(userProfile.name);

  useEffect(() => {
    setCurrentName(userProfile.name); 
  }, [userProfile.name]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    updateProfile({ language: langCode });
  };

  const handleGoalChange = (category: HabitCategory, value: string) => {
    setEditingGoals(prev => ({ ...prev, [category]: value }));
  };

  const handleSaveGoal = (category: HabitCategory) => {
    const valueStr = editingGoals[category];
    if (valueStr) {
      const valueNum = parseInt(valueStr, 10);
      const habitDef = HABIT_DEFINITIONS[category];
      if (!isNaN(valueNum) && valueNum > 0) {
        updateHabitGoal(category, valueNum);
        setEditingGoals(prev => {
            const newGoals = {...prev};
            delete newGoals[category]; 
            return newGoals;
        });
      } else {
        alert(t('profile.goalValueError'));
      }
    }
  };

  const handleCancelEditGoal = (category: HabitCategory) => {
    setEditingGoals(prev => {
        const newGoals = {...prev};
        delete newGoals[category];
        return newGoals;
    });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(e.target.value);
  };

  const handleSaveName = () => {
    if (currentName.trim()) {
      updateProfile({ name: currentName.trim() });
      setIsEditingName(false);
    } else {
        setCurrentName(userProfile.name); 
    }
  };

  return (
    <div className="space-y-8 pb-4">
      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-themePrimary">{t('profile.title')}</h2>
            <button 
                onClick={() => setIsEditingName(!isEditingName)} 
                className="text-themeAccent hover:text-themePrimary p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isEditingName ? t('profile.cancelNameEdit') : t('profile.editName')}
            >
                {isEditingName ? <X size={20} /> : <Edit3 size={20} />}
            </button>
        </div>
        {isEditingName ? (
            <div className="flex items-center space-x-2 mb-2">
                <input 
                    type="text" 
                    value={currentName}
                    onChange={handleNameChange}
                    className="flex-grow p-2.5 border border-gray-300 rounded-md text-xl font-medium focus:ring-2 focus:ring-themePrimary focus:border-transparent outline-none"
                    aria-label={t('profile.editName')}
                    autoFocus
                />
                <button onClick={handleSaveName} className="p-2.5 bg-themePrimary text-white rounded-md hover:opacity-90 shadow-sm" aria-label={t('profile.saveName')}>
                    <Save size={20}/>
                </button>
            </div>
        ) : (
             <h3 className="text-xl font-medium text-themeText mb-2" tabIndex={0}>{t('profile.welcome', { name: userProfile.name })}</h3>
        )}
        <p className="text-gray-600 text-sm">{t('profile.managePreferences')}</p>
      </div>

      {/* Subscription Status Section */}
      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-3">
          {subscriptionStatus === 'premium' ? <Gem size={24} className="mr-3 text-themeAccent flex-shrink-0" /> : <StarIcon size={24} className="mr-3 text-yellow-500 flex-shrink-0" />}
          <h2 className="text-xl font-semibold text-themePrimary">{t(PREMIUM_CURRENT_PLAN)}</h2>
        </div>
        <p className="text-lg text-themeText mb-4">
          {subscriptionStatus === 'premium' ? t(PREMIUM_PLAN_PREMIUM) : t(PREMIUM_PLAN_FREE)}
        </p>
        {subscriptionStatus === 'free' ? (
          <button
            onClick={upgradeToPremium}
            className="w-full bg-themeAccent hover:opacity-90 text-white font-semibold py-2.5 px-4 rounded-md shadow-md transition-opacity flex items-center justify-center"
          >
            <Gem size={18} className="mr-2" /> {t(PREMIUM_UPGRADE_BUTTON)}
          </button>
        ) : (
          <button
            onClick={downgradeToFree} // For simulation purposes
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-md transition-opacity"
          >
            {t(PREMIUM_DOWNGRADE_BUTTON)}
          </button>
        )}
         <p className="text-xs text-gray-500 mt-3">{t('premium.simulationNote')}</p>
      </div>


      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Globe size={24} className="mr-3 text-themePrimary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-themePrimary">{t('profile.language')}</h2>
        </div>
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-themePrimary focus:border-themePrimary text-sm"
          aria-label={t('profile.selectLanguage')}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>


      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Target size={24} className="mr-3 text-themePrimary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-themePrimary">{t('profile.habitGoals')}</h2>
        </div>
        <div className="space-y-4">
          {Object.values(HABIT_DEFINITIONS).map(habitDef => {
            const habitName = t(habitDef.nameKey);
            const habitUnit = t(habitDef.unitKey);
            return (
            <div key={habitDef.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all">
              <div className="flex items-center mb-2 sm:mb-0">
                <habitDef.icon size={22} color={theme.colors.accent} className="mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-themeText">{habitName}</p>
                  <p className="text-sm text-gray-500">{t('profile.currentGoalLabel')}{userProfile.goals[habitDef.id] ?? habitDef.goal} {habitUnit}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-center">
                {editingGoals[habitDef.id] !== undefined ? (
                  <>
                    <input
                      type="number"
                      value={editingGoals[habitDef.id]}
                      onChange={(e) => handleGoalChange(habitDef.id, e.target.value)}
                      className="w-24 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-themePrimary focus:border-transparent outline-none"
                      placeholder={t('profile.newGoalPlaceholder')}
                      aria-label={t('profile.editGoalFor', {name: habitName})}
                      min="1"
                    />
                    <button onClick={() => handleSaveGoal(habitDef.id)} className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100" aria-label={t('profile.saveGoalFor', { name: habitName })}>
                      <Check size={20} />
                    </button>
                     <button onClick={() => handleCancelEditGoal(habitDef.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100" aria-label={t('profile.cancelEditGoalFor', {name: habitName })}>
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleGoalChange(habitDef.id, (userProfile.goals[habitDef.id] ?? habitDef.goal).toString())} className="text-themePrimary hover:text-themeAccent p-1.5 rounded-full hover:bg-blue-50" aria-label={t('profile.editGoalFor', { name: habitName })}>
                    <Edit3 size={18} />
                  </button>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>

      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Palette size={24} className="mr-3 text-themePrimary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-themePrimary">{t('profile.appTheme')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(THEMES).map(themeOption => (
            <button
              key={themeOption.name}
              onClick={() => applyTheme(themeOption.name)} // Theme name is an identifier, not translated here
              className={`p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-themePrimary ${
                themeName === themeOption.name ? 'border-themePrimary ring-2 ring-themePrimary shadow-md' : 'border-gray-300 hover:border-themeAccent hover:shadow-sm'
              }`}
              style={{ backgroundColor: themeOption.colors.background }}
              aria-pressed={themeName === themeOption.name}
              aria-label={t('profile.selectTheme', { themeName: themeOption.name })}
            >
              <div className="flex items-center mb-2">
                <span className="w-5 h-5 rounded-full mr-2 shadow-inner" style={{backgroundColor: themeOption.colors.primary}} aria-hidden="true"></span>
                <span className="w-5 h-5 rounded-full mr-2 shadow-inner" style={{backgroundColor: themeOption.colors.secondary}} aria-hidden="true"></span>
                <span className="w-5 h-5 rounded-full shadow-inner" style={{backgroundColor: themeOption.colors.accent}} aria-hidden="true"></span>
              </div>
              <p style={{color: themeOption.colors.text}} className="font-medium text-sm text-left">{themeOption.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <ShieldCheck size={24} className="mr-3 text-themePrimary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-themePrimary">{t('profile.yourAchievements')}</h2>
        </div>
        <p className="text-3xl font-bold text-themeAccent mb-1">{pointsAndBadges.totalPoints}</p>
        <p className="text-sm text-gray-600 mb-6">{t('profile.totalPointsEarned')}</p>
        
        <h3 className="text-lg font-semibold text-themeText mb-3">{t('profile.badgesUnlockedCount', { count: pointsAndBadges.badges.filter(b => b.achieved).length })}</h3>
        {pointsAndBadges.badges.filter(b => b.achieved).length === 0 && (
            <p className="text-gray-500 text-sm">{t('profile.noBadgesEarned')}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pointsAndBadges.badges.filter(b => b.achieved).map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center p-3 bg-green-50 rounded-lg shadow-sm border border-green-200" title={`${t(badge.descriptionKey)} (${t('general.achievedOn', { date: badge.dateAchieved ? new Date(badge.dateAchieved + 'T00:00:00').toLocaleDateString(i18n.language) : 'N/A'})})`}>
              <badge.icon size={32} className="mb-2 text-themeSecondary" />
              <p className="text-xs font-medium text-themeText">{t(badge.nameKey)}</p>
              {badge.dateAchieved && <p className="text-[10px] text-gray-500">{new Date(badge.dateAchieved + 'T00:00:00').toLocaleDateString(i18n.language)}</p>}
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-semibold text-themeText mt-6 mb-3">{t('profile.badgesToUnlockCount', { count: pointsAndBadges.badges.filter(b => !b.achieved).length })}</h3>
         {pointsAndBadges.badges.filter(b => !b.achieved).length === 0 && (
            <p className="text-gray-500 text-sm">{t('profile.allBadgesUnlocked')}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pointsAndBadges.badges.filter(b => !b.achieved).map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center p-3 bg-gray-100 rounded-lg opacity-70 hover:opacity-100 transition-opacity" title={t(badge.descriptionKey)}>
              <badge.icon size={32} className="mb-2 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">{t(badge.nameKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-themeCard p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Settings size={24} className="mr-3 text-themePrimary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-themePrimary">{t('profile.appSettings')}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {t('profile.dataStorageInfo')}
        </p>
        <p className="text-xs text-gray-500">
          {t('profile.futureUpdatesInfo')}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;