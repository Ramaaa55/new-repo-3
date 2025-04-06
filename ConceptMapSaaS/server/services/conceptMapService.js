/**
 * Servicio de Generación de Mapas Conceptuales
 * 
 * Este servicio implementa el proceso de 6 etapas para la generación
 * de mapas conceptuales a partir de texto, siguiendo la arquitectura
 * descrita en la documentación.
 */

class ConceptMapService {
  /**
   * Procesa el texto y genera un mapa conceptual
   * @param {string} text - Texto de entrada
   * @param {Object} config - Configuración del procesamiento
   * @returns {Object} - Resultado del procesamiento
   */
  async processText(text, config = {}) {
    try {
      console.log('Iniciando procesamiento de texto...');
      
      // Configuración por defecto
      const defaultConfig = {
        maxConcepts: 20,
        style: 'educational',
        stages: {
          organization: true,
          reasoning: true,
          enrichment: true,
          validation: true,
          aesthetics: true,
          conclusion: true
        },
        includeExamples: true,
        includeDefinitions: true
      };
      
      // Combinar configuración por defecto con la proporcionada
      config = { ...defaultConfig, ...config };
      
      // Objeto para almacenar el resultado
      const result = {
        concepts: [],
        relationships: [],
        metadata: {
          processedAt: new Date().toISOString(),
          textLength: text.length,
          conceptCount: 0,
          relationshipCount: 0,
          stageResults: {}
        }
      };
      
      // Etapa 1: Organización y Jerarquización
      if (config.stages.organization) {
        console.log('Ejecutando Etapa 1: Organización y Jerarquización');
        await this.step1_OrganizeAndHierarchize(text, result);
        result.metadata.stageResults.organization = {
          completedAt: new Date().toISOString(),
          conceptsExtracted: result.concepts.length
        };
      }
      
      // Etapa 2: Análisis de Relaciones
      if (config.stages.reasoning) {
        console.log('Ejecutando Etapa 2: Análisis de Relaciones');
        await this.step2_AnalyzeRelationships(text, result);
        result.metadata.stageResults.reasoning = {
          completedAt: new Date().toISOString(),
          relationshipsIdentified: result.relationships.length
        };
      }
      
      // Etapa 3: Enriquecimiento Semántico
      if (config.stages.enrichment) {
        console.log('Ejecutando Etapa 3: Enriquecimiento Semántico');
        await this.step3_EnrichSemantically(text, result);
        result.metadata.stageResults.enrichment = {
          completedAt: new Date().toISOString(),
          definitionsAdded: result.concepts.filter(c => c.definition).length,
          examplesAdded: result.concepts.filter(c => c.examples && c.examples.length > 0).length
        };
      }
      
      // Etapa 4: Validación y Verificación
      if (config.stages.validation) {
        console.log('Ejecutando Etapa 4: Validación y Verificación');
        await this.step4_VerifyAndValidate(result);
        result.metadata.stageResults.validation = {
          completedAt: new Date().toISOString(),
          coherenceScore: result.metadata.coherenceScore || 0,
          conceptsRemoved: result.metadata.conceptsRemoved || 0,
          relationshipsRemoved: result.metadata.relationshipsRemoved || 0
        };
      }
      
      // Etapa 5: Estética Adaptativa
      if (config.stages.aesthetics) {
        console.log('Ejecutando Etapa 5: Estética Adaptativa');
        await this.step5_OptimizeVisualPresentation(result, config);
        result.metadata.stageResults.aesthetics = {
          completedAt: new Date().toISOString(),
          visualStyle: config.style,
          formatAttributesApplied: result.concepts.filter(c => c.formatting).length
        };
      }
      
      // Etapa 6: Conclusión Descriptiva
      if (config.stages.conclusion) {
        console.log('Ejecutando Etapa 6: Conclusión Descriptiva');
        result.metadata.summary = this.generateConceptualSummary(result);
        result.metadata.stageResults.conclusion = {
          completedAt: new Date().toISOString(),
          summaryLength: result.metadata.summary.length
        };
      }
      
      // Limitación de conceptos según configuración
      if (result.concepts.length > config.maxConcepts) {
        console.log(`Limitando a ${config.maxConcepts} conceptos de ${result.concepts.length} totales`);
        // Ordenar por importancia y tomar solo los primeros N
        result.concepts.sort((a, b) => b.importance - a.importance);
        const removedCount = result.concepts.length - config.maxConcepts;
        result.concepts = result.concepts.slice(0, config.maxConcepts);
        
        // Filtrar relaciones para mantener solo las que conectan conceptos existentes
        const conceptIds = new Set(result.concepts.map(c => c.id));
        const originalRelationships = result.relationships.length;
        result.relationships = result.relationships.filter(
          r => conceptIds.has(r.source) && conceptIds.has(r.target)
        );
        
        result.metadata.limitationApplied = {
          conceptsRemoved: removedCount,
          relationshipsRemoved: originalRelationships - result.relationships.length
        };
      }
      
      // Generar contenido del mapa en formato educativo
      result.content = this.generateEducationalConceptMap(result, config);
      
      // Actualización de metadatos
      result.metadata.conceptCount = result.concepts.length;
      result.metadata.relationshipCount = result.relationships.length;
      result.metadata.processingCompleted = new Date().toISOString();
      
      console.log(`Procesamiento completado: ${result.concepts.length} conceptos, ${result.relationships.length} relaciones`);
      return result;
    } catch (error) {
      console.error('Error en el procesamiento del texto:', error);
      throw error;
    }
  }

