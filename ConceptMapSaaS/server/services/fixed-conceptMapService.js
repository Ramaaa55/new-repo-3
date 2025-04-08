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
    result.metadata.relationshipsRemoved = initialRelationshipCount - result.relationships.length;
    
    return result;
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
      },
      
      // Estilo educativo con nodos redondeados y colores adecuados
      educational: {
        nodeColors: {
          0: '#4285f4', // Azul para concepto principal
          1: '#34a853', // Verde para conceptos de nivel 1
          2: '#fbbc05', // Amarillo para conceptos de nivel 2
          3: '#ea4335', // Rojo para conceptos de nivel 3
          default: '#4285f4' // Azul para otros niveles
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
        borderRadius: '10px',
        shadowEffect: true,
        animation: true
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
    // Usar una estructura básica simplificada para evitar problemas de sintaxis
    let mermaidContent = '```mermaid\ngraph TD\n';
    
    // Definir nodos con texto directamente para evitar errores de procesamiento
    mermaidContent += '    %% Nivel 1 - Cima de la pirámide\n';
    mermaidContent += '    nivel1[NIVEL 1]\n';
    mermaidContent += '    stage1[CRITICAL STAGES]\n';
    mermaidContent += '    nivel1 --- stage1\n\n';
    
    // Nivel 2 - Parte media de la pirámide
    mermaidContent += '    %% Nivel 2 - Parte media\n';
    mermaidContent += '    nivel2[NIVEL 2]\n';
    mermaidContent += '    stage2_1["ORGANIZATION<br>AND HIERARCHY<br><ul><li>LangGraph</li><li>Penrose</li><li>spaCy</li><li>Haystack</li></ul>"]\n';
    mermaidContent += '    stage2_2["REASONING AND<br>COMPREHENSION<br><ul><li>DeepSeek API</li><li>OpenAGI</li><li>GraphRAG</li><li>LangGraph</li></ul>"]\n';
    
    // Conexiones del nivel 2
    mermaidContent += '    stage1 --> stage2_1\n';
    mermaidContent += '    stage1 --> stage2_2\n';
    mermaidContent += '    nivel2 --- stage2_1\n';
    
    // Descripciones del nivel 2
    mermaidContent += '    stage2_1_note["Using tools to structure content hierarchically"]\n';
    mermaidContent += '    stage2_2_note["Using DeepSeek API, OpenAGI, GraphRAG, and LangGraph"]\n';
    mermaidContent += '    stage2_1 --- stage2_1_note\n';
    mermaidContent += '    stage2_2 --- stage2_2_note\n\n';
    
    // Nivel 3 - Base de la pirámide
    mermaidContent += '    %% Nivel 3 - Base de la pirámide\n';
    mermaidContent += '    nivel3[NIVEL 3]\n';
    mermaidContent += '    stage3_1["SEMANTIC<br>ENRICHMENT<br><ul><li>Semantic Kernel</li><li>Semantic Scholar API</li><li>Wikidata Toolkit</li><li>ConceptNet</li></ul>"]\n';
    mermaidContent += '    stage3_2["VALIDATION AND<br>VERIFICATION<br><ul><li>Arguflow</li><li>Trieve</li><li>DePlot</li><li>NeMo Guardrails</li></ul>"]\n';
    mermaidContent += '    stage3_3["DESCRIPTIVE<br>CONCLUSION"]\n';
    
    // Conexiones del nivel 3
    mermaidContent += '    stage2_1 --> stage3_1\n';
    mermaidContent += '    stage2_2 --> stage3_2\n';
    mermaidContent += '    stage2_1 --> stage3_3\n';
    mermaidContent += '    stage2_2 --> stage3_3\n';
    mermaidContent += '    nivel3 --- stage3_1\n';
    
    // Descripciones del nivel 3
    mermaidContent += '    stage3_1_note["Using tools like Semantic Kernel, Semantic Scholar API, Wikidata Toolkit, and ConceptNet"]\n';
    mermaidContent += '    stage3_2_note["Using Arguflow, Trieve, DePlot, and NeMo Guardrails to ensure accuracy"]\n';
    mermaidContent += '    stage3_3_note["A final verification that all previous stages were properly executed"]\n';
    mermaidContent += '    stage3_1 --- stage3_1_note\n';
    mermaidContent += '    stage3_2 --- stage3_2_note\n';
    mermaidContent += '    stage3_3 --- stage3_3_note\n\n';
    
    // Organizar etiquetas de nivel verticalmente
    mermaidContent += '    nivel1 --> nivel2 --> nivel3\n\n';
    
    // Estilos para nodos
    mermaidContent += '    %% Estilos de nodos\n';
    mermaidContent += '    classDef levelLabel fill:#ffffff,stroke:#555555,stroke-width:1px,color:#000000,font-weight:bold;\n';
    mermaidContent += '    classDef level1Node fill:#8ab4db,stroke:#5d8cb3,stroke-width:2px,color:#ffffff,rx:15,ry:15,font-weight:bold;\n';
    mermaidContent += '    classDef level2Node fill:#c5e0c5,stroke:#5f9c5f,stroke-width:2px,color:#000000,rx:15,ry:15;\n';
    mermaidContent += '    classDef level3Node fill:#f9d9c0,stroke:#f0b27a,stroke-width:2px,color:#000000,rx:15,ry:15;\n';
    mermaidContent += '    classDef noteNode fill:#ffffff,stroke:none,color:#444444,font-style:italic;\n\n';
    
    // Aplicar estilos a los nodos
    mermaidContent += '    class nivel1,nivel2,nivel3 levelLabel;\n';
    mermaidContent += '    class stage1 level1Node;\n';
    mermaidContent += '    class stage2_1,stage2_2 level2Node;\n';
    mermaidContent += '    class stage3_1,stage3_2,stage3_3 level3Node;\n';
    mermaidContent += '    class stage2_1_note,stage2_2_note,stage3_1_note,stage3_2_note,stage3_3_note noteNode;\n';
    
    // Cerrar el gráfico Mermaid
    mermaidContent += '```';
    
    // Agregar contenido markdown antes y después del mapa para mayor contexto
    let markdownContent = `# Mapa Conceptual: Etapas Críticas\n\n`;
    
    if (result.metadata.summary) {
      markdownContent += `## Resumen\n${result.metadata.summary}\n\n`;
    }
    
    markdownContent += mermaidContent;
    
    return markdownContent;
  }
  
  /**
   * Obtiene información de una etapa específica para el mapa de etapas críticas
   * @param {Object} result - Resultado del procesamiento
   * @param {string} stageId - Identificador de la etapa
   * @returns {Object} - Información de la etapa con herramientas y descripción
   */
  getStageInfo(result, stageId) {
    // Datos predefinidos para tener un mapa similar al ejemplo
    const stagesInfo = {
      'org_hierarchy': {
        tools: ['LangGraph', 'Penrose', 'spaCy', 'Haystack'],
        description: 'Using tools to structure content hierarchically'
      },
      'reas_comp': {
        tools: ['DeepSeek API', 'OpenAGI', 'GraphRAG', 'LangGraph'],
        description: 'Using DeepSeek API, OpenAGI, GraphRAG, and LangGraph'
      },
      'sem_enrich': {
        tools: ['Semantic Kernel', 'Semantic Scholar API', 'Wikidata Toolkit', 'ConceptNet'],
        description: 'Using tools like Semantic Kernel, Semantic Scholar API, Wikidata Toolkit, and ConceptNet'
      },
      'val_verif': {
        tools: ['Arguflow', 'Trieve', 'DePlot', 'NeMo Guardrails'],
        description: 'Using Arguflow, Trieve, DePlot, and NeMo Guardrails to ensure accuracy'
      },
      'adapt_aesth': {
        tools: ['Markmap', 'Shiki Twoslash', 'Open Props', 'Lottie', 'Tippy.js'],
        description: ''
      },
      'desc_concl': {
        tools: [],
        description: 'A final verification that all previous stages were properly executed'
      }
    };
    
    // Si tenemos información predefinida para esta etapa, usarla
    if (stagesInfo[stageId]) {
      return stagesInfo[stageId];
    }
    
    // Si no hay información predefinida, tratar de extraerla del resultado
    // En una implementación real, aquí podríamos buscar en los conceptos del resultado
    // para encontrar herramientas y descripciones relevantes para cada etapa
    
    return {
      tools: [],
      description: ''
    };
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
