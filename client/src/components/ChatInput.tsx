import { useState, FormEvent, KeyboardEvent, RefObject, MutableRefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Transaction } from '../types';
import { transactionService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface ChatInputProps {
  addMessage: (message: ChatMessage) => void;
  inputRef?: RefObject<HTMLInputElement> | null;
}

export function ChatInput({ addMessage, inputRef }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { geminiApiKey, useAIProcessing } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const text = input.trim();
    if (!text || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setInput('');
    setError(null);
    
    setIsLoading(true);
    try {
      const useAI = useAIProcessing && geminiApiKey ? true : false;
      
      const response = await transactionService.processText(
        text,
        useAI ? geminiApiKey : undefined,
        useAI
      );
      
      let aiMessage = '';
      if (response.ai_processed) {
        aiMessage = ' (Clasificado con IA)';
      }
      
      const botMessage: ChatMessage = {
        id: uuidv4(),
        text: response.message + aiMessage,
        isUser: false,
        timestamp: new Date(),
        transactionData: response.transaction
      };
      
      addMessage(botMessage);
    } catch (err: any) {
      console.error('Error al procesar el mensaje:', err);
      
      setError(err.message || 'No pude entender ese mensaje. ¿Podrías intentarlo de nuevo?');
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: err.message || 'Lo siento, no pude procesar tu solicitud. ¿Podrías intentarlo de nuevo?',
        isUser: false,
        timestamp: new Date()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800/50">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-2 flex items-end">
        <div className="relative flex-grow">
          <input
            ref={inputRef ? inputRef : undefined}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un gasto o ingreso... (ej: Gasté $50 en comida)"
            className="w-full p-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          {input.trim().length > 0 && !isLoading && (
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setInput('')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <button
          type="submit"
          className="ml-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Procesando</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
      
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <p>Ejemplos: "Gasté $35 en restaurante", "Recibí $100 de pago"</p>
          {useAIProcessing && geminiApiKey && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-[10px] font-medium">
              IA Activada
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 