  /**
   * Paso 1: Organizar y Jerarquizar
   * Detecta y analiza los conceptos, arreglándolos lógicamente de general a específico
   */
  async step1_OrganizeAndHierarchize(text, result) {
    // Extraer conceptos principales y secundarios
    const mainConcepts = this.extractMainConcepts(text);
    
    // Ordenar conceptos por relevancia e importancia
    const sortedConcepts = this.sortConceptsByRelevance(mainConcepts);
    
    // Establecer jerarquía (crear estructura de árbol)
    const hierarchyTree = this.createHierarchicalStructure(sortedConcepts);
    
    // Guardar resultados
    result.concepts = sortedConcepts;
    result.hierarchy = hierarchyTree;
    
    return result;
  }

  /**
   * Paso 2: Analizar Relaciones
   * Aplica razonamiento para determinar conexiones significativas entre conceptos
   */
  async step2_AnalyzeRelationships(text, result) {
    // Identificar relaciones entre conceptos
    const relationships = this.identifyConceptRelationships(text, result.concepts);
    
    // Clasificar tipos de relaciones (causa-efecto, pertenencia, etc.)
    const typedRelationships = this.classifyRelationshipTypes(relationships);
    
    // Establecer fuerza de relaciones
    const weightedRelationships = this.assignRelationshipStrength(typedRelationships);
    
    // Guardar resultados
    result.relationships = weightedRelationships;
    result.knowledgeGraph = this.createKnowledgeGraph(result.concepts, weightedRelationships);
    
    return result;
  }

  /**
   * Paso 3: Enriquecer Semánticamente
   * Expande cada concepto con definiciones breves, ejemplos, sinónimos o clasificaciones
   */
  async step3_EnrichSemantically(text, result) {
    console.log(`Enriqueciendo semánticamente ${result.concepts.length} conceptos...`);
    
    // Enriquecer cada concepto con definiciones, ejemplos y términos relacionados
    result.concepts = result.concepts.map(concept => {
      // 1. Generar definición concisa para el concepto
      if (!concept.definition) {
        concept.definition = this.generateConciseDefinition(concept);
      }
      
      // 2. Encontrar ejemplos relevantes para conceptos importantes
      if (!concept.examples) {
        concept.examples = this.findRelevantExamples(concept);
      }
      
      // 3. Identificar términos relacionados o sinónimos
      if (!concept.relatedTerms) {
        concept.relatedTerms = this.identifyRelatedTerms(concept);
      }
      
      // 4. Clasificar el concepto en categorías
      if (!concept.classification) {
        concept.classification = this.classifyConcept(concept);
      }
      
      return concept;
    });
    
    // Calcular profundidad semántica del mapa conceptual
    const semanticDepth = result.concepts.reduce((total, concept) => {
      let depth = 0;
      if (concept.definition) depth += 1;
      if (concept.examples?.length) depth += concept.examples.length * 0.5;
      if (concept.relatedTerms?.length) depth += concept.relatedTerms.length * 0.3;
      return total + depth;
    }, 0) / Math.max(1, result.concepts.length);
    
    // Guardar metadatos del enriquecimiento semántico
    result.metadata.semanticDepth = parseFloat(semanticDepth.toFixed(2));
    result.metadata.enrichmentStats = {
      definitionsCount: result.concepts.filter(c => c.definition).length,
      examplesCount: result.concepts.reduce((total, c) => total + (c.examples?.length || 0), 0),
      relatedTermsCount: result.concepts.reduce((total, c) => total + (c.relatedTerms?.length || 0), 0)
    };
    
    console.log(`Enriquecimiento semántico completado. Profundidad semántica: ${result.metadata.semanticDepth}`);
  }

  /**
   * Paso 4: Verificar y Validar
   * Asegura coherencia y relevancia del mapa conceptual
   */
  async step4_VerifyAndValidate(result) {
    console.log(`Validando ${result.concepts.length} conceptos y ${result.relationships.length} relaciones...`);
    
    // Guardar conteos originales para los metadatos
    const originalConceptCount = result.concepts.length;
    const originalRelationshipCount = result.relationships.length;
    
    // 1. Filtrar conceptos irrelevantes según criterios de pertinencia
    const relevantConcepts = this.filterIrrelevantConcepts(result.concepts);
    
    // 2. Eliminar conceptos redundantes o similares
    const uniqueConcepts = this.removeRedundantConcepts(relevantConcepts);
    
    // Actualizar conceptos en el resultado
    result.concepts = uniqueConcepts;
    
    // 3. Validar la coherencia de relaciones entre conceptos
    result.relationships = this.validateRelationshipCoherence(result.relationships, result.concepts);
    
    // 4. Calcular puntuación de coherencia global del mapa
    const coherenceScore = this.calculateCoherenceScore(result.concepts, result.relationships);
    
    // Guardar metadatos de validación
    result.metadata.coherenceScore = parseFloat(coherenceScore.toFixed(2));
    result.metadata.conceptsRemoved = originalConceptCount - result.concepts.length;
    result.metadata.relationshipsRemoved = originalRelationshipCount - result.relationships.length;
    
    // Si la coherencia es muy baja, agregar advertencia
    if (coherenceScore < 0.5) {
      result.metadata.warnings = result.metadata.warnings || [];
      result.metadata.warnings.push({
        type: 'low_coherence',
        message: 'El mapa conceptual tiene baja coherencia. Considere refinar el texto de entrada.'
      });
    }
    
    console.log(`Validación completada. Coherencia: ${result.metadata.coherenceScore}. ` +
      `Se eliminaron ${result.metadata.conceptsRemoved} conceptos y ${result.metadata.relationshipsRemoved} relaciones.`);
  }

