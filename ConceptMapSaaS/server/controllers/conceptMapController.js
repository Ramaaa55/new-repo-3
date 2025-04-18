/**
 * Controlador para la API de Mapas Conceptuales
 */

const conceptMapService = require('../services/fixed-conceptMapService');
const config = require('../config');
const { fixXmlNameTags } = require('../services/fix_tags_corrected');

/**
 * Genera un mapa conceptual a partir de texto siguiendo el pipeline
 * cognitivo-visual de 6 etapas
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
async function generateMap(req, res) {
  try {
    const { text, options = {} } = req.body;
    
    // Validación robusta de entrada
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'El texto es requerido' 
      });
    }
    
    // Asegurar que text es string y tiene contenido válido
    const processText = typeof text === 'string' ? text : String(text);
    if (processText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El texto no puede estar vacío'
      });
    }
    
    console.log(`Procesando texto de ${processText.length} caracteres con las 6 etapas del pipeline cognitivo-visual`);
    
    // Configuración completa con las 6 etapas del pipeline
    const processConfig = {
      maxConcepts: options.maxConcepts || 25,
      style: options.style || 'educational',
      stages: {
        // 1. Organización y Jerarquía
        organization: {
          enabled: options.stages?.organization !== false,
          tools: {
            haystack: options.tools?.haystack !== false,
            spacy: options.tools?.spacy !== false,
            langGraph: options.tools?.langGraph !== false,
            penrose: options.tools?.penrose !== false
          }
        },
        // 2. Razonamiento y Comprensión
        reasoning: {
          enabled: options.stages?.reasoning !== false,
          tools: {
            deepSeekApi: options.tools?.deepSeekApi !== false,
            openAGI: options.tools?.openAGI !== false,
            graphRAG: options.tools?.graphRAG !== false
          }
        },
        // 3. Enriquecimiento Semántico
        enrichment: {
          enabled: options.stages?.enrichment !== false,
          tools: {
            semanticKernel: options.tools?.semanticKernel !== false,
            semanticScholar: options.tools?.semanticScholar !== false,
            wikidataToolkit: options.tools?.wikidataToolkit !== false,
            conceptNet: options.tools?.conceptNet !== false
          }
        },
        // 4. Validación y Verificación
        validation: {
          enabled: options.stages?.validation !== false,
          tools: {
            arguflow: options.tools?.arguflow !== false,
            trieve: options.tools?.trieve !== false,
            dePlot: options.tools?.dePlot !== false,
            nemoGuardrails: options.tools?.nemoGuardrails !== false
          }
        },
        // 5. Estética Adaptativa
        aesthetics: {
          enabled: options.stages?.aesthetics !== false,
          tools: {
            markmap: options.tools?.markmap !== false,
            shikiTwoslash: options.tools?.shikiTwoslash !== false,
            openProps: options.tools?.openProps !== false,
            lottie: options.tools?.lottie !== false,
            tippy: options.tools?.tippy !== false
          }
        },
        // 6. Conclusión Descriptiva
        conclusion: {
          enabled: options.stages?.conclusion !== false
        }
      },
      includeExamples: options.includeExamples !== false,
      includeDefinitions: options.includeDefinitions !== false,
      outputFormat: options.outputFormat || 'all',
      language: options.language || detectLanguage(processText) // Autodetectar idioma
    };
    
    // Procesar el texto usando el servicio mejorado de mapas conceptuales
    console.log("Llamando al servicio con la configuración:", JSON.stringify(processConfig, null, 2));
    try {
      // Procesar el texto con manejo adecuado de errores
      const result = await conceptMapService.processText(processText, processConfig);
      
      // Validar que el resultado contenga las propiedades esperadas
      if (!result) {
        throw new Error('El servicio no devolvió un resultado válido');
      }
      
      // Asegurar que concepts y relationships son arrays
      result.concepts = Array.isArray(result.concepts) ? result.concepts : [];
      result.relationships = Array.isArray(result.relationships) ? result.relationships : [];
      
      console.log("Procesamiento exitoso. Conceptos:", result.concepts.length, "Relaciones:", result.relationships.length);
    
      // Asegurar que existe el objeto metadata
      result.metadata = result.metadata || {};
      
      // Generar formatos de salida según lo solicitado
      console.log("Generando formatos de salida...");
      const outputFormats = conceptMapService.generateOutputFormats(result, processConfig.outputFormat);
      console.log("Formatos generados correctamente");
      
      // Asegurar que el XML está correctamente formateado
      const xmlOutput = outputFormats.xml ? fixXmlNameTags(outputFormats.xml) : '';
      
      // Responder con el resultado completo incluyendo los formatos estructurados
      res.json({
        success: true,
        result: {
          // Datos estructurados del mapa conceptual
          concepts: result.concepts,
          relationships: result.relationships,
          
          // Formatos de salida solicitados en el requerimiento
          structuredRepresentation: {
            json: outputFormats.json || JSON.stringify({ concepts: [], relationships: [] }),
            xml: xmlOutput
          },
          mermaid: outputFormats.mermaid || '',
          reasoningLog: outputFormats.summary || '',
          
          // Metadatos del procesamiento
          metadata: {
            processedAt: result.metadata.processedAt || new Date().toISOString(),
            pipelineVersion: result.metadata.pipelineVersion || '2.0.0',
            stageResults: result.metadata.stageResults || {},
            coherenceScore: result.metadata.coherenceScore || 0,
            conceptCount: result.concepts.length,
            relationshipCount: result.relationships.length,
            language: processConfig.language
          }
        },
        message: 'Mapa conceptual generado exitosamente siguiendo las 6 etapas del pipeline cognitivo-visual'
      });
    } catch (processingError) {
      console.error('Error en el procesamiento:', processingError);
      // Proporcionar una respuesta con más detalles sobre el error para facilitar la depuración
      return res.status(500).json({
        success: false,
        error: 'Error en el procesamiento del mapa conceptual',
        details: processingError.message,
        stackTrace: process.env.NODE_ENV === 'development' ? processingError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Error en el controlador de mapas conceptuales:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el texto', 
      details: error.message,
      stackTrace: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Detecta el idioma del texto
 * @param {string} text - Texto a analizar
 * @returns {string} - Código de idioma detectado ('es', 'en', etc.)
 */
