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
    this.modules = [];
  }

  /**
   * Registra un módulo en el pipeline
   * @param {BaseModule} module - Instancia del módulo
   * @returns {PipelineManager} - Para encadenamiento de métodos
   */
  registerModule(module) {
    if (!(module instanceof BaseModule)) {
      throw new Error(`El módulo debe ser una instancia de BaseModule`);
    }
    
    this.modules.push(module);
    return this;
  }

  /**
   * Ejecuta el pipeline completo con los datos de entrada proporcionados
   * @param {Object} inputData - Datos iniciales para el pipeline
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async processPipeline(inputData) {
    if (!inputData || !inputData.original || !inputData.original.text) {
      throw new Error('Se requieren datos de entrada válidos con texto original');
    }
    
    try {
      console.log(`Iniciando pipeline con ${this.modules.length} módulos`);
      
      // Crear una copia de los datos de entrada para procesarlos
      let result = JSON.parse(JSON.stringify(inputData));
      
      // Asegurar que existe la estructura de metadatos
      if (!result.metadata) {
        result.metadata = {};
      }
      
      result.metadata.pipelineStartTime = new Date().toISOString();
      
      // Contexto global para compartir datos entre módulos
      const context = {
        originalText: inputData.original.text,
        language: inputData.original.language || 'es',
        config: this.config
      };
      
      // Procesar secuencialmente a través de todos los módulos
      for (let i = 0; i < this.modules.length; i++) {
        const module = this.modules[i];
        console.log(`Ejecutando módulo ${i+1}/${this.modules.length}: ${module.name}`);
        
        // Procesar el resultado con el módulo actual
        result = await module.process(result, context);
      }
      
      // Agregar información final del pipeline
      result.metadata.pipelineEndTime = new Date().toISOString();
      result.metadata.totalProcessingTimeMs = 
        new Date(result.metadata.pipelineEndTime) - new Date(result.metadata.pipelineStartTime);
      
      console.log(`Pipeline completado en ${result.metadata.totalProcessingTimeMs}ms`);
      
      return result;
      
    } catch (error) {
      console.error('Error en el procesamiento del pipeline:', error);
      throw error;
    }
  }
}

module.exports = PipelineManager; 