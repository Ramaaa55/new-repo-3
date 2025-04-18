/**
 * OrganizationModule.js
 * Implementación del módulo para la etapa 1: Organización y Jerarquía
 */

const BaseModule = require('../BaseModule');
const path = require('path');

class OrganizationModule extends BaseModule {
  /**
   * Constructor del módulo de organización
   * @param {Object} config - Opciones de configuración
   */
  constructor(config = {}) {
    super('organization', 'Organización y Jerarquía', config);
    
    // Cargar servicios necesarios para esta etapa
    try {
      // La importación es perezosa para evitar cargar servicios no utilizados
      this.conceptMapService = require(path.join(process.cwd(), 'server/services/fixed-conceptMapService'));
    } catch (error) {
      console.warn(`Advertencia en OrganizationModule: No se pudieron cargar algunos servicios: ${error.message}`);
    }
    
    // Configuraciones por defecto
    this.maxConcepts = config.maxConcepts || 50;
    this.includeHierarchy = config.includeHierarchy !== false;
    this.useSpacy = config.useSpacy !== false;
    this.useLangGraph = config.useLangGraph || false;
    this.usePenrose = config.usePenrose || false;
    this.useHaystack = config.useHaystack || false;
  }
  
  /**
   * Validación específica para este módulo
   * @param {Object} input - Datos de entrada
   */
  validateInput(input) {
    if (!input || !input.original || !input.original.text) {
      throw new Error('Se requiere el texto original para la organización de conceptos');
    }
  }
  
  /**
   * Implementación del procesamiento para la etapa de organización
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async _processImplementation(input, context = {}) {
    console.log('ETAPA 1: Organización y Jerarquía');
    
    const startTime = Date.now();
    
    // Extraer texto original
    const text = input.original.text;
    const language = input.original.language || 'es';
    
    // Opciones para el procesamiento
    const extractionOptions = {
      maxConcepts: this.maxConcepts,
      language: language,
      includeRelevance: true
    };
    
    try {
      // 1. Extracción de conceptos
      console.log(`Extrayendo hasta ${this.maxConcepts} conceptos del texto`);
      let concepts = await this._extractConcepts(text, extractionOptions);
      console.log(`Se extrajeron ${concepts.length} conceptos`);
      
      // Si no hay conceptos, crear algunos básicos para que el pipeline funcione
      if (!concepts || concepts.length === 0) {
        console.warn('No se pudieron extraer conceptos. Generando conceptos de respaldo.');
        concepts = this._generateFallbackConcepts(text);
      }
      
      // 2. Organización jerárquica de conceptos
      let hierarchyData = {};
      if (this.includeHierarchy && concepts.length > 0) {
        try {
          console.log('Aplicando organización jerárquica a los conceptos');
          hierarchyData = await this._organizeHierarchy(concepts, text);
          
          // Aplicar niveles de jerarquía a los conceptos
          concepts = this._applyHierarchyLevels(concepts, hierarchyData);
        } catch (error) {
          console.error('Error en la organización jerárquica:', error);
          // No fallamos todo el proceso si la jerarquía falla
        }
      }
      
      // 3. Aplicación de Penrose para optimización espacial si está habilitado
      if (this.usePenrose && concepts.length > 0) {
        try {
          console.log('Aplicando optimización espacial con Penrose');
          concepts = this._applyPenroseOptimization(concepts, hierarchyData);
        } catch (error) {
          console.warn('Error en optimización Penrose:', error.message);
        }
      }
      
      // 4. Aplicación de LangGraph para mejorar la estructura conceptual
      if (this.useLangGraph && concepts.length > 0) {
        try {
          console.log('Mejorando estructura con LangGraph');
          const improvedConcepts = this._applyLangGraphOptimization(concepts, text);
          
          // Solo usar la mejora si devuelve algo válido
          if (improvedConcepts && improvedConcepts.length > 0) {
            concepts = improvedConcepts;
          }
        } catch (error) {
          console.warn('Error en optimización LangGraph:', error.message);
        }
      }
      
      // Actualizar el resultado con los conceptos procesados
      input.concepts = concepts;
      
      // Inicializar array de relaciones vacío para las siguientes etapas
      if (!input.relationships) {
        input.relationships = [];
      }
      
      // Añadir metadatos
      input.metadata = input.metadata || {};
      input.metadata.organization = {
        stage: 'organization',
        conceptCount: concepts.length,
        hierarchyLevels: this._countHierarchyLevels(concepts),
        processingTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        tools: {
          spacy: this.useSpacy,
          langGraph: this.useLangGraph,
          penrose: this.usePenrose,
          haystack: this.useHaystack
        }
      };
      
      return input;
    } catch (error) {
      console.error(`Error en la organización: ${error.message}`);
      
      // Crear conceptos de respaldo en caso de error
      const fallbackConcepts = this._generateFallbackConcepts(text);
      
      // Intentar retornar un resultado mínimo funcional
      input.concepts = fallbackConcepts;
      if (!input.relationships) {
        input.relationships = [];
      }
      
      // Agregar información sobre el error a los metadatos
      input.metadata = input.metadata || {};
      input.metadata.organization = {
        stage: 'organization',
        error: error.message,
        conceptCount: fallbackConcepts.length,
        processingTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        fallbackUsed: true
      };
      
      return input;
    }
  }
  
  /**
   * Extrae conceptos del texto utilizando diferentes herramientas
   * @param {string} text - Texto para analizar
   * @param {Object} options - Opciones para la extracción
   * @returns {Promise<Array>} - Array de conceptos
   * @private
   */
  async _extractConcepts(text, options) {
    try {
      // Si no tenemos el servicio, usar extraction simulada
      if (!this.conceptMapService) {
        return this._simulateConceptExtraction(text, options);
      }
      
      // Decidir qué herramientas usar para la extracción
      if (this.useSpacy) {
        console.log('Usando spaCy para extracción de conceptos');
        return this.conceptMapService.extractMainConcepts(text, options);
      } else if (this.useHaystack) {
        console.log('Usando Haystack para extracción de conceptos');
        return this.conceptMapService.extractMainConcepts(text, {
          ...options,
          useHaystack: true
        });
      } else {
        // Método por defecto
        console.log('Usando extracción estándar de conceptos');
        return this.conceptMapService.extractMainConcepts(text, options);
      }
    } catch (error) {
      console.error('Error en extracción de conceptos:', error);
      return this._simulateConceptExtraction(text, options);
    }
  }
  
