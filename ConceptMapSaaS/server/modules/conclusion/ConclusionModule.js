/**
 * ConclusionModule.js
 * Implementación del módulo para la etapa 6: Conclusión Descriptiva
 */

const BaseModule = require('../BaseModule');
const { performance } = require('perf_hooks');

/**
 * Módulo de Conclusión Descriptiva (Etapa 6)
 * Responsable de verificar que todas las etapas anteriores se hayan ejecutado correctamente
 * y generar un resumen final del mapa conceptual
 */
class ConclusionModule extends BaseModule {
  /**
   * Constructor del módulo de conclusión
   * @param {Object} options - Opciones de configuración
   */
  constructor(options = {}) {
    super('conclusion', options);
    
    // Cargar servicios necesarios
    try {
      this.conceptMapService = require('../../services/fixed-conceptMapService');
      this.aiSdkService = require('../../services/aiSdkService');
    } catch (error) {
      console.error(`Error al cargar servicios para ConclusionModule: ${error.message}`);
    }
    
    // Opciones específicas de generación de conclusiones
    this.conclusionOptions = {
      maxSummaryLength: options.maxSummaryLength || 500,
      includeProcessingSummary: options.includeProcessingSummary !== false,
      includeVerification: options.includeVerification !== false,
      includeCompatibility: options.includeCompatibility !== false,
      generateRecommendations: options.generateRecommendations !== false
    };
  }
  
  /**
   * Validación específica para este módulo
   * @param {Object} input - Datos de entrada
   */
  validateInput(input) {
    super.validateInput(input);
    
    if (!input.concepts || !Array.isArray(input.concepts)) {
      throw new Error('Se requieren conceptos para generar la conclusión');
    }
    
    if (!input.relationships || !Array.isArray(input.relationships)) {
      throw new Error('Se requieren relaciones para generar la conclusión');
    }
  }
  
  /**
   * Implementación del procesamiento para conclusión
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado con conclusión agregada
   */
  async _processImplementation(input, context) {
    console.log('ETAPA 6: Conclusión Descriptiva - Iniciando');
    const startTime = performance.now();
    
    // Extraer información relevante
    const text = input.text || (input.original && input.original.text);
    const concepts = input.concepts;
    const relationships = input.relationships;
    const language = (input.original && input.original.language) || input.language || 'es';
    
    // Recopilar estadísticas de las etapas
    const stageStats = input.metadata && input.metadata.stageResults;
    
    // 1. Verificar integridad del mapa conceptual generado
    const verificationResults = await this._verifyMapIntegrity(concepts, relationships, text);
    
    // 2. Generar estadísticas completas del proceso
    const statistics = this._generateStatistics(concepts, relationships, stageStats);
    
    // 3. Evaluar compatibilidad con formatos de visualización
    const compatibilityResults = this._evaluateVisualCompatibility(concepts, relationships, input);
    
    // 4. Generar recomendaciones de mejora si está habilitado
    const recommendations = this.conclusionOptions.generateRecommendations ? 
      await this._generateRecommendations(concepts, relationships, verificationResults) : [];
    
    // 5. Crear resumen del mapa conceptual
    const summary = await this._generateMapSummary(
      concepts, 
      relationships, 
      statistics, 
      verificationResults,
      language
    );
    
    // Crear objeto de conclusión
    const conclusion = {
      summary,
      verification: verificationResults,
      statistics,
      compatibility: compatibilityResults,
      recommendations,
      processingTime: performance.now() - startTime
    };
    
    // Actualizar el resultado con la conclusión
    input.conclusion = conclusion;
    
    // Añadir metadatos específicos de esta etapa
    if (!input.metadata) input.metadata = {};
    if (!input.metadata.stageResults) input.metadata.stageResults = {};
    
    input.metadata.stageResults.conclusion = {
      verificationPassed: verificationResults.passed,
      summaryLength: summary.length,
      recommendationsCount: recommendations.length,
      processingTimeMs: conclusion.processingTime
    };
    
    console.log(`ETAPA 6: Conclusión Descriptiva - Completada en ${conclusion.processingTime.toFixed(2)}ms`);
    console.log(`Verificación: ${verificationResults.passed ? 'EXITOSA' : 'CON ADVERTENCIAS'}, Recomendaciones: ${recommendations.length}`);
    
    return input;
  }
  
