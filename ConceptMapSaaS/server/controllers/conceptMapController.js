/**
 * Controlador para la API de Mapas Conceptuales
 */

const conceptMapService = require('../services/conceptMapService');
const config = require('../config');

/**
 * Genera un mapa conceptual a partir de texto
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
async function generateMap(req, res) {
  try {
    const { text, options = {} } = req.body;
    
    // Validar entrada
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'El texto es requerido' 
      });
    }
    
    console.log(`Procesando texto de ${text.length} caracteres con opciones:`, options);
    
    // Configurar opciones para el procesamiento
    const processConfig = {
      maxConcepts: options.maxConcepts || 20,
      style: options.style || 'educational',
      stages: {
        organization: options.stages?.organization !== false,
        reasoning: options.stages?.reasoning !== false,
        enrichment: options.stages?.enrichment !== false,
        validation: options.stages?.validation !== false,
        aesthetics: options.stages?.aesthetics !== false,
        conclusion: options.stages?.conclusion !== false
      },
      includeExamples: options.includeExamples !== false,
      includeDefinitions: options.includeDefinitions !== false
    };
    
    // Procesar el texto usando el servicio de mapas conceptuales
    const result = await conceptMapService.processText(text, processConfig);
    
    // Responder con el resultado
    res.json({
      success: true,
      result: {
        concepts: result.concepts,
        relationships: result.relationships,
        content: result.content,
        metadata: result.metadata,
        knowledgeGraph: result.knowledgeGraph
      },
      message: 'Mapa conceptual generado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en el controlador de mapas conceptuales:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el texto', 
      details: error.message 
    });
  }
}

/**
 * Obtiene la configuración disponible para mapas conceptuales
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
function getConfiguration(req, res) {
  try {
    // Simular plan del usuario
    const userPlan = 'professional'; // En una implementación real, esto vendría del usuario autenticado
    
    res.json({
      success: true,
      config: {
        visualStyles: config.conceptMap.visualStyles,
        enabledStages: config.conceptMap.limits[userPlan].enabledStages,
        maxTextLength: config.conceptMap.limits[userPlan].maxTextLength
      }
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener configuración', 
      details: error.message 
    });
  }
}

module.exports = {
  generateMap,
  getConfiguration
};
