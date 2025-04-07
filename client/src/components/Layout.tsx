import { useState, useEffect } from 'react';
import { ChatPanel } from './ChatPanel';
import { Summary } from './Summary';
import { CategoryManager } from './CategoryManager';
import { Settings } from './Settings';
import { useTheme } from '../context/ThemeContext';

type Tab = 'chat' | 'summary' | 'categories' | 'settings';

export function Layout() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { themeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const tabIcons = {
    chat: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    summary: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    categories: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };
  
  const NavButton = ({ tab, label }: { tab: Tab, label: string }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md mb-1 w-full ${
        activeTab === tab
          ? 'bg-blue-500 text-white dark:bg-blue-600'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {tabIcons[tab]}
      <span>{label}</span>
    </button>
  );
  
  const NavigationPanel = () => (
    <div className="flex flex-col py-2 w-full">
      <NavButton tab="chat" label="Chat" />
      <NavButton tab="summary" label="Resumen" />
      <NavButton tab="categories" label="Categorías" />
      <NavButton tab="settings" label="Configuración" />
    </div>
  );
  
  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200 ${themeMode}`}>
      <div className="mx-auto h-screen flex flex-col md:flex-row">
        {/* Barra superior con título y botón de menú (visible en todos los tamaños) */}
        <header className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <span className="text-2xl mr-1">💰</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Pesito</h1>
          </div>
          
          {/* Botón de menú hamburguesa (solo en móvil) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        {/* Estructura del contenido principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Panel lateral (visible solo en escritorio) */}
          <aside className="w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-3 hidden md:block">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-1">💰</span>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Pesito</h1>
            </div>
            <NavigationPanel />
          </aside>
          
          {/* Menú móvil desplegable */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-3 md:hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-1">💰</span>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">Pesito</h1>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <NavigationPanel />
            </div>
          )}
          
          {/* Contenido dinámico según la pestaña activa */}
          <main className="flex-1 overflow-hidden p-3">
            {activeTab === 'chat' && <ChatPanel />}
            {activeTab === 'summary' && <Summary />}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    </div>
  );
} 