  /**
   * Paso 5: Optimizar Presentación Visual
   * Mejora la claridad y comprensión visual del mapa conceptual
   */
  async step5_OptimizeVisualPresentation(result, config) {
    console.log(`Optimizando presentación visual usando estilo '${config.style}'...`);
    
    // 1. Obtener la configuración visual educativa según el estilo
    const visualSettings = this.getEducationalVisualSettings(config.style);
    
    // 2. Asignar emojis relevantes a categorías de conceptos para mejorar reconocimiento visual
    result.conceptEmojis = this.assignRelevantEmojis(result.concepts);
    
    // 3. Aplicar formato a conceptos según su nivel e importancia
    result.concepts.forEach(concept => {
      // Inicializar objeto de formato si no existe
      concept.formatting = concept.formatting || {};
      
      // Conceptos principales o importantes en negrita
      if (concept.level === 0 || concept.importance > 4 || concept.isCritical) {
        concept.formatting.bold = true;
      }
      
      // Conceptos secundarios importantes subrayados
      if (concept.level === 1 && concept.importance > 3) {
        concept.formatting.underline = true;
      }
      
      // Asignar colores según nivel jerárquico
      const colorIndex = concept.level % visualSettings.colorPalette.length;
      concept.formatting.color = visualSettings.colorPalette[colorIndex];
      
      // Asignar tamaño de fuente según nivel jerárquico e importancia
      const fontKey = concept.level === 0 ? 'title' :
                     concept.level === 1 ? 'concept' :
                     concept.level === 2 ? 'subconcept' : 'detail';
      concept.formatting.font = visualSettings.fontOptions[fontKey];
      
      // Asignar padding según configuración
      concept.formatting.padding = visualSettings.spacing.nodePadding;
    });
    
    // 4. Aplicar estilo visual a relaciones según importancia
    result.relationships.forEach(relationship => {
      // Inicializar propiedades visuales
      relationship.visualWeight = relationship.visualWeight || 1;
      
      // Encontrar importancia de conceptos conectados
      const sourceImportance = result.concepts.find(c => c.id === relationship.source)?.importance || 1;
      const targetImportance = result.concepts.find(c => c.id === relationship.target)?.importance || 1;
      
      // Determinar peso visual de la relación basado en importancia
      const relationStrength = relationship.strength || 1;
      const avgImportance = (sourceImportance + targetImportance) / 2;
      relationship.visualWeight = Math.max(1, Math.min(3, Math.round((avgImportance + relationStrength) / 2)));
      
      // Determinar estilo de línea según peso visual
      relationship.lineStyle = relationship.visualWeight === 3 ? visualSettings.lineStyles.strong :
                              relationship.visualWeight === 2 ? visualSettings.lineStyles.medium :
                              visualSettings.lineStyles.light;
    });
    
    // 5. Crear un grafo de conocimiento optimizado para visualización
    result.knowledgeGraph = this.createKnowledgeGraph(result.concepts, result.relationships);
    
    console.log(`Optimización visual completada con estilo '${config.style}'`);
  }

  // Métodos auxiliares para Paso 1: Organizar y Jerarquizar

  /**
   * Extrae conceptos principales del texto
   * @param {string} text - Texto a analizar
   * @returns {Array} - Lista de conceptos
   */
  extractMainConcepts(text) {
    // Dividir el texto en oraciones y párrafos para un análisis estructurado
    const paragraphs = text.split(/\n+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Identificar palabras clave (en una implementación real esto usaría NLP)
    const words = text.split(/\s+/);
    const wordFrequency = {};
    
    // Calcular frecuencia de palabras
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-záéíóúüñ\w]/g, '');
      if (cleanWord.length > 3) { // Ignorar palabras muy cortas
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    // Filtrar palabras comunes y ordenar por frecuencia
    const commonWords = ['para', 'como', 'esto', 'este', 'esta', 'estos', 'estas', 'pero', 'porque'];
    const sortedWords = Object.keys(wordFrequency)
      .filter(word => !commonWords.includes(word))
      .sort((a, b) => wordFrequency[b] - wordFrequency[a]);
    
    // Crear conceptos a partir de palabras clave
    const concepts = sortedWords.slice(0, 15).map((word, index) => {
      // Determinar importancia basada en frecuencia y posición
      const importance = (wordFrequency[word] / words.length * 100) + (15 - index) / 3;
      
      // Determinar nivel jerárquico inicial
      // Conceptos muy importantes (top 3) van al nivel 0
      // Los siguientes 5 al nivel 1, y el resto al nivel 2
      const level = index < 3 ? 0 : (index < 8 ? 1 : 2);
      
      // Crear objeto concepto con metadatos
      return {
        id: `concept-${index}`,
        name: word,
        originalForm: this.findOriginalForm(word, text), // Preserva mayúsculas/minúsculas originales
        importance: Math.min(importance, 6), // Escala de 1-6
        frequency: wordFrequency[word],
        level,
        firstOccurrence: text.toLowerCase().indexOf(word.toLowerCase()),
        isCritical: index < 5 // Los 5 conceptos más importantes son críticos
      };
    });
    
    return concepts;
  }

  /**
   * Encuentra la forma original de una palabra en el texto (respetando mayúsculas/minúsculas)
   * @param {string} word - Palabra normalizada
   * @param {string} text - Texto original
   * @returns {string} - Forma original de la palabra
   */
  findOriginalForm(word, text) {
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'i');
    const match = text.match(regex);
    return match ? match[0] : word;
  }

  /**
   * Ordena conceptos por relevancia e importancia
   * @param {Array} concepts - Lista de conceptos sin ordenar
   * @returns {Array} - Conceptos ordenados
   */
  sortConceptsByRelevance(concepts) {
    // Primero ordenamos por nivel (los más generales primero)
    const sortedByLevel = [...concepts].sort((a, b) => a.level - b.level);
    
    // Luego, dentro de cada nivel, ordenamos por importancia
    const levels = {};
    sortedByLevel.forEach(concept => {
      if (!levels[concept.level]) levels[concept.level] = [];
      levels[concept.level].push(concept);
    });
    
    // Ordenar cada nivel por importancia
    Object.keys(levels).forEach(level => {
      levels[level].sort((a, b) => b.importance - a.importance);
    });
    
    // Aplanar de nuevo la estructura
    return Object.keys(levels).sort().flatMap(level => levels[level]);
  }

  /**
   * Crea una estructura jerárquica de árbol a partir de conceptos
   * @param {Array} concepts - Lista de conceptos ordenados
   * @returns {Object} - Estructura jerárquica de árbol
   */
  createHierarchicalStructure(concepts) {
    // Agrupar conceptos por nivel
    const levels = {};
    concepts.forEach(concept => {
      if (!levels[concept.level]) levels[concept.level] = [];
      levels[concept.level].push(concept);
    });
    
    // Obtener conceptos raíz (nivel 0)
    const rootConcepts = levels[0] || [];
    
    // Crear estructura de árbol con relaciones padre-hijo explícitas
    const hierarchyTree = {
      nodes: concepts,
      root: rootConcepts.map(root => ({
        id: root.id,
        name: root.originalForm || root.name,
        importance: root.importance,
        level: root.level,
        children: this.buildConceptChildren(root, concepts)
      }))
    };
    
    return hierarchyTree;
  }

  /**
   * Construye la estructura jerárquica de hijos para un concepto
   * @param {Object} parent - Concepto padre
   * @param {Array} allConcepts - Todos los conceptos disponibles
   * @returns {Array} - Árbol de hijos para este concepto
   */
  buildConceptChildren(parent, allConcepts) {
    // Encontrar conceptos que deberían ser hijos de este padre
    const children = allConcepts.filter(concept => 
      // Debe ser exactamente un nivel inferior al padre
      concept.level === parent.level + 1 &&
      // Y debemos tener algún criterio de relación semántica
      // En una implementación real, esto se haría con NLP
      // Para esta demo, usamos una heurística simplificada
      concept.firstOccurrence > parent.firstOccurrence
    );
    
    // Limitar el número de hijos directos (máximo 4 por nodo)
    const limitedChildren = children.slice(0, 4);
    
    // Construir recursivamente el árbol
    return limitedChildren.map(child => ({
      id: child.id,
      name: child.originalForm || child.name,
      importance: child.importance,
      level: child.level,
      // Construir los hijos de este hijo si no está en el nivel más bajo
      children: child.level < 2 ? this.buildConceptChildren(child, allConcepts) : []
    }));
  }

  // Métodos auxiliares para Paso 2: Analizar Relaciones

  /**
   * Identifica relaciones entre conceptos basadas en el texto
   * @param {string} text - Texto original
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Lista de relaciones
   */
  identifyConceptRelationships(text, concepts) {
    const relationships = [];
    
    // Obtener oraciones para analizar relaciones
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Para cada concepto, buscar otros conceptos que aparezcan en las mismas oraciones
    concepts.forEach(source => {
      // Encontrar oraciones que contienen este concepto
      const relevantSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(source.name.toLowerCase())
      );
      
      // Buscar otros conceptos en estas oraciones
      concepts.forEach(target => {
        // Evitar auto-relaciones
        if (source.id === target.id) return;
        
        // Contar cuántas oraciones contienen ambos conceptos
        const sharedSentences = relevantSentences.filter(sentence => 
          sentence.toLowerCase().includes(target.name.toLowerCase())
        ).length;
        
        // Si hay oraciones compartidas, crear una relación
        if (sharedSentences > 0) {
          relationships.push({
            id: `rel-${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            // Por ahora dejamos el tipo genérico, lo clasificaremos en el siguiente paso
            type: 'relacionado con',
            strength: Math.min(sharedSentences + 1, 5), // Escala de fuerza 1-5
            sharedSentences
          });
        }
      });
    });
    
    return relationships;
  }

  /**
   * Clasifica los tipos de relaciones entre conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Array} - Relaciones con tipos clasificados
   */
  classifyRelationshipTypes(relationships) {
    // Tipos de relaciones comunes en mapas conceptuales
    const relationTypes = [
      { name: 'es parte de', indicator: 'pertenencia', weight: 3 },
      { name: 'causa', indicator: 'causalidad', weight: 4 },
      { name: 'es un tipo de', indicator: 'clasificación', weight: 3 },
      { name: 'contiene', indicator: 'composición', weight: 3 },
      { name: 'influye en', indicator: 'influencia', weight: 2 },
      { name: 'se relaciona con', indicator: 'asociación', weight: 1 },
      { name: 'precede a', indicator: 'secuencia', weight: 2 },
      { name: 'requiere', indicator: 'dependencia', weight: 3 },
      { name: 'se opone a', indicator: 'contraste', weight: 3 }
    ];
    
    // Asignar tipos de relaciones basados en algún criterio
    // En una implementación real, esto se haría con NLP
    return relationships.map(rel => {
      // Para demo, asignar tipos basados en la fuerza de la relación
      // Las relaciones más fuertes tienden a ser de tipos más específicos
      let typeIndex;
      if (rel.strength >= 4) {
        // Relaciones fuertes: causalidad, clasificación, o composición
        typeIndex = Math.floor(Math.random() * 3);
      } else if (rel.strength >= 2) {
        // Relaciones medias: influencia, secuencia, o dependencia
        typeIndex = 4 + Math.floor(Math.random() * 3);
      } else {
        // Relaciones débiles: asociación general
        typeIndex = 5;
      }
      
      return {
        ...rel,
        type: relationTypes[typeIndex].name,
        semanticCategory: relationTypes[typeIndex].indicator
      };
    });
  }

  /**
   * Asigna pesos/fuerza a las relaciones identificadas
   * @param {Array} relationships - Lista de relaciones tipificadas
   * @returns {Array} - Relaciones con fuerza asignada
   */
  assignRelationshipStrength(relationships) {
    // Ya tenemos la fuerza inicial basada en co-ocurrencia en oraciones
    // Ahora ajustamos basándonos en tipos semánticos
    
    const typeWeights = {
      'causa': 1.5,
      'es un tipo de': 1.3,
      'es parte de': 1.3,
      'contiene': 1.2,
      'requiere': 1.2,
      'precede a': 1.1,
      'influye en': 1.0,
      'se opone a': 1.0,
      'se relaciona con': 0.8
    };
    
    return relationships.map(rel => {
      // Ajustar fuerza basada en tipo semántico
      const weight = typeWeights[rel.type] || 1.0;
      const adjustedStrength = Math.min(Math.max(rel.strength * weight, 1), 5);
      
      return {
        ...rel,
        strength: adjustedStrength,
        // Para visualización, asignar grosor de línea basado en fuerza
        visualWeight: Math.ceil(adjustedStrength)
      };
    });
  }

  // Métodos auxiliares para Paso 3: Enriquecer Semánticamente

  /**
   * Genera una definición concisa para un concepto
   * @param {Object} concept - Concepto a definir
   * @returns {string} - Definición concisa
   */
  generateConciseDefinition(concept) {
    // En una implementación real, esto usaría APIs de diccionarios o modelos de lenguaje
    // Para esta demo, generamos definiciones simuladas basándonos en el concepto
    
    const definitions = [
      `Término que hace referencia a ${concept.name} en el contexto del documento`,
      `Concepto clave relacionado con la temática principal`,
      `Elemento fundamental que representa ${concept.originalForm || concept.name}`,
      `Componente que define aspectos esenciales del tema tratado`
    ];
    
    // Seleccionar definición basada en nivel e importancia
    const index = (concept.level + Math.floor(concept.importance)) % definitions.length;
    return definitions[index];
  }

  /**
   * Encuentra ejemplos relevantes para un concepto
   * @param {Object} concept - Concepto para el que buscar ejemplos
   * @returns {Array<string>} - Lista de ejemplos
   */
  findRelevantExamples(concept) {
    // En una implementación real, esto extraería ejemplos del texto original
    // o usaría bases de conocimiento externas
    
    // Para esta demo, generamos ejemplos simulados
    const examples = [
      `Ejemplo aplicado de ${concept.originalForm || concept.name}`,
      `Caso práctico que ilustra este concepto`,
      `Instancia específica que demuestra su aplicación`
    ];
    
    // Conceptos más importantes o de nivel superior tienen más ejemplos
    const numExamples = Math.min(3, Math.max(1, 3 - concept.level));
    return examples.slice(0, numExamples);
  }

  /**
   * Identifica términos relacionados o sinónimos
   * @param {Object} concept - Concepto para el que buscar términos relacionados
   * @returns {Array<string>} - Lista de términos relacionados
   */
  identifyRelatedTerms(concept) {
    // En una implementación real, esto usaría APIs como WordNet o tesauros
    // Para esta demo, generamos términos relacionados simulados
    
    return [
      `Término relacionado con ${concept.name}`,
      `Sinónimo contextual`
    ];
  }

  /**
   * Clasifica el concepto en categorías aplicables
   * @param {Object} concept - Concepto para clasificar
   * @returns {Object} - Información de clasificación
   */
  classifyConcept(concept) {
    // En una implementación real, esto usaría taxonomías o categorización NLP
    // Para esta demo, asignamos categorías simples basadas en nivel
    
    const categories = [
      'Concepto principal',
      'Concepto secundario',
      'Concepto terciario',
      'Detalle',
      'Ejemplo'  
    ];
    
    return {
      category: categories[concept.level] || categories[0],
      domain: 'General'
    };
  }

  // Métodos auxiliares para Paso 4: Verificar y Validar
  
  /**
   * Filtra conceptos irrelevantes basado en criterios de pertinencia
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Lista filtrada de conceptos relevantes
   */
  filterIrrelevantConcepts(concepts) {
    // Criterios de relevancia: frecuencia, importancia, conexiones
    return concepts.filter(concept => 
      // Los conceptos deben tener cierta importancia mínima o alta frecuencia
      concept.importance > 1.5 || 
      concept.frequency > 1 ||
      // O los conceptos deben ser críticos para la comprensión
      concept.isCritical
    );
  }

  /**
   * Elimina conceptos redundantes o similares
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Lista sin redundancias
   */
  removeRedundantConcepts(concepts) {
    // En una implementación real, usaríamos embeddings semánticos para detectar similitud
    // Para esta demo, simplificamos comparando palabras similares
    const uniqueConcepts = [];
    const seenNames = new Set();
    
    for (const concept of concepts) {
      // Normalizar nombre para comparación
      const normalizedName = concept.name.toLowerCase();
      
      // Si ya vimos un concepto similar, saltar
      if (seenNames.has(normalizedName)) continue;
      
      // Verificar si hay alguno que comience con el mismo prefijo (>4 caracteres)
      let isDuplicate = false;
      if (normalizedName.length > 4) {
        const prefix = normalizedName.substring(0, 4);
        isDuplicate = [...seenNames].some(name => name.startsWith(prefix) && name !== normalizedName);
      }
      
      if (!isDuplicate) {
        seenNames.add(normalizedName);
        uniqueConcepts.push(concept);
      }
    }
    
    return uniqueConcepts;
  }

  /**
   * Valida la coherencia de relaciones entre conceptos
   * @param {Array} relationships - Lista de relaciones
   * @param {Array} concepts - Lista de conceptos válidos
   * @returns {Array} - Relaciones validadas
   */
  validateRelationshipCoherence(relationships, concepts) {
    // Crear un conjunto de IDs de conceptos válidos para búsqueda rápida
    const validConceptIds = new Set(concepts.map(c => c.id));
    
    // Filtrar relaciones que conectan conceptos válidos
    const validRelationships = relationships.filter(rel => 
      validConceptIds.has(rel.source) && validConceptIds.has(rel.target)
    );
    
    // Verificar coherencia semántica de cada relación
    return validRelationships.filter(rel => {
      // En una implementación real, usaríamos NLP para verificar si la relación tiene sentido
      // Para esta demo, simplemente verificamos que el tipo de relación no sea contradictorio
      
      // Por ejemplo, conceptos de nivel superior no deberían ser "parte de" conceptos inferiores
      const sourceLevel = concepts.find(c => c.id === rel.source)?.level || 0;
      const targetLevel = concepts.find(c => c.id === rel.target)?.level || 0;
      
      if (rel.type === 'es parte de' && sourceLevel <= targetLevel) {
        return false;
      }
      
      // Otras validaciones lógicas podrían implementarse aquí
      return true;
    });
  }

  /**
   * Calcula una puntuación de coherencia para el mapa conceptual
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {number} - Puntuación de coherencia (0-1)
   */
  calculateCoherenceScore(concepts, relationships) {
    // En una implementación real, esto usaría heurísticas NLP complejas
    // Para esta demo, calculamos una puntuación simple
    
    // 1. Proporcionalidad de conceptos conectados
    const connectedConceptIds = new Set();
    relationships.forEach(rel => {
      connectedConceptIds.add(rel.source);
      connectedConceptIds.add(rel.target);
    });
    
    const connectivityRatio = connectedConceptIds.size / concepts.length;
    
    // 2. Densidad de relaciones significativas
    const strongRelationships = relationships.filter(rel => rel.strength > 3).length;
    const relationshipDensity = relationships.length / (concepts.length * (concepts.length - 1) / 2);
    const significanceRatio = strongRelationships / Math.max(1, relationships.length);
    
    // 3. Calcular puntuación final combinada
    return (connectivityRatio * 0.4) + (relationshipDensity * 0.3) + (significanceRatio * 0.3);
  }
  
  // Métodos auxiliares para Paso 5: Optimizar Presentación Visual

  /**
   * Asigna emojis relevantes a categorías de conceptos
   * @param {Array} concepts - Lista de conceptos
   * @returns {Object} - Mapeo de conceptos a emojis
   */
  assignRelevantEmojis(concepts) {
    // Emojis por nivel de concepto
    const levelEmojis = {
      0: '💡', // 💡 bombilla (idea principal)
      1: '🔎', // 🔎 lupa (exploración)
      2: '📋'  // 📋 nota (detalle)
    };
    
    // Emojis especiales para conceptos críticos
    const criticalEmoji = '⭐'; // ⭐ estrella
    
    // Asignar emojis apropiados a cada concepto
    const conceptEmojis = {};
    concepts.forEach(concept => {
      // Asignar emoji base por nivel
      conceptEmojis[concept.id] = levelEmojis[concept.level] || levelEmojis[0];
      
      // Si es un concepto crítico, usar emoji especial
      if (concept.isCritical) {
        conceptEmojis[concept.id] = criticalEmoji;
      }
    });
    
    return conceptEmojis;
  }

  /**
   * Obtiene configuración visual para estilo educativo
   * @param {string} style - Estilo visual seleccionado
   * @returns {Object} - Configuración visual
   */
  getEducationalVisualSettings(style) {
    const styles = {
      educational: {
        colorPalette: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#a855f7'],
        fontOptions: {
          title: 'bold 18px Arial, sans-serif',
          concept: '16px Arial, sans-serif',
          subconcept: '14px Arial, sans-serif',
          detail: '12px Arial, sans-serif'
        },
        lineStyles: {
          strong: '3px solid',
          medium: '2px solid',
          light: '1px solid'
        },
        spacing: {
          nodePadding: '10px',
          levelMargin: '30px'
        }
      },
      minimal: {
        colorPalette: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'],
        fontOptions: {
          title: 'bold 16px "Helvetica Neue", sans-serif',
          concept: '14px "Helvetica Neue", sans-serif',
          subconcept: '13px "Helvetica Neue", sans-serif',
          detail: '12px "Helvetica Neue", sans-serif'
        },
        lineStyles: {
          strong: '2px solid',
          medium: '1.5px solid',
          light: '1px solid'
        },
        spacing: {
          nodePadding: '8px',
          levelMargin: '25px'
        }
      },
      colorful: {
        colorPalette: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
        fontOptions: {
          title: 'bold 18px "Comic Sans MS", cursive',
          concept: '16px "Comic Sans MS", cursive',
          subconcept: '14px "Comic Sans MS", cursive',
          detail: '12px "Comic Sans MS", cursive'
        },
        lineStyles: {
          strong: '3px dashed',
          medium: '2px dashed',
          light: '1px dashed'
        },
        spacing: {
          nodePadding: '12px',
          levelMargin: '35px'
        }
      },
      academic: {
        colorPalette: ['#1e40af', '#047857', '#b45309', '#4f46e5', '#7e22ce'],
        fontOptions: {
          title: 'bold 16px "Times New Roman", serif',
          concept: '15px "Times New Roman", serif',
          subconcept: '14px "Times New Roman", serif',
          detail: '13px "Times New Roman", serif'
        },
        lineStyles: {
          strong: '2px solid',
          medium: '1.5px solid',
          light: '1px solid'
        },
        spacing: {
          nodePadding: '10px',
          levelMargin: '30px'
        }
      }
    };
    
    return styles[style] || styles.educational;
  }

  /**
   * Crea un grafo de conocimiento
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Object} - Grafo de conocimiento
   */
  createKnowledgeGraph(concepts, relationships) {
    return {
      nodes: concepts.map(c => ({
        id: c.id,
        label: c.originalForm || c.name,
        level: c.level,
        importance: c.importance,
        isCritical: c.isCritical,
        definition: c.definition,
        examples: c.examples,
        relatedTerms: c.relatedTerms,
        formatting: c.formatting
      })),
      edges: relationships.map(r => ({
        id: r.id,
        source: r.source,
        target: r.target,
        label: r.type,
        strength: r.strength,
        visualWeight: r.visualWeight
      }))
    };
  }

  /**
   * Genera el contenido del mapa conceptual en formato educativo
   * @param {Object} result - Resultado del procesamiento
   * @param {Object} config - Configuración
   * @returns {string} - Contenido en formato markdown estructurado
   */
  generateEducationalConceptMap(result, config) {
    // Agrupar conceptos por nivel para organización jerárquica
    const conceptsByLevel = {};
    result.concepts.forEach(concept => {
      if (!conceptsByLevel[concept.level]) {
        conceptsByLevel[concept.level] = [];
      }
      conceptsByLevel[concept.level].push(concept);
    });
    
    // Obtener emojis para conceptos (si están disponibles)
    const emojis = result.conceptEmojis || {};
    
    // Iniciar con título principal
    let content = '# Mapa Conceptual\n\n';
    
    // Generar conceptos de Nivel 0 (principales)
    if (conceptsByLevel[0]) {
      conceptsByLevel[0].forEach(mainConcept => {
        // Obtener emoji para este concepto principal
        const emoji = emojis[mainConcept.id] || '';
        
        // Aplicar negrita si está configurado para resaltar
        const conceptName = mainConcept.formatting?.bold ? 
          `**${mainConcept.originalForm || mainConcept.name}**` : 
          mainConcept.originalForm || mainConcept.name;
        
        // Título del concepto principal con emoji
        content += `## ${emoji} ${conceptName}\n\n`;
        
        // Añadir definición del concepto principal
        if (mainConcept.definition) {
          content += `${mainConcept.definition}\n\n`;
        }
        
        // Obtener relaciones para este concepto principal
        const relations = result.relationships.filter(rel => rel.source === mainConcept.id);
        
        // Procesar conceptos secundarios (Nivel 1) relacionados con este concepto principal
        const relatedSubconcepts = conceptsByLevel[1]?.filter(subConcept => 
          relations.some(rel => rel.target === subConcept.id)
        ) || [];
        
        relatedSubconcepts.forEach(subConcept => {
          // Encontrar la relación específica entre el concepto principal y este subconcepto
          const relation = relations.find(rel => rel.target === subConcept.id);
          
          // Obtener emoji para este subconcepto
          const subEmoji = emojis[subConcept.id] || '';
          
          // Aplicar formato al nombre del subconcepto
          let subConceptName = subConcept.originalForm || subConcept.name;
          if (subConcept.formatting?.bold) subConceptName = `**${subConceptName}**`;
          if (subConcept.formatting?.underline) subConceptName = `<u>${subConceptName}</u>`;
          
          // Añadir subconcepto con su relación al concepto principal
          content += `### ${subEmoji} ${subConceptName}\n\n`;
          
          // Indicar la relación con el concepto principal
          if (relation) {
            content += `*${relation.type}* ${mainConcept.name}\n\n`;
          }
          
          // Añadir definición del subconcepto
          if (subConcept.definition) {
            content += `${subConcept.definition}\n\n`;
          }
          
          // Añadir ejemplos si existen
          if (subConcept.examples && subConcept.examples.length > 0) {
            content += `**Ejemplos:**\n`;
            subConcept.examples.forEach(example => {
              content += `- ${example}\n`;
            });
            content += '\n';
          }
          
          // Procesar conceptos terciarios (Nivel 2) relacionados con este subconcepto
          const subRelations = result.relationships.filter(rel => rel.source === subConcept.id);
          const relatedDetails = conceptsByLevel[2]?.filter(detail => 
            subRelations.some(rel => rel.target === detail.id)
          ) || [];
          
          if (relatedDetails.length > 0) {
            content += `**Detalles relacionados:**\n`;
            
            relatedDetails.forEach(detail => {
              // Encontrar la relación específica
              const detailRelation = subRelations.find(rel => rel.target === detail.id);
              
              // Aplicar formato al nombre del detalle
              let detailName = detail.originalForm || detail.name;
              if (detail.formatting?.bold) detailName = `**${detailName}**`;
              
              // Añadir detalle con su relación
              content += `- **${detailName}**: `;
              if (detailRelation) {
                content += `*${detailRelation.type}* ${subConcept.name}`;
              }
              content += '\n';
            });
            content += '\n';
          }
          
          // Añadir términos relacionados si existen
          if (subConcept.relatedTerms && subConcept.relatedTerms.length > 0) {
            content += `**Términos relacionados:** ${subConcept.relatedTerms.join(', ')}\n\n`;
          }
        });
      });
    }
    
    return content;
  }

  /**
   * Genera un resumen descriptivo del mapa conceptual para la etapa de Conclusión
   * @param {Object} result - Resultado del mapa conceptual
   * @returns {string} - Resumen descriptivo detallado
   */
  generateConceptualSummary(result) {
    // Extraer conceptos principales (nivel 0)
    const mainConcepts = result.concepts.filter(c => c.level === 0);
    
    // Encontrar los conceptos más importantes por nivel
    const topConceptsByLevel = {};
    for (let level = 0; level <= 2; level++) {
      const conceptsAtLevel = result.concepts.filter(c => c.level === level);
      const sortedByImportance = [...conceptsAtLevel].sort((a, b) => b.importance - a.importance);
      topConceptsByLevel[level] = sortedByImportance.slice(0, 3); // Top 3 por nivel
    }
    
    // Calcular estadísticas generales
    const conceptsByLevel = result.concepts.reduce((acc, c) => {
      acc[c.level] = (acc[c.level] || 0) + 1;
      return acc;
    }, {});
    
    // Tipos de relaciones frecuentes
    const relationshipTypes = result.relationships.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});
    
    const topRelationshipTypes = Object.entries(relationshipTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => `"${type}" (${count})`);
    
    // Construir resumen estructurado
    let summary = `Este mapa conceptual representa una estructura de conocimiento con ${result.concepts.length} conceptos `;
    summary += `organizados en ${Object.keys(conceptsByLevel).length} niveles jerárquicos, `;
    summary += `conectados mediante ${result.relationships.length} relaciones significativas.\n\n`;
    
    // Añadir información sobre conceptos principales
    if (mainConcepts.length > 0) {
      summary += `Los conceptos principales son: ${mainConcepts.map(c => c.name).join(', ')}. `;
    }
    
    // Añadir información sobre relaciones principales
    if (topRelationshipTypes.length > 0) {
      summary += `Las principales relaciones identificadas son: ${topRelationshipTypes.join(', ')}.\n\n`;
    }
    
    // Añadir estadísticas de niveles
    summary += `Distribución jerárquica:\n`;
    Object.entries(conceptsByLevel).forEach(([level, count]) => {
      const levelName = level === '0' ? 'Principal' : 
                       level === '1' ? 'Secundario' : 
                       level === '2' ? 'Terciario' : `Nivel ${level}`;
      summary += `- ${levelName}: ${count} conceptos\n`;
    });
    
    // Añadir estadísticas de enriquecimiento
    if (result.metadata.enrichmentStats) {
      const { definitionsCount, examplesCount, relatedTermsCount } = result.metadata.enrichmentStats;
      summary += `\nEnriquecimiento semántico: ${definitionsCount} definiciones, `;
      summary += `${examplesCount} ejemplos y ${relatedTermsCount} términos relacionados.`;
    }
    
    // Añadir puntuación de coherencia si está disponible
    if (result.metadata.coherenceScore !== undefined) {
      const coherencePercent = Math.round(result.metadata.coherenceScore * 100);
      summary += `\nLa coherencia global del mapa es del ${coherencePercent}%.`;
    }
    
    // Añadir recomendaciones basadas en el análisis
    summary += `\n\nRecomendaciones para uso educativo:\n`;
    if (result.concepts.length > 15) {
      summary += `- Este mapa es extenso y puede ser útil para una visión completa del tema.\n`;
    } else {
      summary += `- Este mapa es conciso y puede ser útil para introducir conceptos básicos.\n`;
    }
    
    // Añadir una conclusión final
    summary += `\nEste mapa conceptual está optimizado para facilitar la comprensión `;
    summary += `y el aprendizaje del tema tratado, estableciendo conexiones significativas `;
    summary += `entre conceptos y proporcionando contexto a través de definiciones y ejemplos.`;
    
    return summary;
  }
}

module.exports = new ConceptMapService();
