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
        await this.step3_EnrichSemantically(text, result, config);
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
   * Extrae conceptos principales del texto
   * @param {string} text - Texto a analizar
   * @returns {Array} - Lista de conceptos
   */
  extractMainConcepts(text) {
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
          .map(word => word.replace(/[.,;:!?()\[\]{}'"‘’“”]/g, '').trim())
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
        const firstWord = content.split(/\s+/)[0].replace(/[.,;:!?()\[\]{}'"‘’“”]/g, '');
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
    
    // Crear árbol jerárquico
    const tree = rootConcepts.map(root => {
      return this.buildConceptChildren(root, concepts);
    });
    
    return tree;
  }
  
  /**
   * Construye la estructura jerárquica de hijos para un concepto
   * @param {Object} parent - Concepto padre
   * @param {Array} allConcepts - Todos los conceptos disponibles
   * @returns {Object} - Árbol de hijos para este concepto
   */
  buildConceptChildren(parent, allConcepts) {
    // Crear nodo para este concepto
    const node = {
      ...parent,
      children: []
    };
    
    // Encontrar posibles hijos (conceptos de nivel inmediatamente inferior)
    const childLevel = parent.level + 1;
    const potentialChildren = allConcepts.filter(c => 
      c.level === childLevel && c.id !== parent.id
    );
    
    // Asignar hijos recursivamente
    node.children = potentialChildren.map(child => 
      this.buildConceptChildren(child, allConcepts.filter(c => c.id !== child.id))
    );
    
    return node;
  }

  /**
   * Paso 2: Analizar Relaciones
   * Aplica razonamiento para determinar conexiones significativas entre conceptos
   */
  async step2_AnalyzeRelationships(text, result) {
    console.log('Analizando relaciones entre conceptos...');
    
    // Detectar relaciones entre conceptos
    const relationships = await this.detectConceptRelationships(result.concepts, text);
    
    // Clasificar tipos de relaciones
    const classifiedRelationships = await this.classifyRelationshipTypes(relationships);
    
    // Guardar relaciones
    result.relationships = classifiedRelationships;
    
    return result;
  }
  
  /**
   * Detecta relaciones entre conceptos basados en su proximidad en el texto
   * y patrones lingüísticos
   * @param {Array} concepts - Lista de conceptos
   * @param {string} text - Texto original
   * @returns {Array} - Lista de relaciones detectadas
   */
  async detectConceptRelationships(concepts, text) {
    console.log(`Detectando relaciones entre ${concepts.length} conceptos...`);
    
    const relationships = [];
    let relationCounter = 1;
    
    // Detectar relaciones basadas en jerarquía de niveles
    for (let i = 0; i < concepts.length; i++) {
      const concept1 = concepts[i];
      
      // Buscar conceptos de nivel inmediatamente inferior
      for (let j = 0; j < concepts.length; j++) {
        if (i === j) continue; // Ignorar comparación con uno mismo
        
        const concept2 = concepts[j];
        
        // Crear relaciones jerárquicas (basadas en nivel)
        if (concept2.level === concept1.level + 1) {
          // Crear relación jerárquica
          relationships.push({
            id: `relation_${relationCounter++}`,
            source: concept1.id,
            target: concept2.id,
            type: 'hierarchical',
            strength: 0.8,
            label: 'incluye'
          });
        }
      }
    }
    
    // Para relaciones más sofisticadas, se utilizarían herramientas como LangGraph y GraphRAG
    // Esta implementación es simplificada
    
    console.log(`Detectadas ${relationships.length} relaciones entre conceptos`);
    return relationships;
  }
  
  /**
   * Clasifica tipos de relaciones entre conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {Array} - Relaciones clasificadas
   */
  async classifyRelationshipTypes(relationships) {
    // Tipos de relaciones semánticas entre conceptos
    const relationTypes = [
      { type: 'hierarchical', labels: ['contiene', 'incluye', 'abarca', 'comprende'] },
      { type: 'causal', labels: ['causa', 'produce', 'genera', 'provoca'] },
      { type: 'sequential', labels: ['precede a', 'sigue a', 'conduce a', 'deriva en'] },
      { type: 'descriptive', labels: ['describe', 'caracteriza', 'define'] },
      { type: 'example', labels: ['ejemplifica', 'ilustra', 'muestra'] },
      { type: 'comparative', labels: ['similar a', 'diferente de', 'contrasta con'] }
    ];
    
    // Asignar etiquetas más descriptivas
    return relationships.map(rel => {
      // Si ya tiene un tipo asignado
      if (rel.type) {
        // Seleccionar una etiqueta aleatoria para ese tipo si no la tiene ya
        if (!rel.label) {
          const matchingType = relationTypes.find(rt => rt.type === rel.type);
          if (matchingType) {
            const randomIndex = Math.floor(Math.random() * matchingType.labels.length);
            rel.label = matchingType.labels[randomIndex];
          }
        }
        return rel;
      }
      
      // Asignar tipo aleatorio para esta implementación simplificada
      const randomTypeIndex = Math.floor(Math.random() * relationTypes.length);
      const selectedType = relationTypes[randomTypeIndex];
      
      // Seleccionar etiqueta aleatoria para el tipo
      const randomLabelIndex = Math.floor(Math.random() * selectedType.labels.length);
      
      return {
        ...rel,
        type: selectedType.type,
        label: rel.label || selectedType.labels[randomLabelIndex]
      };
    });
  }

  /**
   * Paso 3: Enriquecer Semánticamente
   * Expande cada concepto con definiciones breves, ejemplos, sinónimos o clasificaciones
   */
  async step3_EnrichSemantically(text, result, config = {}) {
    console.log(`Enriqueciendo semánticamente ${result.concepts.length} conceptos...`);
    
    // Procesamiento por lotes para evitar sobrecargas
    const batchSize = 5;
    const batches = Math.ceil(result.concepts.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, result.concepts.length);
      const batch = result.concepts.slice(start, end);
      
      // Procesar cada concepto en el lote
      await Promise.all(batch.map(async (concept) => {
        // Generar definición concisa
        if (config.includeDefinitions !== false) {
          concept.definition = await this.generateConciseDefinition(concept);
        }
        
        // Encontrar ejemplos relevantes
        if (config.includeExamples !== false) {
          concept.examples = await this.findRelevantExamples(concept);
        }
        
        // Identificar términos relacionados o sinónimos
        concept.relatedTerms = await this.identifyRelatedTerms(concept);
        
        // Clasificar el concepto
        const classification = await this.classifyConcept(concept);
        concept.category = classification.category;
        concept.subcategory = classification.subcategory;
        
        // Determinar importancia
        concept.importance = concept.importance || 
                             (1 / (concept.level + 1)) * (concept.relatedTerms.length + 1);
                             
        // Atributos para el concepto
        concept.attributes = this.extractConceptAttributes(concept, text);
      }));
      
      console.log(`Procesado lote ${i+1}/${batches} de conceptos`);
    }
    
    return result;
  }
  
  /**
   * Genera una definición concisa para un concepto
   * @param {Object} concept - Concepto a definir
   * @returns {string} - Definición concisa
   */
  async generateConciseDefinition(concept) {
    // En una implementación completa, aquí se utilizaría Semantic Scholar y/o Wikidata
    // Para esta versión, generamos definiciones simples basadas en el nombre del concepto
    
    const commonDefinitions = {
      tecnología: "Conjunto de conocimientos, instrumentos y técnicas que permiten el aprovechamiento práctico del conocimiento científico.",
      inteligencia: "Capacidad de entender, comprender y resolver problemas.",
      artificial: "Hecho por el ser humano; no natural.",
      educación: "Proceso de facilitar el aprendizaje o la adquisición de conocimientos, habilidades, valores y creencias.",
      aprendizaje: "Proceso de adquirir conocimientos, habilidades o aptitudes por medio del estudio o la experiencia.",
      conceptual: "Relativo a los conceptos o a la formación de conceptos.",
      mapa: "Representación gráfica y métrica de elementos existentes o abstractos."
    };
    
    // Buscar definición común
    const lowerName = concept.name.toLowerCase();
    for (const [key, value] of Object.entries(commonDefinitions)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    
    // Si no hay definición predefinida, generar una basada en el nivel del concepto
    if (concept.level === 0) {
      return `Concepto principal que representa ${lowerName}.`;
    } else if (concept.level === 1) {
      return `Área o categoría importante dentro de ${lowerName}.`;
    } else {
      return `Elemento específico relacionado con ${lowerName}.`;
    }
  }
  
  /**
   * Busca ejemplos relevantes para un concepto
   * @param {Object} concept - Concepto para el que buscar ejemplos
   * @returns {Array} - Lista de ejemplos
   */
  async findRelevantExamples(concept) {
    // En una implementación completa, aquí se utilizaría Semantic Scholar API
    // Para esta versión, usamos ejemplos predefinidos basados en palabras clave
    
    const examplesByKeyword = {
      tecnología: ["Inteligencia artificial", "Computación en la nube", "Internet de las cosas"],
      educación: ["Aprendizaje basado en proyectos", "Aula invertida", "Aprendizaje colaborativo"],
      inteligencia: ["Toma de decisiones", "Resolución de problemas", "Adaptabilidad"],
      concepto: ["Ideas abstractas", "Categorías", "Representaciones mentales"],
      mapa: ["Diagramas de flujo", "Mapas mentales", "Organizadores gráficos"]
    };
    
    // Buscar ejemplos que coincidan con palabras clave en el nombre del concepto
    const lowerName = concept.name.toLowerCase();
    let examples = [];
    
    for (const [keyword, exampleList] of Object.entries(examplesByKeyword)) {
      if (lowerName.includes(keyword)) {
        examples = [...examples, ...exampleList];
      }
    }
    
    // Si ya tiene ejemplos, mantenerlos
    if (concept.examples && concept.examples.length > 0) {
      examples = [...concept.examples, ...examples];
    }
    
    // Limitar a 3 ejemplos como máximo
    return examples.slice(0, 3);
  }
  
  /**
   * Identifica términos relacionados o sinónimos para un concepto
   * @param {Object} concept - Concepto a analizar
   * @returns {Array} - Lista de términos relacionados
   */
  async identifyRelatedTerms(concept) {
    // En una implementación completa, aquí se utilizaría ConceptNet
    // Para esta versión, definimos relaciones simplificadas
    
    const relatedTermsByKeyword = {
      tecnología: ["innovación", "desarrollo", "herramientas", "avance"],
      inteligencia: ["conocimiento", "aprendizaje", "cognición", "razonamiento"],
      artificial: ["sintético", "creado", "simulado"],
      educación: ["enseñanza", "pedagogía", "formación", "aprendizaje"],
      mapa: ["representación", "esquema", "diagrama", "organizador"],
      concepto: ["idea", "noción", "constructo", "abstracción"]
    };
    
    // Buscar términos relacionados
    const lowerName = concept.name.toLowerCase();
    let relatedTerms = [];
    
    for (const [keyword, termsList] of Object.entries(relatedTermsByKeyword)) {
      if (lowerName.includes(keyword)) {
        relatedTerms = [...relatedTerms, ...termsList];
      }
    }
    
    // Eliminar duplicados si los hay
    return [...new Set(relatedTerms)];
  }
  
  /**
   * Clasifica un concepto en categorías y subcategorías
   * @param {Object} concept - Concepto a clasificar
   * @returns {Object} - Clasificación del concepto
   */
  async classifyConcept(concept) {
    // Categorías por palabras clave
    const categoriesByKeyword = {
      tecnología: {category: "Tecnología", subcategories: ["Hardware", "Software", "Redes", "Innovación"]},
      educación: {category: "Educación", subcategories: ["Metodologías", "Evaluación", "Recursos", "Instituciones"]},
      inteligencia: {category: "Cognición", subcategories: ["Procesos", "Capacidades", "Desarrollo"]},
      concepto: {category: "Epistemología", subcategories: ["Teorías", "Modelos", "Paradigmas"]},
      mapa: {category: "Visualización", subcategories: ["Diagramas", "Esquemas", "Representaciones"]}
    };
    
    // Categorías por defecto según nivel
    const defaultCategories = [
      {category: "Concepto Principal", subcategory: "Fundamento"},
      {category: "Concepto Secundario", subcategory: "Componente"},
      {category: "Concepto Derivado", subcategory: "Ejemplo"}
    ];
    
    // Buscar categoría por palabra clave
    const lowerName = concept.name.toLowerCase();
    
    for (const [keyword, categoryInfo] of Object.entries(categoriesByKeyword)) {
      if (lowerName.includes(keyword)) {
        // Seleccionar una subcategoría aleatoria
        const randomIndex = Math.floor(Math.random() * categoryInfo.subcategories.length);
        return {
          category: categoryInfo.category,
          subcategory: categoryInfo.subcategories[randomIndex]
        };
      }
    }
    
    // Usar categoría predeterminada según nivel
    const levelIndex = Math.min(concept.level, defaultCategories.length - 1);
    return defaultCategories[levelIndex];
  }

  /**
   * Paso 4: Verificar y Validar
   * Asegura coherencia y relevancia del mapa conceptual
   */
  async step4_VerifyAndValidate(result) {
    console.log('Iniciando validación y verificación');
    
    // Obtener conceptos antes de la validación para métricas
    const initialConceptCount = result.concepts.length;
    const initialRelationshipCount = result.relationships.length;
    
    // 1. Filtrar conceptos irrelevantes
    result.concepts = this.filterIrrelevantConcepts(result.concepts);
    console.log(`Filtrado de conceptos irrelevantes: ${initialConceptCount} -> ${result.concepts.length}`);
    
    // 2. Eliminar conceptos redundantes
    result.concepts = this.removeRedundantConcepts(result.concepts);
    console.log(`Eliminación de conceptos redundantes: ${initialConceptCount} -> ${result.concepts.length}`);
    
    // 3. Validar coherencia de relaciones
    result.relationships = this.validateRelationshipCoherence(
      result.relationships, 
      result.concepts
    );
    console.log(`Validación de relaciones: ${initialRelationshipCount} -> ${result.relationships.length}`);
    
    // 4. Calcular puntuación de coherencia
    const coherenceScore = this.calculateCoherenceScore(result.concepts, result.relationships);
    result.metadata.coherenceScore = coherenceScore;
    console.log(`Puntuación de coherencia: ${coherenceScore.toFixed(2)}`);
    
    // 5. Registrar métricas de cambios
    result.metadata.conceptsRemoved = initialConceptCount - result.concepts.length;
    
    return result;
  }
  
  /**
   * Filtra conceptos irrelevantes o poco importantes
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Lista de conceptos filtrada
   */
  filterIrrelevantConcepts(concepts) {
    // Calcular la importancia promedio
    const importanceValues = concepts.map(c => c.importance || 0);
    const avgImportance = importanceValues.reduce((sum, val) => sum + val, 0) / 
                         Math.max(1, importanceValues.length);
    
    // Eliminar conceptos con importancia significativamente menor al promedio
    // excepto los conceptos principales (nivel 0 o isMainConcept)
    return concepts.filter(concept => 
      concept.level === 0 || 
      concept.isMainConcept || 
      (concept.importance || 0) >= (avgImportance * 0.4)
    );
  }
  
  /**
   * Elimina conceptos redundantes o duplicados
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Lista sin conceptos redundantes
   */
  removeRedundantConcepts(concepts) {
    const uniqueConcepts = [];
    const seenNames = new Set();
    
    // Ordenar por importancia (descendente)
    const sortedConcepts = [...concepts].sort((a, b) => 
      (b.importance || 0) - (a.importance || 0)
    );
    
    // Mantener solo la versión más importante de cada concepto con nombre similar
    sortedConcepts.forEach(concept => {
      const normalizedName = concept.name.toLowerCase().trim();
      
      // Verificar si ya existe un concepto similar
      let isDuplicate = false;
      for (const seenName of seenNames) {
        // Considerar como duplicado si hay alta similitud
        const similarity = this.calculateStringSimilarity(normalizedName, seenName);
        if (similarity > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      // Si no es duplicado o es un concepto principal, conservarlo
      if (!isDuplicate || concept.level === 0 || concept.isMainConcept) {
        uniqueConcepts.push(concept);
        seenNames.add(normalizedName);
      }
    });
    
    return uniqueConcepts;
  }
  
  /**
   * Calcula la similitud entre dos cadenas (0-1)
   * @param {string} str1 - Primera cadena
   * @param {string} str2 - Segunda cadena
   * @returns {number} - Puntuación de similitud (0-1)
   */
  calculateStringSimilarity(str1, str2) {
    // Algoritmo simple de similitud de Levenshtein
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Verificar si una es subcadena de la otra
    if (str1.includes(str2) || str2.includes(str1)) {
      // Calcular proporción de longitud
      const ratio = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
      return 0.7 + (ratio * 0.3); // Entre 0.7 y 1.0 según proporción
    }
    
    // Verificar palabras compartidas
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    // Contar palabras comunes
    let commonWords = 0;
    for (const word of words1) {
      if (words2.includes(word)) commonWords++;
    }
    
    // Calcular proporción de palabras comunes
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return commonWords / Math.max(1, totalUniqueWords);
  }
  
  /**
   * Valida la coherencia de las relaciones y elimina las inválidas
   * @param {Array} relationships - Lista de relaciones
   * @param {Array} concepts - Lista de conceptos validados
   * @returns {Array} - Lista de relaciones válidas
   */
  validateRelationshipCoherence(relationships, concepts) {
    // Crear un conjunto con los IDs de conceptos para búsqueda rápida
    const conceptIds = new Set(concepts.map(c => c.id));
    
    // Filtrar relaciones cuyos conceptos origen o destino ya no existan
    const validRelationships = relationships.filter(relation => 
      conceptIds.has(relation.source) && conceptIds.has(relation.target)
    );
    
    return validRelationships;
  }
  
  /**
   * Calcula la puntuación de coherencia del mapa conceptual
   * @param {Array} concepts - Lista de conceptos
   * @param {Array} relationships - Lista de relaciones
   * @returns {number} - Puntuación de coherencia (0-1)
   */
  calculateCoherenceScore(concepts, relationships) {
    // Factor 1: Proporción de conceptos relacionados
    const conceptsInRelations = new Set();
    relationships.forEach(rel => {
      conceptsInRelations.add(rel.source);
      conceptsInRelations.add(rel.target);
    });
    
    const connectedConceptsRatio = conceptsInRelations.size / Math.max(1, concepts.length);
    
    // Factor 2: Distribución de niveles
    const levelCounts = {};
    concepts.forEach(c => {
      const level = c.level || 0;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    // Idealmente debería haber una distribución pirámide (más generales, menos específicos)
    const levels = Object.keys(levelCounts).map(Number).sort((a, b) => a - b);
    let levelBalanceScore = 1.0;
    
    if (levels.length > 1) {
      for (let i = 1; i < levels.length; i++) {
        // Penalizar si hay más conceptos en niveles inferiores que en superiores
        if (levelCounts[levels[i-1]] < levelCounts[levels[i]]) {
          levelBalanceScore -= 0.2;
        }
      }
    } else {
      // Penalizar si solo hay un nivel
      levelBalanceScore = 0.5;
    }
    
    // Factor 3: Densidad de relaciones (debe ser razonable, ni muy pocas ni demasiadas)
    const relationshipDensity = relationships.length / Math.max(1, concepts.length);
    const densityScore = relationshipDensity <= 0.2 ? relationshipDensity * 2 : 
                         relationshipDensity <= 2 ? 0.8 - (relationshipDensity - 1) * 0.2 :
                         0.4 - Math.min(0.4, (relationshipDensity - 2) * 0.1);
    
    // Combinar factores (ponderados)                     
    return (connectedConceptsRatio * 0.5) + 
           (Math.max(0.2, levelBalanceScore) * 0.3) + 
           (densityScore * 0.2);
    result.metadata.relationshipsRemoved = initialRelationshipCount - result.relationships.length;
    
    return result;
  }

  /**
   * Paso 5: Optimizar Presentación Visual
   * Mejora la claridad y comprensión visual del mapa conceptual
   */
  async step5_OptimizeVisualPresentation(result, config) {
    console.log('Optimizando presentación visual');
    
    // 1. Obtener configuración visual según estilo
    const visualSettings = this.getEducationalVisualSettings(config.style);
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
      },
      
      // Estilo colorido para mayor impacto visual
      colorful: {
        nodeColors: {
          0: '#ff1493', // Rosa intenso para nivel 0
          1: '#00bfff', // Azul cielo para nivel 1
          2: '#32cd32', // Verde lima para nivel 2
          3: '#ffd700', // Amarillo dorado para nivel 3
          default: '#ff7f50' // Coral para otros niveles
        },
        fontSizes: {
          0: 20,
          1: 18,
          2: 16,
          default: 14
        },
        lineStyles: {
          causal: 'bold',
          hierarchical: 'bold',
          descriptive: 'dashed',
          default: 'normal'
        },
        borderRadius: '12px',
        shadowEffect: true,
        animation: true
      },
      
      // Estilo minimalista para mayor claridad
      minimal: {
        nodeColors: {
          0: '#333333', // Gris oscuro para nivel 0
          1: '#666666', // Gris medio para nivel 1
          2: '#888888', // Gris claro para nivel 2
          3: '#aaaaaa', // Gris muy claro para nivel 3
          default: '#666666' // Gris medio para otros niveles
        },
        fontSizes: {
          0: 16,
          1: 14,
          2: 12,
          default: 10
        },
        lineStyles: {
          causal: 'normal',
          hierarchical: 'normal',
          descriptive: 'dotted',
          default: 'normal'
        },
        borderRadius: '4px',
        shadowEffect: false,
        animation: false
      }
    };
    
    // Devolver el estilo solicitado o el estilo moderno por defecto
    return visualStyles[style] || visualStyles.modern;
  }
  
  /**
   * Paso 5: Optimizar Presentación Visual
   * Mejora la claridad y comprensión visual del mapa conceptual
   */
  async step5_OptimizeVisualPresentation(result, config) {
    console.log('Optimizando presentación visual');
    
    // 1. Obtener configuración visual según estilo
    const visualSettings = this.getEducationalVisualSettings(config.style);
    
    // 2. Asignar colores y formas a conceptos según nivel y categoría
    result.concepts.forEach(concept => {
      concept.formatting = {
        color: visualSettings.nodeColors[concept.level] || visualSettings.nodeColors.default,
        shape: concept.isMainConcept ? 'rectangle' : 
               (concept.category === 'process' ? 'ellipse' : 'rectangle'),
        fontSize: visualSettings.fontSizes[concept.level] || visualSettings.fontSizes.default,
        bold: concept.level === 0 || concept.isMainConcept,
        border: concept.isMainConcept ? 2 : 1
      };
    });
    
    // 3. Asignar estilos a relaciones según tipo
    result.relationships.forEach(rel => {
      rel.visualWeight = rel.strength || 1;
      rel.style = rel.type === 'causal' ? 'thick' : 
                 (rel.type === 'hierarchical' ? 'normal' : 'dashed');
    });
    
    // 4. Asignar emojis a conceptos para mayor claridad visual
    result.conceptEmojis = this.assignRelevantEmojis(result.concepts);
    
    // 5. Organizar conceptos por nivel para visualización jerárquica
    result.conceptsByLevel = result.concepts.reduce((acc, concept) => {
      const level = concept.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(concept);
      return acc;
    }, {});
    
    // 6. Preparar notas adicionales como nubes de contexto
    result.contextNotes = this.generateContextNotes(result.concepts);
    
    return result;
  }

  /**
   * Genera notas de contexto para los conceptos principales
   * @param {Array} concepts - Lista de conceptos
   * @returns {Array} - Notas de contexto
   */
  generateContextNotes(concepts) {
    const notes = [];
    
    // Identificar conceptos principales
    const mainConcepts = concepts.filter(c => c.level === 0 || c.isMainConcept);
    
    mainConcepts.forEach(concept => {
      // Si hay características importantes, agregarlas como nube de contexto
      if (concept.characteristics && concept.characteristics.length > 0) {
        const content = concept.characteristics.slice(0, 3).join("\n• ");
        notes.push({
          relatedConceptId: concept.id,
          content: `${concept.name.charAt(0).toUpperCase() + concept.name.slice(1)}:\n• ${content}`
        });
      }
      
      // Si hay información de origen o etimología
      if (concept.origin) {
        notes.push({
          relatedConceptId: concept.id,
          content: `Origen y matiz:\n• ${concept.origin}`
        });
      }
    });
    
    return notes;
  }

  /**
   * Extrae atributos de un concepto
   * @param {Object} concept - Concepto a analizar
   * @param {string} text - Texto original
   * @returns {Array} - Lista de atributos
   */
  extractConceptAttributes(concept, text) {
    // En una implementación completa, esto usaría NLP para extraer atributos
    // Por simplicidad, usamos una aproximación simulada
    
    const attributes = [];
    
    // Si tenemos ejemplos, convertirlos en atributos
    if (concept.examples && concept.examples.length > 0) {
      attributes.push({
        name: "Ejemplos",
        value: concept.examples.join(", "),
        type: "example"
      });
    }
    
    // Si hay definición, extraer palabras clave como atributos
    if (concept.definition) {
      // Extraer características de la definición
      const words = concept.definition.split(/\s+/);
      const keyWords = words.filter(w => w.length > 4).slice(0, 3);
      
      if (keyWords.length > 0) {
        attributes.push({
          name: "Características",
          subAttributes: keyWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)),
          type: "characteristic"
        });
      }
    }
    
    return attributes;
  }

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
   * Genera un mapa conceptual en formato educativo usando Mermaid
   * @param {Object} result - Resultado del procesamiento
   * @param {Object} config - Configuración de generación
   * @returns {string} - Contenido del mapa conceptual en Markdown con Mermaid
   */
  generateEducationalConceptMap(result, config) {
    // Comenzar con la estructura básica del mapa conceptual en Mermaid
    let mermaidContent = '```mermaid\nflowchart TD\n';
    
    // Identificar el concepto principal
    const mainConcept = this.identifyMainConcept(result);
    
    // Agregar clases personalizadas para estilos
    mermaidContent += '    %% Definición de clases para estilizar nodos\n';
    mermaidContent += '    classDef mainConcept fill:#ffffff,stroke:#555,stroke-width:2.5px;\n';
    mermaidContent += '    classDef attributeNode fill:#FFF9C4,stroke:#FBC02D;\n';
    mermaidContent += '    classDef exampleNode fill:#ffffff,stroke:#2E7D32;\n';
    mermaidContent += '    classDef originNode fill:#ffffff,stroke:#6D4C41;\n';
    mermaidContent += '    classDef cloudNode fill:#ffffff,stroke:#795548,rx:25,ry:25;\n\n';
    
    // Agregar nodos principales
    result.concepts.forEach(concept => {
      if (concept.id === mainConcept.id) {
        // Nodo principal (concepto central) con emoji o imagen si está disponible
        let iconPrefix = '';
        if (concept.icon) {
          iconPrefix = `${concept.icon} `;
        }
        mermaidContent += `    ${concept.id}["${iconPrefix}${concept.name}"]\n`;
        mermaidContent += `    class ${concept.id} mainConcept;\n`;
      } else {
        mermaidContent += `    ${concept.id}["${concept.name}"]\n`;
      }
      
      // Si hay una definición, agregarla como un nodo relacionado
      if (concept.definition) {
        const defId = `${concept.id}_def`;
        mermaidContent += `    ${defId}["${concept.definition}"]\n`;
        mermaidContent += `    ${concept.id} --> ${defId}\n`;
      }
      
      // Si hay atributos, mostrarlos como nodos con estilo amarillo
      if (concept.attributes && concept.attributes.length > 0) {
        concept.attributes.forEach((attr, index) => {
          const attrId = `${concept.id}_attr_${index}`;
          mermaidContent += `    ${attrId}["${attr.name}"]\n`;
          mermaidContent += `    class ${attrId} attributeNode;\n`;
          mermaidContent += `    ${concept.id} --> ${attrId}\n`;
          
          // Si el atributo tiene a su vez sub-atributos
          if (attr.subAttributes && attr.subAttributes.length > 0) {
            attr.subAttributes.forEach((subAttr, subIndex) => {
              const subAttrId = `${concept.id}_attr_${index}_sub_${subIndex}`;
              mermaidContent += `    ${subAttrId}["${subAttr}"]\n`;
              mermaidContent += `    class ${subAttrId} attributeNode;\n`;
              mermaidContent += `    ${attrId} --> ${subAttrId}\n`;
            });
          }
        });
      }
      
      // Si hay ejemplos, agregarlos como nodos con formato especial
      if (concept.examples && concept.examples.length > 0) {
        const exampleId = `${concept.id}_examples`;
        let exampleContent = 'Ejemplos de uso:\n';
        concept.examples.forEach(example => {
          exampleContent += `• ${example}\n`;
        });
        mermaidContent += `    ${exampleId}["${exampleContent}"]\n`;
        mermaidContent += `    class ${exampleId} exampleNode;\n`;
        mermaidContent += `    ${concept.id} --> ${exampleId}\n`;
      }
      
      // Si hay información de origen, agregarla como nodo con estilo propio
      if (concept.origin) {
        const originId = `${concept.id}_origin`;
        let originContent = 'Origen y matiz:\n';
        originContent += `• ${concept.origin}\n`;
        mermaidContent += `    ${originId}["${originContent}"]\n`;
        mermaidContent += `    class ${originId} originNode;\n`;
        mermaidContent += `    ${concept.id} --> ${originId}\n`;
      }
    });
    
    // Agregar nodos de contexto adicional como nubes
    if (result.contextNotes && result.contextNotes.length > 0) {
      result.contextNotes.forEach((note, index) => {
        const noteId = `context_${index}`;
        mermaidContent += `    ${noteId}["${note.content}"]\n`;
        mermaidContent += `    class ${noteId} cloudNode;\n`;
        mermaidContent += `    ${note.relatedConceptId} --> ${noteId}\n`;
      });
    }
    
    // Agregar relaciones entre conceptos
    result.relationships.forEach(rel => {
      mermaidContent += `    ${rel.source} --> |"${rel.label || ''}"|${rel.target}\n`;
    });
    
    // Cerrar el gráfico Mermaid
    mermaidContent += '```';
    
    // Agregar contenido markdown antes y después del mapa para mayor contexto
    let markdownContent = `# Mapa Conceptual: ${mainConcept.name}\n\n`;
    
    if (result.metadata.summary) {
      markdownContent += `## Resumen\n${result.metadata.summary}\n\n`;
    }
    
    markdownContent += mermaidContent;
    
    return markdownContent;
  }
  
  /**
   * Identifica el concepto principal del mapa conceptual
   * @param {Object} result - Resultado del procesamiento
   * @returns {Object} - El concepto principal
   */
  identifyMainConcept(result) {
    // Si hay un concepto marcado explícitamente como principal, usarlo
    const explicitMain = result.concepts.find(c => c.isMainConcept);
    if (explicitMain) {
      return explicitMain;
    }
    
    // De lo contrario, usar el concepto con mayor importancia o el primer concepto
    result.concepts.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    return result.concepts[0] || { id: 'main', name: 'Concepto Principal' };
  }
  
  /**
   * Identifica el tema principal del mapa conceptual
   * @param {Object} result - Resultado del procesamiento
   * @returns {string} - Nombre del tema principal
   */
  identifyMainTopic(result) {
    // Buscar concepto principal
    const mainConcept = this.identifyMainConcept(result);
    return mainConcept?.name || 'Mapa Conceptual';
  }
  
  /**
   * Genera un resumen descriptivo del mapa conceptual para la etapa de Conclusión
   * @param {Object} result - Resultado del mapa conceptual
   * @returns {string} - Resumen descriptivo detallado
   */
  generateConceptualSummary(result) {
    // En una implementación real, esto generaría un resumen completo basado en el análisis
    // Por ahora, generamos un resumen básico
    
    const mainConcept = this.identifyMainConcept(result);
    const conceptCount = result.concepts.length;
    const relationshipCount = result.relationships.length;
    
    let summary = `Este mapa conceptual analiza "${mainConcept.name}" a través de ${conceptCount} conceptos interconectados mediante ${relationshipCount} relaciones. `;
    
    // Agregar información sobre jerarquía
    const levels = [...new Set(result.concepts.map(c => c.level))].sort();
    if (levels.length > 1) {
      summary += `Está organizado en ${levels.length} niveles jerárquicos, desde conceptos generales hasta específicos. `;
    }
    
    // Mencionar elementos enriquecidos
    const withDefinitions = result.concepts.filter(c => c.definition).length;
    const withExamples = result.concepts.filter(c => c.examples && c.examples.length > 0).length;
    
    if (withDefinitions > 0 || withExamples > 0) {
      summary += `Incluye ${withDefinitions} definiciones conceptuales y ${withExamples} ejemplos ilustrativos para facilitar la comprensión. `;
    }
    
    // Mencionar características visuales
    summary += `La visualización destaca conceptos clave mediante una organización jerárquica con nodos y conexiones diferenciadas por color y formato.`;
    
    return summary;
  }
  
  // Los métodos auxiliares como extractMainConcepts, findOriginalForm, etc., irían aquí
  // pero no se incluyen por brevedad en esta implementación
  
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
        label: r.type,
        strength: r.strength,
        visualWeight: r.visualWeight
      }))
    };
  }
}

module.exports = new ConceptMapService();
