/**
 * ConclusionModule.js
 * Implementación del módulo para la etapa 6: Conclusión Descriptiva
 */

const BaseModule = require('../BaseModule');
const path = require('path');

/**
 * Módulo de Conclusión Descriptiva (Etapa 6)
 * Responsable de verificar que todas las etapas anteriores se hayan ejecutado correctamente
 * y generar un resumen final del mapa conceptual
 */
class ConclusionModule extends BaseModule {
  /**
   * Constructor del módulo de conclusión
   * @param {Object} config - Configuración del módulo
   */
  constructor(config = {}) {
    super('conclusion', 'Conclusión Descriptiva', config);
    
    // Cargar servicios necesarios para la conclusión
    try {
      // Intentar cargar servicios relevantes
      this.conceptMapService = require(path.join(process.cwd(), 'server/services/fixed-conceptMapService'));
    } catch (error) {
      console.warn(`Advertencia en ConclusionModule: No se pudieron cargar algunos servicios: ${error.message}`);
    }
  }
  
  /**
   * Validación específica para este módulo
   * @param {Object} input - Datos de entrada
   */
  validateInput(input) {
    if (!input || !input.concepts || !Array.isArray(input.concepts) || input.concepts.length === 0) {
      throw new Error('ConclusionModule: La entrada debe contener una lista de conceptos');
    }
    
    if (!input.relationships || !Array.isArray(input.relationships) || input.relationships.length === 0) {
      throw new Error('ConclusionModule: La entrada debe contener una lista de relaciones');
    }
  }
  
  /**
   * Implementación del procesamiento para la etapa de conclusión
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async _processImplementation(input, context) {
    console.log('ETAPA 6: Conclusión Descriptiva');
    
    const startTime = Date.now();
    const concepts = [...(input.concepts || [])];
    const relationships = [...(input.relationships || [])];
    const originalText = input.original?.text || '';
    
    try {
      // 1. Verificar que todas las etapas anteriores se hayan ejecutado
      const stageVerification = this._verifyPreviousStages(input);
      console.log(`Verificación de etapas completada: ${stageVerification.completedStages}/${stageVerification.totalStages} etapas ejecutadas`);
      
      // 2. Generar estadísticas generales del mapa conceptual
      const statistics = this._generateStatistics(concepts, relationships, originalText);
      console.log(`Estadísticas generadas: ${statistics.conceptCount} conceptos, ${statistics.relationshipCount} relaciones`);
      
      // 3. Generar un resumen cualitativo del mapa conceptual
      const summary = this._generateSummary(concepts, relationships, statistics, stageVerification);
      console.log('Resumen cualitativo generado');
      
      // 4. Generar recomendaciones para mejorar el mapa conceptual
      const recommendations = this._generateRecommendations(concepts, relationships, statistics, stageVerification);
      console.log(`${recommendations.length} recomendaciones generadas`);
      
      // Agregar metadatos de conclusión
      input.metadata = input.metadata || {};
      input.metadata.conclusion = {
        stage: 'conclusion',
        stageVerification,
        statistics,
        summary,
        recommendations,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      return input;
    } catch (error) {
      console.error(`Error en la conclusión: ${error.message}`);
      // Agregar información sobre el error a los metadatos
      input.metadata = input.metadata || {};
      input.metadata.conclusion = {
        stage: 'conclusion',
        error: error.message,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      // Devolver los datos sin cambios
      return input;
    }
  }
  
  /**
   * Verifica que todas las etapas anteriores se hayan ejecutado correctamente
   * @private
   */
  _verifyPreviousStages(input) {
    // Etapas esperadas en orden
    const expectedStages = [
      'organization',  // Etapa 1
      'reasoning',     // Etapa 2
      'enrichment',    // Etapa 3
      'validation',    // Etapa 4
      'aesthetics'     // Etapa 5
    ];
    
    const metadata = input.metadata || {};
    const completedStages = [];
    const missingStages = [];
    const stagesWithErrors = [];
    
    // Verificar cada etapa
    for (const stage of expectedStages) {
      if (metadata[stage]) {
        if (metadata[stage].error) {
          stagesWithErrors.push({
            stage,
            error: metadata[stage].error
          });
        } else {
          completedStages.push(stage);
        }
      } else {
        missingStages.push(stage);
      }
    }
    
    return {
      totalStages: expectedStages.length,
      completedStages: completedStages.length,
      completedStagesList: completedStages,
      missingStages,
      stagesWithErrors,
      allStagesCompleted: completedStages.length === expectedStages.length,
      isValid: completedStages.length >= 2 // Requerimos al menos las 2 primeras etapas
    };
  }
  
