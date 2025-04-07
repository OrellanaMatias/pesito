import express from 'express';
import { db } from '../database/setup.js';

const router = express.Router();

router.post('/reset-database', (req, res) => {
  console.log('Solicitud para reiniciar la base de datos recibida');
  
  db.run('DELETE FROM transactions', (err) => {
    if (err) {
      console.error('Error al eliminar transacciones:', err.message);
      return res.status(500).json({ error: 'Error al eliminar transacciones' });
    }
    
    console.log('Transacciones eliminadas correctamente');
    
    db.run('DELETE FROM categories', (err) => {
      if (err) {
        console.error('Error al eliminar categorías:', err.message);
        return res.status(500).json({ error: 'Error al eliminar categorías' });
      }
      
      console.log('Categorías eliminadas correctamente');
      
      const defaultCategories = [
        { name: 'Alimentación', type: 'expense' },
        { name: 'Transporte', type: 'expense' },
        { name: 'Entretenimiento', type: 'expense' },
        { name: 'Servicios', type: 'expense' },
        { name: 'Salud', type: 'expense' },
        { name: 'Educación', type: 'expense' },
        { name: 'Ropa', type: 'expense' },
        { name: 'Hogar', type: 'expense' },
        { name: 'Otros gastos', type: 'expense' },
        
        { name: 'Salario', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Regalos', type: 'income' },
        { name: 'Inversiones', type: 'income' },
        { name: 'Otros ingresos', type: 'income' }
      ];
      
      const insertCategory = (category, index) => {
        if (index >= defaultCategories.length) {
          console.log('Base de datos reiniciada correctamente');
          return res.json({ message: 'Base de datos reiniciada correctamente' });
        }
        
        const { name, type } = defaultCategories[index];
        
        db.run(
          'INSERT INTO categories (name, type) VALUES (?, ?)',
          [name, type],
          (err) => {
            if (err) {
              console.error(`Error al insertar categoría ${name}:`, err.message);
              return res.status(500).json({ error: `Error al insertar categoría ${name}` });
            }
            
            insertCategory(defaultCategories, index + 1);
          }
        );
      };
      
      insertCategory(defaultCategories, 0);
    });
  });
});

export default router; 