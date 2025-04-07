import { db } from '../database/setup.js';
import { parseTransactionText } from '../utils/transactionParser.js';

export const getAllTransactions = (req, res) => {
  const query = `
    SELECT t.*, c.name as category_name 
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ORDER BY t.created_at DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
};

export const createTransaction = (req, res) => {
  const { amount, description, type, category_id } = req.body;
  
  if (!amount || !type) {
    return res.status(400).json({ error: 'Monto y tipo son obligatorios' });
  }
  
  const query = `
    INSERT INTO transactions (amount, description, type, category_id)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [amount, description, type, category_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get(`
      SELECT t.*, c.name as category_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(201).json(row);
    });
  });
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
    
    const insertQuery = `
      INSERT INTO transactions (amount, description, type, category_id)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      transactionData.amount,
      transactionData.description,
      transactionData.type,
      transactionData.category_id
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT name FROM categories WHERE id = ?', [transactionData.category_id], (err, category) => {
        if (err) {
          console.error('Error al obtener categoría:', err);
        }
        
        const result = {
          id: this.lastID,
          ...transactionData,
          category_name: category ? category.name : null
        };
        
        return res.status(201).json({
          transaction: result,
          message: `${transactionData.type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente`,
          ai_processed: useAI && geminiApiKey ? true : false
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar transacción:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar la transacción' });
  }
};

export const getTransactionsSummary = (req, res) => {
  db.get(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
  `, (err, totals) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.all(`
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
    `, (err, expensesByCategory) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.all(`
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
      `, (err, incomesByCategory) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const balance = totals.total_income - totals.total_expense;
        
        res.json({
          balance,
          total_income: totals.total_income,
          total_expense: totals.total_expense,
          expenses_by_category: expensesByCategory,
          incomes_by_category: incomesByCategory
        });
      });
    });
  });
}; 