  /**
   * Verifica la integridad del mapa conceptual
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @param {string} text - Texto original
   * @returns {Promise<Object>} - Resultados de la verificación
   * @private
   */
  async _verifyMapIntegrity(concepts, relationships, text) {
    const startTime = performance.now();
    console.log('Verificando integridad del mapa conceptual');
    
    const verificationResults = {
      passed: true,
      startTime,
      issues: [],
      warnings: [],
      conceptValidation: {
        total: concepts.length,
        withoutDefinition: 0,
        withoutHierarchy: 0,
        tooGeneric: 0
      },
      relationshipValidation: {
        total: relationships.length,
        typeMissing: 0,
        lowConfidence: 0,
        invalid: 0
      },
      textCoverage: this._calculateTextCoverage(concepts, text)
    };
    
    // 1. Verificar conceptos
    concepts.forEach(concept => {
      // Verificar definiciones
      if (!concept.definition || concept.definition.length < 10) {
        verificationResults.conceptValidation.withoutDefinition++;
        verificationResults.warnings.push(`Concepto "${concept.name}" sin definición adecuada`);
      }
      
      // Verificar jerarquía
      if (concept.level === undefined || concept.level === null) {
        verificationResults.conceptValidation.withoutHierarchy++;
        verificationResults.warnings.push(`Concepto "${concept.name}" sin nivel jerárquico asignado`);
      }
      
      // Verificar especificidad
      if (concept.name.length < 3 || /^(cosa|elemento|parte|aspecto)$/i.test(concept.name)) {
        verificationResults.conceptValidation.tooGeneric++;
        verificationResults.issues.push(`Concepto "${concept.name}" demasiado genérico`);
      }
    });
    
    // 2. Verificar relaciones
    const conceptIds = new Set(concepts.map(c => c.id));
    
    relationships.forEach(rel => {
      // Verificar tipo
      if (!rel.type || !rel.label) {
        verificationResults.relationshipValidation.typeMissing++;
        verificationResults.warnings.push(`Relación ${rel.id} sin tipo o etiqueta`);
      }
      
      // Verificar confianza
      if (rel.confidence !== undefined && rel.confidence < 0.4) {
        verificationResults.relationshipValidation.lowConfidence++;
        verificationResults.warnings.push(`Relación ${rel.id} con baja confianza (${rel.confidence})`);
      }
      
      // Verificar referencias válidas
      if (!conceptIds.has(rel.sourceId) || !conceptIds.has(rel.targetId)) {
        verificationResults.relationshipValidation.invalid++;
        verificationResults.issues.push(`Relación ${rel.id} con conceptos inválidos (${rel.sourceId} -> ${rel.targetId})`);
      }
    });
    
    // 3. Verificar completitud con AI SDK si está disponible
    if (this.aiSdkService) {
      try {
        const completenessCheck = await this.aiSdkService.verifyMapCompleteness({
          concepts,
          relationships,
          text
        });
        
        if (completenessCheck && completenessCheck.missingConcepts) {
          verificationResults.missingConcepts = completenessCheck.missingConcepts;
          verificationResults.warnings.push(`AI detectó ${completenessCheck.missingConcepts.length} conceptos potencialmente ausentes`);
        }
      } catch (error) {
        console.warn(`Error en verificación AI: ${error.message}`);
      }
    }
    
    // Determinar si pasa la verificación
    const hasIssues = verificationResults.issues.length > 0;
    const hasManyWarnings = verificationResults.warnings.length > 3;
    const hasPoorCoverage = verificationResults.textCoverage < 0.6;
    
    verificationResults.passed = !hasIssues && !hasManyWarnings && !hasPoorCoverage;
    verificationResults.processingTime = performance.now() - startTime;
    
    return verificationResults;
  }
  
  /**
   * Calcula la cobertura del texto por los conceptos
   * @param {Array} concepts - Conceptos del mapa
   * @param {string} text - Texto original
   * @returns {number} - Porcentaje de cobertura (0-1)
   * @private
   */
  _calculateTextCoverage(concepts, text) {
    if (!text) return 1; // Si no hay texto, asumir cobertura completa
    
    // Preparar texto para análisis
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\W+/).filter(w => w.length > 3);
    const uniqueWords = new Set(words);
    
    // Contar palabras de conceptos que aparecen en el texto
    let matchCount = 0;
    
    concepts.forEach(concept => {
      const conceptWords = concept.name.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const originalFormWords = (concept.originalForm || concept.name).toLowerCase().split(/\W+/).filter(w => w.length > 3);
      
      // Combinar y eliminar duplicados
      const allConceptWords = new Set([...conceptWords, ...originalFormWords]);
      
      allConceptWords.forEach(word => {
        if (uniqueWords.has(word)) {
          matchCount++;
        }
      });
    });
    
