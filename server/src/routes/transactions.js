import express from 'express';
import { 
  getAllTransactions, 
  createTransaction, 
  processTransactionText,
  getTransactionsSummary
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/', createTransaction);
router.post('/process', processTransactionText);
router.get('/summary', getTransactionsSummary);

export default router; 