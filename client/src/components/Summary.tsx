import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { transactionService } from '../services/api';
import { Transaction } from '../types';

export function Summary() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currencySymbol, currency } = useTheme();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getAll();
        setTransactions(data);
      } catch (err: any) {
        console.error('Error al cargar transacciones:', err);
        setError('Error al cargar los datos financieros');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const income = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const expenses = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const balance = income - expenses;

  const formatCurrency = (value: number): string => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '0,00';
    
    return numValue.toFixed(2).replace('.', ',');
  };

  const expensesByCategory = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t: Transaction) => {
      const catName = t.category_name || 'Sin categoría';
      acc[catName] = (acc[catName] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const getColorClass = (type: 'income' | 'expense' | 'balance') => {
    if (type === 'income') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (type === 'expense') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    return balance >= 0 
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto px-1 py-2">
      <div className="max-w-3xl mx-auto">
        {/* Indicador de moneda activa */}
        <div className="flex items-center mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <span className="mr-1 text-gray-800 dark:text-gray-200 font-medium">Moneda:</span> 
            <span className="font-semibold">{currency}</span>
          </span>
        </div>
        
        {/* Panel de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-lg p-4 shadow-sm ${getColorClass('income')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold opacity-80">Ingresos</p>
                <p className="text-2xl font-bold mt-1">{currencySymbol}{formatCurrency(income)}</p>
              </div>
              <div className="p-2 rounded-full bg-white/80 dark:bg-gray-800/50">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 shadow-sm ${getColorClass('expense')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold opacity-80">Gastos</p>
                <p className="text-2xl font-bold mt-1">{currencySymbol}{formatCurrency(expenses)}</p>
              </div>
              <div className="p-2 rounded-full bg-white/80 dark:bg-gray-800/50">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 shadow-sm ${getColorClass('balance')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold opacity-80">Balance</p>
                <p className="text-2xl font-bold mt-1">{currencySymbol}{formatCurrency(balance)}</p>
              </div>
              <div className="p-2 rounded-full bg-white/80 dark:bg-gray-800/50">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de gastos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Distribución de gastos
          </h3>
          
          {chartData.length > 0 ? (
            <div className="space-y-3">
              {chartData.slice(0, 5).map(({ label, value }, index) => {
                const percentage = Math.round((value / expenses) * 100);
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
                  'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      <div className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          {!isNaN(percentage) ? `${percentage}%` : '0%'}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {currencySymbol}{formatCurrency(value)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${color}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {chartData.length > 5 && (
                <div className="text-center mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{chartData.length - 5} categorías más
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No hay datos de gastos para mostrar</p>
            </div>
          )}
        </div>

        {/* Transacciones recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Transacciones recientes
            </h3>
            {transactions.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total: {transactions.length}
              </span>
            )}
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-800/30' 
                        : 'bg-red-100 dark:bg-red-800/30'
                    }`}>
                      {transaction.type === 'income' ? (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{transaction.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-300">
                          {transaction.category_name || 'Sin categoría'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <div className="text-center mt-4">
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline focus:outline-none">
                    Ver todas las transacciones
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-1">Aún no hay transacciones registradas</p>
              <p className="text-sm">Comienza a registrar tus gastos e ingresos en el chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
