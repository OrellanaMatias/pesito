import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CurrencyType } from '../types';
import { transactionService } from '../services/api';

export function Settings() {
  const { 
    themeMode, 
    toggleTheme, 
    currency, 
    setCurrency,
    geminiApiKey,
    setGeminiApiKey,
    useAIProcessing,
    setUseAIProcessing,
    aiApiStatus,
    testGeminiApiKey
  } = useTheme();
  
  const [testApiKeyLoading, setTestApiKeyLoading] = useState(false);
  const [testApiKeyResult, setTestApiKeyResult] = useState<{
    success?: boolean;
    message?: string;
    generatedText?: string;
  }>({});
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetDatabaseLoading, setResetDatabaseLoading] = useState(false);
  const [resetDatabaseResult, setResetDatabaseResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  
  const currencyOptions: { value: CurrencyType; label: string; flag: string; description: string }[] = [
    { 
      value: 'USD', 
      label: 'Dólar estadounidense', 
      flag: '🇺🇸', 
      description: 'Moneda oficial de Estados Unidos'
    },
    { 
      value: 'ARS', 
      label: 'Peso argentino', 
      flag: '🇦🇷', 
      description: 'Moneda oficial de Argentina'
    }
  ];
  
  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestApiKeyResult({
        success: false,
        message: 'Debes ingresar una API key para probar'
      });
      return;
    }
    
    setTestApiKeyLoading(true);
    setTestApiKeyResult({});
    
    setGeminiApiKey(apiKeyInput.trim());
    
    try {
      const result = await testGeminiApiKey();
      setTestApiKeyResult(result);
    } catch (error) {
      setTestApiKeyResult({
        success: false,
        message: 'Error al probar la API key'
      });
    } finally {
      setTestApiKeyLoading(false);
    }
  };
  
  const handleClearApiKey = () => {
    setApiKeyInput('');
    setGeminiApiKey('');
    setTestApiKeyResult({});
  };
  
  const handleResetDatabase = async () => {
    setResetDatabaseLoading(true);
    setResetDatabaseResult({});
    
    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Si estamos en el navegador del cliente y la URL contiene "backend", reemplazarla por "localhost"
    if (typeof window !== 'undefined' && API_URL.includes('backend')) {
      API_URL = API_URL.replace('backend', 'localhost');
    }
    
    try {
      const response = await fetch(`${API_URL}/admin/reset-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setResetDatabaseResult({
          success: true,
          message: 'Base de datos reiniciada correctamente'
        });
      } else {
        throw new Error('Error al reiniciar la base de datos');
      }
    } catch (error) {
      setResetDatabaseResult({
        success: false,
        message: 'Error al reiniciar la base de datos. Inténtalo de nuevo.'
      });
    } finally {
      setResetDatabaseLoading(false);
      setShowResetConfirmation(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">
          Configuración de la aplicación
        </h2>
        
        {/* Sección de Integración con IA */}
        <section className="mb-8">
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Integración con IA (Google Gemini)
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">API Key de Google Gemini</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Para usar la inteligencia artificial en la clasificación de transacciones
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  aiApiStatus === 'valid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : aiApiStatus === 'invalid' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : aiApiStatus === 'testing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {aiApiStatus === 'valid' 
                    ? 'Configurada' 
                    : aiApiStatus === 'invalid' 
                      ? 'Inválida'
                      : aiApiStatus === 'testing'
                        ? 'Probando...'
                        : 'Sin configurar'}
                </span>
              </div>
              
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 dark:hover:text-blue-300">
                  Obtén tu API key en Google AI Studio →
                </a>
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Ingresa tu API key de Google Gemini"
                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {apiKeyInput && (
                    <button
                      onClick={handleClearApiKey}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleTestApiKey}
                    disabled={testApiKeyLoading || !apiKeyInput.trim()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testApiKeyLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Probando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Probar API key</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setGeminiApiKey(apiKeyInput.trim())}
                    disabled={!apiKeyInput.trim() || geminiApiKey === apiKeyInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Resultado de la prueba */}
            {testApiKeyResult.message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                testApiKeyResult.success 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {testApiKeyResult.success ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="font-medium">{testApiKeyResult.message}</p>
                    {testApiKeyResult.generatedText && (
                      <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-800/50">
                        <p className="text-xs opacity-80">Respuesta generada:</p>
                        <p className="text-sm mt-1">{testApiKeyResult.generatedText}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Activar/desactivar el uso de IA */}
            {aiApiStatus === 'valid' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Usar IA para clasificar transacciones</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      La IA analizará el texto de tus gastos e ingresos para clasificarlos automáticamente
                    </p>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useAIProcessing} 
                      onChange={() => setUseAIProcessing(!useAIProcessing)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Sección de Apariencia */}
        <section className="mb-8">
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Apariencia
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Tema oscuro</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cambia entre el tema claro y oscuro
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={themeMode === 'dark'} 
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-800">Tema Claro</h5>
                  <div className={`h-4 w-4 rounded-full ${themeMode === 'light' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-5 bg-blue-500 rounded"></div>
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3 bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-200">Tema Oscuro</h5>
                  <div className={`h-4 w-4 rounded-full ${themeMode === 'dark' ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-5 bg-blue-500 rounded"></div>
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div className="h-5 w-5 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sección de Moneda */}
        <section className="mb-8">
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Moneda
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 dark:text-white">Moneda predeterminada</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selecciona la moneda que deseas usar para mostrar tus transacciones
              </p>
            </div>
            
            <div className="space-y-3 mt-4">
              {currencyOptions.map(option => (
                <div 
                  key={option.value}
                  onClick={() => setCurrency(option.value)}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    currency === option.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0 mr-4 text-2xl">{option.flag}</div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800 dark:text-white">{option.label}</h5>
                      {currency === option.value && (
                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Sección Acerca de */}
        <section>
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Acerca de
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">💰</span>
              <h4 className="font-semibold text-gray-800 dark:text-white text-lg">Pesito</h4>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                Versión 1.0.0
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pesito es una aplicación para gestionar finanzas personales con funciones avanzadas de inteligencia artificial.
            </p>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  Términos de servicio
                </a>
                <a 
                  href="#" 
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  Política de privacidad
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sección Acerca del Desarrollador */}
        <section className="mb-8 mt-8">
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Acerca del Desarrollador
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white text-lg">Matias Orellana</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Técnico en informática personal y profesional</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Especialista en desarrollo web con experiencia en varios frameworks :p
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://orellanamatias.com.ar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Portafolio
              </a>
              
              <a 
                href="https://github.com/OrellanaMatias" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
              
              <a 
                href="https://linkedin.com/in/orellana-matias" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                LinkedIn
              </a>
              
              <a 
                href="https://gitlab.com/OrellanaMatias" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                </svg>
                GitLab
              </a>
            </div>
          </div>
        </section>
        
        {/* Sección de Administración */}
        <section className="mb-8 mt-8">
          <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Administración
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reiniciar base de datos
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esta acción eliminará todas tus transacciones y categorías. Esta acción no se puede deshacer.
              </p>
              
              {!showResetConfirmation ? (
                <button
                  onClick={() => setShowResetConfirmation(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reiniciar datos
                </button>
              ) : (
                <div className="mt-3 p-3 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
                    ¿Estás seguro? Esta acción eliminará permanentemente todos tus datos.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleResetDatabase}
                      disabled={resetDatabaseLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetDatabaseLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        "Sí, eliminar todos mis datos"
                      )}
                    </button>
                    <button
                      onClick={() => setShowResetConfirmation(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              
              {resetDatabaseResult.message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  resetDatabaseResult.success 
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {resetDatabaseResult.success ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">{resetDatabaseResult.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 
