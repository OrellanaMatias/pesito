import { db } from '../database/setup.js';

export const getAllCategories = (req, res) => {
  const query = `SELECT * FROM categories ORDER BY type, name`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
};

export const createCategory = (req, res) => {
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
  
  const query = `INSERT INTO categories (name, type) VALUES (?, ?)`;
  
  db.run(query, [name, type], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: `Ya existe una categoría con el nombre "${name}"` 
        });
      }
      return res.status(500).json({ error: err.message });
    }
    
    db.get(`SELECT * FROM categories WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(201).json(row);
    });
  });
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  
  db.get(`SELECT * FROM categories WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    const query = `UPDATE categories SET name = ? WHERE id = ?`;
    
    db.run(query, [name, id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ 
            error: `Ya existe una categoría con el nombre "${name}"` 
          });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      db.get(`SELECT * FROM categories WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json(row);
      });
    });
  });
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT COUNT(*) as count FROM transactions WHERE category_id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene transacciones asociadas' 
      });
    }
    
    const query = `DELETE FROM categories WHERE id = ?`;
    
    db.run(query, [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      return res.json({ message: 'Categoría eliminada correctamente' });
    });
  });
}; 