  /**
   * Genera estadísticas sobre el mapa conceptual
   * @private
   */
  _generateStatistics(concepts, relationships, originalText) {
    // Estadísticas de conceptos
    const conceptCount = concepts.length;
    const conceptsByLevel = this._groupByProperty(concepts, 'hierarchyLevel');
    const conceptsByCategory = this._groupByProperty(concepts, 'category');
    const conceptsWithDescription = concepts.filter(c => c.description && c.description.length > 0).length;
    const conceptsWithExamples = concepts.filter(c => c.examples && c.examples.length > 0).length;
    
    // Validación de conceptos
    const validatedConcepts = concepts.filter(c => c.validation && c.validation.isValid === true).length;
    const invalidConcepts = concepts.filter(c => c.validation && c.validation.isValid === false).length;
    
    // Estadísticas de relaciones
    const relationshipCount = relationships.length;
    const relationshipsByType = this._groupByProperty(relationships, 'type');
    const validatedRelationships = relationships.filter(r => r.validation && r.validation.isValid === true).length;
    const invalidRelationships = relationships.filter(r => r.validation && r.validation.isValid === false).length;
    
    // Densidad de la red: Proporción de relaciones respecto al máximo posible
    // Para un grafo dirigido, el máximo es n(n-1) donde n es el número de conceptos
    const maxPossibleRelationships = conceptCount * (conceptCount - 1);
    const networkDensity = maxPossibleRelationships > 0 
      ? (relationshipCount / maxPossibleRelationships).toFixed(4) 
      : 0;
    
    // Cobertura de texto: proporción aproximada del texto original cubierto por conceptos
    const textCoverage = this._estimateTextCoverage(concepts, originalText);
    
    return {
      conceptCount,
      relationshipCount,
      conceptsByLevel,
      conceptsByCategory,
      conceptsWithDescription,
      conceptsWithExamples,
      validatedConcepts,
      invalidConcepts,
      relationshipsByType,
      validatedRelationships,
      invalidRelationships,
      networkDensity: parseFloat(networkDensity),
      textCoverage
    };
  }
  
  /**
   * Genera un resumen cualitativo del mapa conceptual
   * @private
   */
  _generateSummary(concepts, relationships, statistics, stageVerification) {
    // Determinar palabras clave para la estructura
    let structureType = 'jerárquica';
    if (statistics.networkDensity > 0.5) {
      structureType = 'altamente conectada';
    } else if (statistics.networkDensity > 0.2) {
      structureType = 'moderadamente conectada';
    }
    
    // Determinar calidad general
    const qualityIndicators = [
      statistics.validatedConcepts / (statistics.conceptCount || 1),
      statistics.validatedRelationships / (statistics.relationshipCount || 1),
      statistics.conceptsWithDescription / (statistics.conceptCount || 1),
      statistics.textCoverage,
      stageVerification.completedStages / (stageVerification.totalStages || 1)
    ];
    
    const qualityScore = qualityIndicators.reduce((sum, val) => sum + val, 0) / qualityIndicators.length;
    
    let qualityDescription = 'regular';
    if (qualityScore > 0.8) {
      qualityDescription = 'excelente';
    } else if (qualityScore > 0.6) {
      qualityDescription = 'buena';
    } else if (qualityScore < 0.4) {
      qualityDescription = 'requiere mejoras';
    }
    
    // Determinar conceptos principales
    const mainConcepts = concepts
      .filter(c => c.importance > 0.7 || c.hierarchyLevel === 0)
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 5)
      .map(c => c.name);
    
