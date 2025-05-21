import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, MessageSquare, UserCircle, X, ShieldAlert } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import AICoachPage from './pages/AICoachPage';
import ProfilePage from './pages/ProfilePage';
import { Theme, UserProfile, SubscriptionStatus } from './types';
import { THEMES, DEFAULT_USER_PROFILE, PREMIUM_UPGRADE_CTA, PREMIUM_UNLOCK_FEATURE } from './constants';
import { useHabitManager } from './hooks/useHabitManager';
import AdPlaceholder from './components/AdPlaceholder';

// Theme Context
interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  themeName: string;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// Modal Context
interface ModalContextType {
  showModal: (content: React.ReactNode, title?: string) => void;
  hideModal: () => void;
  isModalVisible: boolean;
}
const ModalContext = createContext<ModalContextType | undefined>(undefined);
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};

// Habit Context
interface HabitContextType extends ReturnType<typeof useHabitManager> {
  subscriptionStatus: SubscriptionStatus; // Directly from userProfile
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
}
const HabitContext = createContext<HabitContextType | undefined>(undefined);
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
}

// Premium Feature Lock Modal Content
const PremiumLockModalContent: React.FC<{ featureNameKey: string, onUpgrade: () => void }> = ({ featureNameKey, onUpgrade }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();

  const handleUpgradeClick = () => {
    onUpgrade(); // This should trigger the upgrade in useHabitManager
    hideModal();
    // Potentially navigate to profile page or show a success message
  };

  return (
    <div className="text-center">
      <ShieldAlert size={48} className="mx-auto mb-4 text-themeAccent" />
      <h3 className="text-xl font-semibold mb-2 text-themePrimary">{t(PREMIUM_UNLOCK_FEATURE)}</h3>
      <p className="mb-4 text-gray-600">{t('premium.unlockMessage', { featureName: t(featureNameKey) })}</p>
      <button
        onClick={handleUpgradeClick}
        className="w-full bg-themeAccent hover:opacity-90 text-white font-semibold py-2.5 px-4 rounded-md shadow-md transition-opacity"
      >
        {t(PREMIUM_UPGRADE_CTA)}
      </button>
      <button
        onClick={hideModal}
        className="mt-2 w-full text-gray-600 hover:text-gray-800 py-2"
      >
        {t('general.cancel')}
      </button>
    </div>
  );
};


export const usePremiumFeature = () => {
  const { subscriptionStatus, upgradeToPremium } = useHabits();
  const { showModal } = useModal();
  const { t } = useTranslation();

  const requestPremiumAccess = (featureNameKey: string): boolean => {
    if (subscriptionStatus === 'premium') {
      return true;
    }
    showModal(
      <PremiumLockModalContent featureNameKey={featureNameKey} onUpgrade={upgradeToPremium} />,
      t(PREMIUM_UPGRADE_CTA)
    );
    return false;
  };
  return { isPremium: subscriptionStatus === 'premium', requestPremiumAccess };
};


