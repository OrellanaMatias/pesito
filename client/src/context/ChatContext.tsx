import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '../types';

type ChatContextType = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy Pesito, tu asistente financiero. Tirame tus gastos e ingresos como se te cante y yo los anoto :p',
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: '¡Hola de nuevo! ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const value = {
    messages,
    addMessage,
    clearChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  
  return context;
} 