    // Etapas completadas
    const completedStagesText = stageVerification.completedStages === stageVerification.totalStages
      ? 'Todas las etapas del proceso de generación se han completado exitosamente.'
      : `Se han completado ${stageVerification.completedStages} de ${stageVerification.totalStages} etapas del proceso.`;
    
    // Texto sobre etapas faltantes
    const missingStagesText = stageVerification.missingStages.length > 0
      ? `Las siguientes etapas no se ejecutaron: ${stageVerification.missingStages.join(', ')}.`
      : '';
    
    // Construir resumen
    const summary = {
      title: 'Análisis del Mapa Conceptual',
      overallQuality: qualityDescription,
      structureType,
      mainConcepts,
      completionStatus: {
        text: completedStagesText,
        missingStagesTooltip: stageVerification.missingStages.length > 0 ? missingStagesText : undefined
      },
      keyFindings: [
        `El mapa contiene ${statistics.conceptCount} conceptos organizados en una estructura ${structureType}.`,
        `Se identificaron ${statistics.relationshipCount} relaciones entre los conceptos.`,
        `Los conceptos principales incluyen: ${mainConcepts.slice(0, 3).join(', ')}${mainConcepts.length > 3 ? '...' : '.'}`,
        `La calidad general del mapa es ${qualityDescription}.`,
        completedStagesText
      ]
    };
    
    // Agregar hallazgos adicionales si hay problemas
    if (statistics.invalidConcepts > 0 || statistics.invalidRelationships > 0) {
      summary.keyFindings.push(`Se detectaron ${statistics.invalidConcepts} conceptos y ${statistics.invalidRelationships} relaciones que requieren revisión.`);
    }
    
    if (stageVerification.stagesWithErrors.length > 0) {
      summary.keyFindings.push(`Se encontraron errores en ${stageVerification.stagesWithErrors.length} etapas del proceso.`);
      summary.errorDetails = stageVerification.stagesWithErrors;
    }
    
