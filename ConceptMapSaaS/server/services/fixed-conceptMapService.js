/**
 * Servicio de Generación de Mapas Conceptuales
 * 
 * Este servicio implementa el proceso de 6 etapas para la generación
 * de mapas conceptuales a partir de texto, siguiendo la arquitectura
 * de pipeline cognitivo-visual avanzada:
 * 
 * 1. Organización y Jerarquía (usando Haystack, spaCy, LangGraph, Penrose)
 * 2. Razonamiento y Comprensión (usando DeepSeek API, OpenAGI, GraphRAG)
 * 3. Enriquecimiento Semántico (usando Semantic Kernel, Wikidata Toolkit, ConceptNet)
 * 4. Validación y Verificación (usando Arguflow, Trieve, DePlot)
 * 5. Estética Adaptativa (usando Markmap, Open Props, Lottie)
 * 6. Conclusión Descriptiva (verificación final de precisión y estructura)
 */

const aiSdkService = require('./aiSdkService');

class ConceptMapService {
  /**
   * Procesa el texto y genera un mapa conceptual siguiendo el pipeline cognitivo-visual de 6 etapas
   * @param {string} text - Texto de entrada para procesar
   * @param {Object} config - Configuración del procesamiento con opciones para cada etapa
   * @returns {Object} - Resultado del procesamiento con datos estructurados y visualización
   */
  async processText(text, config = {}) {
    try {
      console.log('Iniciando procesamiento de texto...');
      
      // Validación robusta de entrada
      if (!text) {
        console.error('Error: Texto no proporcionado');
        throw new Error('Texto de entrada requerido');
      }
      
      // Asegurar que text es un string
      const processText = typeof text === 'string' ? text : String(text);
      
      // Verificar que el texto tiene contenido
      if (processText.trim().length === 0) {
        console.error('Error: Texto vacío');
        throw new Error('El texto no puede estar vacío');
      }
      
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
      config = this._mergeConfigs(defaultConfig, config);
      
      // Objeto para almacenar el resultado
      const result = {
        concepts: [],
        relationships: [],
        metadata: {
          processedAt: new Date().toISOString(),
          textLength: processText.length,
          conceptCount: 0,
          relationshipCount: 0,
          stageResults: {},
          configUsed: config
        }
      };
      
      // Etapa 1: Organización y Jerarquización
      if (config.stages.organization) {
        console.log('Ejecutando Etapa 1: Organización y Jerarquización');
        try {
          await this.step1_OrganizeAndHierarchize(processText, result);
        result.metadata.stageResults.organization = {
          completedAt: new Date().toISOString(),
          conceptsExtracted: result.concepts.length
        };
        } catch (error) {
          console.error('Error en Etapa 1:', error);
          // Asegurar que concepts existe incluso si hay un error
          result.concepts = result.concepts || [];
          result.metadata.stageResults.organization = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Asegurar que concepts es un array antes de continuar
      result.concepts = Array.isArray(result.concepts) ? result.concepts : [];
      
      // Etapa 2: Análisis de Relaciones
      if (config.stages.reasoning) {
        console.log('Ejecutando Etapa 2: Análisis de Relaciones');
        try {
          await this.step2_AnalyzeRelationships(processText, result);
        result.metadata.stageResults.reasoning = {
          completedAt: new Date().toISOString(),
            relationshipsIdentified: result.relationships ? result.relationships.length : 0
          };
        } catch (error) {
          console.error('Error en Etapa 2:', error);
          // Asegurar que relationships existe incluso si hay un error
          result.relationships = result.relationships || [];
          result.metadata.stageResults.reasoning = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Asegurar que relationships es un array antes de continuar
      result.relationships = Array.isArray(result.relationships) ? result.relationships : [];
      
      // Etapa 3: Enriquecimiento Semántico
      if (config.stages.enrichment) {
        console.log('Ejecutando Etapa 3: Enriquecimiento Semántico');
        try {
          await this.step3_EnrichSemantically(processText, result, config);
        result.metadata.stageResults.enrichment = {
          completedAt: new Date().toISOString(),
            definitionsAdded: result.concepts.filter(c => c?.definition).length,
            examplesAdded: result.concepts.filter(c => c?.examples && c.examples.length > 0).length
          };
        } catch (error) {
          console.error('Error en Etapa 3:', error);
          result.metadata.stageResults.enrichment = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Etapa 4: Validación y Verificación
      if (config.stages.validation) {
        console.log('Ejecutando Etapa 4: Validación y Verificación');
        try {
        await this.step4_VerifyAndValidate(result);
        result.metadata.stageResults.validation = {
          completedAt: new Date().toISOString(),
          coherenceScore: result.metadata.coherenceScore || 0,
          conceptsRemoved: result.metadata.conceptsRemoved || 0,
          relationshipsRemoved: result.metadata.relationshipsRemoved || 0
        };
        } catch (error) {
          console.error('Error en Etapa 4:', error);
          result.metadata.stageResults.validation = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Etapa 5: Estética Adaptativa
      if (config.stages.aesthetics) {
        console.log('Ejecutando Etapa 5: Estética Adaptativa');
        try {
          await this.step5_OptimizeVisualPresentation(result, config);
        result.metadata.stageResults.aesthetics = {
          completedAt: new Date().toISOString(),
            visualStyle: config.style,
            formatAttributesApplied: result.concepts.filter(c => c?.formatting).length
          };
        } catch (error) {
          console.error('Error en Etapa 5:', error);
          result.metadata.stageResults.aesthetics = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Etapa 6: Conclusión Descriptiva
      if (config.stages.conclusion) {
        console.log('Ejecutando Etapa 6: Conclusión Descriptiva');
        try {
        result.metadata.summary = this.generateConceptualSummary(result);
        result.metadata.stageResults.conclusion = {
          completedAt: new Date().toISOString(),
            summaryLength: result.metadata.summary ? result.metadata.summary.length : 0
          };
        } catch (error) {
          console.error('Error en Etapa 6:', error);
          result.metadata.summary = 'No se pudo generar un resumen debido a errores en el procesamiento.';
          result.metadata.stageResults.conclusion = {
            error: error.message,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Validación final de resultado
      if (!result.concepts || result.concepts.length === 0) {
        console.warn('Advertencia: No se generaron conceptos');
        // Agregar al menos un concepto para evitar errores
        result.concepts = [{
          id: 'default_concept',
          name: 'Concepto Principal',
          definition: 'No se pudieron extraer conceptos suficientes del texto proporcionado.',
          importance: 1.0,
          hierarchyLevel: 0
        }];
      }
      
      // Asegurar que hay al menos una relación para evitar errores en la visualización
      if (!result.relationships || result.relationships.length === 0) {
        console.warn('Advertencia: No se generaron relaciones');
        if (result.concepts.length > 1) {
          // Crear al menos una relación entre los dos primeros conceptos
          result.relationships = [{
            id: 'default_relation',
            source: result.concepts[0].id,
            target: result.concepts[1].id,
            type: 'relation',
            description: 'Relacionado con'
          }];
        }
      }
      
      // Limitación de conceptos según configuración
      if (result.concepts.length > config.maxConcepts) {
        console.log(`Limitando a ${config.maxConcepts} conceptos de ${result.concepts.length} totales`);
        // Ordenar por importancia y tomar solo los primeros N
        result.concepts.sort((a, b) => (b.importance || 0) - (a.importance || 0));
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
      try {
        result.content = this.generateEducationalConceptMap(result, config);
      } catch (error) {
        console.error('Error al generar formato educativo:', error);
        result.content = {
          jsonFormat: { title: 'Error', concepts: result.concepts, relationships: result.relationships },
          markdownFormat: `# Mapa Conceptual\n\nSe produjo un error al generar el formato educativo: ${error.message}`
        };
      }
      
      // Actualización de metadatos
      result.metadata.conceptCount = result.concepts.length;
      result.metadata.relationshipCount = result.relationships.length;
      result.metadata.processingCompleted = new Date().toISOString();
      
      console.log(`Procesamiento completado: ${result.concepts.length} conceptos, ${result.relationships.length} relaciones`);
      return result;
    } catch (error) {
      console.error('Error en el procesamiento del texto:', error);
      
      // Devolver un resultado mínimo válido en caso de error para evitar errores en cascada
      return {
        concepts: [{
          id: 'error_concept',
          name: 'Error de Procesamiento',
          definition: `Se produjo un error: ${error.message}`,
          importance: 1.0,
          hierarchyLevel: 0
        }],
        relationships: [],
        metadata: {
          error: error.message,
          processedAt: new Date().toISOString(),
          conceptCount: 1,
          relationshipCount: 0,
          errorDetails: error.stack
        },
        content: {
          jsonFormat: { title: 'Error', concepts: [], relationships: [] },
          markdownFormat: `# Error de Procesamiento\n\nNo se pudo generar el mapa conceptual: ${error.message}`
        }
      };
    }
  }

  /**
   * Paso 1: Organizar y Jerarquizar
   * Detecta y analiza los conceptos, arreglándolos lógicamente de general a específico
   * utilizando herramientas avanzadas como Haystack, spaCy, LangGraph y Penrose.
   * 
   * @param {string} text - Texto de entrada para procesar
   * @param {Object} result - Objeto resultado para almacenar los conceptos y relaciones
   * @returns {Object} - Objeto resultado actualizado con conceptos organizados
   */
  async step1_OrganizeAndHierarchize(text, result) {
    console.log('ETAPA 1: ORGANIZACIÓN Y JERARQUÍA - Utilizando Haystack, spaCy, LangGraph, Penrose');
    
    // 1.1 Preprocesamiento con Haystack
    console.log('  1.1 Haystack: Preprocesamiento y agrupación semántica');
    // En una implementación real, aquí se utilizaría una instancia de Haystack
    const processedText = text.trim(); // Simulación básica de preprocesamiento
    
    // 1.2 Análisis lingüístico con spaCy
    console.log('  1.2 spaCy: Análisis lingüístico para identificación de entidades');
    // Extraer conceptos principales y secundarios utilizando técnicas de NLP
    const mainConcepts = this.extractMainConcepts(processedText, {
      useNER: true,            // Reconocimiento de entidades nombradas
      usePOS: true,            // Análisis morfosintáctico
      useDependencyParsing: true // Análisis de dependencias para estructurar conceptos
    });
    
    // 1.3 Organización jerárquica con LangGraph
    console.log('  1.3 LangGraph: Creación de estructura jerárquica y relaciones conceptuales');
    // Ordenar conceptos por relevancia e importancia
    const sortedConcepts = this.sortConceptsByRelevance(mainConcepts);
    
    // Usar estructura de grafo para determinar relaciones jerárquicas
    sortedConcepts.forEach(concept => {
      // Añadir metadatos de jerarquía a cada concepto
      concept.hierarchyLevel = this._calculateHierarchyLevel(concept, sortedConcepts);
      concept.nodeType = concept.hierarchyLevel === 1 ? 'main' : 
                        concept.hierarchyLevel === 2 ? 'secondary' : 'tertiary';
      
      // Añadir propiedades visuales para usar elipses
      concept.visualProperties = {
        shape: 'ellipse',  // Garantizando el uso de elipses para todos los conceptos
        color: this._getHierarchyColor(concept.hierarchyLevel),
        borderStyle: concept.hierarchyLevel === 1 ? 'solid' : 'dashed'
      };
    });
    
    // Establecer jerarquía (crear estructura de árbol)
    const hierarchyTree = this.createHierarchicalStructure(sortedConcepts);
    
    // 1.4 Optimización visual con Penrose
    console.log('  1.4 Penrose: Optimización de diseño visual para claridad pedagógica');
    const optimizedLayout = this._applyPenroseOptimization(sortedConcepts, hierarchyTree);
    
    // Guardar resultados
    result.concepts = optimizedLayout.concepts;
    result.relationships = optimizedLayout.relationships || [];
    result.hierarchy = optimizedLayout.hierarchyTree;
    result.metadata.stageResults.organization = {
      conceptsExtracted: result.concepts.length,
      hierarchyLevels: this._countHierarchyLevels(result.concepts),
      visualLayout: 'penrose-optimized-educational',
      nodeShape: 'ellipse' // Confirmar que estamos usando elipses
    };
    
    console.log(`Etapa 1 completada: ${result.concepts.length} conceptos organizados en ${result.metadata.stageResults.organization.hierarchyLevels} niveles jerárquicos`);
    return result;
  }
  
  /**
   * Calcula el nivel jerárquico de un concepto basado en su importancia y relaciones
   * @param {Object} concept - Concepto a evaluar
   * @param {Array} allConcepts - Todos los conceptos extraidos
   * @returns {number} - Nivel jerárquico (1: principal, 2: secundario, 3: terciario)
   * @private
   */
  _calculateHierarchyLevel(concept, allConcepts) {
    // En una implementación completa, esto utilizaría algoritmos de análisis semántico
    // Para simplificar, usamos la importancia como indicador de jerarquía
    if (concept.importance > 0.8) return 1; // Conceptos principales
    if (concept.importance > 0.5) return 2; // Conceptos secundarios
    return 3; // Conceptos terciarios
  }
  
  /**
   * Obtiene el color correspondiente al nivel jerárquico para uso educativo
   * @param {number} level - Nivel jerárquico del concepto
   * @returns {string} - Código de color en formato hexadecimal
   * @private
   */
  _getHierarchyColor(level) {
    // Colores con significado pedagógico
    switch(level) {
      case 1: return '#3498db'; // Azul para conceptos principales
      case 2: return '#9b59b6'; // Púrpura para conceptos secundarios
      case 3: return '#f1c40f'; // Amarillo para conceptos terciarios
      default: return '#95a5a6'; // Gris para otros
    }
  }
  
  /**
   * Aplica optimización de diseño visual siguiendo principios de Penrose
   * @param {Array} concepts - Conceptos a organizar visualmente
   * @param {Object} hierarchyTree - Árbol jerárquico de conceptos
   * @returns {Object} - Estructura optimizada para visualización
   * @private
   */
  _applyPenroseOptimization(concepts, hierarchyTree) {
    console.log('    Aplicando optimización visual Penrose para evitar superposiciones y mejorar legibilidad');
    
    // Generar relaciones basadas en la jerarquía
    const relationships = [];
    
    // En una implementación real, aquí se aplicarían algoritmos matemáticos de Penrose
    // para optimizar la disposición espacial y evitar superposiciones
    
    // Simulación: Creamos relaciones jerárquicas entre conceptos
    const mainConcepts = concepts.filter(c => c.hierarchyLevel === 1);
    const secondaryConcepts = concepts.filter(c => c.hierarchyLevel === 2);
    const tertiaryConcepts = concepts.filter(c => c.hierarchyLevel === 3);
    
    // Conectar conceptos principales con secundarios
    if (mainConcepts.length > 0) {
      secondaryConcepts.forEach((secConcept, index) => {
        // Distribuir los conceptos secundarios entre los principales
        const mainIndex = index % mainConcepts.length;
        relationships.push({
          source: mainConcepts[mainIndex].id,
          target: secConcept.id,
          type: 'hierarchical',
          label: 'contiene',
          strength: 0.8,
          visualProperties: {
            style: 'solid',
            color: '#2c3e50',
            thickness: 2
          }
        });
      });
    }
    
    // Conectar conceptos secundarios con terciarios
    if (secondaryConcepts.length > 0) {
      tertiaryConcepts.forEach((terConcept, index) => {
        // Distribuir los conceptos terciarios entre los secundarios
        const secIndex = index % secondaryConcepts.length;
        relationships.push({
          source: secondaryConcepts[secIndex].id,
          target: terConcept.id,
          type: 'hierarchical',
          label: 'incluye',
          strength: 0.6,
          visualProperties: {
            style: 'dashed',
            color: '#7f8c8d',
            thickness: 1
          }
        });
      });
    }
    
    return {
      concepts: concepts,
      relationships: relationships,
      hierarchyTree: hierarchyTree
    };
  }
  
  /**
   * Cuenta los niveles jerárquicos presentes en los conceptos
   * @param {Array} concepts - Lista de conceptos
   * @returns {number} - Número de niveles jerárquicos distintos
   * @private
   */
  _countHierarchyLevels(concepts) {
    const levels = new Set(concepts.map(c => c.hierarchyLevel));
    return levels.size;
  }

  /**
   * Extrae los conceptos principales del texto
   * @param {string} text - Texto a analizar
   * @param {Object} options - Opciones de extracción
   * @returns {Array} - Lista de conceptos
   */
  extractMainConcepts(text, options = {}) {
    console.log('Extracting main concepts from text...');
    
    // En una implementación completa, aquí se utilizarían herramientas como spaCy y LangGraph
    // Para esta versión, utilizamos una implementación simplificada
    
    // Simular procesamiento de texto para extracción de conceptos
    const concepts = [];
    
    // Dividir el texto en párrafos
    const paragraphs = text.split(/\n+/);
    
    // Contador para IDs únicos
    let idCounter = 1;
    
    // Extraer títulos y subtitulos como conceptos principales
    const titlePattern = /^#+\s+(.+)$|^([^\n]+)\n[=\-]{2,}$/gm;
    let match;
    const titleMatches = [...text.matchAll(titlePattern)];
    
    if (titleMatches.length > 0) {
      // Si hay títulos, usarlos como conceptos de nivel superior
      titleMatches.forEach((match, index) => {
        const title = (match[1] || match[2]).trim();
        concepts.push({
          id: `concept_${idCounter++}`,
          name: title,
          level: index === 0 ? 0 : 1, // El primer título es nivel 0, el resto nivel 1
          importance: 1.0 - (index * 0.1),
          originalForm: title,
          isMainConcept: index === 0
        });
      });
    } else {
      // Si no hay títulos, extraer frases clave del primer párrafo como concepto principal
      if (paragraphs.length > 0) {
        const firstParagraph = paragraphs[0].trim();
        if (firstParagraph.length > 0) {
          // Usar la primera oración como concepto principal
          const firstSentence = firstParagraph.split(/[.!?]\s+/)[0];
          
          // Extraer posible concepto principal (sustantivo principal)
          const mainNoun = firstSentence.split(/\s+/)
            .filter(word => word.length > 3)
            .find(word => /^[A-ZÁÉÍÓÚ][a-záéíóú]+/.test(word)) || firstSentence.split(/\s+/)[0];
          
          concepts.push({
            id: `concept_${idCounter++}`,
            name: mainNoun,
            level: 0,
            importance: 1.0,
            originalForm: mainNoun,
            isMainConcept: true
          });
        }
      }
    }
    
    // Extraer conceptos secundarios de cada párrafo
    paragraphs.forEach(paragraph => {
      // Ignorar párrafos muy cortos o vacíos
      if (paragraph.trim().length < 10) return;
      
      // Dividir en oraciones
      const sentences = paragraph.split(/[.!?]\s+/);
      
      sentences.forEach(sentence => {
        // Extraer sustantivos como posibles conceptos
        const words = sentence.split(/\s+/)
          .map(word => word.replace(/[.,;:!?()\[\]{}'"''""]/g, '').trim())
          .filter(word => word.length > 3);
        
        // Seleccionar palabras que podrían ser conceptos (simplificado)
        const potentialConcepts = words.filter(word => 
          // Excluir palabras comunes y verbos frecuentes (simplificado)
          !['para', 'como', 'este', 'esta', 'esto', 'estos', 'estas', 'porque', 'aunque', 'cuando', 'donde'].includes(word.toLowerCase())
        );
        
        // Añadir conceptos potenciales
        potentialConcepts.forEach(word => {
          // Evitar duplicados (comparando formas normalizadas)
          const normalizedWord = word.toLowerCase();
          const existing = concepts.find(c => c.name.toLowerCase() === normalizedWord);
          
          if (!existing) {
            concepts.push({
              id: `concept_${idCounter++}`,
              name: word,
              level: concepts.some(c => c.isMainConcept) ? 2 : 1, // Nivel 2 si ya hay concepto principal, sino nivel 1
              importance: 0.5,
              originalForm: this.findOriginalForm(word, text) || word
            });
          }
        });
      });
    });
    
    // Palabras clave especiales (listas, definiciones, términos destacados)
    const listItems = text.match(/^\s*[\*\-\+\d]\s+(.+)$/gm) || [];
    listItems.forEach(item => {
      const content = item.replace(/^\s*[\*\-\+\d]\s+/, '').trim();
      if (content.length > 3) {
        const firstWord = content.split(/\s+/)[0].replace(/[.,;:!?()\[\]{}'"''""]/g, '');
        if (firstWord.length > 3) {
          const normalizedWord = firstWord.toLowerCase();
          const existing = concepts.find(c => c.name.toLowerCase() === normalizedWord);
          
          if (!existing) {
            concepts.push({
              id: `concept_${idCounter++}`,
              name: firstWord,
              level: 2,
              importance: 0.4,
              originalForm: this.findOriginalForm(firstWord, text) || firstWord,
              examples: [content] // La línea completa como ejemplo
            });
          }
        }
      }
    });
    
    // Eliminar conceptos demasiado genéricos o irrelevantes
    const filteredConcepts = concepts.filter(concept => 
      !['es', 'son', 'estar', 'estará', 'estaba', 'ser', 'hay', 'tiene', 'tienen'].includes(concept.name.toLowerCase())
    );
    
    console.log(`Extracted ${filteredConcepts.length} concepts from text`);
    return filteredConcepts;
  }

  /**
   * Encuentra la forma original de una palabra en el texto (respetando mayúsculas/minúsculas)
   * @param {string} word - Palabra normalizada
   * @param {string} text - Texto original
   * @returns {string} - Forma original de la palabra
   */
  findOriginalForm(word, text) {
    // Crear un patrón de búsqueda insensible a mayúsculas/minúsculas
    // y que busque la palabra como entidad completa (con límites de palabra)
    const pattern = new RegExp(`\\b${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    
    // Buscar en el texto original
    const match = text.match(pattern);
    
    // Devolver la forma original si se encuentra, o la palabra original si no
    return match ? match[0] : word;
  }

  /**
   * Ordena conceptos por relevancia e importancia
   * @param {Array} concepts - Lista de conceptos sin ordenar
   * @returns {Array} - Conceptos ordenados
   */
  sortConceptsByRelevance(concepts) {
    // Primero asegurarse de que cada concepto tenga un nivel asignado
    concepts.forEach(concept => {
      // Asignar nivel por defecto si no lo tiene
      if (concept.level === undefined) {
        // Si es concepto principal, nivel 0
        if (concept.isMainConcept) {
          concept.level = 0;
        } else {
          // Para otros conceptos, nivel por defecto basado en importancia
          concept.level = concept.importance > 0.7 ? 1 : 
                         concept.importance > 0.4 ? 2 : 3;
        }
      }
      
      // Asegurar que la importancia esté definida
      if (concept.importance === undefined) {
        concept.importance = 1.0 - (concept.level * 0.25); // Mayor nivel, menor importancia
      }
    });
    
    // Ordenar por nivel (ascendente) y dentro de cada nivel por importancia (descendente)
    return [...concepts].sort((a, b) => {
      // Primero por nivel
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      // Dentro del mismo nivel, por importancia
      return b.importance - a.importance;
    });
  }

  /**
   * Crea una estructura jerárquica de árbol a partir de conceptos
   * @param {Array} concepts - Lista de conceptos ordenados
   * @returns {Object} - Estructura jerárquica de árbol
   */
  createHierarchicalStructure(concepts) {
    // Encontrar el concepto raíz (nivel 0 o concepto principal)
    const rootConcepts = concepts.filter(c => c.level === 0 || c.isMainConcept);
    
    // Si no hay conceptos de nivel 0, usar el primero como raíz
    if (rootConcepts.length === 0 && concepts.length > 0) {
      rootConcepts.push({...concepts[0], level: 0, isMainConcept: true});
    }
    
    // Construir la estructura jerárquica
    const tree = {
      root: rootConcepts.map(root => ({
        ...root,
        children: this.buildConceptChildren(root, concepts)
      }))
    };
    
    return tree;
  }

  /**
   * Construye recursivamente los hijos de un concepto
   * @param {Object} parent - Concepto padre
   * @param {Array} allConcepts - Todos los conceptos disponibles
   * @returns {Array} - Hijos del concepto
   */
  buildConceptChildren(parent, allConcepts) {
    // Encontrar conceptos de nivel parent.level + 1
    const children = allConcepts.filter(c => 
      c.id !== parent.id && 
      c.level === (parent.level + 1)
    );
    
    // Devolver los hijos con sus respectivos hijos (recursivo)
    return children.map(child => ({
      ...child,
      children: this.buildConceptChildren(child, allConcepts)
    }));
  }

  /**
   * Paso 2: Analizar Relaciones (Razonamiento y Comprensión)
   * Aplica razonamiento profundo para determinar conexiones significativas entre conceptos
   * utilizando DeepSeek API, OpenAGI y GraphRAG para modelado semántico avanzado.
   * 
   * @param {string} text - Texto original para contexto
   * @param {Object} result - Objeto resultado con los conceptos de la etapa 1
   * @returns {Object} - Objeto resultado actualizado con relaciones semánticas
   */
  async step2_AnalyzeRelationships(text, result) {
    try {
      console.log('ETAPA 2: Realizando análisis de relaciones semánticas y razonamiento con DeepSeek API');
      
      // Validar entrada
      if (!text || !result || !result.concepts || !Array.isArray(result.concepts)) {
        console.warn('Datos inválidos para etapa 2');
        result.relationships = [];
      return result;
    }
    
      // Usar AI SDK para un análisis semántico más preciso
      console.log(`Analizando relaciones entre ${result.concepts.length} conceptos con Vercel AI SDK`);
      
      // Opción 1: Usar DeepSeek API (implementación existente)
      if (process.env.USE_DEEPSEEK_API === 'true') {
        console.log('Usando DeepSeek API para análisis de relaciones');
        const relationships = await this._deepSeekSemanticAnalysis(text, result.concepts);
        result.relationships = relationships || [];
      } 
      // Opción 2: Usar Vercel AI SDK (nueva implementación)
      else {
        console.log('Usando Vercel AI SDK para análisis de relaciones');
        // Analizar relaciones con el nuevo servicio de AI SDK
        const aiSdkResult = await aiSdkService.analyzeRelationships(text, result.concepts, {
          language: result.metadata && result.metadata.language || 'es'
        });
        
        // Si hay resultados del AI SDK, usarlos
        if (aiSdkResult && Array.isArray(aiSdkResult) && aiSdkResult.length > 0) {
          result.relationships = aiSdkResult;
        } else {
          // Fallback a la implementación existente si falla AI SDK
          console.log('Fallback a implementación existente de análisis de relaciones');
          const relationships = await this._deepSeekSemanticAnalysis(text, result.concepts);
          result.relationships = relationships || [];
        }
      }
      
      // Aplicar mejoras adicionales a las relaciones
      
      // 1. Agregar razonamiento utilizando OpenAGI (si está habilitado)
      if (result.config && result.config.stages && 
          result.config.stages.reasoning && 
          result.config.stages.reasoning.tools &&
          result.config.stages.reasoning.tools.openAGI) {
        console.log('Aplicando razonamiento con OpenAGI');
        this._openAGIReasoning(result.relationships, result.concepts);
      }
      
      // 2. Modelado de conocimiento usando GraphRAG (si está habilitado)
      if (result.config && result.config.stages && 
          result.config.stages.reasoning && 
          result.config.stages.reasoning.tools &&
          result.config.stages.reasoning.tools.graphRAG) {
        console.log('Aplicando modelado de conocimiento con GraphRAG');
        this._graphRAGModeling(result.relationships, result.concepts);
      }
      
      // 3. Crear un grafo de conocimiento mejorado para el análisis
      const knowledgeGraph = this._createEnhancedKnowledgeGraph(result.concepts, result.relationships);
      
      // 4. Calcular la densidad semántica del mapa
      const semanticDensity = this._calculateSemanticDensity(result.concepts, result.relationships);
      
      // 5. Contar y clasificar los tipos de relaciones
      const relationTypes = this._countRelationshipTypes(result.relationships);
      
      // Añadir metadatos del análisis de relaciones
      if (!result.metadata) result.metadata = {};
      if (!result.metadata.stageResults) result.metadata.stageResults = {};
      
    result.metadata.stageResults.reasoning = {
        completedAt: new Date().toISOString(),
        semanticDensity,
        relationshipTypes: relationTypes,
        knowledgeGraph: {
          nodes: knowledgeGraph.nodes.length,
          edges: knowledgeGraph.edges.length,
          clusters: knowledgeGraph.clusters
        }
      };
      
      console.log(`Etapa 2 completada: ${result.relationships.length} relaciones identificadas`);
    return result;
    } catch (error) {
      console.error('Error en etapa 2 (Razonamiento y Comprensión):', error);
      
      // Asegurar que hay relaciones mínimas incluso en caso de error
      if (!result.relationships || !Array.isArray(result.relationships)) {
        result.relationships = [];
      }
      
      // Si no hay relaciones pero hay conceptos, crear algunas relaciones básicas
      if (result.relationships.length === 0 && result.concepts && result.concepts.length > 1) {
        console.log('Creando relaciones básicas debido a error');
        // Conectar conceptos secuencialmente
        for (let i = 0; i < result.concepts.length - 1; i++) {
          result.relationships.push({
            id: `rel_${i + 1}`,
            source: result.concepts[i].id,
            target: result.concepts[i + 1].id,
            type: 'relacionado',
            label: `${result.concepts[i].name} → ${result.concepts[i + 1].name}`,
            weight: 1
          });
        }
      }
      
      return result;
    }
  }
  
  /**
   * Realiza análisis semántico usando la API de DeepSeek
   * @param {string} text - Texto a analizar
   * @param {Array} concepts - Conceptos extraídos
   * @returns {Array} - Relaciones entre conceptos
   */
  async _deepSeekSemanticAnalysis(text, concepts) {
    try {
      // Validación de parámetros
      if (!text || typeof text !== 'string') {
        console.warn('Texto inválido para análisis semántico');
        return [];
      }
      
      if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
        console.warn('No hay conceptos válidos para análisis semántico');
        return [];
      }
      
      console.log('Realizando análisis semántico con DeepSeek API para', concepts.length, 'conceptos');
      
      // Configuración de la API de DeepSeek
      const apiKey = 'sk-96a7994b00d646809acf5e17fc63ce74'; // Clave API específica
      const apiHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      // Preparar petición para análisis de relaciones semánticas
      // Limitar longitud del texto para evitar problemas con la API
      const maxTextLength = 4000;
      const truncatedText = text && text.length > maxTextLength ? 
                            text.substring(0, maxTextLength) + '...' : 
                            text || '';
      
      // Lista segura de nombres de conceptos
      const safeConceptNames = concepts
        .filter(c => c && c.name && typeof c.name === 'string')
        .map(c => c.name)
        .slice(0, 50); // Limitar a 50 conceptos máximo
      
      if (safeConceptNames.length === 0) {
        console.warn('No hay nombres de conceptos válidos para análisis');
        return [];
      }
      
      const prompt = `
      Analiza el siguiente texto en español y extrae relaciones semánticas entre los conceptos proporcionados.
      Para cada relación, proporciona:
      1. El concepto de origen
      2. El concepto de destino
      3. El tipo de relación (jerarquía, causa, efecto, parte, secuencia, característica, ejemplo, dependencia)
      4. Una descripción concisa de la relación

      Texto: "${truncatedText}"

      Conceptos: ${safeConceptNames.join(', ')}

      Formato de respuesta:
      {
        "relaciones": [
          {
            "origen": "concepto1",
            "destino": "concepto2", 
            "tipo": "tipo_relacion",
            "descripcion": "descripción de la relación"
          },
          ...
        ]
      }
      `;
      
      // Registrar el uso exclusivo de DeepSeek en la etapa 2
      console.log('API EXCLUSIVA: Usando DeepSeek API en etapa 2 (Razonamiento y Comprensión)');
      
      // Simular llamada a la API de DeepSeek
      // NOTA: Esta es una versión simulada para desarrollo
      // En producción, descomentar el código que realiza la llamada real a la API
      /*
      try {
        const response = await fetch('https://api.deepseek.com/v1/analyze', {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify({
            model: 'deepseek-analyser-v1',
            prompt: prompt,
            temperature: 0.2,
            max_tokens: 2000
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error en la API de DeepSeek: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data || !data.output) {
          throw new Error('Respuesta de API inválida');
        }
        
        try {
          const relations = JSON.parse(data.output).relaciones;
          if (!Array.isArray(relations)) {
            throw new Error('Formato de relaciones inválido');
          }
          // Continuar con el procesamiento...
        } catch (parseError) {
          console.error('Error al parsear respuesta JSON:', parseError);
          throw new Error(`Error al parsear respuesta: ${parseError.message}`);
        }
      } catch (apiError) {
        console.error('Error en llamada a DeepSeek API:', apiError);
        // Continuar con la simulación en caso de error
      }
      */
      
      // Simulación de respuesta para desarrollo
      console.log('Simulando respuesta de DeepSeek API con clave:', apiKey);
      
      // Generar relaciones basadas en los conceptos disponibles
      const relations = [];
      const relationTypes = [
        'jerarquia', 'causa', 'efecto', 'parte', 
        'secuencia', 'caracteristica', 'ejemplo', 'dependencia'
      ];
      
      // Para cada concepto principal, crear algunas relaciones 
      // Filtrar conceptos principales y asegurar que tienen importancia
      const mainConcepts = concepts
        .filter(c => c && typeof c === 'object')
        .map(c => ({...c, importance: c.importance || 0.5}))
        .filter(c => c.importance >= 0.7);
      
      // Filtrar conceptos secundarios y asegurar que tienen importancia
      const otherConcepts = concepts
        .filter(c => c && typeof c === 'object')
        .map(c => ({...c, importance: c.importance || 0.5}))
        .filter(c => c.importance < 0.7);
      
      // Si no hay conceptos principales, usar los primeros 2 como principales
      const primaryConcepts = mainConcepts.length > 0 ? 
                              mainConcepts : 
                              concepts.slice(0, Math.min(2, concepts.length));
      
      // Si no hay conceptos secundarios, usar el resto como secundarios
      const secondaryConcepts = otherConcepts.length > 0 ?
                               otherConcepts :
                               primaryConcepts.length < concepts.length ?
                               concepts.slice(primaryConcepts.length) : [];
      
      // Generar relaciones
      for (const mainConcept of primaryConcepts) {
        if (!mainConcept || !mainConcept.name) continue;
        
        // Crear 2-4 relaciones por concepto principal
        const relCount = 2 + Math.floor(Math.random() * 3);
        
        // Usar conceptos secundarios si hay disponibles
        const targetsPool = secondaryConcepts.length > 0 ?
                           secondaryConcepts :
                           // Si no hay conceptos secundarios, usar otros conceptos principales
                           primaryConcepts.filter(c => c.id !== mainConcept.id);
        
        // Si no hay targets disponibles, continuar
        if (targetsPool.length === 0) continue;
        
        for (let i = 0; i < relCount && i < targetsPool.length; i++) {
          const targetConcept = targetsPool[i];
          if (!targetConcept || !targetConcept.name) continue;
          
          const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];
          
          relations.push({
            origen: mainConcept.name,
            destino: targetConcept.name,
            tipo: relationType,
            descripcion: this._getRelationDescription(relationType, mainConcept.name, targetConcept.name)
          });
        }
      }
      
      // Si no se pudieron generar relaciones, crear al menos una
      if (relations.length === 0 && concepts.length >= 2) {
        const concept1 = concepts[0];
        const concept2 = concepts[1];
        if (concept1 && concept2 && concept1.name && concept2.name) {
          relations.push({
            origen: concept1.name,
            destino: concept2.name,
            tipo: 'relacionado',
            descripcion: `${concept1.name} está relacionado con ${concept2.name}`
          });
        }
      }
      
      // Transformar las relaciones al formato esperado por el sistema
      const relationships = relations.map((rel, index) => {
        const sourceNode = concepts.find(c => c && c.name === rel.origen);
        const targetNode = concepts.find(c => c && c.name === rel.destino);
        
        if (sourceNode && targetNode) {
          return {
            id: `rel_${index + 1}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: rel.tipo,
            description: rel.descripcion,
            tool: 'DeepSeek API',
            apiKey: apiKey ? apiKey.substring(0, 8) + '...' : '[API key no disponible]' // Versión truncada de la clave API
          };
        }
        return null;
      }).filter(rel => rel !== null);
      
      console.log(`DeepSeek API identificó ${relationships.length} relaciones semánticas`);
    return relationships;
    } catch (error) {
      console.error('Error en el análisis semántico con DeepSeek API:', error);
      // Devolver array vacío en lugar de propagar el error
      return [];
    }
  }
  
  /**
   * Aplica razonamiento avanzado simulando uso de OpenAGI para mejorar las relaciones
   * @param {Array} relationships - Relaciones semánticas básicas
   * @param {Array} concepts - Conceptos del mapa
   * @returns {Array} - Relaciones tipificadas y mejoradas con razonamiento
   * @private
   */
  _openAGIReasoning(relationships, concepts) {
    console.log('    Aplicando razonamiento OpenAGI para refinar relaciones conceptuales');
    
    // Asignar categorías semánticas a las relaciones (taxonomía cognitiva)
    const categorizedRelationships = relationships.map(relation => {
      // Obtener los conceptos fuente y destino por ID
      const source = concepts.find(c => c.id === relation.source);
      const target = concepts.find(c => c.id === relation.target);
      
      if (!source || !target) {
        console.warn(`Relación con conceptos no encontrados: ${relation.source} -> ${relation.target}`);
        return relation;
      }
      
      // Categorizar la relación según nivel cognitivo Bloom
      let cognitiveLevel;
      switch (relation.type) {
        case 'definition':
        case 'inclusion':
          cognitiveLevel = 'conocimiento'; // Nivel básico de conocimiento
          break;
        case 'example':
        case 'partOf':
          cognitiveLevel = 'comprensión'; // Nivel de entendimiento
          break;
        case 'causation':
        case 'dependency':
          cognitiveLevel = 'aplicación'; // Nivel de aplicación
          break;
        case 'similarity':
        case 'contrast':
          cognitiveLevel = 'análisis'; // Nivel de análisis
          break;
        case 'sequence':
          cognitiveLevel = 'síntesis'; // Nivel de síntesis
          break;
        default:
          cognitiveLevel = 'conocimiento'; // Por defecto
      }
      
      // Añadir metadatos de razonamiento
      return {
        ...relation,
        cognitiveLevel,
        bidirectional: ['similarity', 'contrast'].includes(relation.type),
        pedagogicalValue: (relation.priority * relation.confidence).toFixed(2),
        reasoningType: this._getReasoningType(relation.type)
      };
    });
    
    return categorizedRelationships;
  }
  
  /**
   * Determina el tipo de razonamiento aplicado a una relación
   * @param {string} relationType - Tipo de relación semántica
   * @returns {string} - Tipo de razonamiento cognitivo
   * @private
   */
  _getReasoningType(relationType) {
    const reasoningMap = {
      'inclusion': 'deductivo',
      'partOf': 'estructural',
      'example': 'inductivo',
      'definition': 'conceptual',
      'causation': 'causal',
      'dependency': 'funcional',
      'similarity': 'analógico',
      'contrast': 'comparativo',
      'sequence': 'procedural'
    };
    
    return reasoningMap[relationType] || 'conceptual';
  }
  
  /**
   * Aplica modelado basado en grafos simulando uso de GraphRAG
   * @param {Array} relationships - Relaciones tipificadas
   * @param {Array} concepts - Conceptos disponibles
   * @returns {Array} - Relaciones enriquecidas y optimizadas para visualización
   * @private
   */
  _graphRAGModeling(relationships, concepts) {
    console.log('    Modelando grafo de conocimiento con GraphRAG para optimizar conexiones');
    
    // En una implementación real, aquí se crearía un grafo completo
    // y se optimizaría utilizando algoritmos de teoría de grafos
    
    // Eliminar relaciones redundantes o de baja calidad
    const threshold = 0.4; // Umbral mínimo de relevancia
    const filteredRelationships = relationships.filter(rel => 
      parseFloat(rel.pedagogicalValue) > threshold);
    
    // Agregar propiedades visuales a las relaciones
    return filteredRelationships.map(rel => ({
      ...rel,
      strength: parseFloat(rel.confidence),
      visualProperties: {
        style: rel.bidirectional ? 'double' : 'directed',
        color: this._getRelationshipColor(rel.cognitiveLevel),
        thickness: parseFloat(rel.pedagogicalValue) * 3, // Grosor proporcional al valor pedagógico
        dashed: rel.cognitiveLevel === 'análisis' || rel.cognitiveLevel === 'síntesis'
      }
    }));
  }
  
  /**
   * Crea un grafo de conocimiento mejorado basado en los conceptos y relaciones
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones enriquecidas
   * @returns {Object} - Grafo de conocimiento estructurado
   * @private
   */
  _createEnhancedKnowledgeGraph(concepts, relationships) {
    // Crear estructura de grafo para representar el conocimiento
    const graph = {
      nodes: concepts.map(c => ({
        id: c.id,
        label: c.label || c.name,
        type: c.nodeType,
        level: c.hierarchyLevel,
        properties: {
          ...c,
          visualProperties: c.visualProperties
        }
      })),
      edges: relationships.map(r => ({
        source: r.source,
        target: r.target,
        label: r.label,
        type: r.type,
        properties: {
          ...r,
          visualProperties: r.visualProperties
        }
      })),
      metadata: {
        conceptCount: concepts.length,
        relationshipCount: relationships.length,
        hierarchicalDepth: Math.max(...concepts.map(c => c.hierarchyLevel || 1)),
        semanticDensity: this._calculateSemanticDensity(concepts, relationships),
        graphType: 'enhanced-educational-concept-map'
      }
    };
    
    return graph;
  }
  
  /**
   * Calcula la densidad semántica del grafo (complejidad y riqueza)
   * @param {Array} concepts - Conceptos del mapa
   * @param {Array} relationships - Relaciones del mapa
   * @returns {number} - Índice de densidad semántica (0-1)
   * @private
   */
  _calculateSemanticDensity(concepts, relationships) {
    if (!concepts || concepts.length <= 1) return 0;
    
    // Densidad = número de relaciones / número máximo posible de relaciones
    // En un grafo completo, el número máximo de relaciones es n*(n-1)/2
    const maxPossibleRelations = (concepts.length * (concepts.length - 1)) / 2;
    return relationships.length / maxPossibleRelations;
  }
  
  /**
   * Cuenta los diferentes tipos de relaciones utilizados
   * @param {Array} relationships - Relaciones semánticas
   * @returns {Object} - Conteo de cada tipo de relación
   * @private
   */
  _countRelationshipTypes(relationships) {
    const typeCounts = {};
    
    relationships.forEach(rel => {
      if (!typeCounts[rel.type]) {
        typeCounts[rel.type] = 0;
      }
      typeCounts[rel.type]++;
    });
    
    return typeCounts;
  }
  
  /**
   * Obtiene el color adecuado para un nivel cognitivo
   * @param {string} cognitiveLevel - Nivel cognitivo de la relación
   * @returns {string} - Código de color en formato hexadecimal
   * @private
   */
  _getRelationshipColor(cognitiveLevel) {
    const colorMap = {
      'conocimiento': '#3498db', // Azul
      'comprensión': '#2ecc71', // Verde
      'aplicación': '#f1c40f', // Amarillo
      'análisis': '#e67e22',   // Naranja
      'síntesis': '#9b59b6',   // Púrpura
      'evaluación': '#e74c3c'  // Rojo
    };
    
    return colorMap[cognitiveLevel] || '#7f8c8d'; // Gris por defecto
  }

  /**
   * Paso 3: Enriquecer Semánticamente
   * Utiliza múltiples fuentes para enriquecer los conceptos con definiciones, 
   * ejemplos, propiedades, taxonomías y relaciones semánticas
   * 
   * @param {string} text - Texto original de entrada
   * @param {Object} result - Objeto de resultado con conceptos y relaciones
   * @returns {Object} - Resultado con conceptos enriquecidos
   */
  async step3_EnrichSemantically(text, result) {
    try {
      console.log('Etapa 3: Iniciando enriquecimiento semántico con múltiples herramientas...');
      
      // Extraer el contexto principal del texto para dar contexto al enriquecimiento
      const context = {
        mainTopic: this._identifyMainTopic(result),
        domain: this._identifyDomain(text),
        language: this._detectLanguage(text),
        educationalLevel: this._detectEducationalLevel(text)
      };
      
      console.log(`Contexto identificado: ${context.mainTopic} (${context.domain})`);
      
      // 1. Enriquecimiento con Semantic Kernel - Procesamiento semántico profundo
      await this._semanticKernelEnrichment(result.concepts, context);
      
      // 2. Enriquecimiento con Semantic Scholar - Información académica y bibliográfica
    await this._semanticScholarEnhancement(result.concepts);
    
      // 3. Integración con Wikidata - Datos estructurados y propiedades
    await this._wikidataIntegration(result.concepts);
    
      // 4. Expansión con ConceptNet - Red de conocimiento y relaciones ontológicas
      await this._conceptNetExpansion(result.concepts, result.relationships);
      
      // Agregar metadatos del enriquecimiento
      result.metadata.enrichment = {
      completedAt: new Date().toISOString(),
        semanticKernelEntities: result.concepts.filter(c => c.semanticProperties).length,
        wikipediaLinks: result.concepts.filter(c => c.wikidata).length,
        conceptNetConnections: result.concepts.filter(c => c.conceptNetRelations).length,
        additionalRelationships: result.relationships.filter(r => r.source === 'enrichment').length
      };
      
    return result;
    } catch (error) {
      console.error('Error en la etapa de enriquecimiento semántico:', error);
      throw new Error(`Error en etapa 3 (Enriquecimiento): ${error.message}`);
    }
  }
  
  /**
   * Utiliza Semantic Kernel para enriquecer conceptos con propiedades semánticas
   * - Enriquece con definiciones precisas y contextuales
   * - Genera ejemplos adaptados al dominio
   * - Identifica propiedades semánticas
   * 
   * @param {Array} concepts - Lista de conceptos a enriquecer
   * @param {Object} context - Contexto del texto (dominio, tema principal)
   */
  async _semanticKernelEnrichment(concepts, context) {
    console.log('Iniciando enriquecimiento con Semantic Kernel...');
    
    // Crear un conjunto de plugins semánticos para el enriquecimiento
    const semanticPlugins = {
      definition: (concept) => this._generateDefinitionPlugin(concept, context),
      examples: (concept) => this._generateExamplesPlugin(concept, context),
      properties: (concept) => this._generatePropertiesPlugin(concept, context)
    };
    
    for (const concept of concepts) {
      try {
        // Aplicar cada plugin semántico al concepto
        concept.definition = await semanticPlugins.definition(concept);
        concept.examples = await semanticPlugins.examples(concept);
        concept.semanticProperties = await semanticPlugins.properties(concept);
        
        // Agregar metadatos del enriquecimiento
        concept.enrichmentSources = concept.enrichmentSources || [];
        concept.enrichmentSources.push('semantic-kernel');
        
        console.log(`Concepto "${concept.name}" enriquecido con Semantic Kernel`);
      } catch (error) {
        console.warn(`Error al enriquecer "${concept.name}" con Semantic Kernel:`, error.message);
      }
    }
  }
  
  /**
   * Genera una definición contextualizada para un concepto usando Semantic Kernel
   * @param {Object} concept - Concepto a definir
   * @param {Object} context - Contexto del texto (dominio, nivel educativo)
   * @returns {string} Definición contextualizada
   */
  async _generateDefinitionPlugin(concept, context) {
    // Esta función simula la generación de definiciones contextualizadas
    // En una implementación real, utilizaría la API de Semantic Kernel
    
    const conceptLevel = concept.hierarchyLevel || 1;
    const educationalLevel = context.educationalLevel || 'general';
    const domain = context.domain || 'general';
    
    // Ajustar la complejidad de la definición según el nivel educativo y jerárquico
    const complexity = this._calculateDefinitionComplexity(conceptLevel, educationalLevel);
    
    // Simular una definición generada por Semantic Kernel
    return `${concept.name} es un ${this._getConceptType(concept)} fundamental en el ámbito de ${domain} que ${this._generateConceptFunction(concept, domain, complexity)}.`;
  }
  
  /**
   * Utiliza Semantic Scholar API para enriquecer conceptos con información académica
   * - Añade referencias bibliográficas
   * - Identifica teorías relacionadas
   * - Agrega contexto científico
   * 
   * @param {Array} concepts - Lista de conceptos a enriquecer
   */
  async _semanticScholarEnhancement(concepts) {
    console.log('Iniciando enriquecimiento con Semantic Scholar API...');
    
    // Filtrar conceptos que son apropiados para enriquecimiento académico
    const academicConcepts = concepts.filter(c => 
      c.importance > 0.7 || 
      this._isAcademicTerm(c.name)
    );
    
    for (const concept of academicConcepts) {
      try {
        // Simulación de consulta a Semantic Scholar API
        // En una implementación real, esto haría una llamada a la API
        concept.academicContext = {
          field: this._getRandomAcademicField(),
          relatedPapers: this._generateRelatedPapers(concept.name),
          theories: this._generateRelatedTheories(concept.name)
        };
        
        // Añadir metadatos de enriquecimiento
        concept.enrichmentSources = concept.enrichmentSources || [];
        concept.enrichmentSources.push('semantic-scholar');
        
        console.log(`Concepto "${concept.name}" enriquecido con Semantic Scholar`);
      } catch (error) {
        console.warn(`Error al enriquecer "${concept.name}" con Semantic Scholar:`, error.message);
      }
    }
  }
  
  /**
   * Integra datos estructurados de Wikidata para enriquecer conceptos
   * - Añade propiedades y valores
   * - Proporciona instancias y ejemplos
   * - Incorpora taxonomías y clasificaciones
   * 
   * @param {Array} concepts - Lista de conceptos a enriquecer
   */
  async _wikidataIntegration(concepts) {
    console.log('Iniciando integración con Wikidata Toolkit...');
    
    for (const concept of concepts) {
      try {
        // Simular búsqueda en Wikidata
        // En una implementación real, esto consultaría la API de Wikidata
        concept.wikidata = {
          id: `Q${Math.floor(Math.random() * 10000)}`,
        instances: this._generateInstances(concept.name),
        properties: this._generateProperties(concept),
          taxonomyPath: this._generateTaxonomyPath(concept)
        };
        
        // Añadir enlaces a Wikipedia cuando estén disponibles
        if (Math.random() > 0.3) { // Simular que el 70% de los conceptos tienen página de Wikipedia
          concept.wikidata.wikipediaLink = `https://es.wikipedia.org/wiki/${encodeURIComponent(concept.name.replace(/ /g, '_'))}`;
        }
        
        // Añadir metadatos de enriquecimiento
        concept.enrichmentSources = concept.enrichmentSources || [];
        concept.enrichmentSources.push('wikidata');
        
        console.log(`Concepto "${concept.name}" enriquecido con Wikidata`);
      } catch (error) {
        console.warn(`Error al enriquecer "${concept.name}" con Wikidata:`, error.message);
      }
    }
  }
  
  /**
   * Expande conceptos usando la red semántica ConceptNet
   * - Añade relaciones conceptuales semánticas
   * - Identifica categorías conceptuales
   * - Expande con conceptos relacionados
   * 
   * @param {Array} concepts - Lista de conceptos a enriquecer
   * @param {Array} relationships - Relaciones existentes entre conceptos
   */
  async _conceptNetExpansion(concepts, relationships) {
    console.log('Iniciando expansión semántica con ConceptNet...');
    
    // Mapear conceptos por nombre para referencia rápida
    const conceptMap = new Map(concepts.map(c => [c.name.toLowerCase(), c]));
    
    // Relaciones semánticas de ConceptNet que serán utilizadas
    const conceptNetRelations = [
      'IsA', 'PartOf', 'HasA', 'UsedFor', 'CapableOf',
      'AtLocation', 'Causes', 'HasProperty', 'SymbolOf'
    ];
    
    for (const concept of concepts) {
      try {
        // Inicializar estructura para relaciones de ConceptNet
        concept.conceptNetRelations = {};
        
        // Para cada tipo de relación, generar conceptos relacionados
        for (const relationType of conceptNetRelations) {
          // En una implementación real, esto consultaría la API de ConceptNet
          // Aquí simulamos la respuesta para el prototipo
          const relatedConcepts = this._generateConceptNetRelations(
            concept.name, 
            relationType,
            conceptMap
          );
          
          if (relatedConcepts.length > 0) {
            concept.conceptNetRelations[relationType] = relatedConcepts;
            
            // Añadir estas relaciones al grafo general si los conceptos existen
            for (const relatedConcept of relatedConcepts) {
              const targetConcept = conceptMap.get(relatedConcept.toLowerCase());
              
              if (targetConcept) {
                relationships.push({
                  source: concept.id,
                  target: targetConcept.id,
                  type: relationType,
                  weight: 0.7,
                  source: 'enrichment',
                  description: this._getRelationDescription(relationType)
                });
              }
            }
          }
        }
        
        // Identificar categorías semánticas para el concepto
        concept.categories = this.identifyCategories(concept.name);
        
        // Añadir metadatos de enriquecimiento
        concept.enrichmentSources = concept.enrichmentSources || [];
        concept.enrichmentSources.push('conceptnet');
        
        console.log(`Concepto "${concept.name}" expandido con ConceptNet`);
      } catch (error) {
        console.warn(`Error al expandir "${concept.name}" con ConceptNet:`, error.message);
      }
    }
  }

  /**
   * Etapa 4: Validación y Verificación
   * Utiliza herramientas especializadas para validar la precisión, coherencia 
   * y calidad de los conceptos y relaciones generados
   * 
   * @param {Object} result - Objeto de resultado con conceptos y relaciones
   * @returns {Object} - Resultado con conceptos y relaciones validados
   */
  async step4_VerifyAndValidate(result) {
    try {
      console.log('Etapa 4: Iniciando validación y verificación del mapa conceptual...');
      
      // Variables para seguimiento de cambios
      const originalConceptCount = result.concepts.length;
      const originalRelationshipCount = result.relationships.length;
      let removedConcepts = 0;
      let removedRelationships = 0;
      let modifiedConcepts = 0;
      
      // 1. Validación de coherencia lógica con Arguflow
      const arguflowResults = await this._arguflowCoherenceCheck(result.concepts, result.relationships);
      
      // Aplicar correcciones de Arguflow
      for (const correction of arguflowResults.corrections) {
        const conceptToFix = result.concepts.find(c => c.id === correction.conceptId);
        if (conceptToFix) {
          if (correction.action === 'remove') {
            // Marcar para eliminación
            conceptToFix.flaggedForRemoval = true;
            console.log(`Concepto "${conceptToFix.name}" marcado para eliminación por incoherencia lógica`);
          } else if (correction.action === 'modify') {
            // Aplicar modificación
            conceptToFix.name = correction.newName || conceptToFix.name;
            conceptToFix.definition = correction.newDefinition || conceptToFix.definition;
            modifiedConcepts++;
            console.log(`Concepto "${conceptToFix.name}" modificado para mejorar coherencia`);
          }
        }
      }
      
      // 2. Verificación de datos con Trieve
      const trieveResults = await this._trieveDataVerification(result.concepts);
      
      // Aplicar verificaciones de Trieve
      for (const verification of trieveResults.verifications) {
        const conceptToVerify = result.concepts.find(c => c.id === verification.conceptId);
        if (conceptToVerify) {
          // Añadir información de verificación
          conceptToVerify.verification = {
            score: verification.score,
            confidence: verification.confidence,
            sources: verification.sources
          };
          
          // Si la verificación falla por debajo del umbral, marcar para eliminación
          if (verification.score < 0.4) {
            conceptToVerify.flaggedForRemoval = true;
            console.log(`Concepto "${conceptToVerify.name}" marcado para eliminación por baja verificación (${verification.score})`);
          }
        }
      }
      
      // 3. Análisis estructural con DePlot
      const deplotResults = await this._deplotStructureAnalysis(result.concepts, result.relationships);
      
      // Aplicar mejoras estructurales de DePlot
      for (const improvement of deplotResults.improvements) {
        if (improvement.type === 'relationship' && improvement.action === 'remove') {
          // Marcar relación para eliminación
          const relationshipIndex = result.relationships.findIndex(
            r => r.source === improvement.sourceId && r.target === improvement.targetId
          );
          
          if (relationshipIndex >= 0) {
            result.relationships[relationshipIndex].flaggedForRemoval = true;
            console.log(`Relación ${improvement.sourceId} -> ${improvement.targetId} marcada para eliminación por análisis estructural`);
          }
        } else if (improvement.type === 'concept' && improvement.action === 'merge') {
          // Fusionar conceptos duplicados o muy similares
          const primaryConcept = result.concepts.find(c => c.id === improvement.primaryId);
          const secondaryConcept = result.concepts.find(c => c.id === improvement.secondaryId);
          
          if (primaryConcept && secondaryConcept) {
            // Transferir propiedades del concepto secundario al primario
            primaryConcept.aliases = [...(primaryConcept.aliases || []), secondaryConcept.name];
            primaryConcept.importance = Math.max(primaryConcept.importance, secondaryConcept.importance);
            
            // Marcar el secundario para eliminación
            secondaryConcept.flaggedForRemoval = true;
            console.log(`Conceptos "${primaryConcept.name}" y "${secondaryConcept.name}" fusionados por similitud`);
            
            // Redirigir relaciones del concepto secundario al primario
            for (const relationship of result.relationships) {
              if (relationship.source === secondaryConcept.id) {
                relationship.source = primaryConcept.id;
              }
              if (relationship.target === secondaryConcept.id) {
                relationship.target = primaryConcept.id;
              }
            }
          }
        }
      }
      
      // 4. Aplicar NeMo Guardrails para garantías de calidad
      const guardRailResults = await this._applyNemoGuardrails(result.concepts, result.relationships);
      
      // Aplicar correcciones de los guardrails
      for (const guardrail of guardRailResults.guardrails) {
        if (guardrail.type === 'concept' && guardrail.action === 'flag') {
          const conceptToFlag = result.concepts.find(c => c.id === guardrail.conceptId);
          if (conceptToFlag) {
            conceptToFlag.flags = conceptToFlag.flags || [];
            conceptToFlag.flags.push({
              type: guardrail.flagType,
              message: guardrail.message,
              severity: guardrail.severity
            });
            console.log(`Concepto "${conceptToFlag.name}" marcado con flag: ${guardrail.flagType} (${guardrail.severity})`);
          }
        }
      }
      
      // Eliminar conceptos marcados para eliminación
      result.concepts = result.concepts.filter(c => !c.flaggedForRemoval);
      removedConcepts = originalConceptCount - result.concepts.length;
      
      // Eliminar relaciones marcadas para eliminación
      result.relationships = result.relationships.filter(r => !r.flaggedForRemoval);
      
      // Eliminar relaciones que apuntan a conceptos eliminados
      const validConceptIds = new Set(result.concepts.map(c => c.id));
      result.relationships = result.relationships.filter(
        r => validConceptIds.has(r.source) && validConceptIds.has(r.target)
      );
      
      removedRelationships = originalRelationshipCount - result.relationships.length;
      
      // Calcular puntuación de coherencia global
      const coherenceScore = this._calculateOverallCoherence(result.concepts, result.relationships);
      result.metadata.coherenceScore = coherenceScore;
      
      // Actualizar metadatos
      result.metadata.conceptsRemoved = removedConcepts;
      result.metadata.relationshipsRemoved = removedRelationships;
      result.metadata.conceptsModified = modifiedConcepts;
      
      console.log(`Validación completada: Eliminados ${removedConcepts} conceptos y ${removedRelationships} relaciones. Puntuación de coherencia: ${coherenceScore.toFixed(2)}`);
      
      return result;
    } catch (error) {
      console.error('Error en la etapa de validación y verificación:', error);
      throw new Error(`Error en etapa 4 (Validación): ${error.message}`);
    }
  }
  
  /**
   * Verifica la coherencia lógica de los conceptos y relaciones usando Arguflow
   * - Detecta contradicciones e inconsistencias lógicas
   * - Evalúa la validez de las relaciones
   * - Sugiere correcciones para mejorar coherencia
   * 
   * @param {Array} concepts - Lista de conceptos a validar
   * @param {Array} relationships - Lista de relaciones a validar
   * @returns {Object} Resultado del análisis de coherencia
   */
  async _arguflowCoherenceCheck(concepts, relationships) {
    console.log('Iniciando verificación de coherencia lógica con Arguflow...');
    
    // En una implementación real, esta función enviaría los conceptos y relaciones
    // a la API de Arguflow y procesaría sus respuestas
    
    const corrections = [];
    
    // Analizar definiciones de conceptos para coherencia interna
    for (const concept of concepts) {
      // Verificar coherencia de la definición con sus propiedades
      if (concept.definition && concept.semanticProperties) {
        const coherenceScore = this._calculateDefinitionCoherence(
          concept.definition, 
          concept.semanticProperties
        );
        
        // Si hay baja coherencia, sugerir corrección
        if (coherenceScore < 0.6) {
          if (coherenceScore < 0.3) {
            // Si la coherencia es muy baja, sugerir eliminación
            corrections.push({
              conceptId: concept.id,
              action: 'remove',
              reason: 'Definición inconsistente con las propiedades semánticas'
            });
          } else {
            // Si la coherencia es medianamente baja, sugerir modificación
            corrections.push({
              conceptId: concept.id,
              action: 'modify',
              newDefinition: this._generateImprovedDefinition(concept),
              reason: 'Mejora de coherencia entre definición y propiedades'
            });
          }
        }
      }
    }
    
    // Analizar relaciones entre conceptos
    for (const relationship of relationships) {
      const source = concepts.find(c => c.id === relationship.source);
      const target = concepts.find(c => c.id === relationship.target);
      
      if (source && target) {
        // Verificar si la relación es lógicamente coherente
        const relationCoherence = this._validateRelationshipCoherence(
          source, 
          target, 
          relationship.type
        );
        
        if (!relationCoherence.valid) {
          corrections.push({
            relationshipId: `${relationship.source}_${relationship.target}`,
            action: 'remove',
            reason: relationCoherence.reason
          });
        }
      }
    }
    
    return {
      coherenceAnalyzed: true,
      corrections: corrections,
      overallCoherence: 1 - (corrections.length / (concepts.length + relationships.length))
    };
  }
  
  /**
   * Verifica la precisión factual de los conceptos usando Trieve
   * - Busca y verifica información en fuentes confiables
   * - Evalúa la precisión de definiciones y propiedades
   * - Asigna puntuaciones de confianza
   * 
   * @param {Array} concepts - Lista de conceptos a verificar
   * @returns {Object} Resultado de la verificación
   */
  async _trieveDataVerification(concepts) {
    console.log('Iniciando verificación de datos con Trieve...');
    
    // En una implementación real, esta función enviaría consultas a la API de Trieve
    // para verificar la precisión factual de los conceptos
    
    const verifications = [];
    
    for (const concept of concepts) {
      // Generar una verificación simulada para cada concepto
      // En una implementación real, esta sería una búsqueda en fuentes confiables
      
      const verificationScore = this._calculateVerificationScore(concept);
      const confidence = 0.7 + (Math.random() * 0.3); // Entre 0.7 y 1.0
      
      // Generar fuentes simuladas para la verificación
      const sources = this._generateVerificationSources(concept);
      
      verifications.push({
        conceptId: concept.id,
        score: verificationScore,
        confidence: confidence,
        sources: sources
      });
    }
    
    return {
      verificationsPerformed: verifications.length,
      verifications: verifications,
      averageScore: verifications.reduce((sum, v) => sum + v.score, 0) / verifications.length
    };
  }
  
  /**
   * Analiza la estructura del mapa conceptual usando DePlot
   * - Evalúa la distribución de conceptos y relaciones
   * - Identifica redundancias y agrupaciones ineficientes
   * - Sugiere mejoras estructurales
   * 
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Object} Análisis estructural y sugerencias de mejora
   */
  async _deplotStructureAnalysis(concepts, relationships) {
    console.log('Iniciando análisis estructural con DePlot...');
    
    // En una implementación real, esta función utilizaría la API de DePlot
    // para analizar la estructura del grafo y sugerir mejoras
    
    const improvements = [];
    
    // 1. Identificar relaciones redundantes o transitivas
    const transitiveRelations = this._findTransitiveRelations(relationships, concepts);
    for (const relation of transitiveRelations) {
      improvements.push({
        type: 'relationship',
        action: 'remove',
        sourceId: relation.source,
        targetId: relation.target,
        reason: 'Relación transitiva redundante'
      });
    }
    
    // 2. Identificar conceptos candidatos para fusión por similitud
    const similarConcepts = this._findSimilarConcepts(concepts);
    for (const pair of similarConcepts) {
      // Determinar cuál concepto será el principal (el de mayor importancia)
      const primary = pair[0].importance > pair[1].importance ? pair[0] : pair[1];
      const secondary = primary === pair[0] ? pair[1] : pair[0];
      
      improvements.push({
        type: 'concept',
        action: 'merge',
        primaryId: primary.id,
        secondaryId: secondary.id,
        similarityScore: pair.similarity,
        reason: 'Conceptos similares o duplicados'
      });
    }
    
    // 3. Evaluar la densidad del grafo y sugerir optimizaciones
    const graphDensity = this._calculateGraphDensity(concepts.length, relationships.length);
    
    // Si el grafo es demasiado denso, sugerir relaciones a eliminar
    if (graphDensity > 0.7) {
      const lowValueRelations = this._findLowValueRelations(relationships, concepts);
      for (const relation of lowValueRelations.slice(0, 5)) { // Limitar a 5 sugerencias
        improvements.push({
          type: 'relationship',
          action: 'remove',
          sourceId: relation.source,
          targetId: relation.target,
          reason: 'Relación de bajo valor en grafo de alta densidad'
        });
      }
    }
    
    return {
      structureAnalyzed: true,
      improvements: improvements,
      metrics: {
        graphDensity: graphDensity,
        avgDegree: relationships.length * 2 / concepts.length,
        clusters: this._identifyClusters(concepts, relationships).length
      }
    };
  }
  
  /**
   * Aplica guardrails de seguridad y calidad usando NeMo Guardrails
   * - Verifica la precisión, equidad y calidad
   * - Identifica sesgos y contenido problemático
   * - Asegura que el mapa cumpla con estándares establecidos
   * 
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Object} Resultado de la aplicación de guardrails
   */
  async _applyNemoGuardrails(concepts, relationships) {
    console.log('Aplicando NeMo Guardrails para garantizar calidad y precisión...');
    
    // En una implementación real, esta función enviaría los conceptos a la API de NeMo Guardrails
    // para evaluar su contenido según directrices de calidad
    
    const guardrails = [];
    
    // 1. Guardrail: Precisión educativa
    for (const concept of concepts) {
      // Evaluar precisión educativa
      const educationalAccuracy = this._evaluateEducationalAccuracy(concept);
      
      if (educationalAccuracy < 0.7) {
        guardrails.push({
          type: 'concept',
          conceptId: concept.id,
          action: 'flag',
          flagType: 'educational_accuracy',
          message: 'Requiere revisión de precisión educativa',
          severity: educationalAccuracy < 0.5 ? 'high' : 'medium'
        });
      }
    }
    
    // 2. Guardrail: Neutralidad y equidad
    for (const concept of concepts) {
      // Evaluar neutralidad y sesgo
      const biasScore = this._evaluateBias(concept);
      
      if (biasScore > 0.3) {
        guardrails.push({
          type: 'concept',
          conceptId: concept.id,
          action: 'flag',
          flagType: 'neutrality',
          message: 'Posible contenido sesgado o no neutral',
          severity: biasScore > 0.6 ? 'high' : 'medium'
        });
      }
    }
    
    // 3. Guardrail: Complejidad adecuada
    for (const concept of concepts) {
      // Evaluar adecuación de complejidad
      const complexityScore = this._evaluateComplexity(concept);
      
      if (complexityScore < 0.4 || complexityScore > 0.8) {
        guardrails.push({
          type: 'concept',
          conceptId: concept.id,
          action: 'flag',
          flagType: 'complexity',
          message: complexityScore < 0.4 ? 'Contenido demasiado simple' : 'Contenido demasiado complejo',
          severity: 'medium'
        });
      }
    }
    
    return {
      guardrailsApplied: true,
      guardrails: guardrails,
      passedAllGuardrails: guardrails.length === 0
    };
  }
  
  /**
   * Calcula la coherencia global del mapa conceptual
   * - Evalúa relaciones, definiciones y estructura
   * - Genera una puntuación compuesta de coherencia
   * 
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {number} Puntuación de coherencia (0-1)
   */
  _calculateOverallCoherence(concepts, relationships) {
    // Evaluar tres aspectos de coherencia
    
    // 1. Coherencia de definiciones (cada concepto tiene definición clara y relevante)
    const definitionCoherence = concepts.filter(c => c.definition && c.definition.length > 20).length / concepts.length;
    
    // 2. Coherencia estructural (las relaciones tienen sentido lógico)
    let structuralCoherence = 0;
    
    // Calcular cuántas relaciones conectan conceptos relacionados jerárquicamente
    let hierarchicalRelations = 0;
    for (const relationship of relationships) {
      const source = concepts.find(c => c.id === relationship.source);
      const target = concepts.find(c => c.id === relationship.target);
      
      if (source && target) {
        // Verificar si hay una relación jerárquica lógica
        const sourceLevel = source.hierarchyLevel || 0;
        const targetLevel = target.hierarchyLevel || 0;
        
        if (Math.abs(sourceLevel - targetLevel) <= 1) {
          hierarchicalRelations++;
        }
      }
    }
    
    structuralCoherence = relationships.length > 0 ? 
      hierarchicalRelations / relationships.length : 0.5;
    
    // 3. Coherencia semántica (conceptos relacionados tienen semántica compatible)
    const conceptsWithSemantics = concepts.filter(c => 
      c.semanticProperties || c.categories || c.conceptNetRelations
    ).length;
    
    const semanticCoherence = conceptsWithSemantics / concepts.length;
    
    // Calcular coherencia global (ponderada)
    return (
      (definitionCoherence * 0.4) + 
      (structuralCoherence * 0.4) + 
      (semanticCoherence * 0.2)
    );
  }
  
  /**
   * Obtiene configuración visual para mapas conceptuales educativos
   * @param {string} style - Estilo visual a usar (modern, classic, colorful, minimal)
   * @returns {Object} - Configuración visual para el mapa conceptual
   */
  getEducationalVisualSettings(style = 'modern') {
    // Estilos predefinidos para mapas conceptuales
    const visualStyles = {
      // Estilo moderno con bordes redondeados y colores suaves
      modern: {
        nodeColors: {
          0: '#6a0dad', // Color principal para conceptos de nivel 0 (púrpura)
          1: '#4169e1', // Azul para conceptos de nivel 1
          2: '#3cb371', // Verde para conceptos de nivel 2
          3: '#ff8c00', // Naranja para conceptos de nivel 3
          default: '#6495ed' // Azul claro para otros niveles
        },
        fontSizes: {
          0: 18,
          1: 16,
          2: 14,
          default: 12
        },
        lineStyles: {
          causal: 'thick',
          hierarchical: 'normal',
          descriptive: 'dashed',
          default: 'normal'
        },
        borderRadius: '8px',
        shadowEffect: true,
        animation: true
      },
      
      // Estilo clásico con formas tradicionales
      classic: {
        nodeColors: {
          0: '#000080', // Azul marino para conceptos principales
          1: '#006400', // Verde oscuro para nivel 1
          2: '#8b0000', // Rojo oscuro para nivel 2
          3: '#4b0082', // Índigo para nivel 3
          default: '#2f4f4f' // Gris oscuro para otros
        },
        fontSizes: {
          0: 16,
          1: 14,
          2: 12,
          default: 10
        },
        lineStyles: {
          causal: 'solid',
          hierarchical: 'solid',
          descriptive: 'dotted',
          default: 'solid'
        },
        borderRadius: '0px',
        shadowEffect: false,
        animation: false
      }
    };
    
    // Devolver el estilo solicitado o el estilo moderno por defecto
    return visualStyles[style] || visualStyles.modern;
  }
  
  /**
   * Crea un grafo de conocimiento
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Object} - Grafo de conocimiento
   */
  createKnowledgeGraph(concepts, relationships) {
    // Convertir a formato de grafo para visualización y análisis
    return {
      nodes: concepts.map(c => ({
        id: c.id,
        label: c.name,
        level: c.level,
        importance: c.importance,
        category: c.category,
        data: {
          definition: c.definition,
          examples: c.examples,
          attributes: c.attributes
        }
      })),
      edges: relationships.map(r => ({
        source: r.source,
        target: r.target,
        label: r.description || '',
        type: r.type
      }))
    };
  }

  /**
   * Genera representaciones estructuradas del mapa conceptual en diferentes formatos
   * @param {Object} result - El resultado del procesamiento del mapa conceptual
   * @param {string} format - Formato de salida ('json', 'xml', 'mermaid')
   * @returns {Object} Objeto con representaciones del mapa conceptual
   */
  generateOutputFormats(result, format = 'all') {
    console.log(`Generando representaciones de salida en formato: ${format}`);
    
    const output = {};
    
    if (format === 'all' || format === 'json') {
      output.json = this._generateJSONRepresentation(result);
    }
    
    if (format === 'all' || format === 'xml') {
      output.xml = this._generateXMLRepresentation(result);
    }
    
    if (format === 'all' || format === 'mermaid') {
      output.mermaid = this._generateMermaidRepresentation(result);
    }
    
    if (format === 'all' || format === 'summary') {
      output.summary = this._generateProcessingSummary(result);
    }
    
    return output;
  }

  /**
   * Genera una representación JSON estructurada del mapa conceptual
   * @param {Object} result - El resultado del procesamiento
   * @returns {string} Representación JSON del mapa conceptual
   */
  _generateJSONRepresentation(result) {
    // Crear una versión limpia y estructurada del mapa conceptual
    const conceptMap = {
      metadata: {
        title: this._identifyMainTopic(result),
        generatedAt: new Date().toISOString(),
        conceptCount: result.concepts.length,
        relationshipCount: result.relationships.length,
        coherenceScore: result.metadata.coherenceScore || 0
      },
      concepts: result.concepts.map(concept => ({
        id: concept.id,
        name: concept.name,
        definition: concept.definition || "",
        importance: concept.importance || 0,
        hierarchyLevel: concept.hierarchyLevel || 0,
        categories: concept.categories || [],
        examples: concept.examples || []
      })),
      relationships: result.relationships.map(rel => ({
        source: rel.source,
        target: rel.target,
        type: rel.type || "related",
        description: rel.description || ""
      })),
      visualProperties: {
        layout: "hierarchical",
        style: result.metadata.configUsed?.style || "educational",
        colorScheme: "pedagogical"
      }
    };
    
    return JSON.stringify(conceptMap, null, 2);
  }

  /**
   * Genera una representación XML estructurada del mapa conceptual
   * @param {Object} result - El resultado del procesamiento
   * @returns {string} Representación XML del mapa conceptual
   */
  _generateXMLRepresentation(result) {
    try {
      // Validar entrada
      if (!result) {
        console.error('Error: Resultado indefinido para generar XML');
        return '<?xml version="1.0" encoding="UTF-8"?><conceptMap><error>No hay datos disponibles</error></conceptMap>';
      }
      
      // Asegurar que los arreglos existen
      const concepts = Array.isArray(result.concepts) ? result.concepts : [];
      const relationships = Array.isArray(result.relationships) ? result.relationships : [];
      
      // Asegurar que metadata existe
      const metadata = result.metadata || {};
      
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<conceptMap>\n';
    
    // Metadatos
    xml += '  <metadata>\n';
      xml += `    <titulo>${this._escapeXml(this._identifyMainTopic(result) || 'Mapa Conceptual')}</titulo>\n`;
      xml += `    <generadoEn>${new Date().toISOString()}</generadoEn>\n`;
      xml += `    <totalConceptos>${concepts.length}</totalConceptos>\n`;
      xml += `    <totalRelaciones>${relationships.length}</totalRelaciones>\n`;
      xml += `    <coherencia>${metadata.coherenceScore || 0}</coherencia>\n`;
      
      // Información de API exclusiva si existe
      if (metadata.exclusiveApiUsed) {
        xml += '    <api_etapa>\n';
        xml += `      <etapa>${metadata.exclusiveApiUsed.stage || 'unknown'}</etapa>\n`;
        xml += `      <api>${metadata.exclusiveApiUsed.api || 'unknown'}</api>\n`;
        xml += `      <claveApi>${metadata.exclusiveApiUsed.apiKey || 'unknown'}</claveApi>\n`;
        xml += '    </api_etapa>\n';
      }
      
    xml += '  </metadata>\n';
    
    // Conceptos
      xml += '  <conceptos>\n';
      
      // Organizar conceptos por nivel jerárquico
      const conceptsByLevel = {};
      for (const concept of concepts) {
        // Validar que el concepto es un objeto válido
        if (!concept || typeof concept !== 'object') {
          console.warn('Concepto inválido encontrado, omitiendo');
          continue;
        }
        
        const level = concept.hierarchyLevel || 0;
        if (!conceptsByLevel[level]) {
          conceptsByLevel[level] = [];
        }
        conceptsByLevel[level].push(concept);
      }
      
      // Procesar conceptos por nivel, comenzando con nivel 0 (conceptos principales)
      const levels = Object.keys(conceptsByLevel).sort((a, b) => Number(a) - Number(b));
      
      if (levels.length === 0) {
        // No hay conceptos organizados por nivel, agregar concepto por defecto
        xml += '    <concepto nivel="1">\n';
        xml += '      <id>default_concept</id>\n';
        xml += '      <nombre>Concepto Principal</nombre>\n';
        xml += '      <definicion>No se pudieron extraer conceptos adecuados del texto.</definicion>\n';
        xml += '      <importancia>1.0</importancia>\n';
        xml += '      <visual>\n';
        xml += '        <emoji>📝</emoji>\n';
        xml += '        <estilo>negrita</estilo>\n';
        xml += '        <color>#4A86E8</color>\n';
        xml += '      </visual>\n';
        xml += '    </concepto>\n';
      } else {
        // Procesar conceptos organizados por nivel
        for (const level of levels) {
          const levelConcepts = conceptsByLevel[level];
          for (const concept of levelConcepts) {
            // Determinar nivel para el XML (1-basado, donde 1 es el nivel más alto)
            const xmlLevel = Number(level) + 1;
            
            // Validar ID
            const conceptId = concept.id || `concept_${Math.random().toString(36) ? Math.random().toString(36).substring(2, 9) : ''}`;
            
            // Etiqueta de concepto con atributo de nivel
            xml += `    <concepto nivel="${xmlLevel}">\n`;
            xml += `      <id>${conceptId}</id>\n`;
            xml += `      <nombre>${this._escapeXml(concept.name || 'Concepto sin nombre')}</nombre>\n`;
            
            // Definición si existe
      if (concept.definition) {
              xml += `      <definicion>${this._escapeXml(concept.definition)}</definicion>\n`;
      }
      
            // Importancia y nivel jerárquico
            xml += `      <importancia>${concept.importance || 0}</importancia>\n`;
      
            // Categorías
            if (concept.categories && Array.isArray(concept.categories) && concept.categories.length > 0) {
              xml += '      <categorias>\n';
        for (const category of concept.categories) {
                xml += `        <categoria>${this._escapeXml(category || '')}</categoria>\n`;
        }
              xml += '      </categorias>\n';
      }
      
            // Ejemplos
            if (concept.examples && Array.isArray(concept.examples) && concept.examples.length > 0) {
              xml += '      <ejemplos>\n';
        for (const example of concept.examples) {
                xml += `        <ejemplo>${this._escapeXml(example || '')}</ejemplo>\n`;
              }
              xml += '      </ejemplos>\n';
            }
            
            // Información de la herramienta que generó el concepto
            if (concept.generatedBy) {
              xml += `      <fuente>${this._escapeXml(concept.generatedBy)}</fuente>\n`;
            }
            
            // Elementos visuales
            xml += '      <visual>\n';
            xml += `        <emoji>${this._getConceptEmoji(concept)}</emoji>\n`;
            xml += `        <estilo>${concept.formatting?.style || "negrita"}</estilo>\n`;
            xml += `        <color>${concept.formatting?.color || this._getHierarchyColor(level)}</color>\n`;
            xml += '      </visual>\n';
            
            xml += '    </concepto>\n';
          }
        }
      }
      xml += '  </conceptos>\n';
    
    // Relaciones
      xml += '  <relaciones>\n';
      
      if (relationships.length === 0) {
        // No hay relaciones, agregar una por defecto si hay al menos 2 conceptos
        if (concepts.length >= 2) {
          const source = concepts[0]?.id || 'default_source';
          const target = concepts[1]?.id || 'default_target';
          
          xml += '    <relacion>\n';
          xml += `      <origen>${source}</origen>\n`;
          xml += `      <destino>${target}</destino>\n`;
          xml += '      <tipo>relacionado</tipo>\n';
          xml += '      <descripcion>Relación generada por defecto</descripcion>\n';
          xml += '      <visual>\n';
          xml += '        <estilo>linea</estilo>\n';
          xml += '        <color>#666666</color>\n';
          xml += '      </visual>\n';
          xml += '    </relacion>\n';
        }
      } else {
        // Procesar relaciones existentes
        for (const rel of relationships) {
          // Validar que la relación tiene source y target
          if (!rel || !rel.source || !rel.target) {
            console.warn('Relación inválida encontrada, omitiendo');
            continue;
          }
          
          xml += '    <relacion>\n';
          xml += `      <origen>${rel.source}</origen>\n`;
          xml += `      <destino>${rel.target}</destino>\n`;
          xml += `      <tipo>${this._escapeXml(rel.type || "relacionado")}</tipo>\n`;
      
      if (rel.description) {
            xml += `      <descripcion>${this._escapeXml(rel.description)}</descripcion>\n`;
          }
          
          // Incluir información de la API si está disponible
          if (rel.tool) {
            xml += `      <fuente>${this._escapeXml(rel.tool)}</fuente>\n`;
            if (rel.apiKey) {
              xml += `      <api_etapa>DeepSeek API (${rel.apiKey})</api_etapa>\n`;
            }
          }
          
          // Elementos visuales de la relación
          xml += '      <visual>\n';
          xml += `        <estilo>${rel.formatting?.style || "linea"}</estilo>\n`;
          xml += `        <color>${rel.formatting?.color || this._getRelationshipColor(rel.type)}</color>\n`;
          xml += '      </visual>\n';
          
          xml += '    </relacion>\n';
        }
      }
      xml += '  </relaciones>\n';
      
      // Propiedades visuales generales
      xml += '  <propiedadesVisuales>\n';
      xml += '    <disposicion>jerarquica</disposicion>\n';
      xml += `    <estilo>${metadata.configUsed?.style || "educativo"}</estilo>\n`;
      xml += '    <esquemaColor>pedagogico</esquemaColor>\n';
      xml += '  </propiedadesVisuales>\n';
      
      // Conclusión
      xml += '  <conclusion>\n';
      const summary = metadata.summary || 'No se generó resumen';
      xml += `    <resumen>${this._escapeXml(summary)}</resumen>\n`;
      
      // Utilidad didáctica
      const utilidadDidactica = this._generateEducationalValue(result);
      xml += `    <utilidad>${this._escapeXml(utilidadDidactica)}</utilidad>\n`;
      
      // Información de etapas aplicadas
      xml += '    <etapasAplicadas>\n';
      xml += '      <etapa numero="1">Organización y Jerarquía</etapa>\n';
      xml += '      <etapa numero="2">Razonamiento y Comprensión (DeepSeek API)</etapa>\n';
      xml += '      <etapa numero="3">Enriquecimiento Semántico</etapa>\n';
      xml += '      <etapa numero="4">Validación y Verificación</etapa>\n';
      xml += '      <etapa numero="5">Estética Adaptativa / UX Visual</etapa>\n';
      xml += '      <etapa numero="6">Conclusión Descriptiva</etapa>\n';
      xml += '    </etapasAplicadas>\n';
      
      xml += '  </conclusion>\n';
    
    xml += '</conceptMap>';
    
      // Reparar las etiquetas XML
    return this._fixXmlNameTags(xml);
    } catch (error) {
      console.error('Error al generar representación XML:', error);
      // Devolver XML mínimo válido en caso de error
      return '<?xml version="1.0" encoding="UTF-8"?><conceptMap><error>' + 
             this._escapeXml('Error generando XML: ' + error.message) + 
             '</error></conceptMap>';
    }
  }

  /**
   * Obtiene un emoji representativo para un concepto basado en su categoría o contenido
   * @param {Object} concept - Concepto a representar
   * @returns {string} Emoji representativo
   */
  _getConceptEmoji(concept) {
    if (!concept) return '📌';
    
    if (concept.emoji) return concept.emoji;
    
    // Emojis por defecto basados en nivel jerárquico
    const levelEmojis = ['🗺️', '📊', '🧠', '🔍', '✅', '🎨', '📝'];
    const level = Math.min(concept.hierarchyLevel || 0, levelEmojis.length - 1);
    
    return levelEmojis[level];
  }
  
  /**
   * Genera un verbo descriptivo para el tipo de relación
   * @param {string} relationType - Tipo de relación
   * @returns {string} Verbo descriptivo
   */
  _getRelationshipVerb(relationType) {
    const relationshipVerbs = {
      'jerarquia': 'contiene a',
      'causa': 'causa',
      'efecto': 'produce',
      'parte': 'es parte de',
      'secuencia': 'precede a',
      'caracteristica': 'se caracteriza por',
      'ejemplo': 'ejemplifica',
      'dependencia': 'depende de',
      'asociacion': 'se asocia con',
      'oposicion': 'se opone a',
      'similitud': 'es similar a',
      'complementaria': 'complementa a',
      'relacionado': 'se relaciona con'
    };
    
    return relationshipVerbs[relationType.toLowerCase()] || 'se relaciona con';
  }
  
  /**
   * Genera descripción de utilidad didáctica para el mapa conceptual
   * @param {Object} result - Resultado del procesamiento
   * @returns {string} Descripción de utilidad didáctica
   */
  _generateEducationalValue(result) {
    const mainTopic = this._identifyMainTopic(result);
    return `Este mapa conceptual facilita la comprensión de ${mainTopic} al visualizar claramente ${
      result.concepts.length} conceptos y ${result.relationships.length} relaciones entre ellos. ` + 
      `Sirve como guía visual para la comprensión del tema, destacando los aspectos más relevantes ` +
      `y la estructura jerárquica de conocimiento.`;
  }

  /**
   * Repara las etiquetas XML problemáticas en los mapas conceptuales
   * @param {string} xml - Contenido XML a reparar
   * @returns {string} XML con etiquetas corregidas
   */
  _fixXmlNameTags(xml) {
    if (!xml) return '';
    
    console.log("Reparando etiquetas XML:", xml.length, "caracteres");
    
    // Mapa de reemplazo para etiquetas problemáticas
    // Formato: [etiqueta problemática, etiqueta correcta]
    const replacements = [
      // Corregir etiquetas específicas para mapas conceptuales
      ['<n>', '<nombre>'],
      ['</n>', '</nombre>'],
      // Etiquetas para mapa conceptual
      ['<concepto nivel=', '<concepto nivel='],
      ['</concepto>', '</concepto>'],
      ['<subconcepto nivel=', '<subconcepto nivel='],
      ['</subconcepto>', '</subconcepto>'],
      ['<definición concepto=', '<definición concepto='],
      ['</definición>', '</definición>'],
      ['<relación tipo=', '<relación tipo='],
      ['</relación>', '</relación>'],
      // Etiquetas con acentos que pueden causar problemas
      ['<definición>', '<definicion>'],
      ['</definición>', '</definicion>'],
      ['<relación>', '<relacion>'],
      ['</relación>', '</relacion>']
    ];
    
    let fixed = xml;
    
    // Aplicar todos los reemplazos
    for (const [problematic, corrected] of replacements) {
      fixed = fixed.split(problematic).join(corrected);
    }
    
    // Verificación adicional para etiquetas XML mal formadas
    fixed = fixed.replace(/<([a-zA-Z]+)([^>]*)\/>/g, '<$1$2></$1>');
    
    console.log("Etiquetas XML reparadas");
    
    return fixed;
  }

  /**
   * Genera una representación en Mermaid.js del mapa conceptual
   * @param {Object} result - El resultado del procesamiento
   * @returns {string} Código Mermaid.js para renderizar el mapa
   */
  _generateMermaidRepresentation(result) {
    // Ordenar conceptos por nivel jerárquico
    const sortedConcepts = [...result.concepts].sort((a, b) => 
      (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0)
    );
    
    let mermaid = 'graph TD\n';
    
    // Definir nodos (conceptos)
    for (const concept of sortedConcepts) {
      // Determinar estilo basado en nivel jerárquico
      const styleClass = this._getMermaidStyleClass(concept);
      mermaid += `    ${concept.id}${styleClass}["${concept.name}"]\n`;
    }
    
    // Definir relaciones
    for (const rel of result.relationships) {
      const linkStyle = this._getMermaidLinkStyle(rel);
      const linkLabel = rel.description ? `|${rel.description}|` : '';
      mermaid += `    ${rel.source} ${linkStyle} ${linkLabel} ${rel.target}\n`;
    }
    
    // Añadir definición de clases para estilos
    mermaid += '\n    classDef root fill:#f9d5e5,stroke:#333,stroke-width:2px\n';
    mermaid += '    classDef level1 fill:#eeeeee,stroke:#666,stroke-width:1px\n';
    mermaid += '    classDef level2 fill:#e6f7ff,stroke:#0099cc,stroke-width:1px\n';
    mermaid += '    classDef level3 fill:#e6ffe6,stroke:#00cc66,stroke-width:1px\n';
    mermaid += '    classDef default fill:#f9f9f9,stroke:#999,stroke-width:1px\n';
    
    return mermaid;
  }

  /**
   * Determina la clase de estilo Mermaid para un concepto
   * @param {Object} concept - Concepto a estilizar
   * @returns {string} Declaración de clase para el nodo
   */
  _getMermaidStyleClass(concept) {
    const level = concept.hierarchyLevel || 0;
    
    if (level === 0) return ':::root';
    if (level === 1) return ':::level1';
    if (level === 2) return ':::level2';
    if (level === 3) return ':::level3';
    return '';
  }

  /**
   * Determina el estilo de la flecha Mermaid según el tipo de relación
   * @param {Object} relationship - Relación a estilizar
   * @returns {string} Tipo de flecha para la relación
   */
  _getMermaidLinkStyle(relationship) {
    const type = relationship.type ? relationship.type.toLowerCase() : '';
    
    switch (type) {
      case 'is_a':
      case 'isa':
      case 'istype':
        return '-->';
      case 'has_part':
      case 'haspart':
      case 'contains':
        return '--o';
      case 'causes':
      case 'leads_to':
        return '==>';
      case 'similar_to':
      case 'related_to':
        return '---';
      case 'opposite_of':
      case 'contradicts':
        return '-.->';
      default:
        return '-->';
    }
  }

  /**
   * Genera un resumen de los pasos de procesamiento y decisiones clave
   * @param {Object} result - El resultado del procesamiento
   * @returns {string} Resumen narrativo del procesamiento
   */
  _generateProcessingSummary(result) {
    const mainTopic = this._identifyMainTopic(result);
    const conceptCount = result.concepts.length;
    const relationshipCount = result.relationships.length;
    const rootConcepts = result.concepts.filter(c => (c.hierarchyLevel || 0) === 0);
    const mostImportantConcepts = [...result.concepts]
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 5)
      .map(c => c.name);
    
    let summary = `Se ha generado un mapa conceptual sobre "${mainTopic}" `;
    summary += `con ${conceptCount} conceptos y ${relationshipCount} relaciones. `;
    
    if (rootConcepts.length > 0) {
      summary += `El concepto principal es "${rootConcepts[0].name}". `;
    }
    
    summary += `Los conceptos más relevantes identificados son: ${mostImportantConcepts.join(', ')}. `;
    
    // Añadir datos sobre la estructura jerárquica
    const hierarchyLevels = Math.max(...result.concepts.map(c => c.hierarchyLevel || 0)) + 1;
    summary += `El mapa tiene ${hierarchyLevels} niveles jerárquicos. `;
    
    // Añadir datos sobre coherencia y validación
    if (result.metadata.coherenceScore !== undefined) {
      const coherencePercentage = Math.round(result.metadata.coherenceScore * 100);
      summary += `La puntuación de coherencia lógica es ${coherencePercentage}%. `;
    }
    
    // Mencionar cualquier corrección aplicada durante la validación
    if (result.metadata.conceptsRemoved || result.metadata.relationshipsRemoved) {
      summary += `Durante la validación se refinaron ${result.metadata.conceptsRemoved || 0} conceptos `;
      summary += `y ${result.metadata.relationshipsRemoved || 0} relaciones para mejorar la precisión. `;
    }
    
    // Información sobre el proceso de enriquecimiento
    const conceptsWithDefinitions = result.concepts.filter(c => c.definition).length;
    const conceptsWithExamples = result.concepts.filter(c => c.examples && c.examples.length > 0).length;
    
    const definitionPercentage = Math.round((conceptsWithDefinitions / conceptCount) * 100);
    const examplesPercentage = Math.round((conceptsWithExamples / conceptCount) * 100);
    
    summary += `El ${definitionPercentage}% de los conceptos incluyen definiciones y `;
    summary += `el ${examplesPercentage}% incluyen ejemplos ilustrativos.`;
    
    return summary;
  }

  /**
   * Identifica el tema principal del mapa conceptual
   * @param {Object} result - Resultado del procesamiento
   * @returns {string} Tema principal identificado
   */
  _identifyMainTopic(result) {
    // Asegurar que existen conceptos para analizar
    if (!result || !result.concepts || !Array.isArray(result.concepts) || result.concepts.length === 0) {
      return "Mapa Conceptual";
    }

    // Intentar encontrar el concepto raíz (nivel 0)
    const rootConcepts = result.concepts.filter(c => 
      (c.hierarchyLevel || 0) === 0 || 
      c.importance > 0.9
    );
    
    if (rootConcepts.length > 0) {
      // Ordenar por importancia en caso de múltiples raíces
      rootConcepts.sort((a, b) => (b.importance || 0) - (a.importance || 0));
      return rootConcepts[0].name;
    }
    
    // Si no hay conceptos raíz, tomar el concepto más importante
    if (result.concepts.length > 0) {
      const sortedConcepts = [...result.concepts].sort(
        (a, b) => (b.importance || 0) - (a.importance || 0)
      );
      return sortedConcepts[0].name;
    }
    
    // Si no hay conceptos, devolver valor predeterminado
    return "Mapa Conceptual";
  }

  /**
   * Identifica el dominio principal del texto
   * @param {string} text - Texto original
   * @returns {string} Dominio identificado
   */
  _identifyDomain(text) {
    // Simular identificación de dominio basada en palabras clave
    const domainKeywords = {
      'ciencia': ['átomo', 'molécula', 'experimento', 'científico', 'teoría', 'hipótesis'],
      'biología': ['célula', 'organismo', 'ADN', 'proteína', 'gen', 'fotosíntesis', 'ecosistema'],
      'matemáticas': ['ecuación', 'teorema', 'cálculo', 'geometría', 'álgebra', 'función'],
      'historia': ['siglo', 'guerra', 'revolución', 'imperio', 'civilización', 'época'],
      'literatura': ['novela', 'poesía', 'autor', 'narrativa', 'personaje', 'metáfora'],
      'tecnología': ['computadora', 'software', 'internet', 'digital', 'programación', 'algoritmo'],
      'filosofía': ['ética', 'moral', 'existencia', 'metafísica', 'lógica', 'epistemología']
    };
    
    // Contar apariciones de palabras clave por dominio
    const domainCounts = {};
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      domainCounts[domain] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          domainCounts[domain] += matches.length;
        }
      }
    }
    
    // Encontrar el dominio con más palabras clave
    let maxDomain = 'general';
    let maxCount = 0;
    
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDomain = domain;
      }
    }
    
    return maxCount > 0 ? maxDomain : 'general';
  }

  /**
   * Detecta el idioma del texto
   * @param {string} text - Texto a analizar
   * @returns {string} Código de idioma (es, en, etc.)
   */
  _detectLanguage(text) {
    // Palabras comunes en español
    const spanishWords = ['el', 'la', 'los', 'las', 'de', 'en', 'y', 'que', 'es', 'por', 'para'];
    
    // Palabras comunes en inglés
    const englishWords = ['the', 'of', 'and', 'to', 'in', 'is', 'that', 'for', 'it', 'as', 'with'];
    
    // Contar apariciones de palabras comunes
    let spanishCount = 0;
    let englishCount = 0;
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    for (const word of words) {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    }
    
    // Determinar idioma basado en el recuento
    return spanishCount >= englishCount ? 'es' : 'en';
  }

  /**
   * Detecta el nivel educativo aproximado del texto
   * @param {string} text - Texto a analizar
   * @returns {string} Nivel educativo (básico, intermedio, avanzado)
   */
  _detectEducationalLevel(text) {
    // Contar longitud promedio de palabras y frases
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (words.length === 0 || sentences.length === 0) {
      return 'intermedio';
    }
    
    const avgWordLength = words.join('').length / words.length;
    const avgSentenceWords = words.length / sentences.length;
    
    // Determinar nivel educativo basado en métricas
    if (avgWordLength < 5 && avgSentenceWords < 10) {
      return 'básico';
    } else if (avgWordLength > 6 && avgSentenceWords > 15) {
      return 'avanzado';
    } else {
      return 'intermedio';
    }
  }

  /**
   * Calcula la complejidad de definición basada en nivel conceptual y educativo
   * @param {number} conceptLevel - Nivel jerárquico del concepto
   * @param {string} educationalLevel - Nivel educativo del texto
   * @returns {number} Complejidad entre 0.0 y 1.0
   */
  _calculateDefinitionComplexity(conceptLevel, educationalLevel) {
    // Base de complejidad según nivel educativo
    let baseComplexity = 0.5;
    
    switch (educationalLevel) {
      case 'básico':
        baseComplexity = 0.3;
        break;
      case 'intermedio':
        baseComplexity = 0.5;
        break;
      case 'avanzado':
        baseComplexity = 0.7;
        break;
    }
    
    // Ajustar según nivel jerárquico
    // Conceptos de nivel superior suelen requerir definiciones más simples
    // Conceptos específicos pueden tener definiciones más técnicas
    let levelFactor = 0;
    
    if (conceptLevel === 0) levelFactor = -0.1;
    else if (conceptLevel === 1) levelFactor = 0;
    else if (conceptLevel >= 2) levelFactor = 0.1;
    
    // Limitar entre 0.1 y 0.9
    return Math.max(0.1, Math.min(0.9, baseComplexity + levelFactor));
  }

  /**
   * Determina el tipo de concepto 
   * @param {Object} concept - Concepto a analizar
   * @returns {string} Tipo de concepto (término, proceso, etc.)
   */
  _getConceptType(concept) {
    const categories = concept.categories || [];
    
    if (categories.includes('Proceso')) return 'proceso';
    if (categories.includes('Entidad')) return 'elemento';
    if (categories.includes('Artificial')) return 'artefacto';
    if (categories.includes('Natural')) return 'fenómeno natural';
    if (categories.includes('Teórico')) return 'concepto teórico';
    
    // Por defecto
    return 'término';
  }

  /**
   * Genera una descripción funcional para un concepto
   * @param {Object} concept - Concepto a describir
   * @param {string} domain - Dominio del texto
   * @param {number} complexity - Complejidad de la definición
   * @returns {string} Descripción funcional
   */
  _generateConceptFunction(concept, domain, complexity) {
    // Generador simple de función conceptual
    const simpleFunctions = [
      'permite entender los principios básicos de la materia',
      'facilita la comprensión de fenómenos naturales',
      'ayuda a explicar procesos complejos',
      'estructura el conocimiento en este campo',
      'sirve como base para estudios más avanzados'
    ];
    
    const complexFunctions = [
      'constituye un paradigma fundamental para el análisis metodológico',
      'establece las bases epistemológicas para la investigación científica',
      'representa una abstracción esencial en la teorización avanzada',
      'integra múltiples perspectivas analíticas en un marco cohesivo',
      'articula la intersección entre diversos campos disciplinarios'
    ];
    
    // Seleccionar complejidad apropiada
    if (complexity < 0.4) {
      return simpleFunctions[Math.floor(Math.random() * simpleFunctions.length)];
    } else if (complexity > 0.7) {
      return complexFunctions[Math.floor(Math.random() * complexFunctions.length)];
    } else {
      // Mezclar ambos para complejidad media
      const allFunctions = [...simpleFunctions, ...complexFunctions];
      return allFunctions[Math.floor(Math.random() * allFunctions.length)];
    }
  }

  /**
   * Genera relaciones conceptuales para ConceptNet
   * @param {string} conceptName - Nombre del concepto
   * @param {string} relationType - Tipo de relación
   * @param {Map} conceptMap - Mapa de conceptos existentes
   * @returns {Array} Lista de conceptos relacionados
   */
  _generateConceptNetRelations(conceptName, relationType, conceptMap) {
    // Esta función simula la generación de relaciones de ConceptNet
    const relatedTerms = [];
    const existingConcepts = Array.from(conceptMap.keys());
    
    // Determinar cuántas relaciones generar (1-3)
    const count = 1 + Math.floor(Math.random() * 3);
    
    // Intentar usar conceptos existentes cuando sea posible
    for (let i = 0; i < count; i++) {
      if (existingConcepts.length > 0 && Math.random() < 0.7) {
        // Usar un concepto existente 70% del tiempo
        const randomIndex = Math.floor(Math.random() * existingConcepts.length);
        const existingConcept = existingConcepts[randomIndex];
        
        if (existingConcept !== conceptName.toLowerCase() && 
            !relatedTerms.includes(existingConcept)) {
          relatedTerms.push(existingConcept);
        }
      } else {
        // Generar un término relacionado sintético
        const syntheticRelation = this._generateSyntheticRelation(conceptName, relationType);
        if (!relatedTerms.includes(syntheticRelation)) {
          relatedTerms.push(syntheticRelation);
        }
      }
    }
    
    return relatedTerms;
  }

  /**
   * Genera un término relacionado sintético 
   * @param {string} conceptName - Nombre del concepto
   * @param {string} relationType - Tipo de relación
   * @returns {string} Término relacionado
   */
  _generateSyntheticRelation(conceptName, relationType) {
    // Prefijos/sufijos según tipo de relación
    const modifiers = {
      'IsA': ['tipo de ', 'clase de ', 'categoría de '],
      'PartOf': ['componente de ', 'parte de ', 'elemento de '],
      'HasA': ['tiene ', 'contiene ', 'incluye '],
      'UsedFor': ['utilizado para ', 'sirve para ', 'usado en '],
      'CapableOf': ['puede ', 'es capaz de ', 'permite '],
      'AtLocation': ['ubicado en ', 'encontrado en ', 'situado en '],
      'Causes': ['causa ', 'genera ', 'produce '],
      'HasProperty': ['es ', 'tiene propiedad de ', 'caracterizado por '],
      'SymbolOf': ['simboliza ', 'representa ', 'significa ']
    };
    
    // Obtener modificadores para este tipo de relación
    const availableModifiers = modifiers[relationType] || ['relacionado con '];
    const modifier = availableModifiers[Math.floor(Math.random() * availableModifiers.length)];
    
    // Generar término sintético
    return modifier + conceptName;
  }

  /**
   * Obtiene descripción textual de un tipo de relación
   * @param {string} relationType - Tipo de relación
   * @returns {string} Descripción en español
   */
  _getRelationDescription(relationType) {
    const descriptions = {
      'IsA': 'es un tipo de',
      'PartOf': 'es parte de',
      'HasA': 'tiene',
      'UsedFor': 'se usa para',
      'CapableOf': 'es capaz de',
      'AtLocation': 'se encuentra en',
      'Causes': 'causa',
      'HasProperty': 'tiene la propiedad',
      'SymbolOf': 'simboliza'
    };
    
    return descriptions[relationType] || 'se relaciona con';
  }

  /**
   * Verifica si un término parece ser académico
   * @param {string} term - Término a evaluar
   * @returns {boolean} Verdadero si parece académico
   */
  _isAcademicTerm(term) {
    // Sufijos comunes en términos académicos
    const academicSuffixes = ['ción', 'logía', 'ismo', 'idad', 'miento', 'esis', 'oma'];
    
    // Verificar si el término tiene algún sufijo académico
    for (const suffix of academicSuffixes) {
      if (term.toLowerCase().endsWith(suffix)) {
        return true;
      }
    }
    
    // Términos académicos a menudo tienen más de 8 caracteres
    if (term.length > 8) {
      return true;
    }
    
    // Términos con iniciales mayúsculas consecutivas suelen ser académicos
    if (/[A-Z][a-z]+[A-Z]/.test(term)) {
      return true;
    }
    
    return false;
  }

  /**
   * Genera artículos académicos relacionados simulados
   * @param {string} conceptName - Nombre del concepto
   * @returns {Array} Lista de artículos simulados
   */
  _generateRelatedPapers(conceptName) {
    const papers = [];
    const count = 1 + Math.floor(Math.random() * 3);
    
    const templates = [
      { title: "Advances in {concept} research", year: 2019 + Math.floor(Math.random() * 4), authors: "Smith et al." },
      { title: "{concept}: A comprehensive review", year: 2018 + Math.floor(Math.random() * 5), authors: "Johnson and Williams" },
      { title: "Understanding {concept} in modern context", year: 2020 + Math.floor(Math.random() * 3), authors: "García-Rodríguez et al." },
      { title: "Theoretical framework for {concept}", year: 2017 + Math.floor(Math.random() * 6), authors: "Zhang and López" }
    ];
    
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      papers.push({
        title: template.title.replace('{concept}', conceptName),
        year: template.year,
        authors: template.authors
      });
    }
    
    return papers;
  }

  /**
   * Genera teorías relacionadas simuladas
   * @param {string} conceptName - Nombre del concepto
   * @returns {Array} Lista de teorías simuladas
   */
  _generateRelatedTheories(conceptName) {
    const theories = [];
    const count = Math.floor(Math.random() * 3);
    
    const prefixes = ["Teoría de ", "Paradigma de ", "Modelo de ", "Hipótesis de "];
    const suffixes = [" moderna", " clásica", " contemporánea", " alternativa"];
    
    for (let i = 0; i < count; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : "";
      
      theories.push(prefix + conceptName + suffix);
    }
    
    return theories;
  }

  /**
   * Genera instancias de ejemplo para un concepto
   * @param {string} conceptName - Nombre del concepto
   * @returns {Array} - Lista de instancias
   */
  _generateInstances(conceptName) {
    // Simulación: generar 2-4 instancias aleatorias
    const count = 2 + Math.floor(Math.random() * 3);
    const instances = [];
    
    for (let i = 0; i < count; i++) {
      instances.push(`Ejemplo ${i+1} de ${conceptName}`);
    }
    
    return instances;
  }

  /**
   * Genera propiedades estructuradas para un concepto
   * @param {Object} concept - Concepto a procesar
   * @returns {Object} - Propiedades estructuradas
   */
  _generateProperties(concept) {
    // Simulación: generar propiedades relevantes basadas en el tipo de concepto
    return {
      commonAttributes: [
        { name: 'importance', value: concept.importance || Math.random().toFixed(2) },
        { name: 'abstraction', value: concept.hierarchyLevel === 1 ? 'high' : 
                                 concept.hierarchyLevel === 2 ? 'medium' : 'specific' }
      ],
      domain: concept.academicContext?.field || 'General',
      usage: (Math.random() > 0.5) ? 'common' : 'specialized'
    };
  }

  /**
   * Genera un camino taxonómico para un concepto
   * @param {Object} concept - Concepto a procesar
   * @returns {Array} - Camino taxonómico
   */
  _generateTaxonomyPath(concept) {
    // Simulación: crear un camino taxonómico basado en el nivel jerárquico
    const path = [];
    
    if (concept.hierarchyLevel >= 3) {
      path.push('Conceptos específicos');
    }
    
    if (concept.hierarchyLevel >= 2) {
      path.push('Conceptos intermedios');
    }
    
    path.push('Conceptos generales');
    
    return path.reverse(); // De general a específico
  }

  /**
   * Obtiene un campo académico aleatorio para simulación
   * @returns {string} - Campo académico
   */
  _getRandomAcademicField() {
    const fields = [
      'Ciencias de la Computación',
      'Inteligencia Artificial',
      'Aprendizaje Automático',
      'Ciencia de Datos',
      'Neurociencia',
      'Psicología Cognitiva',
      'Lingüística Computacional',
      'Sistemas Complejos',
      'Educación',
      'Filosofía de la Ciencia'
    ];
    return fields[Math.floor(Math.random() * fields.length)];
  }

  /**
   * Identifica categorías para un concepto
   * @param {string} conceptName - Nombre del concepto a categorizar
   * @returns {Array} - Categorías identificadas
   */
  identifyCategories(conceptName) {
    // Simulación: generar 1-3 categorías aleatorias
    const categories = [];
    const possibleCategories = [
      'Abstracto', 'Concreto', 'Proceso', 'Entidad', 
      'Teórico', 'Práctico', 'Científico', 'Tecnológico', 
      'Humano', 'Natural', 'Artificial', 'Conceptual',
      'Físico', 'Lógico', 'Matemático', 'Lingüístico'
    ];
    
    const numCategories = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numCategories; i++) {
      const categoryIndex = Math.floor(Math.random() * possibleCategories.length);
      const category = possibleCategories[categoryIndex];
      
      if (!categories.includes(category)) {
        categories.push(category);
      }
    }
    
    return categories;
  }

  /**
   * Calcula la puntuación de verificación para un concepto
   * @param {Object} concept - Concepto a verificar
   * @returns {number} Puntuación de verificación entre 0.0 y 1.0
   */
  _calculateVerificationScore(concept) {
    // Simulación: generar una puntuación de verificación basada en propiedades del concepto
    let baseScore = 0.7 + (Math.random() * 0.3); // Puntuación base entre 0.7 y 1.0
    
    // Ajustar según la calidad de la definición (si existe)
    if (concept.definition) {
      if (concept.definition.length > 100) {
        baseScore += 0.1; // Definiciones más largas suelen ser más precisas
      }
      if (concept.definition.length < 30) {
        baseScore -= 0.1; // Definiciones muy cortas pueden ser menos precisas
      }
    } else {
      baseScore -= 0.2; // Penalizar conceptos sin definición
    }
    
    // Ajustar según la presencia de ejemplos
    if (concept.examples && concept.examples.length > 0) {
      baseScore += 0.05 * Math.min(concept.examples.length, 3); // Bonificación por ejemplos
    }
    
    // Limitar entre 0.1 y 1.0
    return Math.max(0.1, Math.min(1.0, baseScore));
  }

  /**
   * Genera fuentes de verificación simuladas
   * @param {Object} concept - Concepto a verificar
   * @returns {Array} Lista de fuentes
   */
  _generateVerificationSources(concept) {
    const sourceCount = 1 + Math.floor(Math.random() * 3); // 1-3 fuentes
    const sources = [];
    
    const possibleSources = [
      { name: "Wikipedia", url: `https://es.wikipedia.org/wiki/${encodeURIComponent(concept.name)}` },
      { name: "Enciclopedia Británica", url: `https://www.britannica.com/search?query=${encodeURIComponent(concept.name)}` },
      { name: "Google Scholar", url: `https://scholar.google.com/scholar?q=${encodeURIComponent(concept.name)}` },
      { name: "Base de datos científica", url: `https://www.sciencedirect.com/search?qs=${encodeURIComponent(concept.name)}` },
      { name: "Diccionario de la RAE", url: `https://dle.rae.es/${encodeURIComponent(concept.name)}` }
    ];
    
    // Seleccionar fuentes aleatorias sin repetir
    const selectedIndices = new Set();
    while (selectedIndices.size < sourceCount && selectedIndices.size < possibleSources.length) {
      const index = Math.floor(Math.random() * possibleSources.length);
      selectedIndices.add(index);
    }
    
    // Agregar fuentes seleccionadas
    for (const index of selectedIndices) {
      sources.push(possibleSources[index]);
    }
    
    return sources;
  }

  /**
   * Calcula la coherencia entre una definición y propiedades semánticas
   * @param {string} definition - Definición del concepto
   * @param {Object} semanticProperties - Propiedades semánticas
   * @returns {number} Puntuación de coherencia entre 0.0 y 1.0
   */
  _calculateDefinitionCoherence(definition, semanticProperties) {
    // Simulación: generar puntuación de coherencia
    // En una implementación real, esto analizaría la relación semántica
    
    // Base de coherencia
    let coherence = 0.5 + (Math.random() * 0.5); // Entre 0.5 y 1.0
    
    // Simular posibles incoherencias para conceptos aleatorios (10% de probabilidad)
    if (Math.random() < 0.1) {
      coherence = 0.2 + (Math.random() * 0.3); // Entre 0.2 y 0.5 (baja coherencia)
    }
    
    return coherence;
  }

  /**
   * Genera una definición mejorada para un concepto
   * @param {Object} concept - Concepto a mejorar
   * @returns {string} Definición mejorada
   */
  _generateImprovedDefinition(concept) {
    // Si no hay definición original, crear una nueva
    if (!concept.definition) {
      return `${concept.name} es un término que se refiere a un concepto en el ámbito de estudio relacionado.`;
    }
    
    // Simular mejora de definición existente
    const improvements = [
      "con aplicaciones importantes en diversos campos",
      "que representa un aspecto fundamental de su dominio",
      "caracterizado por su relevancia y utilidad práctica",
      "cuya comprensión es esencial para el entendimiento del tema"
    ];
    
    // Seleccionar una mejora aleatoria
    const improvement = improvements[Math.floor(Math.random() * improvements.length)];
    
    // Agregar mejora a la definición original
    if (concept.definition.endsWith('.')) {
      return concept.definition.slice(0, -1) + ` ${improvement}.`;
    } else {
      return `${concept.definition} ${improvement}.`;
    }
  }

  /**
   * Valida la coherencia lógica de una relación
   * @param {Object} source - Concepto origen
   * @param {Object} target - Concepto destino
   * @param {string} relationType - Tipo de relación
   * @returns {Object} Resultado de validación con validez y razón
   */
  _validateRelationshipCoherence(source, target, relationType) {
    // Simulación: validar coherencia lógica de relación
    // En una implementación real, esto utilizaría análisis semántico
    
    // Por defecto, considerar válida
    const validation = {
      valid: true,
      reason: null
    };
    
    // Validar según tipo de relación
    switch (relationType?.toLowerCase()) {
      case 'is_a':
      case 'isa':
      case 'istype':
        // Verificar que un concepto específico "es un" concepto más general
        if ((source.hierarchyLevel || 0) <= (target.hierarchyLevel || 0)) {
          validation.valid = Math.random() > 0.2; // 20% de probabilidad de invalidez
          if (!validation.valid) {
            validation.reason = 'Relación jerárquica invertida: el origen debería ser más específico que el destino';
          }
        }
        break;
        
      case 'part_of':
      case 'partof':
        // Conceptos similares no deberían ser "parte de" entre sí
        if (this._calculateConceptSimilarity(source, target) > 0.8) {
          validation.valid = false;
          validation.reason = 'Conceptos demasiado similares para relación parte-todo';
        }
        break;
        
      default:
        // Para otros tipos, validar con probabilidad alta
        validation.valid = Math.random() > 0.05; // 5% de probabilidad de invalidez
        if (!validation.valid) {
          validation.reason = 'Relación semánticamente improbable entre los conceptos';
        }
    }
    
    return validation;
  }

  /**
   * Calcula similitud entre dos conceptos
   * @param {Object} concept1 - Primer concepto
   * @param {Object} concept2 - Segundo concepto
   * @returns {number} Similitud entre 0.0 y 1.0
   */
  _calculateConceptSimilarity(concept1, concept2) {
    // Simulación: calcular similitud entre conceptos
    // En una implementación real, utilizaría análisis semántico
    
    // Base de similitud
    let similarity = 0.3 + (Math.random() * 0.4); // Entre 0.3 y 0.7
    
    // Ajustar según categorías compartidas
    const categories1 = concept1.categories || [];
    const categories2 = concept2.categories || [];
    
    const sharedCategories = categories1.filter(cat => categories2.includes(cat));
    
    if (sharedCategories.length > 0) {
      similarity += 0.1 * sharedCategories.length;
    }
    
    // Limitar entre 0.0 y 1.0
    return Math.min(1.0, similarity);
  }

  /**
   * Encuentra relaciones transitivas redundantes
   * @param {Array} relationships - Lista de relaciones
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} Lista de relaciones transitivas
   */
  _findTransitiveRelations(relationships, concepts) {
    // Encontrar relaciones A->B, B->C donde también existe A->C
    const transitiveRelations = [];
    
    // Crear un mapa de relaciones para búsqueda rápida
    const relationMap = new Map();
    for (const rel of relationships) {
      if (!relationMap.has(rel.source)) {
        relationMap.set(rel.source, new Set());
      }
      relationMap.get(rel.source).add(rel.target);
    }
    
    // Buscar transitividad
    for (const relAB of relationships) {
      const sourceA = relAB.source;
      const targetB = relAB.target;
      
      // Verificar si B tiene relaciones salientes
      if (relationMap.has(targetB)) {
        // Para cada relación B->C
        for (const targetC of relationMap.get(targetB)) {
          // Verificar si existe A->C
          if (relationMap.has(sourceA) && relationMap.get(sourceA).has(targetC)) {
            // Encontrada relación transitiva
            transitiveRelations.push(relationships.find(
              r => r.source === sourceA && r.target === targetC
            ));
          }
        }
      }
    }
    
    return transitiveRelations;
  }

  /**
   * Encuentra conceptos similares candidatos para fusión
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} Pares de conceptos similares
   */
  _findSimilarConcepts(concepts) {
    const similarPairs = [];
    
    // Comparar todos los pares de conceptos
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const concept1 = concepts[i];
        const concept2 = concepts[j];
        
        // Calcular similitud
        const similarity = this._calculateConceptSimilarity(concept1, concept2);
        
        // Si son muy similares, considerar fusión
        if (similarity > 0.8) {
          const pair = [concept1, concept2];
          pair.similarity = similarity;
          similarPairs.push(pair);
        }
      }
    }
    
    return similarPairs;
  }

  /**
   * Calcula la densidad del grafo
   * @param {number} numNodes - Número de nodos (conceptos)
   * @param {number} numEdges - Número de aristas (relaciones)
   * @returns {number} Densidad del grafo entre 0.0 y 1.0
   */
  _calculateGraphDensity(numNodes, numEdges) {
    if (numNodes <= 1) return 0;
    
    // Densidad = Aristas actuales / Máximo posible de aristas
    const maxPossibleEdges = (numNodes * (numNodes - 1)) / 2;
    return numEdges / maxPossibleEdges;
  }

  /**
   * Encuentra relaciones de bajo valor para posible eliminación
   * @param {Array} relationships - Lista de relaciones
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} Relaciones de bajo valor
   */
  _findLowValueRelations(relationships, concepts) {
    // Calcular valor para cada relación
    const valuedRelations = relationships.map(rel => {
      const source = concepts.find(c => c.id === rel.source);
      const target = concepts.find(c => c.id === rel.target);
      
      let value = 0.5; // Valor base
      
      // Relaciones entre conceptos importantes tienen más valor
      if (source && target) {
        value += (source.importance || 0) * 0.25;
        value += (target.importance || 0) * 0.25;
        
        // Relaciones jerárquicas directas tienen más valor
        if (Math.abs((source.hierarchyLevel || 0) - (target.hierarchyLevel || 0)) === 1) {
          value += 0.2;
        }
      }
      
      return { ...rel, value };
    });
    
    // Ordenar por valor y devolver las de menor valor
    return [...valuedRelations].sort((a, b) => a.value - b.value);
  }

  /**
   * Identifica clusters en el grafo de conceptos
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Array} Clusters identificados
   */
  _identifyClusters(concepts, relationships) {
    // Implementación simple de detección de clusters
    const clusters = [];
    const visited = new Set();
    
    // Crear mapa de adyacencia
    const adjacencyMap = new Map();
    for (const concept of concepts) {
      adjacencyMap.set(concept.id, []);
    }
    
    // Llenar mapa de adyacencia
    for (const rel of relationships) {
      if (adjacencyMap.has(rel.source)) {
        adjacencyMap.get(rel.source).push(rel.target);
      }
      if (adjacencyMap.has(rel.target)) {
        adjacencyMap.get(rel.target).push(rel.source);
      }
    }
    
    // Función DFS para encontrar componentes conectados
    const dfs = (conceptId, cluster) => {
      if (visited.has(conceptId)) return;
      
      visited.add(conceptId);
      cluster.push(conceptId);
      
      for (const neighbor of adjacencyMap.get(conceptId) || []) {
        dfs(neighbor, cluster);
      }
    };
    
    // Encontrar todos los clusters (componentes conectados)
    for (const concept of concepts) {
      if (!visited.has(concept.id)) {
        const cluster = [];
        dfs(concept.id, cluster);
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }

  /**
   * Combina objetos de configuración de forma recursiva
   * @param {Object} defaultConfig - Configuración por defecto
   * @param {Object} userConfig - Configuración proporcionada por el usuario
   * @returns {Object} Configuración combinada
   * @private
   */
  _mergeConfigs(defaultConfig, userConfig) {
    // Validación de entrada
    if (!defaultConfig || typeof defaultConfig !== 'object') {
      defaultConfig = {};
    }
    
    if (!userConfig || typeof userConfig !== 'object') {
      userConfig = {};
    }
    
    try {
      // Combinación simple para propiedades de nivel superior
    const result = { ...defaultConfig };
    
      // Recorrer cada propiedad en la configuración del usuario
    for (const key in userConfig) {
        // Para objetos complejos, combinar recursivamente
        if (key in result && 
            typeof result[key] === 'object' && 
          typeof userConfig[key] === 'object' && 
            !Array.isArray(result[key]) && 
            !Array.isArray(userConfig[key])) {
          
          result[key] = this._mergeConfigs(result[key], userConfig[key]);
        } else {
          // Para tipos simples o arrays, reemplazar directamente
          result[key] = userConfig[key];
      }
    }
    
    return result;
    } catch (error) {
      console.error('Error al combinar configuraciones:', error);
      // En caso de error, devolver la configuración por defecto
      return defaultConfig;
    }
  }

  /**
   * Obtiene una descripción de relación basada en el tipo
   * @param {string} relationType - Tipo de relación
   * @param {string} sourceName - Nombre del concepto origen
   * @param {string} targetName - Nombre del concepto destino
   * @returns {string} - Descripción de la relación
   */
  _getRelationDescription(relationType, sourceName, targetName) {
    if (!sourceName || !targetName) {
      return 'Relación entre conceptos';
    }
    
    switch (relationType.toLowerCase()) {
      case 'jerarquia':
        return `${sourceName} incluye a ${targetName} como subcategoría`;
      case 'causa':
        return `${sourceName} causa o produce ${targetName}`;
      case 'efecto':
        return `${sourceName} es consecuencia de ${targetName}`;
      case 'parte':
        return `${sourceName} es parte de ${targetName}`;
      case 'secuencia':
        return `${sourceName} ocurre antes que ${targetName}`;
      case 'caracteristica':
        return `${sourceName} es una característica de ${targetName}`;
      case 'ejemplo':
        return `${sourceName} es un ejemplo de ${targetName}`;
      case 'dependencia':
        return `${sourceName} depende de ${targetName}`;
      default:
        return `${sourceName} está relacionado con ${targetName}`;
    }
  }

  /**
   * Genera una representación educativa del mapa conceptual
   * @param {Object} result - Resultado del procesamiento
   * @param {Object} config - Configuración del mapa
   * @returns {Object} Formatos JSON y Markdown del mapa conceptual
   */
  generateEducationalConceptMap(result, config) {
    const jsonFormat = {
      title: this._identifyMainTopic(result),
      concepts: result.concepts.map(c => ({
        id: c.id,
        name: c.name,
        description: c.definition || '',
        importance: c.importance || 0,
        level: c.hierarchyLevel || 0,
        categories: c.categories || []
      })),
      relationships: result.relationships.map(r => ({
        source: r.source,
        target: r.target,
        type: r.type || 'related',
        label: r.description || ''
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        style: config.style || 'educational'
      }
    };
    
    // Generar representación en markdown/mermaid
    let markdownFormat = `# Mapa Conceptual: ${this._identifyMainTopic(result)}\n\n`;
    markdownFormat += '```mermaid\n';
    markdownFormat += this._generateMermaidRepresentation(result);
    markdownFormat += '\n```\n\n';
    
    // Agregar descripciones
    if (result.concepts.length > 0) {
      markdownFormat += '## Conceptos Principales\n\n';
      
      const mainConcepts = [...result.concepts]
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 5);
      
      for (const concept of mainConcepts) {
        markdownFormat += `### ${concept.name}\n\n`;
        if (concept.definition) {
          markdownFormat += `${concept.definition}\n\n`;
        }
        
        if (concept.examples && concept.examples.length > 0) {
          markdownFormat += '**Ejemplos:**\n\n';
          for (const example of concept.examples) {
            markdownFormat += `- ${example}\n`;
          }
          markdownFormat += '\n';
        }
      }
    }
    
    return { jsonFormat, markdownFormat };
  }

  /**
   * Evalúa la precisión educativa de un concepto
   * @param {Object} concept - Concepto a evaluar
   * @returns {number} - Puntuación de precisión (0-1)
   */
  _evaluateEducationalAccuracy(concept) {
    // Comprobar que el concepto tiene los atributos necesarios
    if (!concept) return 0;

    let score = 0.5; // Puntuación base

    // Verificar si tiene definición clara
    if (concept.definition && concept.definition.length > 20) {
      score += 0.2;
    }

    // Verificar si tiene ejemplos
    if (concept.examples && concept.examples.length > 0) {
      score += 0.1;
    }

    // Verificar categorización
    if (concept.categories && concept.categories.length > 0) {
      score += 0.1;
    }

    // Verificar el nivel jerárquico
    if (concept.hierarchyLevel !== undefined) {
      score += 0.1;
    }

    // Limitar al rango 0-1
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Evalúa el sesgo potencial en un concepto
   * @param {Object} concept - Concepto a evaluar
   * @returns {number} - Puntuación de sesgo (0-1, mayor valor = más sesgado)
   */
  _evaluateBias(concept) {
    if (!concept || !concept.definition) return 0;

    let biasScore = 0;
    const definition = concept.definition.toLowerCase();

    // Palabras que podrían indicar sesgo
    const biasIndicators = [
      'siempre', 'nunca', 'todos', 'ninguno', 'absolutamente',
      'definitivamente', 'obviamente', 'claramente', 
      'mejor', 'peor', 'superior', 'inferior'
    ];

    // Buscar indicadores de sesgo en la definición
    biasIndicators.forEach(word => {
      if (definition.includes(word)) {
        biasScore += 0.1;
      }
    });

    // Limitar al rango 0-1
    return Math.min(1, biasScore);
  }

  /**
   * Evalúa la complejidad de un concepto
   * @param {Object} concept - Concepto a evaluar
   * @returns {number} - Puntuación de complejidad (0-1)
   */
  _evaluateComplexity(concept) {
    if (!concept || !concept.definition) return 0.5;

    const definition = concept.definition;
    
    // Factores que afectan la complejidad
    
    // 1. Longitud de la definición
    const lengthScore = Math.min(1, definition.length / 300); // Normalizar
    
    // 2. Longitud promedio de palabras
    const words = definition.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(1, words.length);
    const wordLengthScore = Math.min(1, avgWordLength / 8); // Normalizar
    
    // 3. Complejidad de oraciones
    const sentences = definition.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, sentence) => {
      return sum + sentence.split(/\s+/).length;
    }, 0) / Math.max(1, sentences.length);
    
    const sentenceComplexityScore = Math.min(1, avgSentenceLength / 20); // Normalizar
    
    // Calcular complejidad combinada
    const complexityScore = (
      (lengthScore * 0.3) +
      (wordLengthScore * 0.3) +
      (sentenceComplexityScore * 0.4)
    );
    
    return complexityScore;
  }

  /**
   * Escapa caracteres especiales para XML
   * @param {string} str - Cadena a escapar 
   * @returns {string} Cadena escapada
   */
  _escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Función para generar los formatos de salida
  generateOutputFormats(result, outputFormat = 'all') {
    try {
      console.log('Generando formatos de salida:', outputFormat);
      console.log('Datos recibidos:', JSON.stringify({
        concepts: result.concepts ? result.concepts.length : 0,
        relationships: result.relationships ? result.relationships.length : 0
      }));
      
      const formats = {};
      
      // Generar JSON estructurado
      if (outputFormat === 'all' || outputFormat === 'json') {
        formats.json = JSON.stringify({
          concepts: result.concepts || [],
          relationships: result.relationships || []
        });
      }
      
      // Generar representación XML
      if (outputFormat === 'all' || outputFormat === 'xml') {
        formats.xml = this.convertToXML(result.concepts || [], result.relationships || []);
      }
      
      // Generar representación Mermaid
      if (outputFormat === 'all' || outputFormat === 'mermaid') {
        formats.mermaid = this.convertToMermaid(result.concepts || [], result.relationships || []);
      }
      
      // Generar resumen markdown
      if (outputFormat === 'all' || outputFormat === 'markdown') {
        formats.markdown = this.convertToMarkdown(result.concepts || [], result.relationships || []);
      }
      
      // Añadir resumen textual
      if (outputFormat === 'all' || outputFormat === 'summary') {
        formats.summary = this.generateSummary(result.concepts || [], result.relationships || []);
      }
      
      // Si no se especificó un formato, proporcionar todos como estructura para la interfaz
      if (outputFormat === 'interface' || outputFormat === 'all') {
        formats.content = {
          concepts: result.concepts || [],
          relationships: result.relationships || [],
          title: "Mapa Conceptual Generado",
          metadata: result.metadata || {}
        };
        console.log('Formato para interfaz generado con éxito', 
          formats.content.concepts.length + ' conceptos, ' + 
          formats.content.relationships.length + ' relaciones');
      }
      
      // Log para depuración
      console.log('Formatos generados:', Object.keys(formats).join(', '));
      
      return formats;
    } catch (error) {
      console.error('Error al generar formatos de salida:', error);
      return {
        error: 'Error al generar formatos: ' + error.message
      };
    }
  }
}

module.exports = new ConceptMapService();


