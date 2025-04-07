import { db } from '../database/setup.js';

/**
 * Prueba la conexión con la API de Gemini usando la API key proporcionada
 */
export const testGeminiAPI = async (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ 
      success: false,
      message: 'Se requiere una API key para probar Gemini' 
    });
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    
    const ai = new GoogleGenAI({ apiKey });
    
    console.log('Enviando prompt de prueba a Gemini...');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Genera una frase corta sobre finanzas personales en español.",
      });
      
      const text = response.text;
      console.log('Prueba Gemini exitosa:', text);
      
      return res.status(200).json({
        success: true,
        message: 'Conexión con Gemini establecida correctamente',
        generatedText: text
      });
    } catch (apiError) {
      console.error('Error específico de la API de Gemini:', apiError);
      
      let errorMessage = 'Error al conectar con Gemini';
      
      if (apiError.message && apiError.message.includes('API key')) {
        errorMessage = 'API key de Gemini inválida';
      } else if (apiError.message && apiError.message.includes('quota')) {
        errorMessage = 'Se ha excedido la cuota de la API de Gemini';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        details: apiError.message
      });
    }
  } catch (error) {
    console.error('Error general en prueba Gemini:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al inicializar Gemini',
      details: error.message
    });
  }
};

export const processTransactionWithGemini = async (req, res) => {
  const { text, apiKey } = req.body;
  
  if (!text) {
    return res.status(400).json({ 
      success: false, 
      message: 'El texto de la transacción es requerido' 
    });
  }
  
  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'Se requiere una API key de Gemini para procesar el texto' 
    });
  }
  
  try {
    const getCategories = () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories ORDER BY type, name', (err, categories) => {
          if (err) reject(err);
          else resolve(categories);
        });
      });
    };
    
    const categories = await getCategories();
    
    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay categorías disponibles para clasificar la transacción'
      });
    }
    
    const expenseCategories = categories
      .filter(cat => cat.type === 'expense')
      .map(cat => `${cat.id}: ${cat.name}`);
      
    const incomeCategories = categories
      .filter(cat => cat.type === 'income')
      .map(cat => `${cat.id}: ${cat.name}`);
    
    const { GoogleGenAI } = await import('@google/genai');
    
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Analiza el siguiente texto en español que describe una transacción financiera: "${text}"
      
      Genera un objeto JSON con este esquema exacto:
      {
        "tipo": "income" o "expense" (si es un ingreso o un gasto),
        "monto": número (valor numérico de la transacción),
        "descripcion": string (descripción breve),
        "categoria_id": número (ID de la categoría más adecuada)
      }
      
      Categorías de gastos disponibles:
      ${expenseCategories.join('\n')}
      
      Categorías de ingresos disponibles:
      ${incomeCategories.join('\n')}
      
      Si no puedes determinar algún campo con certeza, haz tu mejor estimación.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const analysisText = response.text.trim();
    console.log('Análisis de Gemini:', analysisText);
    
    try {
      const jsonStartIndex = analysisText.indexOf('{');
      const jsonEndIndex = analysisText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error('No se pudo encontrar un objeto JSON en la respuesta');
      }
      
      const jsonStr = analysisText.substring(jsonStartIndex, jsonEndIndex);
      const analysisData = JSON.parse(jsonStr);
      
      if (!analysisData.tipo || !analysisData.monto || !analysisData.categoria_id) {
        throw new Error('La respuesta no contiene todos los campos requeridos');
      }
      
      const categoryExists = categories.some(
        cat => cat.id === parseInt(analysisData.categoria_id) && cat.type === analysisData.tipo
      );
      
      if (!categoryExists) {
        throw new Error(`La categoría con ID ${analysisData.categoria_id} no existe o no coincide con el tipo`);
      }
      
      return res.json({
        success: true,
        analysis: {
          type: analysisData.tipo,
          amount: parseFloat(analysisData.monto),
          description: analysisData.descripcion || text,
          category_id: parseInt(analysisData.categoria_id)
        }
      });
      
    } catch (parseError) {
      console.error('Error al parsear la respuesta de Gemini:', parseError);
      return res.status(500).json({
        success: false,
        message: 'No se pudo procesar la respuesta de Gemini',
        details: parseError.message,
        rawResponse: analysisText
      });
    }
    
  } catch (error) {
    console.error('Error al procesar la transacción con Gemini:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la transacción con Gemini',
      details: error.message
    });
  }
}; 