import express from 'express';
import { query } from '../database/mysql-setup.js';

const router = express.Router();

router.post('/reset-database', async (req, res) => {
  console.log('Solicitud para reiniciar la base de datos recibida');
  
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Eliminar todas las transacciones
    await query('DELETE FROM transactions');
    console.log('Transacciones eliminadas correctamente');
    
    // Eliminar todas las categorías
    await query('DELETE FROM categories');
    console.log('Categorías eliminadas correctamente');
    
    // Reiniciar los contadores AUTO_INCREMENT
    await query('ALTER TABLE transactions AUTO_INCREMENT = 1');
    await query('ALTER TABLE categories AUTO_INCREMENT = 1');
    
    // Reactivar las restricciones de clave foránea
    await query('SET FOREIGN_KEY_CHECKS = 1');
    
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
    
    // Insertar las categorías predeterminadas
    for (const category of defaultCategories) {
      await query(
        'INSERT INTO categories (name, type) VALUES (?, ?)',
        [category.name, category.type]
      );
    }
    
    console.log('Base de datos reiniciada correctamente');
    return res.json({ message: 'Base de datos reiniciada correctamente' });
    
  } catch (error) {
    console.error('Error al reiniciar la base de datos:', error.message);
    return res.status(500).json({ error: 'Error al reiniciar la base de datos' });
  }
});

export default router; 