const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const habitManager = useHabitManager();
  const initialThemeName = habitManager.userProfile?.theme || DEFAULT_USER_PROFILE.theme;
  const [currentThemeName, setCurrentThemeName] = useState<string>(initialThemeName);
  const [theme, setThemeState] = useState<Theme>(THEMES[initialThemeName]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);

  const setTheme = useCallback((themeName: string) => {
    const newTheme = THEMES[themeName];
    if (newTheme) {
      setThemeState(newTheme);
      setCurrentThemeName(themeName);
      // No need to call habitManager.updateProfile here for theme if userProfile effect handles it
    }
  }, []);

  useEffect(() => {
    if (habitManager.userProfile && habitManager.userProfile.theme !== currentThemeName) {
      setTheme(habitManager.userProfile.theme);
    }
  }, [habitManager.userProfile?.theme, currentThemeName, setTheme]);
  
  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);


  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-card', theme.colors.card);
    document.body.className = `bg-themeBackground text-themeText min-h-screen flex flex-col font-sans antialiased`;
  }, [theme]);

  const showModal = useCallback((content: React.ReactNode, title?: string) => {
    setModalContent(content);
    setModalTitle(title);
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    setModalContent(null);
    setModalTitle(undefined);
  }, []);

  const navItems = [
    { path: '/', labelKey: 'nav.dashboard', icon: Home },
    { path: '/coach', labelKey: 'nav.aiCoach', icon: MessageSquare },
    { path: '/profile', labelKey: 'nav.profile', icon: UserCircle },
  ];

  const adHeight = 50; 
  const navHeight = '4rem'; 

  const contextValue = {
    ...habitManager,
    subscriptionStatus: habitManager.userProfile.subscriptionStatus,
    upgradeToPremium: habitManager.upgradeToPremium,
    downgradeToFree: habitManager.downgradeToFree,
  };

  return (
    <HabitContext.Provider value={contextValue}>
    <ThemeContext.Provider value={{ theme, setTheme, themeName: currentThemeName }}>
      <ModalContext.Provider value={{ showModal, hideModal, isModalVisible }}>
        <HashRouter>
          <div className="flex flex-col min-h-screen w-full">
            <header className="p-4 shadow-md sticky top-0 z-50" style={{ backgroundColor: theme.colors.primary, color: theme.colors.card }}>
              <h1 className="text-2xl font-bold text-center tracking-tight">{t('appName')}</h1>
            </header>
            
            <main 
              className="flex-grow p-4 overflow-y-auto w-full max-w-3xl mx-auto"
              style={{ paddingBottom: `calc(${navHeight} + ${adHeight}px + 1rem)` }}
            >
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/coach" element={<AICoachPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>

            <div
              className="fixed bottom-16 left-0 right-0 z-40 flex justify-center items-center bg-gray-100/80 backdrop-blur-sm border-t border-gray-300/70"
              style={{ height: `${adHeight}px` }}
              role="complementary"
              aria-label={t('adPlaceholder.default')}
            >
              <AdPlaceholder type="banner" height={adHeight} width="100%" style={{maxWidth: '728px'}} />
            </div>

            <nav 
              className="fixed bottom-0 left-0 right-0 border-t shadow-t-lg z-50" 
              style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.accent+"50", height: navHeight }}
            >
              <ul className="flex justify-around items-center h-full max-w-3xl mx-auto">
                {navItems.map((item) => (
                  <NavItem key={item.path} path={item.path} labelKey={item.labelKey} icon={item.icon} />
                ))}
              </ul>
            </nav>
          </div>

          {isModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
              <div className="bg-themeCard p-5 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby={modalTitle ? 'modal-title-id' : undefined}>
                <div className="flex justify-between items-center mb-4">
                  {modalTitle && <h2 id="modal-title-id" className="text-xl font-semibold text-themePrimary">{modalTitle}</h2>}
                  <button onClick={hideModal} className="text-themeText hover:text-themeAccent p-1 rounded-full hover:bg-gray-100" aria-label={t('general.close')}>
                    <X size={24} />
                  </button>
                </div>
                <div className="overflow-y-auto pr-1">
                  {modalContent}
                </div>
              </div>
            </div>
          )}
        </HashRouter>
      </ModalContext.Provider>
    </ThemeContext.Provider>
    </HabitContext.Provider>
  );
};

interface NavItemProps {
  path: string;
  labelKey: string; // Changed from label to labelKey
  icon: React.ComponentType<{className?: string, size?: number, color?: string}>;
}

const NavItem: React.FC<NavItemProps> = ({ path, labelKey, icon: Icon }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = location.pathname === path;
  const { theme } = useTheme();

  return (
    <li className="flex-1">
      <Link
        to={path}
        className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-themeAccent ${
          isActive ? 'text-themePrimary' : 'text-gray-500 hover:text-themeAccent'
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={24} color={isActive ? theme.colors.primary : theme.colors.text} className={`mb-0.5 group-hover:scale-110 transition-transform ${isActive ? 'text-themePrimary' : 'text-gray-500 group-hover:text-themeAccent'}`} />
        <span className={`text-xs font-medium ${isActive ? 'text-themePrimary' : 'text-gray-500 group-hover:text-themeAccent'}`}>{t(labelKey)}</span>
      </Link>
    </li>
  );
};

export default App;