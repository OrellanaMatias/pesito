import { query } from '../database/mysql-setup.js';

/**
 * Analiza un mensaje de texto para identificar una transacción financiera
 * @param {string} text - Texto a analizar (ej: "Gasté 300 en supermercado")
 * @returns {Object|null} - Datos de la transacción o null si no se pudo analizar
 */
export const parseTransactionText = async (text) => {
  const normalizedText = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  const expensePatterns = [
    /gast[eé](?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:en|por)?\s+(.+)/i,
    /pag[uéo](?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:por|en)?\s+(.+)/i,
    /compr[eéa](?:\s+)[^0-9]*?(?:por|en)?\s*?(\d+(?:[.,]\d+)?)[^0-9]*?\s+(.+)/i,
    /(\d+(?:[.,]\d+)?)[^0-9]*?(?:en|por)\s+(.+)/i
  ];
  
  const incomePatterns = [
    /recib[ií](?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:por|de)?\s+(.+)/i,
    /me\s+pagaron(?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:por|de)?\s+(.+)/i,
    /ingres[eé](?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:por|de)?\s+(.+)/i,
    /cobr[eé](?:\s+)[^0-9]*?(\d+(?:[.,]\d+)?)[^0-9]*?(?:por|de)?\s+(.+)/i
  ];
  
  const expenseKeywords = ['gast', 'compr', 'pag', 'cost', 'comid', 'transport', 'uber', 'taxi', 'mercado', 'super'];
  const incomeKeywords = ['recib', 'ingres', 'cobr', 'me pagaron', 'me dieron', 'sueldo', 'salario'];
  
  let type = null;
  let amount = null;
  let description = null;
  let patterns = [];
  
  const isExpense = expenseKeywords.some(keyword => normalizedText.includes(keyword));
  if (isExpense) {
    type = 'expense';
    patterns = expensePatterns;
  } 
  else {
    const isIncome = incomeKeywords.some(keyword => normalizedText.includes(keyword));
    if (isIncome) {
      type = 'income';
      patterns = incomePatterns;
    }
  }
  
  if (!type) {
    if (normalizedText.match(/gast|compr|pag|cost|comid|transport/i)) {
      type = 'expense';
      patterns = expensePatterns;
    } else if (normalizedText.match(/recib|ingres|pagaron|dieron|cobr/i)) {
      type = 'income';
      patterns = incomePatterns;
    } else {
      type = 'expense';
      patterns = [
        /(\d+(?:[.,]\d+)?)[^0-9]*?(?:en|por|de)?\s+(.+)/i,
        /(.+)[^0-9]*?(\d+(?:[.,]\d+)?)/i
      ];
    }
  }
  
  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(',', '.'));
      description = match[2].trim();
      break;
    }
  }
  
  if (!amount) {
    const numberMatch = normalizedText.match(/(\d+(?:[.,]\d+)?)/);
    if (numberMatch) {
      amount = parseFloat(numberMatch[1].replace(',', '.'));
      
      description = normalizedText
        .replace(/gast[eé]|pag[uéo]|compr[eéa]|recib[ií]|me\s+pagaron|ingres[eé]|cobr[eé]/ig, '')
        .replace(new RegExp(amount.toString(), 'g'), '')
        .replace(/en|por|de/g, '')
        .trim();
    }
  }
  
  if (!amount) {
    return null;
  }
  
  if (!description || description.length < 2) {
    description = type === 'income' ? 'Ingreso sin especificar' : 'Gasto sin especificar';
  }
  
  const categoryId = await findBestCategory(description, type);
  
  return {
    amount,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    type,
    category_id: categoryId
  };
};

/**
 * Encuentra la mejor categoría para una descripción de transacción
 * @param {string} description - Descripción de la transacción
 * @param {string} type - Tipo de transacción ('income' o 'expense')
 * @returns {Promise<number>} - Promise que resuelve al ID de la categoría
 */
