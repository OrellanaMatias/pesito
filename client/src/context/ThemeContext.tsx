import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, CurrencyType, AIApiStatus, GeminiTestResponse } from '../types';
import { geminiService } from '../services/api';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  currencySymbol: string;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  useAIProcessing: boolean;
  setUseAIProcessing: (use: boolean) => void;
  aiApiStatus: AIApiStatus;
  testGeminiApiKey: () => Promise<GeminiTestResponse>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const getInitialTheme = (): ThemeMode => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as ThemeMode;
      if (storedTheme) {
        return storedTheme;
      }
      
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    
    return 'light';
  };
  
  const getInitialCurrency = (): CurrencyType => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCurrency = window.localStorage.getItem('currency') as CurrencyType;
      if (storedCurrency === 'USD' || storedCurrency === 'ARS') {
        return storedCurrency;
      }
    }
    return 'ARS';
  };
  
  const getInitialGeminiApiKey = (): string => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedKey = window.localStorage.getItem('geminiApiKey');
      if (storedKey) {
        return storedKey;
      }
    }
    return '';
  };
  
  const getInitialAIProcessingUsage = (): boolean => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const useAI = window.localStorage.getItem('useAIProcessing');
      if (useAI !== null) {
        return useAI === 'true';
      }
    }
    return false;
  };
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [currency, setCurrencyState] = useState<CurrencyType>(getInitialCurrency);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(getInitialGeminiApiKey);
  const [useAIProcessing, setUseAIProcessingState] = useState<boolean>(getInitialAIProcessingUsage);
  const [aiApiStatus, setAIApiStatus] = useState<AIApiStatus>(
    getInitialGeminiApiKey() ? 'valid' : 'unconfigured'
  );
  
  const getCurrencySymbol = (currencyType: CurrencyType): string => {
    switch (currencyType) {
      case 'USD':
        return '$';
      case 'ARS':
        return '$';
      default:
        return '$';
    }
  };
  
  const toggleTheme = () => {
    setThemeMode(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  const setCurrency = (newCurrency: CurrencyType) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };
  
  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('geminiApiKey', key);
    if (!key) {
      setAIApiStatus('unconfigured');
      setUseAIProcessingState(false);
      localStorage.setItem('useAIProcessing', 'false');
    }
  };
  
  const setUseAIProcessing = (use: boolean) => {
    setUseAIProcessingState(use);
    localStorage.setItem('useAIProcessing', use.toString());
  };
  
  const testGeminiApiKey = async (): Promise<GeminiTestResponse> => {
    if (!geminiApiKey) {
      return {
        success: false,
        message: 'No se ha configurado una API key'
      };
    }
    
    setAIApiStatus('testing');
    console.log('Iniciando prueba de API key de Gemini:', geminiApiKey.substring(0, 5) + '...');
    
    try {
      const data = await geminiService.testApiKey(geminiApiKey);
      console.log('Resultado de la prueba de API key:', data);
      
      if (data.success) {
        setAIApiStatus('valid');
        return {
          success: true,
          message: 'API key válida',
          generatedText: data.generatedText
        };
      } else {
        setAIApiStatus('invalid');
        return {
          success: false,
          message: data.message || 'Error al validar la API key'
        };
      }
    } catch (error: any) {
      console.error('Error al probar API key:', error);
      setAIApiStatus('invalid');
      return {
        success: false,
        message: error.message || 'Error de conexión al probar la API key'
      };
    }
  };
  
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);
  
  const value = {
    themeMode,
    toggleTheme,
    currency,
    setCurrency,
    currencySymbol: getCurrencySymbol(currency),
    geminiApiKey,
    setGeminiApiKey,
    useAIProcessing,
    setUseAIProcessing,
    aiApiStatus,
    testGeminiApiKey
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}; 
