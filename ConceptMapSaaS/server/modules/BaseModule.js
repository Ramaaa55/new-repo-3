/**
 * BaseModule.js
 * Clase base para todos los módulos de etapas del pipeline de mapas conceptuales
 */

class BaseModule {
  /**
   * Constructor para el módulo base
   * @param {string} name - Nombre del módulo
   * @param {string} displayName - Nombre mostrado al usuario
   * @param {Object} config - Opciones de configuración
   */
  constructor(name, displayName, config = {}) {
    this.name = name;
    this.displayName = displayName || name;
    this.config = config;
    this.isEnabled = config.enabled !== false;
    this.startTime = null;
    this.endTime = null;
    this.metrics = {};
  }

  /**
   * Procesa los datos de entrada y retorna el resultado
   * @param {Object} input - Datos de entrada del módulo
   * @param {Object} context - Contexto de ejecución (configuración, metadatos, etc.)
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async process(input, context = {}) {
    if (!this.isEnabled) {
      console.log(`Módulo ${this.displayName} deshabilitado, saltando procesamiento`);
      return input;
    }

    try {
      this.startTime = new Date();
      console.log(`Iniciando módulo: ${this.displayName}`);
      
      // Validar la entrada
      this.validateInput(input);
      
      // Realizar el procesamiento específico del módulo
      const result = await this._processImplementation(input, context);
      
      this.endTime = new Date();
      const duration = this.endTime - this.startTime;
      
      // Registrar métricas
      this.metrics = {
        startTime: this.startTime.toISOString(),
        endTime: this.endTime.toISOString(),
        duration: duration,
        status: 'success'
      };
      
      console.log(`Módulo ${this.displayName} completado en ${duration}ms`);
      
      // Crear o actualizar metadatos
      if (!result.metadata) result.metadata = {};
      if (!result.metadata.modules) result.metadata.modules = {};
      
      result.metadata.modules[this.name] = {
        ...this.metrics,
        displayName: this.displayName,
        config: this.config
      };
      
      return result;
    } catch (error) {
      console.error(`Error en módulo ${this.displayName}:`, error);
      
      // Registrar error en métricas
      this.endTime = new Date();
      this.metrics = {
        startTime: this.startTime?.toISOString(),
        endTime: this.endTime.toISOString(),
        duration: this.startTime ? (this.endTime - this.startTime) : null,
        status: 'error',
        error: error.message
      };
      
      // Si hay entrada, intentar devolverla para que el pipeline pueda continuar
      if (input) {
        if (!input.metadata) input.metadata = {};
        if (!input.metadata.modules) input.metadata.modules = {};
        
        input.metadata.modules[this.name] = {
          ...this.metrics,
          displayName: this.displayName,
          config: this.config
        };
        
        input.metadata.errors = input.metadata.errors || [];
        input.metadata.errors.push({
          module: this.name,
          displayName: this.displayName,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        
        return input;
      }
      
      // Si no hay entrada para devolver, lanzar el error
      throw error;
    }
  }
  
  /**
   * Validar los datos de entrada
   * @param {Object} input - Datos de entrada a validar
   * @throws {Error} Si los datos de entrada son inválidos
   */
  validateInput(input) {
    if (!input) {
      throw new Error(`${this.displayName}: Datos de entrada nulos o indefinidos`);
    }
  }
  
  /**
   * Implementación específica del procesamiento del módulo
   * Este método debe ser sobrescrito por cada módulo concreto
   * @param {Object} input - Datos de entrada del módulo
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async _processImplementation(input, context) {
    throw new Error(`El método _processImplementation debe ser implementado por la subclase (${this.displayName})`);
  }
  
  /**
   * Verificar si una característica/herramienta está habilitada en las opciones
   * @param {string} toolName - Nombre de la herramienta
   * @returns {boolean} - true si la herramienta está habilitada
   */
  isToolEnabled(toolName) {
    return this.config?.tools && this.config.tools[toolName] === true;
  }
  
  /**
   * Obtener opciones para una herramienta específica
   * @param {string} toolName - Nombre de la herramienta
   * @returns {Object} - Opciones de la herramienta o un objeto vacío si no existe
   */
  getToolOptions(toolName) {
    return this.config?.toolOptions?.[toolName] || {};
  }
  
  /**
   * Método utilitario para manejar errores 
   * @param {Error} error - Error ocurrido
   * @param {Object} input - Datos de entrada originales
   * @param {string} operationName - Nombre de la operación que falló
   * @returns {Object} - Datos de entrada con información del error
   */
  handleError(error, input, operationName) {
    console.error(`Error en ${this.displayName} - ${operationName}:`, error);
    
    if (!input.metadata) input.metadata = {};
    if (!input.metadata.errors) input.metadata.errors = [];
    
    input.metadata.errors.push({
      module: this.name,
      displayName: this.displayName,
      operation: operationName,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return input;
  }
}

module.exports = BaseModule; 