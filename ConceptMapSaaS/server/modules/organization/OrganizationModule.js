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
    console.log('Utilizando extracción avanzada de conceptos');
    
    // Partir el texto en oraciones y palabras
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Estrategia 1: Extraer palabras individuales frecuentes
    const allWords = text.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[.,;:!?()[\]{}'"]/g, ''));
    
    // Contar frecuencia de palabras
    const wordCount = {};
    for (const word of allWords) {
      const lowerWord = word.toLowerCase();
      wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
    }
    
    // Estrategia 2: Extraer frases compuestas y términos multi-palabra
    const ngramCandidates = this._extractNgrams(sentences, 2, 4);
    
    // Estrategia 3: Identificar sujetos y objetos de oraciones (análisis sintáctico básico)
    const syntacticElements = this._extractSyntacticElements(sentences);
    
    // Combinar resultados de las distintas estrategias
    const uniqueConcepts = new Map();
    
    // Agregar palabras individuales frecuentes
    const sortedWords = Object.entries(wordCount)
      .filter(([word]) => !/^\d+$/.test(word)) // Excluir números
      .sort((a, b) => b[1] - a[1]); // Ordenar por frecuencia
    
    // Seleccionar el 60% del máximo de conceptos para palabras simples
    const maxSingleWords = Math.floor((options.maxConcepts || 20) * 0.6);
    sortedWords.slice(0, maxSingleWords).forEach(([word, count]) => {
      const conceptId = `concept_${uniqueConcepts.size + 1}`;
      uniqueConcepts.set(word, {
        id: conceptId,
        name: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        frequency: count,
        type: 'word',
        importance: count / sortedWords[0][1] // Normalizar por la palabra más frecuente
      });
    });
    
    // Agregar frases compuestas
    const sortedNgrams = Array.from(ngramCandidates.entries())
      .sort((a, b) => b[1].score - a[1].score);
    
    // Seleccionar el 30% para n-gramas
    const maxNgrams = Math.floor((options.maxConcepts || 20) * 0.3);
    sortedNgrams.slice(0, maxNgrams).forEach(([phrase, data]) => {
      if (!uniqueConcepts.has(phrase.toLowerCase())) {
        const conceptId = `concept_${uniqueConcepts.size + 1}`;
        uniqueConcepts.set(phrase.toLowerCase(), {
          id: conceptId,
          name: phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
          frequency: data.count,
          type: 'phrase',
          importance: 0.7 + (data.score / sortedNgrams[0][1].score) * 0.3, // Priorizar frases
          context: data.context
        });
      }
    });
    
    // Agregar elementos sintácticos significativos
    const sortedSyntactic = syntacticElements
      .sort((a, b) => b.score - a.score);
    
    // Seleccionar el 10% para elementos sintácticos
    const maxSyntactic = Math.floor((options.maxConcepts || 20) * 0.1);
    sortedSyntactic.slice(0, maxSyntactic).forEach(element => {
      const lowercaseElement = element.text.toLowerCase();
      if (!uniqueConcepts.has(lowercaseElement)) {
        const conceptId = `concept_${uniqueConcepts.size + 1}`;
        uniqueConcepts.set(lowercaseElement, {
          id: conceptId,
          name: element.text.charAt(0).toUpperCase() + element.text.slice(1).toLowerCase(),
          frequency: element.count,
          type: element.type,
          importance: 0.8, // Alta importancia para elementos sintácticos
          role: element.role,
          context: element.context
        });
      }
    });
    
    // Limitar al máximo de conceptos especificado
    const maxConcepts = options.maxConcepts || 20;
    let conceptsArray = Array.from(uniqueConcepts.values()).slice(0, maxConcepts);
    
    // Enriquecer conceptos con descripciones e información contextual
    conceptsArray = conceptsArray.map(concept => {
      // Buscar contexto en las oraciones
      const relevantSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(concept.name.toLowerCase())
      );
      
      // Crear descripción a partir del contexto
      const description = relevantSentences.length > 0 
        ? relevantSentences[0].trim()
        : `Concepto relacionado con "${concept.name}"`;
      
      // Detectar definiciones explícitas
      const definitionSentence = this._findDefinitionSentence(relevantSentences, concept.name);
      
      // Encontrar posibles relaciones con otros conceptos
      const relatedConceptIds = this._findPotentialRelationships(concept, conceptsArray, sentences);
      
      // Determinar jerarquía basada en co-ocurrencia y patrones lingüísticos
      const hierarchyRelation = this._detectHierarchyRelations(concept, conceptsArray, sentences);
      
      return {
        ...concept,
        description: definitionSentence || description,
        category: this._inferSimpleCategory(concept.name, relevantSentences),
        childrenIds: relatedConceptIds,
        hierarchyRelation,
        originalForm: concept.name.toLowerCase(),
        // Determinar nivel jerárquico preliminar basado en el tipo y las relaciones
        hierarchyLevel: hierarchyRelation === 'parent' ? 0 : 
                       hierarchyRelation === 'child' ? 2 : 1
      };
    });
    
    // Identificar el concepto principal (tema del texto)
    const mainConcept = this._identifyMainConcept(conceptsArray, paragraphs);
    if (mainConcept) {
      // Marcar el concepto principal
      const mainConceptIndex = conceptsArray.findIndex(c => c.id === mainConcept.id);
      if (mainConceptIndex >= 0) {
        conceptsArray[mainConceptIndex] = {
          ...conceptsArray[mainConceptIndex],
          isMainConcept: true,
          importance: 1.0, // Máxima importancia
          hierarchyLevel: 0 // Nivel superior en la jerarquía
        };
      }
      
      // Reorganizar para que el concepto principal esté al principio
      if (mainConceptIndex > 0) {
        const [main] = conceptsArray.splice(mainConceptIndex, 1);
        conceptsArray = [main, ...conceptsArray];
      }
    }
    
    return conceptsArray;
  }
  
  /**
   * Extrae n-gramas (frases de múltiples palabras) del texto
   * @param {Array} sentences - Oraciones del texto
   * @param {number} minSize - Tamaño mínimo del n-grama
   * @param {number} maxSize - Tamaño máximo del n-grama
   * @returns {Map} - Mapa de n-gramas con su puntuación
   * @private
   */
  _extractNgrams(sentences, minSize = 2, maxSize = 4) {
    const ngrams = new Map();
    const stopWords = ['de', 'la', 'el', 'en', 'y', 'a', 'que', 'los', 'del', 'las', 'un', 'por', 'con', 'una', 'su', 'para'];
    
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/).map(w => w.toLowerCase().replace(/[.,;:!?()[\]{}'"]/g, ''));
      
      // Generar n-gramas de diferentes tamaños
      for (let size = minSize; size <= maxSize; size++) {
        for (let i = 0; i <= words.length - size; i++) {
          const ngram = words.slice(i, i + size).join(' ');
          
          // Filtrar n-gramas que comienzan o terminan con stopwords
          if (stopWords.includes(words[i]) || stopWords.includes(words[i + size - 1])) {
            continue;
          }
          
          // Filtrar n-gramas demasiado cortos o que no tienen sentido
          if (ngram.length < 5) {
            continue;
          }
          
          // Actualizar el contador y contexto
          if (ngrams.has(ngram)) {
            const data = ngrams.get(ngram);
            data.count++;
            // Actualizar puntuación basada en frecuencia y longitud
            data.score = data.count * (size / maxSize + 0.5);
            // Guardar contexto si es mejor que el anterior
            if (sentence.length > data.context.length) {
              data.context = sentence;
            }
          } else {
            ngrams.set(ngram, {
              count: 1,
              size,
              score: 1 * (size / maxSize + 0.5), // Favorecer ligeramente n-gramas más largos
              context: sentence
            });
          }
        }
      }
    });
    
    return ngrams;
  }
  
  /**
   * Extrae elementos sintácticos clave de las oraciones
   * @param {Array} sentences - Oraciones del texto
   * @returns {Array} - Elementos sintácticos identificados
   * @private
   */
  _extractSyntacticElements(sentences) {
    const elements = [];
    const elementCount = new Map();
    
    // Patrones simples para identificar elementos sintácticos
    const subjectPatterns = [
      /^(.+?)(es|son|está|están|puede|pueden|debe|deben|ha|han|tiene|tienen)/i,
      /(.+?)(se define como)/i,
      /(.+?)(se refiere a)/i
    ];
    
    const objectPatterns = [
      /(se conoce|se denomina|se llama|es conocido como)(.+?)$/i,
      /(consiste en|consta de|incluye a|contiene|abarca)(.+?)$/i
    ];
    
    sentences.forEach(sentence => {
      // Buscar sujetos
      for (const pattern of subjectPatterns) {
        const match = sentence.match(pattern);
        if (match && match[1]) {
          const subject = match[1].trim();
          if (subject.length > 3 && subject.split(/\s+/).length <= 4) {
            const key = subject.toLowerCase();
            elementCount.set(key, (elementCount.get(key) || 0) + 1);
            elements.push({
              text: subject,
              type: 'subject',
              role: 'concept',
              count: elementCount.get(key),
              score: elementCount.get(key) * 1.5, // Mayor peso a sujetos
              context: sentence
            });
          }
        }
      }
      
      // Buscar objetos
      for (const pattern of objectPatterns) {
        const match = sentence.match(pattern);
        if (match && match[2]) {
          const object = match[2].trim();
          if (object.length > 3 && object.split(/\s+/).length <= 4) {
            const key = object.toLowerCase();
            elementCount.set(key, (elementCount.get(key) || 0) + 1);
            elements.push({
              text: object,
              type: 'object',
              role: 'definition',
              count: elementCount.get(key),
              score: elementCount.get(key) * 1.2, // Peso a objetos
              context: sentence
            });
          }
        }
      }
    });
    
    // Eliminar duplicados manteniendo la mejor puntuación
    const uniqueElements = [];
    const seen = new Set();
    
    elements.forEach(element => {
      const key = `${element.text.toLowerCase()}_${element.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueElements.push(element);
      }
    });
    
    return uniqueElements;
  }
  
  /**
   * Encuentra una oración que defina explícitamente el concepto
   * @param {Array} sentences - Oraciones relevantes
   * @param {string} conceptName - Nombre del concepto
   * @returns {string|null} - Oración de definición encontrada o null
   * @private
   */
  _findDefinitionSentence(sentences, conceptName) {
    // Patrones de definición
    const definitionPatterns = [
      new RegExp(`${conceptName}\\s+(es|son|está|están|se define como|significa|representa)`, 'i'),
      new RegExp(`(el|la|los|las)\\s+${conceptName}\\s+(es|son|está|están|se define como|significa|representa)`, 'i'),
      new RegExp(`(se entiende por|se denomina|se conoce como)\\s+${conceptName}`, 'i')
    ];
    
    for (const sentence of sentences) {
      for (const pattern of definitionPatterns) {
        if (pattern.test(sentence)) {
          return sentence.trim();
        }
      }
    }
    
    return null;
  }
  
  /**
   * Identifica relaciones potenciales entre conceptos
   * @param {Object} concept - Concepto principal
   * @param {Array} allConcepts - Todos los conceptos extraídos
   * @param {Array} sentences - Oraciones del texto
   * @returns {Array} - IDs de conceptos relacionados
   * @private
   */
  _findPotentialRelationships(concept, allConcepts, sentences) {
    const relatedIds = [];
    const conceptName = concept.name.toLowerCase();
    
    // Encontrar co-ocurrencias en oraciones
    const conceptOccurrences = sentences.filter(sentence => 
      sentence.toLowerCase().includes(conceptName)
    );
    
    allConcepts.forEach(otherConcept => {
      // Evitar relaciones reflexivas
      if (otherConcept.id === concept.id) return;
      
      const otherName = otherConcept.name.toLowerCase();
      let relationStrength = 0;
      
      // Verificar co-ocurrencia en las mismas oraciones
      conceptOccurrences.forEach(sentence => {
        if (sentence.toLowerCase().includes(otherName)) {
          relationStrength += 1;
        }
      });
      
      // Verificar si hay una relación jerárquica (contenido léxico)
      if (conceptName.includes(otherName) || otherName.includes(conceptName)) {
        relationStrength += 2;
      }
      
      // Si hay suficiente evidencia de relación, agregar a la lista
      if (relationStrength >= 1) {
        relatedIds.push(otherConcept.id);
      }
    });
    
    // Limitar a máximo 5 relaciones
    return relatedIds.slice(0, 5);
  }
  
  /**
   * Detecta relaciones jerárquicas entre conceptos
   * @param {Object} concept - Concepto a analizar
   * @param {Array} allConcepts - Todos los conceptos
   * @param {Array} sentences - Oraciones del texto
   * @returns {string} - Tipo de relación: 'parent', 'child' o 'sibling'
   * @private
   */
  _detectHierarchyRelations(concept, allConcepts, sentences) {
    const conceptName = concept.name.toLowerCase();
    
    // Buscar patrones explícitos de jerarquía
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Patrones donde el concepto es un padre (más general)
      const parentPatterns = [
        `${conceptName} incluye`,
        `${conceptName} contiene`,
        `${conceptName} abarca`,
        `${conceptName} comprende`,
        `tipos de ${conceptName}`,
        `clases de ${conceptName}`,
        `${conceptName} se divide en`
      ];
      
      // Patrones donde el concepto es un hijo (más específico)
      const childPatterns = [
        `parte de ${conceptName}`,
        `incluido en ${conceptName}`,
        `pertenece a ${conceptName}`,
        `tipo de ${conceptName}`,
        `clase de ${conceptName}`,
        `${conceptName} es un tipo de`,
        `${conceptName} es una clase de`
      ];
      
      // Verificar patrones de padre
      for (const pattern of parentPatterns) {
        if (lowerSentence.includes(pattern)) {
          return 'parent';
        }
      }
      
      // Verificar patrones de hijo
      for (const pattern of childPatterns) {
        if (lowerSentence.includes(pattern)) {
          return 'child';
        }
      }
    }
    
    // Si no hay patrones explícitos, usar heurísticas
    // Por ejemplo, conceptos más cortos tienden a ser más generales (padres)
    if (concept.type === 'word' && concept.frequency > 10) {
      return 'parent';
    }
    
    // Los conceptos más complejos tienden a ser más específicos (hijos)
    if (concept.type === 'phrase' && conceptName.split(' ').length > 2) {
      return 'child';
    }
    
    // Por defecto, considerar como hermano (mismo nivel)
    return 'sibling';
  }
  
  /**
   * Identifica el concepto principal/tema del texto
   * @param {Array} concepts - Conceptos extraídos
   * @param {Array} paragraphs - Párrafos del texto
   * @returns {Object|null} - Concepto principal o null
   * @private
   */
  _identifyMainConcept(concepts, paragraphs) {
    // Estrategia 1: Buscar conceptos mencionados en el primer párrafo
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0].toLowerCase();
      const candidatesInFirst = concepts.filter(concept => 
        firstParagraph.includes(concept.name.toLowerCase())
      );
      
      if (candidatesInFirst.length > 0) {
        // Preferir conceptos con mayor frecuencia entre los del primer párrafo
        return candidatesInFirst.sort((a, b) => b.frequency - a.frequency)[0];
      }
    }
    
    // Estrategia 2: Concepto más frecuente y con más relaciones
    return concepts
      .map(concept => ({
        ...concept,
        score: (concept.frequency || 0) * 2 + (concept.childrenIds?.length || 0) * 3
      }))
      .sort((a, b) => b.score - a.score)[0] || null;
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
    
    // Asegurarnos de que tenemos al menos un concepto raíz
    if (rootIds.length === 0 && concepts.length > 0) {
      // Si no hay raíces definidas, usar el primer concepto como raíz
      rootIds.push(concepts[0].id);
    }
    
    // Función recursiva para asignar niveles
    const assignLevel = (conceptId, level = 1, path = []) => {
      // Evitar ciclos
      if (path.includes(conceptId)) return;
      
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) return;
      
      // Asignar nivel
      concept.hierarchyLevel = level;
      
      hierarchyMap.set(conceptId, level);
      
      // Procesar hijos - buscar explícitamente en childrenIds y también en relaciones
      let children = concept.childrenIds || [];
      
      // Buscar más hijos en las relaciones entre conceptos (si existen)
      const hierarchicalRelTypes = ['contiene', 'incluye', 'compuesto por', 'tiene', 'parte de', 'tipo de'];
      const additionalChildren = [];
      
      if (hierarchyData.relationships) {
        hierarchyData.relationships.forEach(rel => {
          if (rel.sourceId === conceptId && 
              hierarchicalRelTypes.some(type => rel.type && rel.type.toLowerCase().includes(type))) {
            if (!children.includes(rel.targetId)) {
              additionalChildren.push(rel.targetId);
            }
          }
        });
      }
      
      children = [...children, ...additionalChildren];
      
      // Si no hay hijos explícitos, intentar inferir basado en similaridad
      if (children.length === 0) {
        // Intentar encontrar conceptos relacionados que podrían ser hijos
        const potentialChildren = concepts.filter(c => 
          c.id !== conceptId && 
          !hierarchyMap.has(c.id) && 
          this._areConceptsRelated(concept, c)
        );
        
        // Limitar a máximo 5 hijos inferidos para evitar una estructura demasiado ancha
        children = potentialChildren.slice(0, 5).map(c => c.id);
      }
      
      // Actualizar concepto con los hijos encontrados
      concept.childrenIds = children;
      
      const newPath = [...path, conceptId];
      
      // Procesar cada hijo recursivamente
      for (const childId of children) {
        assignLevel(childId, level + 1, newPath);
      }
    };
    
    // Asignar niveles comenzando por las raíces
    for (const rootId of rootIds) {
      assignLevel(rootId, 1, []);
    }
    
    // Asegurar que todos los conceptos tengan un nivel
    let unassignedConcepts = concepts.filter(c => !c.hierarchyLevel);
    
    // Asignar conceptos no asignados a niveles adecuados
    if (unassignedConcepts.length > 0) {
      console.log(`Asignando ${unassignedConcepts.length} conceptos sin nivel jerárquico`);
      
      // Asignar niveles a conceptos huérfanos
      let currentLevel = 2; // Empezar en nivel 2 (después de las raíces)
      
      while (unassignedConcepts.length > 0 && currentLevel <= 5) {
        const conceptsForThisLevel = Math.ceil(unassignedConcepts.length / (6 - currentLevel));
        
        // Tomar los N conceptos para este nivel
        const batch = unassignedConcepts.splice(0, conceptsForThisLevel);
        
        // Asignar nivel
        batch.forEach(concept => {
          concept.hierarchyLevel = currentLevel;
        });
        
        currentLevel++;
      }
      
      // Si quedan conceptos sin asignar, ponerlos en el último nivel
      unassignedConcepts.forEach(concept => {
        concept.hierarchyLevel = currentLevel - 1;
      });
    }
    
    // Calcular y asignar importancia basada en nivel jerárquico
    for (const concept of concepts) {
      // Niveles más bajos (más cercanos a la raíz) son más importantes
      const importanceValue = this._calculateImportance(concept.hierarchyLevel, concepts.length);
      
      if (importanceValue > 0.7) {
        concept.importance = 'high';
      } else if (importanceValue > 0.4) {
        concept.importance = 'medium';
      } else {
        concept.importance = 'low';
      }
    }
    
    return concepts;
  }
  
  /**
   * Determina si dos conceptos están relacionados semánticamente
   * @param {Object} concept1 - Primer concepto
   * @param {Object} concept2 - Segundo concepto
   * @returns {boolean} - Verdadero si están relacionados
   * @private
   */
  _areConceptsRelated(concept1, concept2) {
    // Comprobar si los nombres son similares
    if (concept1.name.toLowerCase().includes(concept2.name.toLowerCase()) || 
        concept2.name.toLowerCase().includes(concept1.name.toLowerCase())) {
      return true;
    }
    
    // Comprobar si comparten categoría
    if (concept1.category && concept2.category && 
        concept1.category === concept2.category) {
      return true;
    }
    
    // Comprobar similitud en descripciones si existen
    if (concept1.description && concept2.description) {
      const words1 = concept1.description.toLowerCase().split(/\s+/);
      const words2 = concept2.description.toLowerCase().split(/\s+/);
      
      // Contar palabras comunes
      const commonWords = words1.filter(word => 
        word.length > 3 && words2.includes(word)
      );
      
      if (commonWords.length >= 2) {
        return true;
      }
    }
    
    return false;
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