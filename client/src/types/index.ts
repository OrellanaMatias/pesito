export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category_id: number;
  category_name?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface FinancialSummary {
  balance: number;
  total_income: number;
  total_expense: number;
  expenses_by_category: CategorySummary[];
  incomes_by_category: CategorySummary[];
}

export interface CategorySummary {
  id: number;
  name: string;
  total: number;
  count: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  transactionData?: Transaction;
}

export type ThemeMode = 'light' | 'dark';

export type CurrencyType = 'USD' | 'ARS';

export type AIApiStatus = 'unconfigured' | 'valid' | 'invalid' | 'testing';

export interface AppSettings {
  theme: ThemeMode;
  currency: CurrencyType;
  geminiApiKey?: string;
  useAIProcessing?: boolean;
}

export interface GeminiTestResponse {
  success: boolean;
  message: string;
  generatedText?: string;
} 