/**
 * index.js
 * Punto de entrada para el sistema modular de generación de mapas conceptuales
 */

const PipelineManager = require('./PipelineManager');
const OrganizationModule = require('./organization/OrganizationModule');
const ReasoningModule = require('./reasoning/ReasoningModule');
const EnrichmentModule = require('./enrichment/EnrichmentModule');
const ValidationModule = require('./validation/ValidationModule');
const AestheticsModule = require('./aesthetics/AestheticsModule');
const ConclusionModule = require('./conclusion/ConclusionModule');

/**
 * Crea un pipeline de procesamiento completo con todos los módulos
 * @param {Object} config - Configuración global del pipeline
 * @returns {PipelineManager} - Instancia del pipeline configurado
 */
function createPipeline(config = {}) {
  // Instanciar el pipeline manager
  const pipeline = new PipelineManager(config);
  
  // Configuración por módulo
  const moduleConfigs = config.modules || {};
  
  // Registrar todos los módulos en orden
  pipeline
    .registerModule('organization', new OrganizationModule(moduleConfigs.organization || {}))
    .registerModule('reasoning', new ReasoningModule(moduleConfigs.reasoning || {}))
    .registerModule('enrichment', new EnrichmentModule(moduleConfigs.enrichment || {}))
    .registerModule('validation', new ValidationModule(moduleConfigs.validation || {}))
    .registerModule('aesthetics', new AestheticsModule(moduleConfigs.aesthetics || {}))
    .registerModule('conclusion', new ConclusionModule(moduleConfigs.conclusion || {}));
    
  // Establecer el orden de ejecución por defecto
  pipeline.setExecutionOrder([
    'organization',
    'reasoning', 
    'enrichment', 
    'validation', 
    'aesthetics', 
    'conclusion'
  ]);
  
  return pipeline;
}

/**
 * Crea un pipeline personalizado con solo algunos módulos
 * @param {Array<string>} stages - Etapas a incluir en el pipeline
 * @param {Object} config - Configuración global
 * @returns {PipelineManager} - Instancia del pipeline personalizado
 */
function createCustomPipeline(stages = [], config = {}) {
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error('Se requiere un array de etapas para crear un pipeline personalizado');
  }
  
  // Mapeo de nombres de etapas a clases de módulos
  const moduleClasses = {
    'organization': OrganizationModule,
    'reasoning': ReasoningModule,
    'enrichment': EnrichmentModule,
    'validation': ValidationModule,
    'aesthetics': AestheticsModule,
    'conclusion': ConclusionModule
  };
  
  // Instanciar el pipeline manager
  const pipeline = new PipelineManager(config);
  const moduleConfigs = config.modules || {};
  
  // Registrar sólo los módulos solicitados
  for (const stage of stages) {
    if (!moduleClasses[stage]) {
      throw new Error(`Etapa desconocida: ${stage}`);
    }
    
    pipeline.registerModule(
      stage, 
      new moduleClasses[stage](moduleConfigs[stage] || {})
    );
  }
  
  // Establecer el orden de ejecución según el array proporcionado
  pipeline.setExecutionOrder(stages);
  
  return pipeline;
}

/**
 * Configura un pipeline para procesamiento rápido (con menos procesamiento)
 * @param {Object} config - Configuración global
 * @returns {PipelineManager} - Instancia del pipeline simplificado
 */
function createFastPipeline(config = {}) {
  // Similar al pipeline completo pero con menos etapas
  const fastConfig = {
    ...config,
    modules: {
      ...(config.modules || {}),
      // Usar configuraciones más ligeras
      organization: {
        ...(config.modules?.organization || {}),
        tools: { haystack: false, penrose: false }
      },
      reasoning: {
        ...(config.modules?.reasoning || {}),
        tools: { openAGI: false, graphRAG: false }
      }
    }
  };
  
  // Crear pipeline con etapas mínimas
  return createCustomPipeline(
    ['organization', 'reasoning', 'conclusion'],
    fastConfig
  );
}

/**
 * Configura un pipeline enfocado en el enriquecimiento de conceptos
 * @param {Object} config - Configuración global
 * @returns {PipelineManager} - Instancia del pipeline de enriquecimiento
 */
function createEnrichmentPipeline(config = {}) {
  // Similar al pipeline completo pero enfocado en enriquecimiento
  const enrichmentConfig = {
    ...config,
    modules: {
      ...(config.modules || {}),
      enrichment: {
        ...(config.modules?.enrichment || {}),
        // Activar todas las herramientas de enriquecimiento
        tools: { 
          semanticKernel: true, 
          semanticScholar: true, 
          wikidataToolkit: true, 
          conceptNet: true 
        }
      }
    }
  };
  
  // Crear pipeline con etapas para enriquecimiento
  return createCustomPipeline(
    ['organization', 'reasoning', 'enrichment', 'conclusion'],
    enrichmentConfig
  );
}

/**
 * Configura un pipeline enfocado en validación y verificación
 * @param {Object} config - Configuración global
 * @returns {PipelineManager} - Instancia del pipeline de validación
 */
function createValidationPipeline(config = {}) {
  // Similar al pipeline completo pero enfocado en validación
  const validationConfig = {
    ...config,
    modules: {
      ...(config.modules || {}),
      validation: {
        ...(config.modules?.validation || {}),
        // Activar todas las herramientas de validación
        tools: { 
          arguflow: true, 
          trieve: true, 
          dePlot: true, 
          nemoGuardrails: true 
        }
      }
    }
  };
  
  // Crear pipeline con etapas para validación
  return createCustomPipeline(
    ['organization', 'reasoning', 'validation', 'conclusion'],
    validationConfig
  );
}

/**
 * Configura un pipeline enfocado en estética visual
 * @param {Object} config - Configuración global
 * @returns {PipelineManager} - Instancia del pipeline de estética
 */
function createAestheticsPipeline(config = {}) {
  // Similar al pipeline completo pero enfocado en estética
  const aestheticsConfig = {
    ...config,
    modules: {
      ...(config.modules || {}),
      aesthetics: {
        ...(config.modules?.aesthetics || {}),
        // Activar todas las herramientas estéticas
        tools: { 
          markmap: true, 
          shikiTwoslash: true, 
          openProps: true, 
          lottie: true, 
          tippyJs: true 
        }
      }
    }
  };
  
  // Crear pipeline con etapas para estética
  return createCustomPipeline(
    ['organization', 'reasoning', 'aesthetics', 'conclusion'],
    aestheticsConfig
  );
}

/**
 * Procesa texto a través del pipeline completo
 * @param {string} text - Texto para procesar
 * @param {Object} options - Opciones de procesamiento
 * @param {Object} config - Configuración del pipeline
 * @returns {Promise<Object>} - Resultado del procesamiento
 */
async function processText(text, options = {}, config = {}) {
  const pipeline = createPipeline(config);
  return pipeline.processText(text, options);
}

module.exports = {
  createPipeline,
  createCustomPipeline,
  createFastPipeline,
  createEnrichmentPipeline,
  createValidationPipeline,
  createAestheticsPipeline,
  processText,
  // Exportar clases de módulos individuales para uso directo
  PipelineManager,
  OrganizationModule,
  ReasoningModule,
  EnrichmentModule,
  ValidationModule,
  AestheticsModule,
  ConclusionModule
}; 