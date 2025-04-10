import { useState, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ChatMessageProps {
  message: ChatMessageType;
  botAvatar?: string;
}

export function ChatMessage({ message, botAvatar }: ChatMessageProps) {
  const { currencySymbol } = useTheme();
  const [visible, setVisible] = useState(message.isUser);
  
  useEffect(() => {
    if (!message.isUser) {
      // Pequeño retraso para que la animación sea perceptible
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [message.isUser]);
  
  const formattedTime = new Intl.DateTimeFormat('es', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(message.timestamp);

  return (
    <div 
      className={`flex mb-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!message.isUser && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-500 shadow-sm overflow-hidden">
            <img 
              src={botAvatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MzM4REQiLz48cGF0aCBkPSJNMTM2IDg0QzEzNiA5NS4wNDU3IDEyNy4wNDYgMTA0IDExNiAxMDRDMTA0Ljk1NCAxMDQgOTYgOTUuMDQ1NyA5NiA4NEM5NiA3Mi45NTQzIDEwNC45NTQgNjQgMTE2IDY0QzEyNy4wNDYgNjQgMTM2IDcyLjk1NDMgMTM2IDg0WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjQgMTMySDE2OFYxNTJDMTY4IDE2MC44MzcgMTYwLjgzNyAxNjggMTUyIDE2OEg4MEM3MS4xNjM0IDE2OCA2NCAxNjAuODM3IDY0IDE1MlYxMzJaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik04NCA3NkM4NCA4MS41MjI4IDc5LjUyMjggODYgNzQgODZDNjguNDc3MiA4NiA2NCA4MS41MjI4IDY0IDc2QzY0IDcwLjQ3NzIgNjguNDc3MiA2NiA3NCA2NkM3OS41MjI4IDY2IDg0IDcwLjQ3NzIgODQgNzZaIiBmaWxsPSIjRkZERDAwIi8+PHBhdGggZD0iTTk2IDEwNEMxMDQgMTIwIDEyOCAxMjAgMTM2IDEwNCIgc3Ryb2tlPSIjNDMzOEREIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg=='} 
              alt="Bot" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      <div
        className={`max-w-[75%] rounded-lg p-3 ${
          message.isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-700 dark:text-white rounded-bl-none'
        } ${!message.isUser ? (visible ? 'animate-fadeIn' : 'opacity-0') : ''}`}
      >
        <div className="text-sm mb-1 min-h-[20px]">
          {message.text}
        </div>
        
        {/* Si hay datos de transacción, mostramos un resumen */}
        {message.transactionData && visible && (
          <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/50 rounded-md backdrop-blur-sm text-xs border border-white/20 dark:border-gray-700/50 animate-slideUp">
            <div className="font-semibold flex justify-between items-center">
              <span>
                {message.transactionData.type === 'income' ? 'Ingreso' : 'Gasto'}
              </span>
              <span className={`ml-1 ${message.transactionData.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                {currencySymbol}{message.transactionData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs mt-1">{message.transactionData.description}</div>
            {message.transactionData.category_name && (
              <div className="text-gray-300/80 dark:text-gray-400 text-xs mt-1 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300/50 dark:bg-gray-500/50 mr-1"></span>
                <span>{message.transactionData.category_name}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-right mt-1 opacity-70">
          {formattedTime}
        </div>
      </div>
      
      {message.isUser && (
        <div className="flex-shrink-0 ml-2 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 shadow-sm overflow-hidden">
            <svg className="w-full h-full text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
} 