    return summary;
  }
  
  /**
   * Genera recomendaciones para mejorar el mapa conceptual
   * @private
   */
  _generateRecommendations(concepts, relationships, statistics, stageVerification) {
    const recommendations = [];
    
    // 1. Recomendaciones basadas en conceptos
    if (statistics.conceptsWithDescription < statistics.conceptCount * 0.7) {
      const conceptsWithoutDescription = concepts
        .filter(c => !c.description || c.description.length === 0)
        .slice(0, 3)
        .map(c => c.name);
      
      recommendations.push({
        type: 'concepts',
        priority: 'alta',
        description: 'Agregar descripciones a los conceptos que no las tienen',
        details: `${statistics.conceptCount - statistics.conceptsWithDescription} conceptos requieren descripción (ej: ${conceptsWithoutDescription.join(', ')})`
      });
    }
    
    if (statistics.invalidConcepts > 0) {
      const invalidConceptsExamples = concepts
        .filter(c => c.validation && c.validation.isValid === false)
        .slice(0, 3)
        .map(c => c.name);
      
      recommendations.push({
        type: 'concepts',
        priority: 'alta',
        description: 'Revisar conceptos marcados como inválidos',
        details: `${statistics.invalidConcepts} conceptos requieren revisión (ej: ${invalidConceptsExamples.join(', ')})`
      });
    }
    
    // 2. Recomendaciones basadas en relaciones
    if (statistics.invalidRelationships > 0) {
      recommendations.push({
        type: 'relationships',
        priority: 'alta',
        description: 'Revisar relaciones marcadas como inválidas',
        details: `${statistics.invalidRelationships} relaciones requieren revisión`
      });
    }
    
    if (statistics.networkDensity < 0.1) {
      recommendations.push({
        type: 'relationships',
        priority: 'media',
        description: 'Aumentar la interconexión entre conceptos',
        details: 'El mapa conceptual tiene una baja densidad de conexiones'
      });
    }
    
    // 3. Recomendaciones basadas en etapas faltantes
    for (const missingStage of stageVerification.missingStages) {
      let description = '';
      let priority = 'media';
      
      switch (missingStage) {
        case 'organization':
          description = 'Ejecutar la etapa de organización y jerarquía';
          priority = 'crítica';
          break;
        case 'reasoning':
          description = 'Ejecutar la etapa de razonamiento y comprensión';
          priority = 'crítica';
          break;
        case 'enrichment':
          description = 'Ejecutar la etapa de enriquecimiento semántico';
          priority = 'alta';
          break;
        case 'validation':
          description = 'Ejecutar la etapa de validación y verificación';
          priority = 'alta';
          break;
        case 'aesthetics':
          description = 'Ejecutar la etapa de estética adaptativa';
          priority = 'media';
          break;
      }
      
      if (description) {
        recommendations.push({
          type: 'stages',
          priority,
          description,
          details: `La etapa "${missingStage}" no fue ejecutada`
        });
      }
    }
    
    // 4. Recomendaciones basadas en errores
    for (const stageError of stageVerification.stagesWithErrors) {
      recommendations.push({
        type: 'error',
        priority: 'crítica',
        description: `Corregir error en la etapa "${stageError.stage}"`,
        details: stageError.error
      });
    }
    
    // 5. Recomendaciones basadas en la estructura
    const concepts0Level = this._countByProperty(concepts, 'hierarchyLevel', 0);
    
    if (concepts0Level > 3) {
      recommendations.push({
        type: 'structure',
        priority: 'media',
        description: 'Reducir el número de conceptos de nivel raíz',
        details: `Hay ${concepts0Level} conceptos de nivel raíz, lo ideal es tener 1-3`
      });
    }
    
    // 6. Recomendaciones basadas en cobertura del texto
    if (statistics.textCoverage < 0.5) {
      recommendations.push({
        type: 'content',
        priority: 'media',
        description: 'Aumentar la cobertura del texto original',
        details: `El mapa conceptual solo cubre aproximadamente un ${Math.round(statistics.textCoverage * 100)}% del texto original`
      });
    }
    
    // Ordenar por prioridad
    const priorityMap = {
      'crítica': 0,
      'alta': 1,
      'media': 2,
      'baja': 3
    };
    
    recommendations.sort((a, b) => {
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
    
    return recommendations;
  }
  
  /**
   * Agrupa elementos por una propiedad y cuenta cuántos hay en cada grupo
   * @private
   */
  _groupByProperty(items, property) {
    const groups = {};
    
    for (const item of items) {
      const value = item[property];
      
      if (value !== undefined && value !== null) {
        // Convertir a string para usarlo como clave
        const key = String(value);
        
        if (!groups[key]) {
          groups[key] = 0;
        }
        
        groups[key]++;
      }
    }
    
    return groups;
  }
  
  /**
   * Cuenta elementos con un valor específico para una propiedad
   * @private
   */
  _countByProperty(items, property, value) {
    return items.filter(item => item[property] === value).length;
  }
  
  /**
   * Estima qué porcentaje del texto original está cubierto por los conceptos
   * @private
   */
  _estimateTextCoverage(concepts, originalText) {
    if (!originalText || originalText.length === 0) {
      return 0;
    }
    
    // Simplificado: verificamos cuántos conceptos aparecen en el texto
    let coveredConcepts = 0;
    const totalConcepts = concepts.length;
    
    for (const concept of concepts) {
      const conceptName = concept.name.toLowerCase();
      if (originalText.toLowerCase().includes(conceptName)) {
        coveredConcepts++;
      }
    }
    
    // Calcular cobertura basada en la proporción de conceptos que aparecen en el texto
    // Esto es una aproximación simple
    return totalConcepts > 0 ? coveredConcepts / totalConcepts : 0;
  }
}

module.exports = ConclusionModule; 