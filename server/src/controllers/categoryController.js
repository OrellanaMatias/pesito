import { query } from '../database/mysql-setup.js';

export const getAllCategories = async (req, res) => {
  try {
    const sql = `SELECT * FROM categories ORDER BY type, name`;
    const categories = await query(sql);
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name, type } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ 
      error: 'Nombre y tipo (income/expense) son obligatorios' 
    });
  }
  
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ 
      error: 'El tipo debe ser "income" o "expense"' 
    });
  }
  
  try {
    const insertSql = `INSERT INTO categories (name, type) VALUES (?, ?)`;
    
    try {
      const result = await query(insertSql, [name, type]);
      const insertId = result.insertId;
      
      const selectSql = `SELECT * FROM categories WHERE id = ?`;
      const categories = await query(selectSql, [insertId]);
      
      return res.status(201).json(categories[0]);
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        return res.status(400).json({ 
          error: `Ya existe una categoría con el nombre "${name}"` 
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  
  try {
    const checkSql = `SELECT * FROM categories WHERE id = ?`;
    const existingCategory = await query(checkSql, [id]);
    
    if (existingCategory.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    const updateSql = `UPDATE categories SET name = ? WHERE id = ?`;
    
    try {
      const result = await query(updateSql, [name, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      const updatedCategory = await query(checkSql, [id]);
      return res.json(updatedCategory[0]);
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        return res.status(400).json({ 
          error: `Ya existe una categoría con el nombre "${name}"` 
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  
  try {
    const checkTransactionsSql = `SELECT COUNT(*) as count FROM transactions WHERE category_id = ?`;
    const transactionsCount = await query(checkTransactionsSql, [id]);
    
    if (transactionsCount[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene transacciones asociadas' 
      });
    }
    
    const deleteSql = `DELETE FROM categories WHERE id = ?`;
    const result = await query(deleteSql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    return res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 
