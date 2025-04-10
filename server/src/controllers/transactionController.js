import { query } from '../database/mysql-setup.js';
import { parseTransactionText } from '../utils/transactionParser.js';

export const getAllTransactions = async (req, res) => {
  try {
    const sql = `
      SELECT t.*, c.name as category_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
    `;
    
    const transactions = await query(sql);
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const { amount, description, type, category_id } = req.body;
  
  if (!amount || !type) {
    return res.status(400).json({ error: 'Monto y tipo son obligatorios' });
  }
  
  try {
    const insertSql = `
      INSERT INTO transactions (amount, description, type, category_id)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query(insertSql, [amount, description, type, category_id]);
    const insertId = result.insertId;
    
    const selectSql = `
      SELECT t.*, c.name as category_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `;
    
    const transaction = await query(selectSql, [insertId]);
    return res.status(201).json(transaction[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const processTransactionText = async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'El texto es obligatorio' });
  }
  
  const geminiApiKey = req.body.geminiApiKey;
  const useAI = req.body.useAI === true;
  
  try {
    let transactionData;
    
    if (useAI && geminiApiKey) {
      console.log('Procesando transacción con Gemini...');
      
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/gemini/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            apiKey: geminiApiKey
          }),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success && result.analysis) {
          console.log('Análisis de Gemini exitoso:', result.analysis);
          transactionData = result.analysis;
        } else {
          console.error('Error en análisis Gemini, usando método tradicional:', result.error || 'Error desconocido');
          transactionData = await parseTransactionText(text);
        }
      } catch (aiError) {
        console.error('Error al llamar a Gemini, usando método tradicional:', aiError);
        transactionData = await parseTransactionText(text);
      }
    } else {
      console.log('Procesando transacción con método tradicional...');
      transactionData = await parseTransactionText(text);
    }
    
    if (!transactionData) {
      return res.status(400).json({ 
        error: 'No se pudo interpretar el texto como una transacción válida' 
      });
    }
    
    const insertSql = `
      INSERT INTO transactions (amount, description, type, category_id)
      VALUES (?, ?, ?, ?)
    `;
    
    const insertResult = await query(insertSql, [
      transactionData.amount,
      transactionData.description,
      transactionData.type,
      transactionData.category_id
    ]);
    
    const insertId = insertResult.insertId;
    
    const categorySql = 'SELECT name FROM categories WHERE id = ?';
    const categories = await query(categorySql, [transactionData.category_id]);
    const category = categories.length > 0 ? categories[0] : null;
    
    const result = {
      id: insertId,
      ...transactionData,
      category_name: category ? category.name : null
    };
    
    return res.status(201).json({
      transaction: result,
      message: `${transactionData.type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente`,
      ai_processed: useAI && geminiApiKey ? true : false
    });
  } catch (error) {
    console.error('Error al procesar transacción:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar la transacción' });
  }
};

export const getTransactionsSummary = async (req, res) => {
  try {
    const totalsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
    `;
    
    const totalsResults = await query(totalsSql);
    const totals = totalsResults[0];
    
    const expensesByCategorySql = `
      SELECT 
        c.id, 
        c.name, 
        SUM(t.amount) as total,
        COUNT(t.id) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `;
    
    const expensesByCategory = await query(expensesByCategorySql);
    
    const incomesByCategorySql = `
      SELECT 
        c.id, 
        c.name, 
        SUM(t.amount) as total,
        COUNT(t.id) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'income'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `;
    
    const incomesByCategory = await query(incomesByCategorySql);
    
    const balance = totals.total_income - totals.total_expense;
    
    res.json({
      balance,
      total_income: totals.total_income,
      total_expense: totals.total_expense,
      expenses_by_category: expensesByCategory,
      incomes_by_category: incomesByCategory
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 
