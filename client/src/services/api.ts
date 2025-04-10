import { Transaction, Category, FinancialSummary, GeminiTestResponse } from '../types';

// Configurar la URL de la API para que siempre use la IP del VPS
let API_URL = 'http://54.175.70.20:3000/api';

console.log('API URL configurada:', API_URL);

async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    console.log(`Enviando solicitud a: ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    console.log(`Respuesta recibida de: ${API_URL}${endpoint}, status: ${response.status}`);
    
    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch (e) {
        errorDetail = { error: 'Error al procesar la respuesta' };
      }
      
      throw new Error(
        errorDetail.error || 
        `Error en la solicitud: ${response.status} ${response.statusText}`
      );
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        `Error de conexión: No se pudo conectar al servidor en ${API_URL}. ` +
        'Verifica que el servidor esté en ejecución.'
      );
    }
    
    throw error;
  }
}

export const transactionService = {
  getAll: (): Promise<Transaction[]> => {
    return fetchApi<Transaction[]>('/transactions');
  },

  create: (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
    return fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  processText: (
    text: string, 
    geminiApiKey?: string, 
    useAI?: boolean
  ): Promise<{
    transaction: Transaction;
    message: string;
    ai_processed?: boolean;
  }> => {
    const payload: any = { text };
    
    if (geminiApiKey && useAI) {
      payload.geminiApiKey = geminiApiKey;
      payload.useAI = true;
    }
    
    return fetchApi('/transactions/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSummary: (): Promise<FinancialSummary> => {
    return fetchApi<FinancialSummary>('/transactions/summary');
  }
};

export const categoryService = {
  getAll: (): Promise<Category[]> => {
    return fetchApi<Category[]>('/categories');
  },

  create: (category: Pick<Category, 'name' | 'type'>): Promise<Category> => {
    return fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  update: (id: number, name: string): Promise<Category> => {
    return fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};

export const geminiService = {
  testApiKey: (apiKey: string): Promise<GeminiTestResponse> => {
    console.log('Probando API key de Gemini...');
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('API key vacía');
      return Promise.resolve({
        success: false,
        message: 'La API key no puede estar vacía'
      });
    }
    
    return fetchApi<any>('/gemini/test', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }).then(response => {
      console.log('Respuesta del test de API key:', response);
      
      const formattedResponse: GeminiTestResponse = {
        success: response.success || false,
        message: (response as any).error || response.message || 'Error desconocido al validar la API key',
        generatedText: response.generatedText
      };
      
      return formattedResponse;
    }).catch(error => {
      console.error('Error al probar API key de Gemini:', error);
      
      return {
        success: false,
        message: error.message || 'Error de conexión al probar la API key'
      };
    });
  },
  
  processTransaction: (text: string, apiKey: string): Promise<{
    success: boolean;
    analysis?: {
      type: 'income' | 'expense';
      amount: number;
      description: string;
      category_id: number;
    };
    error?: string;
  }> => {
    return fetchApi('/gemini/process', {
      method: 'POST',
      body: JSON.stringify({ text, apiKey }),
    });
  }
}; 