    // Calcular porcentaje (limitado a 1)
    return Math.min(1, matchCount / Math.max(1, uniqueWords.size));
  }
  
  /**
   * Genera estadísticas completas del mapa conceptual
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @param {Object} stageStats - Estadísticas de etapas previas
   * @returns {Object} - Estadísticas completas
   * @private
   */
  _generateStatistics(concepts, relationships, stageStats) {
    // Estadísticas básicas
    const statistics = {
      counts: {
        concepts: concepts.length,
        relationships: relationships.length,
        hierarchyLevels: 0
      },
      averages: {
        conceptsPerLevel: 0,
        relationshipsPerConcept: 0,
        importanceScore: 0
      },
      distribution: {
        byLevel: {},
        byImportance: {
          high: 0,
          medium: 0,
          low: 0
        },
        byType: {}
      },
      enrichment: {
        conceptsWithDefinition: 0,
        conceptsWithExamples: 0,
        conceptsWithProperties: 0
      }
    };
    
    // Analizar conceptos
    let totalImportance = 0;
    const levels = new Set();
    
    concepts.forEach(concept => {
      // Nivel
      if (concept.level !== undefined) {
        levels.add(concept.level);
        if (!statistics.distribution.byLevel[concept.level]) {
          statistics.distribution.byLevel[concept.level] = 0;
        }
        statistics.distribution.byLevel[concept.level]++;
      }
      
      // Importancia
      if (concept.importance !== undefined) {
        totalImportance += concept.importance;
        
        if (concept.importance >= 0.7) {
          statistics.distribution.byImportance.high++;
        } else if (concept.importance >= 0.4) {
          statistics.distribution.byImportance.medium++;
        } else {
          statistics.distribution.byImportance.low++;
        }
      }
      
      // Enriquecimiento
      if (concept.definition && concept.definition.length > 10) {
        statistics.enrichment.conceptsWithDefinition++;
      }
      
      if (concept.examples && concept.examples.length > 0) {
        statistics.enrichment.conceptsWithExamples++;
      }
      
      if (concept.properties && Object.keys(concept.properties).length > 0) {
        statistics.enrichment.conceptsWithProperties++;
      }
    });
    
    // Analizar relaciones
    relationships.forEach(rel => {
      if (rel.type) {
        if (!statistics.distribution.byType[rel.type]) {
          statistics.distribution.byType[rel.type] = 0;
        }
        statistics.distribution.byType[rel.type]++;
      }
    });
    
    // Calcular métricas derivadas
    statistics.counts.hierarchyLevels = levels.size;
    statistics.averages.conceptsPerLevel = concepts.length / Math.max(1, levels.size);
    statistics.averages.relationshipsPerConcept = relationships.length / Math.max(1, concepts.length);
    statistics.averages.importanceScore = totalImportance / Math.max(1, concepts.length);
    
    // Incorporar estadísticas de etapas si están disponibles
    if (stageStats) {
      statistics.stageProcessingTimes = {};
      
      Object.entries(stageStats).forEach(([stageName, stageData]) => {
        if (stageData.processingTimeMs || stageData.durationMs) {
          statistics.stageProcessingTimes[stageName] = stageData.processingTimeMs || stageData.durationMs;
        }
      });
    }
    
    return statistics;
  }
  
  /**
   * Evalúa la compatibilidad con diferentes formatos de visualización
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @param {Object} input - Datos de entrada completos
   * @returns {Object} - Resultados de compatibilidad
   * @private
   */
  _evaluateVisualCompatibility(concepts, relationships, input) {
    const compatibility = {
      formats: {
        markmap: { compatible: true, score: 0, warnings: [] },
        d3: { compatible: true, score: 0, warnings: [] },
        mermaid: { compatible: true, score: 0, warnings: [] }
      },
      recommendedFormat: null,
      overall: { compatible: true, warnings: [] }
    };
    
    // Evaluar compatibilidad con Markmap
    if (concepts.length > 100) {
      compatibility.formats.markmap.compatible = false;
      compatibility.formats.markmap.warnings.push('Demasiados conceptos para Markmap (>100)');
    } else {
      compatibility.formats.markmap.score = 0.9 - (concepts.length / 100);
    }
    
    // Evaluar compatibilidad con D3
    if (relationships.length > 200) {
      compatibility.formats.d3.warnings.push('Gran cantidad de relaciones (>200), puede afectar rendimiento');
      compatibility.formats.d3.score = 0.7;
    } else {
      compatibility.formats.d3.score = 0.8;
    }
    
    // Evaluar compatibilidad con Mermaid
    const cycleCheck = this._checkForCycles(concepts, relationships);
    if (cycleCheck.hasCycles) {
      compatibility.formats.mermaid.warnings.push('Ciclos detectados, puede causar problemas en Mermaid');
      compatibility.formats.mermaid.score = 0.5;
    } else {
      compatibility.formats.mermaid.score = 0.85;
    }
    
    // Comprobar complejidad
    const complexity = this._calculateComplexity(concepts, relationships);
    if (complexity > 0.7) {
      compatibility.overall.warnings.push('Mapa conceptual altamente complejo, considere simplificar');
    }
    
    // Determinar formato recomendado
    const scores = {
      markmap: compatibility.formats.markmap.score,
      d3: compatibility.formats.d3.score,
      mermaid: compatibility.formats.mermaid.score
    };
    
    compatibility.recommendedFormat = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return compatibility;
  }
  
  /**
   * Comprueba si hay ciclos en las relaciones
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @returns {Object} - Resultado del análisis de ciclos
   * @private
   */
  _checkForCycles(concepts, relationships) {
    // Construir grafo
    const graph = {};
    concepts.forEach(concept => {
      graph[concept.id] = [];
    });
    
    relationships.forEach(rel => {
      if (graph[rel.sourceId]) {
        graph[rel.sourceId].push(rel.targetId);
      }
    });
    
    // Verificar ciclos usando DFS
    const visited = {};
    const recursionStack = {};
    let hasCycles = false;
    let cycleNodes = [];
    
    const checkCycle = (nodeId, path = []) => {
      if (!graph[nodeId]) return false;
      
      if (recursionStack[nodeId]) {
        cycleNodes = [...path, nodeId];
        return true;
      }
      
      if (visited[nodeId]) return false;
      
      visited[nodeId] = true;
      recursionStack[nodeId] = true;
      
      for (const neighbor of graph[nodeId]) {
        if (checkCycle(neighbor, [...path, nodeId])) return true;
      }
      
      recursionStack[nodeId] = false;
      return false;
    };
    
    for (const conceptId in graph) {
      if (!visited[conceptId]) {
        if (checkCycle(conceptId)) {
          hasCycles = true;
          break;
        }
      }
    }
    
    return { hasCycles, cycleNodes };
  }
  
  /**
   * Calcula la complejidad del mapa conceptual
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @returns {number} - Puntuación de complejidad (0-1)
   * @private
   */
  _calculateComplexity(concepts, relationships) {
    // Factores de complejidad
    const conceptCount = concepts.length;
    const relationshipCount = relationships.length;
    const levelCount = new Set(concepts.filter(c => c.level !== undefined).map(c => c.level)).size;
    const relationshipDensity = relationshipCount / Math.max(1, conceptCount);
    const relationshipTypeCount = new Set(relationships.filter(r => r.type).map(r => r.type)).size;
    
    // Calcular puntuación de complejidad
    const complexityScore = (
      (0.3 * Math.min(1, conceptCount / 50)) +
      (0.3 * Math.min(1, relationshipDensity / 3)) +
      (0.2 * Math.min(1, levelCount / 5)) +
      (0.2 * Math.min(1, relationshipTypeCount / 5))
    );
    
    return complexityScore;
  }
  
  /**
   * Genera recomendaciones de mejora para el mapa conceptual
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @param {Object} verification - Resultados de verificación
   * @returns {Promise<Array>} - Lista de recomendaciones
   * @private
   */
  async _generateRecommendations(concepts, relationships, verification) {
    const recommendations = [];
    
    // Recomendaciones basadas en verificación
    if (verification.conceptValidation.withoutDefinition > 0) {
      recommendations.push({
        type: 'definition',
        priority: 'alta',
        description: `Añadir definiciones a ${verification.conceptValidation.withoutDefinition} conceptos que carecen de ellas`
      });
    }
    
    if (verification.relationshipValidation.typeMissing > 0) {
      recommendations.push({
        type: 'relationship',
        priority: 'media',
        description: `Especificar el tipo de relación para ${verification.relationshipValidation.typeMissing} conexiones sin clasificar`
      });
    }
    
    // Recomendaciones basadas en estructura
    const levelsDistribution = Object.entries(verification.distribution?.byLevel || {})
      .map(([level, count]) => ({ level: parseInt(level), count }))
      .sort((a, b) => a.level - b.level);
    
    if (levelsDistribution.length > 0) {
      const topLevel = levelsDistribution[0];
      if (topLevel.count > 7) {
        recommendations.push({
          type: 'structure',
          priority: 'media',
          description: `Considerar subdividir el nivel principal que contiene ${topLevel.count} conceptos`
        });
      }
    }
    
    // Recomendaciones de enriquecimiento
    const needsExamples = concepts.filter(c => !c.examples || c.examples.length === 0).length;
    if (needsExamples > concepts.length / 2) {
      recommendations.push({
        type: 'enrichment',
        priority: 'baja',
        description: 'Añadir ejemplos prácticos para ilustrar mejor los conceptos principales'
      });
    }
    
    // Recomendaciones de visualización
    const complexity = this._calculateComplexity(concepts, relationships);
    if (complexity > 0.7) {
      recommendations.push({
        type: 'visualization',
        priority: 'alta',
        description: 'Simplificar el mapa o dividirlo en submapas debido a su alta complejidad'
      });
    }
    
    // Recomendaciones de IA si disponibles
    if (this.aiSdkService && concepts.length > 0) {
      try {
        const aiRecommendations = await this.aiSdkService.getMapRecommendations({
          concepts,
          relationships
        });
        
        if (aiRecommendations && aiRecommendations.length > 0) {
          aiRecommendations.forEach(rec => {
            recommendations.push({
              type: 'ai_suggestion',
              priority: rec.priority || 'media',
              description: rec.description
            });
          });
        }
      } catch (error) {
        console.warn(`Error al obtener recomendaciones de IA: ${error.message}`);
      }
    }
    
    // Ordenar por prioridad
    const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  /**
   * Genera un resumen del mapa conceptual
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @param {Object} statistics - Estadísticas del mapa
   * @param {Object} verification - Resultados de verificación
   * @param {string} language - Idioma del mapa
   * @returns {Promise<string>} - Resumen generado
   * @private
   */
  async _generateMapSummary(concepts, relationships, statistics, verification, language) {
    // Obtener conceptos principales basados en importancia
    const mainConcepts = concepts
      .filter(c => c.importance >= 0.7)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);
    
    // Bases para el resumen
    let summary = `El mapa conceptual generado contiene ${concepts.length} conceptos interconectados mediante ${relationships.length} relaciones. `;
    
    // Añadir información sobre conceptos principales
    if (mainConcepts.length > 0) {
      summary += `Los conceptos principales identificados son: ${mainConcepts.map(c => c.name).join(', ')}. `;
    }
    
    // Añadir información sobre estructura jerárquica
    const levelCount = statistics.counts.hierarchyLevels;
    if (levelCount > 1) {
      summary += `La estructura se organiza en ${levelCount} niveles jerárquicos. `;
    }
    
    // Añadir información sobre enriquecimiento
    const definitionPercentage = Math.round((statistics.enrichment.conceptsWithDefinition / concepts.length) * 100);
    if (definitionPercentage > 0) {
      summary += `El ${definitionPercentage}% de los conceptos incluyen definiciones detalladas. `;
    }
    
    // Añadir resultados de verificación
    if (!verification.passed) {
      summary += `La verificación ha identificado ${verification.issues.length} problemas y ${verification.warnings.length} advertencias que podrían afectar la calidad del mapa. `;
    } else {
      summary += `La verificación de integridad ha sido exitosa. `;
    }
    
    // Añadir información sobre tipos de relaciones si hay diversidad
    const relationshipTypes = Object.keys(statistics.distribution.byType || {});
    if (relationshipTypes.length > 1) {
      const topTypes = relationshipTypes
        .sort((a, b) => (statistics.distribution.byType[b] || 0) - (statistics.distribution.byType[a] || 0))
        .slice(0, 3);
      
      summary += `Los tipos de relación más comunes son: ${topTypes.join(', ')}. `;
    }
    
    // Si hay AI SDK disponible, generar una conclusión más semántica
    if (this.aiSdkService) {
      try {
        const enhancedSummary = await this.aiSdkService.generateMapSummary({
          concepts: mainConcepts,
          totalConcepts: concepts.length,
          totalRelationships: relationships.length,
          hasPassed: verification.passed,
          language
        });
        
        if (enhancedSummary && enhancedSummary.length > 0) {
          summary = enhancedSummary;
        }
      } catch (error) {
        console.warn(`Error al generar resumen con IA: ${error.message}`);
      }
    }
    
    // Limitar longitud si es necesario
    if (summary.length > this.conclusionOptions.maxSummaryLength) {
      summary = summary.substring(0, this.conclusionOptions.maxSummaryLength) + '...';
    }
    
    return summary;
  }
}

module.exports = ConclusionModule; 