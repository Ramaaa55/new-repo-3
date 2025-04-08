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
