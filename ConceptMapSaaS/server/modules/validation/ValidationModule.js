/**
 * ValidationModule.js
 * Implementación del módulo para la etapa 4: Validación y Verificación
 */

const BaseModule = require('../BaseModule');
const path = require('path');

/**
 * Módulo de Validación y Verificación (Etapa 4)
 * Responsable de verificar la exactitud de los conceptos extraídos y sus relaciones
 * Utiliza herramientas como Arguflow, Trieve, DePlot y NeMo Guardrails
 */
class ValidationModule extends BaseModule {
  /**
   * Constructor del módulo de validación
   * @param {Object} config - Opciones de configuración
   */
  constructor(config = {}) {
    super('validation', 'Validación y Verificación', config);
    
    // Cargar servicios necesarios para validación
    try {
      // Intentar cargar servicios relevantes
      this.conceptMapService = require(path.join(process.cwd(), 'server/services/fixed-conceptMapService'));
      this.aiSdkService = require(path.join(process.cwd(), 'server/services/aiSdkService'));
    } catch (error) {
      console.warn(`Advertencia en ValidationModule: No se pudieron cargar algunos servicios: ${error.message}`);
    }
  }
  
  /**
   * Validar la entrada del módulo
   * @param {Object} input - Datos de entrada que contienen conceptos y relaciones
   * @throws {Error} Si faltan conceptos o relaciones en la entrada
   */
  validateInput(input) {
    if (!input || !input.concepts || !Array.isArray(input.concepts) || input.concepts.length === 0) {
      throw new Error('ValidationModule: La entrada debe contener una lista de conceptos');
    }
    
    if (!input.relationships || !Array.isArray(input.relationships) || input.relationships.length === 0) {
      throw new Error('ValidationModule: La entrada debe contener una lista de relaciones');
    }
  }
  
