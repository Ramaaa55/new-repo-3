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
    this.tools = config.tools || {};
    this.processedInputs = 0;
    this.errors = [];
    this.timeout = config.timeout || 30000; // timeout en ms
    this.shouldSkipOnError = config.skipOnError === true;
    this.retryCount = config.retryCount || 0;
    this.logLevel = config.logLevel || 'info'; // 'debug', 'info', 'warn', 'error'
    this.logPrefix = `[${this.name.toUpperCase()}]`;
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
      this.startTime = Date.now();
      this.log('info', `Iniciando procesamiento de ${this.name}`);
      
      // Validar la entrada
      this.validateInput(input);
      
      // Realizar el procesamiento específico del módulo
      const result = await this._processWithTimeout(
        this._processImplementation.bind(this),
        input,
        context
      );
      
      this.processedInputs++;
      this.endTime = Date.now();
      const duration = this.endTime - this.startTime;
      
      // Registrar métricas
      this.metrics = {
        startTime: this.startTime.toISOString(),
        endTime: this.endTime.toISOString(),
        duration: duration,
        status: 'success'
      };
      
      this.log('info', `Módulo ${this.displayName} completado en ${duration}ms`);
      
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
      this.errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack
      });
      
      this.endTime = Date.now();
      this.log('error', `Error en procesamiento: ${error.message}`);
      
      if (this.shouldSkipOnError) {
        this.log('warn', 'Continuando sin procesar (skipOnError=true)');
        return input;
      }
      
      // Registrar error en métricas
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
    // Si no se especifica, asumir habilitada por defecto
    if (!this.tools || typeof this.tools[toolName] === 'undefined') {
      return true;
    }
    
    return this.tools[toolName] === true;
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

  /**
   * Función auxiliar para aplicar timeout al procesamiento
   * @param {Function} processFn - Función a ejecutar
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   * @private
   */
  async _processWithTimeout(processFn, input, context) {
    return new Promise(async (resolve, reject) => {
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout excedido (${this.timeout}ms) en módulo ${this.name}`));
      }, this.timeout);
      
      try {
        // Ejecutar proceso
        const result = await processFn(input, context);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Intentar retries si están configurados
        if (this.retryCount > 0) {
          this.log('warn', `Intentando nuevamente (${this.retryCount} intentos restantes)`);
          this.retryCount--;
          
          try {
            const retryResult = await this._processWithTimeout(processFn, input, context);
            resolve(retryResult);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Registra un mensaje en el log con el nivel especificado
   * @param {string} level - Nivel de log ('debug', 'info', 'warn', 'error')
   * @param {string} message - Mensaje a registrar
   */
  log(level, message) {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Solo mostrar si el nivel es igual o superior al configurado
    if (levels[level] >= levels[this.logLevel]) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `${timestamp} ${this.logPrefix} [${level.toUpperCase()}] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.log(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }
  }
  
  /**
   * Obtiene estadísticas del módulo
   * @returns {Object} - Estadísticas de ejecución
   */
  getStats() {
    return {
      name: this.name,
      description: this.config.description || `Módulo de ${this.name}`,
      processedInputs: this.processedInputs,
      errorsCount: this.errors.length,
      lastProcessingTime: this.endTime && this.startTime ? 
        this.endTime - this.startTime : null,
      status: this.errors.length > 0 ? 'warning' : 'ok'
    };
  }
}

module.exports = BaseModule; 