  /**
   * Simula la extracción de conceptos cuando no está disponible el servicio
   * @param {string} text - Texto para analizar
   * @param {Object} options - Opciones para la extracción
   * @returns {Array} - Array de conceptos simulados
   * @private
   */
  _simulateConceptExtraction(text, options) {
    console.log('Utilizando extracción simulada de conceptos');
    
    // Partir el texto en oraciones y palabras
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const allWords = text.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[.,;:!?()[\]{}'"]/g, ''));
    
    // Contar frecuencia de palabras
    const wordCount = {};
    for (const word of allWords) {
      const lowerWord = word.toLowerCase();
      wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
    }
    
    // Ordenar por frecuencia
    const sortedWords = Object.keys(wordCount)
      .filter(word => !/^\d+$/.test(word)) // Excluir números
      .sort((a, b) => wordCount[b] - wordCount[a]);
    
    // Limitar al máximo de conceptos
    const maxConcepts = options.maxConcepts || 20;
    const selectedWords = sortedWords.slice(0, maxConcepts);
    
    // Crear conceptos
    return selectedWords.map((word, index) => {
      // Buscar contexto en las oraciones
      const relevantSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(word.toLowerCase())
      );
      
      // Crear descripción a partir del contexto
      const description = relevantSentences.length > 0 
        ? relevantSentences[0].trim()
        : `Concepto relacionado con "${word}"`;
      
      return {
        id: `concept_${index + 1}`,
        name: word.charAt(0).toUpperCase() + word.slice(1),
        importance: 1 - (index / selectedWords.length),
        frequency: wordCount[word],
        description: description,
        originalForm: word,
        category: this._inferSimpleCategory(word, relevantSentences)
      };
    });
  }
  