const findBestCategory = async (description, type) => {
  const expenseCategoryKeywords = {
    // Comida
    'comida': 1, 'restaurant': 1, 'comer': 1, 'almuerzo': 1, 'cena': 1, 
    'desayuno': 1, 'pizza': 1, 'hamburguesa': 1, 'cafe': 1, 'supermercado': 1,
    'mercado': 1, 'super': 1, 'tienda': 1, 'verdura': 1, 'fruta': 1,
    
    // Transporte
    'transporte': 2, 'uber': 2, 'taxi': 2, 'bus': 2, 'gasolina': 2, 
    'combustible': 2, 'metro': 2, 'tren': 2, 'pasaje': 2, 'peaje': 2,
    
    // Vivienda
    'vivienda': 3, 'alquiler': 3, 'renta': 3, 'hipoteca': 3, 'mantenimiento': 3,
    'condominio': 3, 'reparacion': 3, 'mueble': 3, 'decoracion': 3, 'casa': 3,
    
    // Entretenimiento
    'entretenimiento': 4, 'cine': 4, 'pelicula': 4, 'concierto': 4, 'teatro': 4,
    'juego': 4, 'fiesta': 4, 'viaje': 4, 'vacacion': 4, 'ocio': 4, 'diversion': 4,
    
    // Servicios
    'servicio': 5, 'agua': 5, 'luz': 5, 'electricidad': 5, 'internet': 5, 
    'telefono': 5, 'movil': 5, 'celular': 5, 'cable': 5, 'streaming': 5, 
    'spotify': 5, 'netflix': 5, 'suscripcion': 5,
    
    // Salud
    'salud': 6, 'medico': 6, 'doctor': 6, 'medicina': 6, 'farmacia': 6,
    'hospital': 6, 'clinica': 6, 'seguro': 6, 'dental': 6, 'terapia': 6,
    
    // Educación
    'educacion': 7, 'colegio': 7, 'escuela': 7, 'universidad': 7, 'curso': 7,
    'libro': 7, 'material': 7, 'clase': 7, 'capacitacion': 7, 'taller': 7
  };
  
  const incomeCategoryKeywords = {
    // Salario
    'salario': 9, 'sueldo': 9, 'nomina': 9, 'trabajo': 9, 'empleo': 9,
    
    // Freelance
    'freelance': 10, 'proyecto': 10, 'cliente': 10, 'consultoria': 10, 
    'diseno': 10, 'desarrollo': 10, 'programacion': 10, 'redaccion': 10,
    
    // Regalos
    'regalo': 11, 'donacion': 11, 'cumpleanos': 11, 'navidad': 11,
    
    // Inversiones
    'inversion': 12, 'dividendo': 12, 'interes': 12, 'alquiler': 12, 
    'ganancia': 12, 'venta': 12, 'accion': 12, 'bono': 12, 'rendimiento': 12
  };
  
  const categoryKeywords = type === 'expense' ? expenseCategoryKeywords : incomeCategoryKeywords;
  
  const normalizedDesc = description.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  let bestCategory = null;
  let maxScore = 0;
  
  for (const [keyword, categoryId] of Object.entries(categoryKeywords)) {
    if (normalizedDesc.includes(keyword)) {
      const score = keyword.length;
      if (score > maxScore) {
        maxScore = score;
        bestCategory = categoryId;
      }
    }
  }
  
  if (!bestCategory) {
    bestCategory = type === 'expense' ? 8 : 13; // 8 = Otros gastos, 13 = Otros ingresos
  }
  
  try {
    const sql = 'SELECT id FROM categories WHERE id = ? AND type = ?';
    const result = await query(sql, [bestCategory, type]);
    
    if (result.length === 0) {
      return type === 'expense' ? 8 : 13;
    }
    
    return bestCategory;
  } catch (error) {
    console.error('Error al buscar categoría:', error.message);
    return type === 'expense' ? 8 : 13;
  }
}; 