function detectLanguage(text) {
  try {
    // Validar entrada
    if (!text || typeof text !== 'string') {
      return 'es'; // Valor por defecto
    }
    
    // Simple detección basada en palabras comunes
    const spanishCommonWords = ['de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'una', 'su', 'al'];
    const englishCommonWords = ['the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with'];
    
    const words = text.toLowerCase().split(/\s+/);
    let spanishCount = 0;
    let englishCount = 0;
    
    words.forEach(word => {
      if (spanishCommonWords.includes(word)) spanishCount++;
      if (englishCommonWords.includes(word)) englishCount++;
    });
    
    return spanishCount >= englishCount ? 'es' : 'en';
  } catch (error) {
    console.error('Error al detectar idioma:', error);
    return 'es'; // Valor por defecto en caso de error
  }
}

/**
 * Obtiene la configuración disponible para el pipeline de 6 etapas
 * @param {Object} req - Solicitud HTTP
 * @param {Object} res - Respuesta HTTP
 */
function getConfiguration(req, res) {
  try {
    // Simular plan del usuario
    const userPlan = req.query.plan || 'professional';
    
    // Asegurar que la configuración existe
    if (!config || !config.conceptMap || !config.conceptMap.limits || !config.conceptMap.limits[userPlan]) {
      return res.status(500).json({
        success: false,
        error: 'Configuración no disponible'
      });
    }
    
    res.json({
      success: true,
      config: {
        visualStyles: config.conceptMap.visualStyles || ['educational', 'modern', 'minimal'],
        enabledStages: config.conceptMap.limits[userPlan].enabledStages || ['organization', 'reasoning', 'enrichment', 'validation', 'aesthetics', 'conclusion'],
        maxTextLength: config.conceptMap.limits[userPlan].maxTextLength || 5000,
        supportedTools: {
          organization: ['haystack', 'spacy', 'langGraph', 'penrose'],
          reasoning: ['deepSeekApi', 'openAGI', 'graphRAG'],
          enrichment: ['semanticKernel', 'semanticScholar', 'wikidataToolkit', 'conceptNet'],
          validation: ['arguflow', 'trieve', 'dePlot', 'nemoGuardrails'],
          aesthetics: ['markmap', 'shikiTwoslash', 'openProps', 'lottie', 'tippy']
        },
        outputFormats: ['json', 'xml', 'mermaid', 'all'],
        supportedLanguages: ['es', 'en']
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
