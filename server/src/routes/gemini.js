import express from 'express';
import { 
  testGeminiAPI,
  processTransactionWithGemini 
} from '../controllers/geminiController.js';

const router = express.Router();

router.post('/test', testGeminiAPI);

router.post('/process', processTransactionWithGemini);

export default router; 