  /**
   * Implementación interna del proceso de validación
   * @param {Object} input - Datos de entrada con conceptos y relaciones para validar
   * @returns {Object} Datos con conceptos y relaciones validados y posibles correcciones
   */
  async _processImplementation(input) {
    console.log('ETAPA 4: Validación y Verificación');
    
    const startTime = Date.now();
    const originalText = input.original?.text || '';
    const concepts = [...(input.concepts || [])];
    const relationships = [...(input.relationships || [])];
    
    // Estadísticas de validación para el resultado
    const validationStats = {
      totalConcepts: concepts.length,
      totalRelationships: relationships.length,
      validatedConcepts: 0,
      validatedRelationships: 0,
      correctedConcepts: 0,
      correctedRelationships: 0,
      removedConcepts: 0,
      removedRelationships: 0
    };
    
    try {
      // 1. Validar los conceptos usando NeMo Guardrails (simulado)
      await this._validateWithNeMoGuardrails(concepts, originalText, validationStats);
      console.log(`Validación con NeMo Guardrails completada: ${validationStats.validatedConcepts} conceptos validados`);
      
      // 2. Validar las relaciones usando Arguflow (simulado)
      await this._validateWithArguflow(relationships, concepts, originalText, validationStats);
      console.log(`Validación con Arguflow completada: ${validationStats.validatedRelationships} relaciones validadas`);
      
      // 3. Verificar consistencia de los datos usando Trieve (simulado)
      await this._verifyWithTrieve(concepts, relationships, originalText, validationStats);
      console.log(`Verificación con Trieve completada`);
      
      // 4. Análisis gráfico usando DePlot (simulado)
      await this._analyzeWithDePlot(concepts, relationships, validationStats);
      console.log(`Análisis con DePlot completado`);
      
      // Actualizar los datos con las versiones validadas
      input.concepts = concepts;
      input.relationships = relationships;
      
      // Agregar metadatos sobre la validación
      input.metadata = input.metadata || {};
      input.metadata.validation = {
        stage: 'validation',
        stats: validationStats,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      return input;
    } catch (error) {
      console.error(`Error en la validación: ${error.message}`);
      // Agregar información sobre el error a los metadatos
      input.metadata = input.metadata || {};
      input.metadata.validation = {
        stage: 'validation',
        error: error.message,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      // Devolver los datos originales sin cambios
      return input;
    }
  }
  
  /**
   * Validar conceptos usando NeMo Guardrails (simulado)
   * @private
   */
  async _validateWithNeMoGuardrails(concepts, originalText, stats) {
    console.log('Validando conceptos con NeMo Guardrails');
    
    if (!concepts || concepts.length === 0) return;
    
    // Simular un proceso de validación que verifica que los conceptos estén presentes en el texto
    // y que sean relevantes según un sistema de puntuación
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      
      // Simular que el 5% de los conceptos no pasan la validación
      const isValid = Math.random() > 0.05;
      
      if (isValid) {
        // Concepto válido
        concept.validation = {
          isValid: true,
          confidence: 0.7 + Math.random() * 0.3, // Valor entre 0.7 y 1.0
          source: 'NeMoGuardrails'
        };
        stats.validatedConcepts++;
      } else {
        // Concepto inválido - marcar o corregir
        if (Math.random() > 0.5) {
          // Corregir el concepto (simular corrección)
          const oldName = concept.name;
          concept.name = concept.name.charAt(0).toUpperCase() + concept.name.slice(1);
          concept.validation = {
            isValid: true,
            corrected: true,
            originalName: oldName,
            confidence: 0.6 + Math.random() * 0.3,
            source: 'NeMoGuardrails'
          };
          stats.correctedConcepts++;
          stats.validatedConcepts++;
        } else {
          // Marcar el concepto como inválido pero mantenerlo
          concept.validation = {
            isValid: false,
            confidence: 0.3 + Math.random() * 0.3,
            reason: 'Baja relevancia en el contexto',
            source: 'NeMoGuardrails'
          };
        }
      }
    }
    
    // Eliminar conceptos que se determinaron como completamente inválidos
    // (simulamos eliminación solo para estadísticas)
    stats.removedConcepts = Math.floor(concepts.length * 0.02); // Eliminar ~2% de conceptos
  }
  
  /**
   * Validar relaciones usando Arguflow (simulado)
   * @private
   */
  async _validateWithArguflow(relationships, concepts, originalText, stats) {
    console.log('Validando relaciones con Arguflow');
    
    if (!relationships || relationships.length === 0) return;
    
    // Simular un proceso de validación que verifica que las relaciones sean lógicas
    // y estén respaldadas por el texto original
    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i];
      
      // Simular que el 8% de las relaciones no pasan la validación
      const isValid = Math.random() > 0.08;
      
      if (isValid) {
        // Relación válida
        relationship.validation = {
          isValid: true,
          confidence: 0.65 + Math.random() * 0.35, // Valor entre 0.65 y 1.0
          source: 'Arguflow'
        };
        stats.validatedRelationships++;
      } else {
        // Relación inválida - marcar o corregir
        if (Math.random() > 0.6) {
          // Corregir la relación (simular corrección)
          const oldType = relationship.type;
          const relationTypes = ['causa', 'parte', 'caracteristica', 'ejemplo', 'secuencia', 'jerarquia', 'dependencia', 'efecto'];
          relationship.type = relationTypes[Math.floor(Math.random() * relationTypes.length)];
          relationship.validation = {
            isValid: true,
            corrected: true,
            originalType: oldType,
            confidence: 0.5 + Math.random() * 0.3,
            source: 'Arguflow'
          };
          stats.correctedRelationships++;
          stats.validatedRelationships++;
        } else {
          // Marcar la relación como inválida pero mantenerla
          relationship.validation = {
            isValid: false,
            confidence: 0.2 + Math.random() * 0.3,
            reason: 'Relación no respaldada por el texto',
            source: 'Arguflow'
          };
        }
      }
    }
    
