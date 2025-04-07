import { useEffect, useState } from 'react';
import { transactionService } from '../services/api';
import { Transaction } from '../types';

const DonutChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
  ];
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-400">No hay datos disponibles</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full max-h-full">
        {/* Círculo de fondo */}
        <circle cx="50" cy="50" r="40" fill="#f3f4f6" className="dark:fill-gray-700" />
        
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = data.slice(0, index).reduce(
            (sum, d) => sum + (d.value / total) * 360, 0
          );
          const endAngle = startAngle + (item.value / total) * 360;
          
          const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
          const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth="1"
              className="transition-all duration-300"
            />
          );
        })}
        
        {/* Círculo central (opcional) */}
        <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-800" />
      </svg>
      
      {/* Leyenda simplificada */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-1 text-[9px]">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              style={{ backgroundColor: colors[index % colors.length] }}
              className="w-2 h-2 rounded-full mr-1"
            />
            <span className="truncate max-w-[55px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FinancialSummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getAll();
        setTransactions(data);
        console.log('Transacciones cargadas:', data);
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
        setError('Error al cargar los datos financieros');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular ingresos y gastos totales
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  // Agrupar gastos por categoría para el gráfico
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const catName = t.category_name || 'Sin categoría';
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([label, value]) => ({
    label,
    value,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-3">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-white bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Panel de resumen */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
          <h3 className="text-xs text-green-700 dark:text-green-300 font-medium">Ingresos</h3>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">${income.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">
          <h3 className="text-xs text-red-700 dark:text-red-300 font-medium">Gastos</h3>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">${expenses.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
          <h3 className="text-xs text-blue-700 dark:text-blue-300 font-medium">Balance</h3>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráfico de gastos por categoría */}
      {chartData.length > 0 ? (
        <div className="mt-1 mb-1">
          <h3 className="text-xs font-medium px-1 mb-1">Gastos por categoría</h3>
          <div className="h-36">
            <DonutChart data={chartData} />
          </div>
        </div>
      ) : (
        <div className="text-center p-2 text-sm text-gray-500 dark:text-gray-400">
          No hay datos de gastos para mostrar
        </div>
      )}

      {/* Lista de transacciones recientes */}
      <div className="mt-2">
        <h3 className="text-xs font-medium px-1 mb-1">Transacciones recientes</h3>
        <div className="space-y-1">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-xs font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.category_name || 'Sin categoría'}
                  </p>
                </div>
                <p className={`text-sm font-medium ${
                  transaction.type === 'income' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center p-2 text-sm text-gray-500 dark:text-gray-400">
              No hay transacciones recientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 