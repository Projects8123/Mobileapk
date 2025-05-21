import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, User, Send, RotateCcw, AlertTriangle, Lightbulb, MessageSquareDashed, LoaderCircle, Lock, Sparkles } from 'lucide-react';
import { getWellnessTip, answerWellnessQuestion, getWeeklyAnalysis } from '../services/geminiService';
import { useHabits, useTheme, usePremiumFeature } from '../App';
import { AICoachMessage } from '../types';
import { Content } from '@google/genai';
// Fix: Import PREMIUM_FEATURE_LOCKED
import { PREMIUM_FEATURE_CUSTOM_AI_PLANS, PREMIUM_FEATURE_LOCKED } from '../constants';

const AICoachPage: React.FC = () => {
  const { habitLogs } = useHabits();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isPremium, requestPremiumAccess } = usePremiumFeature();
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isCustomPlanLoading, setIsCustomPlanLoading] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKeyExists = !!process.env.API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchDailyTip = useCallback(async () => {
    if (!apiKeyExists) {
      setDailyTip(t('aicoach.apiKeyMissing'));
      return;
    }
    setIsTipLoading(true);
    try {
      const tip = await getWellnessTip(habitLogs.slice(-10)); 
      setDailyTip(tip);
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      setDailyTip(t("aicoach.error.fetchTip"));
    } finally {
      setIsTipLoading(false);
    }
  }, [apiKeyExists, habitLogs, t]);
  
  const fetchWeeklyAnalysis = useCallback(async () => {
    if (!apiKeyExists) {
      setWeeklyAnalysis(t('aicoach.apiKeyMissing'));
      return;
    }
    setIsAnalysisLoading(true);
    try {
      const analysis = await getWeeklyAnalysis(habitLogs);
      setWeeklyAnalysis(analysis);
    } catch (error) {
      console.error("Error fetching weekly analysis:", error);
      setWeeklyAnalysis(t("aicoach.error.fetchAnalysis"));
    } finally {
      setIsAnalysisLoading(false);
    }
  }, [apiKeyExists, habitLogs, t]);

  useEffect(() => {
    fetchDailyTip();
    fetchWeeklyAnalysis();
  }, [fetchDailyTip, fetchWeeklyAnalysis]);

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isChatLoading || !apiKeyExists) return;

    const newUserMessage: AICoachMessage = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsChatLoading(true);

    try {
      const historyForAPI: Content[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      
      const aiResponseText = await answerWellnessQuestion(currentInput, historyForAPI);
      const newAiMessage: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error in AI chat:", error);
      const errorAiMessage: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        text: t("aicoach.error.chatResponse"),
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGetCustomPlan = async () => {
    if (!apiKeyExists) {
        setMessages(prev => [...prev, {id: Date.now().toString(), text: t('aicoach.apiKeyMissing'), sender: 'ai', timestamp: Date.now()}]);
        return;
    }
    if (requestPremiumAccess(PREMIUM_FEATURE_CUSTOM_AI_PLANS)) {
      setIsCustomPlanLoading(true);
      setMessages(prev => [...prev, {id: Date.now().toString(), text: t('aicoach.generatingPlan'), sender: 'ai', timestamp: Date.now()}]);
      // Simulate API call for custom plan
      try {
        // In a real app, this would be a different Gemini service call with a specific prompt for plan generation
        // const plan = await getCustomAIPlan(habitLogs); // Example function
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        const plan = t('aicoach.customPlanExample'); // Example plan
        
        setMessages(prev => [...prev, {id: (Date.now() + 1).toString(), text: plan, sender: 'ai', timestamp: Date.now()}]);
      } catch (error) {
        console.error("Error generating custom plan:", error);
        setMessages(prev => [...prev, {id: (Date.now() + 1).toString(), text: t('aicoach.error.fetchPlan'), sender: 'ai', timestamp: Date.now()}]);
      } finally {
        setIsCustomPlanLoading(false);
      }
    }
  };
  
  const QuickActionButton: React.FC<{ onClick: () => void; isLoading: boolean; icon: React.ReactNode; label: string, disabled?: boolean }> = ({ onClick, isLoading, icon, label, disabled }) => (
    <button 
        onClick={onClick} 
        disabled={isLoading || disabled} 
        className="text-xs text-themeAccent hover:underline mt-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-live="polite"
        aria-busy={isLoading}
    >
        {isLoading ? <LoaderCircle size={14} className="animate-spin inline mr-1.5"/> : icon}
        {label}
    </button>
  );


  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)]">
      <div className="mb-6 space-y-4">
        {!apiKeyExists && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
              <div>
                <p className="font-bold">{t('aicoach.limited')}</p>
                <p className="text-sm">{t('aicoach.apiKeyMissing')}</p>
              </div>
            </div>
          </div>
        )}
        {dailyTip && (
          <div className="bg-themeCard p-4 rounded-lg shadow-lg">
            <div className="flex items-center text-themePrimary mb-2">
              <Lightbulb size={20} className="mr-2 flex-shrink-0" />
              <h3 className="text-lg font-semibold">{t('aicoach.dailyTipTitle')}</h3>
            </div>
            <p className="text-sm text-themeText min-h-[20px]">{isTipLoading ? t('aicoach.fetchingTip') : dailyTip}</p>
            {apiKeyExists && <QuickActionButton onClick={fetchDailyTip} isLoading={isTipLoading} icon={<RotateCcw size={12} className="inline mr-1"/>} label={t('aicoach.refreshTip')} />}
          </div>
        )}
        {weeklyAnalysis && (
          <div className="bg-themeCard p-4 rounded-lg shadow-lg">
            <div className="flex items-center text-themeSecondary mb-2">
               <Bot size={20} className="mr-2 flex-shrink-0" />
              <h3 className="text-lg font-semibold">{t('aicoach.weeklyInsightsTitle')}</h3>
            </div>
            <p className="text-sm text-themeText whitespace-pre-wrap min-h-[40px]">{isAnalysisLoading ? t('aicoach.analyzingData') : weeklyAnalysis}</p>
            {apiKeyExists && <QuickActionButton onClick={fetchWeeklyAnalysis} isLoading={isAnalysisLoading} icon={<RotateCcw size={12} className="inline mr-1"/>} label={t('aicoach.refreshAnalysis')} />}
          </div>
        )}
        {/* Custom AI Plan Button (Premium) */}
        <div className="bg-themeCard p-4 rounded-lg shadow-lg">
           <div className="flex items-center text-themeAccent mb-2">
            <Sparkles size={20} className="mr-2 flex-shrink-0"/>
            <h3 className="text-lg font-semibold">{t('premium.customAIPlans')}</h3>
             {/* Fix: Wrap Lock icon in a span with title attribute and use imported PREMIUM_FEATURE_LOCKED */}
             {!isPremium && <span title={t(PREMIUM_FEATURE_LOCKED)}><Lock size={16} className="ml-2 text-yellow-500" /></span>}
           </div>
           <p className="text-sm text-gray-600 mb-3">{t('premium.customAIPlansDesc')}</p>
           <button
             onClick={handleGetCustomPlan}
             disabled={isCustomPlanLoading || !apiKeyExists}
             className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-50 ${
                isPremium ? 'bg-themeAccent text-white hover:opacity-90' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
             }`}
             aria-live="polite"
             aria-busy={isCustomPlanLoading}
           >
            {isCustomPlanLoading ? <LoaderCircle size={20} className="animate-spin mr-2"/> : (isPremium ? <Sparkles size={20} className="mr-2"/> : <Lock size={16} className="mr-2"/>) }
            {t('aicoach.getCustomPlanButton')}
           </button>
        </div>

      </div>

      <div className="flex-grow overflow-y-auto mb-4 p-3 sm:p-4 bg-themeCard rounded-lg shadow-lg space-y-4 min-h-[200px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquareDashed size={48} className="mb-2"/>
            <p>{t('aicoach.chatPlaceholder')}</p>
            {!apiKeyExists && <p className="text-xs mt-1">{t('aicoach.chatDisabledMissingKey')}</p>}
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-xl shadow-md ${
                msg.sender === 'user'
                  ? 'bg-themePrimary text-white rounded-br-none'
                  : 'bg-gray-100 text-themeText rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
           <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-xl shadow-md bg-gray-100 text-themeText rounded-bl-none">
              <LoaderCircle size={20} className="animate-spin text-themePrimary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto p-1 bg-themeCard rounded-lg shadow-md">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={apiKeyExists ? t('aicoach.chatPlaceholder') : t('aicoach.chatDisabled')}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-themePrimary focus:border-transparent outline-none transition-shadow disabled:bg-gray-100"
            disabled={!apiKeyExists || isChatLoading}
            aria-label={t('aicoach.chatPlaceholder')}
          />
          <button
            type="submit"
            disabled={isChatLoading || !apiKeyExists || userInput.trim() === ''}
            className="p-3 bg-themePrimary text-white rounded-lg hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-themePrimary disabled:opacity-50 transition-all"
            aria-label={t('aicoach.sendMessage')}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoachPage;