/**
 * PipelineManager.js
 * Controlador central que orquesta el flujo entre módulos del sistema de mapas conceptuales
 */

const BaseModule = require('./BaseModule');

class PipelineManager {
  /**
   * Constructor para el gestor de pipeline
   * @param {Object} config - Configuración global del pipeline
   */
  constructor(config = {}) {
    this.config = config;
    this.modules = {};
    this.executionOrder = [];
    this.metrics = {
      modulePerformance: {},
      errorCounts: {},
      recoveryAttempts: {}
    };
    this.lastRunTimestamp = null;
    this.totalRuns = 0;
  }

  /**
   * Registra un módulo en el pipeline
   * @param {string|BaseModule} nameOrModule - Nombre del módulo o instancia del módulo
   * @param {BaseModule} [module] - Instancia del módulo (opcional si el primer parámetro es el módulo)
   * @returns {PipelineManager} - Instancia actual para encadenamiento
   */
  registerModule(nameOrModule, module = null) {
    // Verificar si el primer parámetro es el módulo (compatibilidad con versiones anteriores)
    if (nameOrModule instanceof BaseModule && module === null) {
      const moduleInstance = nameOrModule;
      const name = moduleInstance.name;
      
      this.modules[name] = moduleInstance;
      
      // Si no hay orden de ejecución definido, agregar al final
      if (!this.executionOrder.includes(name)) {
        this.executionOrder.push(name);
      }
      
      return this;
    }
    
    // Caso normal: nombre y módulo proporcionados
    const name = nameOrModule;
    
    if (!(module instanceof BaseModule)) {
      throw new Error(`El módulo '${name}' debe ser una instancia de BaseModule`);
    }
    
    this.modules[name] = module;
    
    // Si no hay orden de ejecución definido, agregar al final
    if (!this.executionOrder.includes(name)) {
      this.executionOrder.push(name);
    }
    
    return this;
  }

  /**
   * Establece explícitamente el orden de ejecución de los módulos
   * @param {Array<string>} order - Array con nombres de módulos en orden de ejecución
   * @returns {PipelineManager} - Instancia actual para encadenamiento
   */
  setExecutionOrder(order) {
    // Verificar que todos los módulos en el orden existan
    for (const moduleName of order) {
      if (!this.modules[moduleName]) {
        throw new Error(`No se puede establecer orden: módulo '${moduleName}' no está registrado`);
      }
    }
    
    this.executionOrder = [...order];
    return this;
  }

  /**
   * Ejecuta el pipeline completo con los datos de entrada proporcionados
   * @param {Object} inputData - Datos iniciales para el pipeline
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async processPipeline(inputData) {
    this.totalRuns++;
    this.lastRunTimestamp = new Date();
    
    console.log(`[PipelineManager] Iniciando ejecución del pipeline con ${this.executionOrder.length} etapas`);
    
    let result = { ...inputData };
    const startTime = Date.now();
    const moduleTimings = {};
    const pipelineMetrics = {
      startTime,
      moduleResults: {},
      errors: [],
      recoveryActions: []
    };
    
    for (const moduleName of this.executionOrder) {
      const module = this.modules[moduleName];
      
      if (!module) {
        const error = `Módulo '${moduleName}' en orden de ejecución pero no está registrado`;
        console.error(`[PipelineManager] ERROR: ${error}`);
        pipelineMetrics.errors.push({ stage: moduleName, error, time: Date.now() });
        continue;
      }
      
      try {
        console.log(`[PipelineManager] Ejecutando módulo: ${moduleName}`);
        const moduleStartTime = Date.now();
        
        // Procesar con el módulo actual
        result = await module.process(result);
        
        const moduleDuration = Date.now() - moduleStartTime;
        moduleTimings[moduleName] = moduleDuration;
        
        // Actualizar métricas de rendimiento para este módulo
        if (!this.metrics.modulePerformance[moduleName]) {
          this.metrics.modulePerformance[moduleName] = {
            totalTime: 0,
            callCount: 0,
            avgTime: 0,
            minTime: moduleDuration,
            maxTime: moduleDuration
          };
        }
        
        const perfMetrics = this.metrics.modulePerformance[moduleName];
        perfMetrics.totalTime += moduleDuration;
        perfMetrics.callCount += 1;
        perfMetrics.avgTime = perfMetrics.totalTime / perfMetrics.callCount;
        perfMetrics.minTime = Math.min(perfMetrics.minTime, moduleDuration);
        perfMetrics.maxTime = Math.max(perfMetrics.maxTime, moduleDuration);
        
        pipelineMetrics.moduleResults[moduleName] = {
          duration: moduleDuration,
          success: true
        };
        
        console.log(`[PipelineManager] Módulo ${moduleName} completado en ${moduleDuration}ms`);
      } catch (error) {
        console.error(`[PipelineManager] Error en módulo ${moduleName}:`, error);
        
        // Registrar el error en métricas
        if (!this.metrics.errorCounts[moduleName]) {
          this.metrics.errorCounts[moduleName] = 0;
        }
        this.metrics.errorCounts[moduleName]++;
        
        pipelineMetrics.errors.push({
          stage: moduleName,
          error: error.message || String(error),
          time: Date.now()
        });

        // Intento de recuperación basado en el tipo de error
        try {
          if (!this.metrics.recoveryAttempts[moduleName]) {
            this.metrics.recoveryAttempts[moduleName] = 0;
          }
          
          // Estrategia de recuperación: intentar usar un resultado previo o generar uno mínimo
          const recoveryResult = await this._attemptRecovery(moduleName, result, error);
          
          if (recoveryResult) {
            this.metrics.recoveryAttempts[moduleName]++;
            result = recoveryResult;
            
            pipelineMetrics.recoveryActions.push({
              stage: moduleName,
              action: "Recuperación exitosa",
              time: Date.now()
            });
            
            console.log(`[PipelineManager] Recuperación exitosa para ${moduleName}`);
          } else {
            pipelineMetrics.moduleResults[moduleName] = {
              duration: Date.now() - moduleStartTime,
              success: false,
              error: error.message || String(error)
            };
            
            // Si no se pudo recuperar, añadir advertencia pero continuar con el siguiente módulo
            if (!result.warnings) result.warnings = [];
            result.warnings.push({
              module: moduleName,
              message: `Error en módulo: ${error.message || String(error)}`
            });
          }
        } catch (recoveryError) {
          console.error(`[PipelineManager] Error en recuperación de ${moduleName}:`, recoveryError);
          
          pipelineMetrics.recoveryActions.push({
            stage: moduleName,
            action: "Recuperación fallida",
            error: recoveryError.message,
            time: Date.now()
          });
        }
      }
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Añadir metadatos sobre el procesamiento
    result.metadata = {
      ...(result.metadata || {}),
      processingTime: {
        total: totalDuration,
        byModule: moduleTimings
      },
      pipelineConfig: {
        moduleOrder: this.executionOrder,
        moduleCount: this.executionOrder.length
      },
      pipelineMetrics: {
        ...pipelineMetrics,
        endTime: Date.now(),
        totalDuration
      }
    };
    
    console.log(`[PipelineManager] Pipeline completado en ${totalDuration}ms`);
    return result;
  }

  /**
   * Procesa texto a través del pipeline completo
   * @param {string} text - Texto para procesar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async processText(text, options = {}) {
    return this.processPipeline({ text, options });
  }

  /**
   * Intenta recuperarse de un error en un módulo específico
   * @param {string} moduleName - Nombre del módulo con error
   * @param {Object} currentData - Datos actuales antes del error
   * @param {Error} error - Error que ocurrió
   * @returns {Promise<Object|null>} - Datos recuperados o null si no es posible
   * @private
   */
  async _attemptRecovery(moduleName, currentData, error) {
    console.log(`[PipelineManager] Intentando recuperación para módulo: ${moduleName}`);
    
    // Estrategias de recuperación según el módulo
    switch (moduleName) {
      case 'organization':
        // Si falla la organización, intentar con un enfoque mínimo
        if (currentData.text) {
          return {
            ...currentData,
            concepts: this._generateMinimalConcepts(currentData.text),
            relationships: [],
            metadata: {
              ...(currentData.metadata || {}),
              recovery: {
                module: moduleName,
                strategy: 'minimal_concepts',
                error: error.message
              }
            }
          };
        }
        break;
        
      case 'reasoning':
        // Si falla el razonamiento pero tenemos conceptos, crear relaciones básicas
        if (currentData.concepts && currentData.concepts.length > 0) {
          return {
            ...currentData,
            relationships: this._generateBasicRelationships(currentData.concepts),
            metadata: {
              ...(currentData.metadata || {}),
              recovery: {
                module: moduleName,
                strategy: 'basic_relationships',
                error: error.message
              }
            }
          };
        }
        break;
        
      case 'enrichment':
        // Si falla el enriquecimiento, continuar con los conceptos sin enriquecer
        return {
          ...currentData,
          metadata: {
            ...(currentData.metadata || {}),
            recovery: {
              module: moduleName,
              strategy: 'skip_enrichment',
              error: error.message
            }
          }
        };
        
      case 'validation':
        // Si falla la validación, continuar con una advertencia
        return {
          ...currentData,
          validationResults: { passed: false, reason: 'Error en validación' },
          metadata: {
            ...(currentData.metadata || {}),
            recovery: {
              module: moduleName,
              strategy: 'skip_validation',
              error: error.message
            }
          }
        };
        
      case 'aesthetics':
        // Si falla la estética, usar un formato visual básico
        return {
          ...currentData,
          visualOptions: {
            format: 'basic',
            theme: 'default'
          },
          metadata: {
            ...(currentData.metadata || {}),
            recovery: {
              module: moduleName,
              strategy: 'basic_visuals',
              error: error.message
            }
          }
        };
        
      case 'conclusion':
        // Si falla la conclusión, generar una mínima
        return {
          ...currentData,
          conclusion: {
            summary: 'Generación de conclusión fallida. Mapa conceptual procesado con errores.',
            stats: {
              conceptCount: currentData.concepts?.length || 0,
              relationshipCount: currentData.relationships?.length || 0
            }
          },
          metadata: {
            ...(currentData.metadata || {}),
            recovery: {
              module: moduleName,
              strategy: 'minimal_conclusion',
              error: error.message
            }
          }
        };
    }
    
    // Si no hay estrategia específica, retornar null
    return null;
  }

  /**
   * Genera conceptos mínimos a partir de texto (para recuperación)
   * @param {string} text - Texto de entrada
   * @returns {Array<Object>} - Lista básica de conceptos
   * @private
   */
  _generateMinimalConcepts(text) {
    // Simplemente dividir por puntos, eliminar duplicados y crear conceptos básicos
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 5);
    const potentialConcepts = new Set();
    
    // Extraer palabras importantes de cada oración (simula extracción de conceptos)
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      // Considerar grupos de 1-3 palabras como potenciales conceptos
      for (let i = 0; i < words.length; i++) {
        if (words[i].length > 3) { // Ignorar palabras muy cortas
          potentialConcepts.add(words[i]);
        }
        
        if (i < words.length - 1 && words[i+1].length > 3) {
          potentialConcepts.add(`${words[i]} ${words[i+1]}`);
        }
      }
    });
    
    // Convertir a array de objetos de concepto
    return Array.from(potentialConcepts).slice(0, 20).map((name, index) => ({
      id: `concept-${index}`,
      name,
      level: 1,
      importance: 0.5,
      originalForm: name,
      childrenIds: []
    }));
  }

  /**
   * Genera relaciones básicas entre conceptos (para recuperación)
   * @param {Array<Object>} concepts - Lista de conceptos
   * @returns {Array<Object>} - Lista básica de relaciones
   * @private
   */
  _generateBasicRelationships(concepts) {
    const relationships = [];
    
    // Crear algunas relaciones básicas entre conceptos
    if (concepts.length > 1) {
      // Conectar con un concepto principal
      const mainConcept = concepts[0];
      
      for (let i = 1; i < Math.min(concepts.length, 10); i++) {
        relationships.push({
          id: `rel-${i}`,
          sourceId: mainConcept.id,
          targetId: concepts[i].id,
          type: 'relacionado',
          label: 'se relaciona con',
          confidence: 0.3
        });
      }
    }
    
    return relationships;
  }

  /**
   * Obtiene estadísticas del rendimiento del pipeline
   * @returns {Object} - Estadísticas de rendimiento
   */
  getPerformanceStats() {
    return {
      totalRuns: this.totalRuns,
      lastRunTimestamp: this.lastRunTimestamp,
      modulePerformance: this.metrics.modulePerformance,
      errorCounts: this.metrics.errorCounts,
      recoveryAttempts: this.metrics.recoveryAttempts
    };
  }
}

module.exports = PipelineManager; 