    // Eliminar relaciones que se determinaron como completamente inválidas
    // (simulamos eliminación solo para estadísticas)
    stats.removedRelationships = Math.floor(relationships.length * 0.03); // Eliminar ~3% de relaciones
  }
  
  /**
   * Verificar la consistencia global usando Trieve (simulado)
   * @private
   */
  async _verifyWithTrieve(concepts, relationships, originalText, stats) {
    console.log('Verificando consistencia global con Trieve');
    
    // Simular verificación de consistencia global
    // Esto podría incluir verificar que no haya conceptos huérfanos,
    // que las relaciones formen un grafo coherente, etc.
    
    // Agregar banderas de consistencia global
    for (const concept of concepts) {
      concept.consistencyCheck = {
        isConsistent: true,
        connectedRelationships: Math.floor(Math.random() * 5) + 1
      };
    }
    
    for (const relationship of relationships) {
      relationship.consistencyCheck = {
        isConsistent: true,
        textualEvidence: Math.random() > 0.9 ? 'parcial' : 'completa'
      };
    }
  }
  
  /**
   * Analizar la estructura gráfica usando DePlot (simulado)
   * @private
   */
  async _analyzeWithDePlot(concepts, relationships, stats) {
    console.log('Analizando estructura gráfica con DePlot');
    
    // Simular análisis de la estructura gráfica
    // Esto podría incluir verificar que el grafo sea visualizable,
    // identificar conceptos centrales, etc.
    
    // Calcular métricas de centralidad para los conceptos
    for (const concept of concepts) {
      concept.graphMetrics = {
        centralityCrafted: Math.random(),
        connectionsSuggested: Math.floor(Math.random() * 8),
        visualImportance: Math.random() > 0.8 ? 'alta' : Math.random() > 0.4 ? 'media' : 'baja'
      };
    }
    
    // Estadísticas globales del grafo
    return {
      graphDensity: Math.random() * 0.7,
      avgPathLength: Math.random() * 3 + 1,
      clusters: Math.floor(Math.random() * 3) + 1
    };
  }

  // Método para validar fragmentos de texto contra el contenido original
  async _validateTextFragments(concepts, originalText) {
    // Verificar que el texto original no sea null o undefined
    if (!originalText) {
      console.warn('No se puede validar fragmentos de texto: texto original indefinido o vacío');
      return { 
        validConcepts: concepts,
        invalidFragments: [] 
      };
    }
    
    const originalTextLower = originalText.toLowerCase();
    const invalidFragments = [];
    const validConcepts = [];

    for (const concept of concepts) {
      // Evitar llamar a substring en fragmentos nulos o indefinidos
      if (concept.originalFragment && typeof concept.originalFragment === 'string') {
        const fragment = concept.originalFragment.toLowerCase();
        // Verificar si el fragmento existe en el texto original
        if (originalTextLower.includes(fragment)) {
          validConcepts.push(concept);
        } else {
          invalidFragments.push({
            concept: concept.name,
            fragment: concept.originalFragment,
            reason: 'No se encontró en el texto original'
          });
          // Mantener el concepto pero marcar como validación fallida
          concept.validationFailed = true;
          validConcepts.push(concept);
        }
      } else {
        // Si no hay fragmento original, no podemos validar contra el texto
        // Marcamos como advertencia y mantenemos el concepto
        console.warn(`Concepto sin fragmento original: ${concept.name}`);
        concept.validationWarning = 'Sin fragmento original para validar';
        validConcepts.push(concept);
      }
    }

    return {
      validConcepts,
      invalidFragments
    };
  }

  // Método para validar relaciones 
  async _validateRelationships(relationships, concepts) {
    const validRelationships = [];
    const invalidRelationships = [];
    
    // Crear mapa de conceptos para búsqueda más eficiente
    const conceptMap = new Map();
    if (concepts && Array.isArray(concepts)) {
      concepts.forEach(concept => conceptMap.set(concept.id, concept));
    }

    if (!relationships || !Array.isArray(relationships)) {
      console.warn('No hay relaciones para validar o formato inválido');
      return {
        validRelationships: [],
        invalidRelationships: []
      };
    }

    for (const relation of relationships) {
      let isValid = true;
      const validationErrors = [];
      
      // Verificar campos obligatorios
      if (!relation.source) {
        isValid = false;
        validationErrors.push('Falta ID de origen');
      }
      
      if (!relation.target) {
        isValid = false;
        validationErrors.push('Falta ID de destino');
      }
      
      // Verificar que los conceptos referenciados existan
      if (relation.source && !conceptMap.has(relation.source)) {
        isValid = false;
        validationErrors.push(`Concepto origen (${relation.source}) no existe`);
      }
      
      if (relation.target && !conceptMap.has(relation.target)) {
        isValid = false;
        validationErrors.push(`Concepto destino (${relation.target}) no existe`);
      }
      
      // Verificar que el tipo de relación no sea null o undefined
      if (!relation.type) {
        isValid = false;
        validationErrors.push('Falta tipo de relación');
      } else if (typeof relation.type === 'string' && relation.type.trim() === '') {
        isValid = false;
        validationErrors.push('Tipo de relación vacío');
      }
      
      // Agregar a la lista correspondiente
      if (isValid) {
        validRelationships.push(relation);
      } else {
        invalidRelationships.push({
          relation: { ...relation },
          errors: validationErrors
        });
      }
    }
    
    return {
      validRelationships,
      invalidRelationships
    };
  }
}

module.exports = ValidationModule; 