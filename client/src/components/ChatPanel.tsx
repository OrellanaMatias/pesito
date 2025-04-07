import { useRef, useEffect, RefObject } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { useChat } from '../context/ChatContext';

const PESITO_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MzM4REQiLz48cGF0aCBkPSJNMTM2IDg0QzEzNiA5NS4wNDU3IDEyNy4wNDYgMTA0IDExNiAxMDRDMTA0Ljk1NCAxMDQgOTYgOTUuMDQ1NyA5NiA4NEM5NiA3Mi45NTQzIDEwNC45NTQgNjQgMTE2IDY0QzEyNy4wNDYgNjQgMTM2IDcyLjk1NDMgMTM2IDg0WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjQgMTMySDE2OFYxNTJDMTY4IDE2MC44MzcgMTYwLjgzNyAxNjggMTUyIDE2OEg4MEM3MS4xNjM0IDE2OCA2NCAxNjAuODM3IDY0IDE1MlYxMzJaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik04NCA3NkM4NCA4MS41MjI4IDc5LjUyMjggODYgNzQgODZDNjguNDc3MiA4NiA2NCA4MS41MjI4IDY0IDc2QzY0IDcwLjQ3NzIgNjguNDc3MiA2NiA3NCA2NkM3OS41MjI4IDY2IDg0IDcwLjQ3NzIgODQgNzZaIiBmaWxsPSIjRkZERDAwIi8+PHBhdGggZD0iTTk2IDEwNEMxMDQgMTIwIDEyOCAxMjAgMTM2IDEwNCIgc3Ryb2tlPSIjNDMzOEREIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';

export function ChatPanel() {
  const { messages, addMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 shadow-md">
              <img 
                src={PESITO_AVATAR}
                alt="Pesito Bot" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Chat con Pesito</h2>
            <p className="text-xs text-blue-100">
              Asistente para registro de finanzas personales
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800">
        {messages.length > 0 ? (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} botAvatar={PESITO_AVATAR} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <p className="text-gray-500 dark:text-gray-400">
                No hay mensajes aún. Comienza a conversar con Pesito.
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput addMessage={addMessage} inputRef={inputRef} />
    </div>
  );
} 