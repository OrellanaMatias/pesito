import { useState, useEffect, FormEvent } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/api';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Solicitando categorías al API...');
      const data = await categoryService.getAll();
      console.log('Categorías recibidas:', data);
      
      setCategories(data);
    } catch (err: any) {
      console.error('Error detallado:', err);
      setError('Error al cargar las categorías');
      setDebugInfo(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) return;
    
    try {
      setLoading(true);
      const newCategory = await categoryService.create({
        name: newCategoryName.trim(),
        type: newCategoryType
      });
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };
  
  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };
  
  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };
  
  const saveEdit = async () => {
    if (!editingCategory || !editName.trim()) return;
    
    try {
      setLoading(true);
      const updatedCategory = await categoryService.update(editingCategory.id, editName.trim());
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setEditingCategory(null);
      setEditName('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la categoría');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCategories = categories
    .filter(cat => cat.type === activeTab)
    .filter(cat => 
      searchTerm === '' || 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const errorMessage = error && (
    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm dark:bg-red-900/30 dark:text-red-100 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{error}</p>
          {debugInfo && <p className="text-xs mt-1 opacity-80">Detalle: {debugInfo}</p>}
        </div>
        <button
          onClick={() => { setError(null); setDebugInfo(null); }}
          className="ml-2 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800/50 h-6 w-6 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  const loadingSpinner = loading && (
    <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex justify-center items-center z-10 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Procesando...</p>
      </div>
    </div>
  );

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border-3 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Cargando categorías...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 relative">
        {loadingSpinner}
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Gestión de Categorías</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
            {categories.length} categorías
          </div>
        </div>
        
        {/* Formulario para añadir categoría */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agregar nueva categoría</h3>
          
          <form onSubmit={handleAddCategory}>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2.5 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nombre de la categoría"
                  disabled={loading}
                />
                {newCategoryName && (
                  <button
                    type="button"
                    onClick={() => setNewCategoryName('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !newCategoryName.trim()}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Agregando</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Agregar</span>
                  </div>
                )}
              </button>
            </div>
            
            <div className="flex gap-6 mt-3">
              <label className={`flex items-center cursor-pointer rounded-full px-3 py-1.5 ${
                newCategoryType === 'expense' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={newCategoryType === 'expense'}
                  onChange={() => setNewCategoryType('expense')}
                  disabled={loading}
                />
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm font-medium">Gasto</span>
              </label>
              
              <label className={`flex items-center cursor-pointer rounded-full px-3 py-1.5 ${
                newCategoryType === 'income' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/50' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={newCategoryType === 'income'}
                  onChange={() => setNewCategoryType('income')}
                  disabled={loading}
                />
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium">Ingreso</span>
              </label>
            </div>
          </form>
        </div>
        
        {/* Mensaje de error */}
        {errorMessage}
        
        {/* Búsqueda y listado de categorías */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Tabs de navegación */}
          <div className="flex border-b dark:border-gray-700">
            <button 
              className={`flex-1 py-2.5 text-sm font-medium relative ${
                activeTab === 'expense' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('expense')}
            >
              <div className="flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'expense' ? 'bg-red-500' : 'bg-gray-400'} mr-2`}></span>
                <span>Gastos</span>
              </div>
              {activeTab === 'expense' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            
            <button 
              className={`flex-1 py-2.5 text-sm font-medium relative ${
                activeTab === 'income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('income')}
            >
              <div className="flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'income' ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                <span>Ingresos</span>
              </div>
              {activeTab === 'income' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
              )}
            </button>
          </div>
          
          {/* Búsqueda */}
          <div className="p-3 border-b dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categorías..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de categorías */}
          <div className="p-0">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                {searchTerm ? (
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados para "{searchTerm}"</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      Borrar búsqueda
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">No hay categorías de {activeTab === 'expense' ? 'gastos' : 'ingresos'}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Agrega una categoría usando el formulario</p>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCategories.map(category => (
                  <li key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    {editingCategory?.id === category.id ? (
                      <div className="p-3 flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                          category.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-grow p-2 text-sm border rounded-md mr-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={saveEdit}
                            className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50"
                            disabled={loading}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            category.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-gray-800 dark:text-gray-200">
                            {category.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {confirmDelete === category.id ? (
                            <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-1">
                              <span className="text-xs text-red-600 dark:text-red-400 px-1">¿Eliminar?</span>
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="p-1 bg-red-200 text-red-700 rounded hover:bg-red-300 dark:bg-red-800/50 dark:text-red-300"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(category)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900/30"
                                disabled={loading}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(category.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900/30"
                                disabled={loading}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}