  /**
   * Infiere una categoría simple para un concepto
   * @param {string} word - Palabra a categorizar
   * @param {Array} sentences - Oraciones relevantes
   * @returns {string} - Categoría inferida
   * @private
   */
  _inferSimpleCategory(word, sentences) {
    // Lista de palabras clave para diferentes categorías
    const categoryKeywords = {
      'proceso': ['es un proceso', 'consiste en', 'se realiza', 'implica', 'funciona'],
      'objeto': ['es un objeto', 'es una herramienta', 'se utiliza', 'sirve para'],
      'persona': ['persona', 'profesional', 'usuario', 'cliente', 'humano'],
      'concepto': ['significa', 'se refiere', 'es un concepto', 'teoría'],
      'lugar': ['lugar', 'ubicación', 'sitio', 'zona', 'región', 'país']
    };
    
    // Buscar coincidencias en las oraciones
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (lowerSentence.includes(keyword)) {
            return category;
          }
        }
      }
    }
    
    // Categoría por defecto
    return 'concepto';
  }
  
  /**
   * Organiza los conceptos en una estructura jerárquica
   * @param {Array} concepts - Conceptos a organizar
   * @param {string} text - Texto original
   * @returns {Promise<Object>} - Datos de jerarquía
   * @private
   */
  async _organizeHierarchy(concepts, text) {
    // Reutilizar la implementación existente
    try {
      const hierarchy = this.conceptMapService.createHierarchicalStructure(concepts);
      
      // Realizar un segundo pase para enriquecer con más información contextual
      for (const concept of concepts) {
        if (!concept.childrenIds) concept.childrenIds = [];
        
        // Análisis contextual para determinar conceptos secundarios
        const contextualWords = this._findAssociatedWords(concept.name, text);
        for (const contextWord of contextualWords) {
          const childConcept = concepts.find(c => 
            c.name.toLowerCase().includes(contextWord.toLowerCase()) && 
            c.id !== concept.id && 
            !concept.childrenIds.includes(c.id));
          
          if (childConcept) {
            concept.childrenIds.push(childConcept.id);
          }
        }
      }
      
      return hierarchy;
    } catch (error) {
      console.error('Error en organización de jerarquía:', error);
      // Devolver estructura mínima en caso de error
      return {
        roots: concepts.slice(0, 1).map(c => c.id),
        nodes: concepts.reduce((acc, concept) => {
          acc[concept.id] = { children: [] };
          return acc;
        }, {})
      };
    }
  }
  
  /**
   * Aplica niveles de jerarquía a los conceptos
   * @param {Array} concepts - Conceptos a procesar
   * @param {Object} hierarchyData - Datos de jerarquía
   * @returns {Array} - Conceptos con niveles de jerarquía
   * @private
   */
  _applyHierarchyLevels(concepts, hierarchyData) {
    const rootIds = hierarchyData.roots || [];
    const hierarchyMap = new Map();
    
    // Función recursiva para asignar niveles
    const assignLevel = (conceptId, level = 1, path = []) => {
      // Evitar ciclos
      if (path.includes(conceptId)) return;
      
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) return;
      
      // Asignar nivel si es mayor que el actual
      if (!concept.hierarchyLevel || concept.hierarchyLevel < level) {
        concept.hierarchyLevel = level;
      }
      
      hierarchyMap.set(conceptId, level);
      
      // Procesar hijos
      const children = concept.childrenIds || [];
      const newPath = [...path, conceptId];
      
      for (const childId of children) {
        assignLevel(childId, level + 1, newPath);
      }
    };
    
    // Asignar niveles comenzando por las raíces
    for (const rootId of rootIds) {
      assignLevel(rootId, 1, []);
    }
    
    // Asegurar que todos los conceptos tengan un nivel
    for (const concept of concepts) {
      if (!concept.hierarchyLevel) {
        concept.hierarchyLevel = 1; // Nivel por defecto
      }
      
      // Añadir indicador de importancia basado en nivel jerárquico
      concept.importance = this._calculateImportance(concept.hierarchyLevel, concepts.length);
    }
    
    return concepts;
  }
  
  /**
   * Calcula la importancia de un concepto basado en su nivel jerárquico
   * @param {number} level - Nivel jerárquico
   * @param {number} totalConcepts - Número total de conceptos
   * @returns {number} - Valor de importancia (0-1)
   * @private
   */
  _calculateImportance(level, totalConcepts) {
    const maxLevel = Math.min(5, totalConcepts);
    const invertedLevel = Math.max(1, maxLevel - level + 1);
    return Math.max(0.1, Math.min(0.9, invertedLevel / maxLevel));
  }
  
  /**
   * Aplica optimización espacial de Penrose a los conceptos
   * @param {Array} concepts - Conceptos a optimizar
   * @param {Object} hierarchyData - Datos de jerarquía
   * @returns {Array} - Conceptos optimizados
   * @private
   */
  _applyPenroseOptimization(concepts, hierarchyData) {
    // Esta es una simulación de la aplicación de Penrose
    // En una implementación real, se invocaría a la biblioteca Penrose
    
    // Asignar coordenadas iniciales basadas en jerarquía
    const width = 1000;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const rootIds = hierarchyData.roots || [];
    const maxLevel = Math.max(...concepts.map(c => c.hierarchyLevel || 1));
    
    // Posicionar conceptos en círculos concéntricos según su nivel
    for (const concept of concepts) {
      const level = concept.hierarchyLevel || 1;
      const radius = (centerY * 0.7) * (level / maxLevel);
      
      // Calcular posición angular
      const isRoot = rootIds.includes(concept.id);
      const angle = isRoot ? 
        (rootIds.indexOf(concept.id) / rootIds.length) * 2 * Math.PI : 
        (concepts.indexOf(concept) / concepts.length) * 2 * Math.PI;
      
      // Asignar coordenadas
      concept.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        level: level
      };
      
      // Asignar tamaño basado en importancia
      concept.size = 30 + (concept.importance * 20);
    }
    
    // Aplicar ajustes para evitar solapamientos (simplificado)
    // En una implementación real, aquí se aplicaría el algoritmo de Penrose
    
    return concepts;
  }
  
  /**
   * Aplica optimización de LangGraph a la estructura conceptual
   * @param {Array} concepts - Conceptos a optimizar
   * @param {string} text - Texto original
   * @returns {Array} - Conceptos optimizados
   * @private
   */
  _applyLangGraphOptimization(concepts, text) {
    // Simulación de LangGraph - en una implementación real se usaría la biblioteca
    
    // Detectar conceptos que podrían fusionarse o dividirse
    const improvedConcepts = [...concepts];
    
    for (let i = 0; i < improvedConcepts.length; i++) {
      const concept = improvedConcepts[i];
      
      // Enriquecer descripción si es muy corta
      if (concept.description && concept.description.length < 20) {
        const contextInText = this._findConceptContext(concept.name, text);
        if (contextInText && contextInText.length > concept.description.length) {
          concept.description = contextInText;
        }
      }
      
      // Añadir identificador de categoría si es detectable
      if (!concept.category) {
        concept.category = this._inferConceptCategory(concept, text);
      }
    }
    
    return improvedConcepts;
  }
  
  /**
   * Encuentra palabras asociadas a un concepto en el texto
   * @param {string} conceptName - Nombre del concepto
   * @param {string} text - Texto original
   * @returns {Array<string>} - Palabras asociadas
   * @private
   */
  _findAssociatedWords(conceptName, text) {
    // Implementación simplificada
    const words = [];
    const contextSize = 10; // Palabras antes y después
    
    // Encontrar instancias del concepto en el texto
    const conceptRegex = new RegExp(`\\b${conceptName}\\b`, 'i');
    const match = text.match(conceptRegex);
    
    if (match) {
      const matchIndex = match.index;
      
      // Extraer contexto alrededor
      const before = text && matchIndex ? text.substring(0, matchIndex).split(/\s+/).slice(-contextSize) : [];
      const after = text && matchIndex !== undefined ? text.substring(matchIndex + (conceptName?.length || 0)).split(/\s+/).slice(0, contextSize) : [];
      
      // Filtrar palabras significativas
      const significantWords = [...before, ...after].filter(word => 
        word.length > 3 && 
        !['para', 'como', 'entre', 'sobre', 'desde', 'hacia', 'según', 'mediante'].includes(word.toLowerCase())
      );
      
      // Tomar hasta 5 palabras asociadas
      words.push(...significantWords.slice(0, 5));
    }
    
    return words;
  }
  
  /**
   * Encuentra el contexto de un concepto en el texto
   * @param {string} conceptName - Nombre del concepto
   * @param {string} text - Texto original
   * @returns {string} - Contexto encontrado
   * @private
   */
  _findConceptContext(conceptName, text) {
    // Buscar una oración que contenga el concepto
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(conceptName.toLowerCase())) {
        return sentence.trim();
      }
    }
    
    return '';
  }
  
  /**
   * Infiere una categoría para un concepto
   * @param {Object} concept - Concepto a categorizar
   * @param {string} text - Texto original
   * @returns {string} - Categoría inferida
   * @private
   */
  _inferConceptCategory(concept, text) {
    // Categorías comunes
    const categories = [
      {name: 'proceso', keywords: ['proceso', 'etapa', 'fase', 'paso', 'método', 'procedimiento']},
      {name: 'teoría', keywords: ['teoría', 'modelo', 'paradigma', 'enfoque', 'perspectiva']},
      {name: 'herramienta', keywords: ['herramienta', 'técnica', 'instrumento', 'recurso', 'método']},
      {name: 'concepto', keywords: ['concepto', 'término', 'idea', 'noción', 'principio']},
      {name: 'entidad', keywords: ['entidad', 'objeto', 'elemento', 'componente', 'parte']}
    ];
    
    // Buscar coincidencias en la descripción o contexto
    const context = concept.description || this._findConceptContext(concept.name, text);
    
    for (const category of categories) {
      for (const keyword of category.keywords) {
        if (context.toLowerCase().includes(keyword)) {
          return category.name;
        }
      }
    }
    
    return 'general';
  }
  
  /**
   * Cuenta los niveles de jerarquía en los conceptos
   * @param {Array} concepts - Conceptos a analizar
   * @returns {Object} - Estadísticas de niveles
   * @private
   */
  _countHierarchyLevels(concepts) {
    const levels = concepts.map(c => c.hierarchyLevel || 1);
    const maxLevel = Math.max(...levels);
    const levelCounts = {};
    
    for (let i = 1; i <= maxLevel; i++) {
      levelCounts[i] = levels.filter(level => level === i).length;
    }
    
    return {
      max: maxLevel,
      counts: levelCounts
    };
  }
  
  /**
   * Genera conceptos de respaldo cuando falla la extracción normal
   * @param {string} text - Texto original
   * @returns {Array} - Lista de conceptos básicos
   * @private
   */
  _generateFallbackConcepts(text) {
    console.log('Generando conceptos de respaldo');
    
    // Extraer palabras del texto para generar conceptos básicos
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[.,;:!?()[\]{}'"]/g, ''))
      .filter(word => !/^\d+$/.test(word)); // Excluir números
    
    // Eliminar duplicados y palabras muy comunes en español
    const commonWords = ['para', 'como', 'esto', 'esta', 'estos', 'estas', 'pero', 'porque'];
    const uniqueWords = [...new Set(words)]
      .filter(word => !commonWords.includes(word.toLowerCase()));
    
    // Tomar solo las primeras palabras únicas (máximo 20)
    const selectedWords = uniqueWords.slice(0, 20);
    
    // Crear conceptos a partir de las palabras
    const concepts = selectedWords.map((word, index) => {
      return {
        id: `concept_${index + 1}`,
        name: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        importance: 1 - (index * 0.05),
        hierarchyLevel: index < 3 ? 0 : index < 10 ? 1 : 2,
        originalForm: word,
        childrenIds: index < 5 ? [
          `concept_${Math.min(index + 5, selectedWords.length - 1)}`,
          `concept_${Math.min(index + 7, selectedWords.length - 1)}`
        ] : []
      };
    });
    
    return concepts;
  }
}

module.exports = OrganizationModule; 