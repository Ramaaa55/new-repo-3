/**
 * ReasoningModule.js
 * Implementación del módulo para la etapa 2: Razonamiento y Comprensión
 */

const BaseModule = require('../BaseModule');

class ReasoningModule extends BaseModule {
  /**
   * Constructor del módulo de razonamiento
   * @param {Object} options - Opciones de configuración
   */
  constructor(options = {}) {
    super('reasoning', options);
    
    // Cargar servicios necesarios para esta etapa
    try {
      // Importar servicios existentes
      this.conceptMapService = require('../../services/fixed-conceptMapService');
      
      // Importar el nuevo servicio AI SDK
      this.aiSdkService = require('../../services/aiSdkService');
    } catch (error) {
      console.error('Error al cargar servicios para ReasoningModule:', error);
    }
  }
  
  /**
   * Validación específica para este módulo
   * @param {Object} input - Datos de entrada
   */
  validateInput(input) {
    super.validateInput(input);
    
    // Verificar que existan conceptos para analizar relaciones
    if (!input.concepts || !Array.isArray(input.concepts) || input.concepts.length === 0) {
      throw new Error('Se requieren conceptos para analizar sus relaciones');
    }
  }
  
  /**
   * Implementación del procesamiento para la etapa de razonamiento
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async _processImplementation(input, context) {
    console.log('ETAPA 2: Razonamiento y Comprensión');
    
    // Extraer información relevante
    const text = input.original.text;
    const concepts = input.concepts;
    const language = input.original.language || 'es';
    
    // Preferencia de API: DeepSeek API o Vercel AI SDK
    const useDeepSeekApi = this.isToolEnabled('deepSeekApi') || process.env.USE_DEEPSEEK_API === 'true';
    const useAiSdk = this.isToolEnabled('aiSdk') || !useDeepSeekApi;
    
    // Inicializar array de relaciones
    let relationships = [];
    
    // 1. Análisis de relaciones utilizando la API preferida
    try {
      if (useDeepSeekApi) {
        console.log('Analizando relaciones con DeepSeek API');
        relationships = await this._analyzeWithDeepSeek(text, concepts);
      } else if (useAiSdk) {
        console.log('Analizando relaciones con Vercel AI SDK');
        relationships = await this._analyzeWithAiSdk(text, concepts, language);
      } else {
        // Fallback a método estándar
        console.log('Usando análisis estándar de relaciones');
        relationships = await this._fallbackAnalysis(text, concepts);
      }
      
      console.log(`Se identificaron ${relationships.length} relaciones entre conceptos`);
    } catch (error) {
      console.error('Error en análisis de relaciones:', error);
      // Crear algunas relaciones básicas en caso de error
      relationships = this._createBasicRelationships(concepts);
    }
    
    // 2. Aplicar razonamiento avanzado con OpenAGI si está habilitado
    if (this.isToolEnabled('openAGI') && relationships.length > 0) {
      try {
        console.log('Aplicando razonamiento con OpenAGI');
        relationships = await this._enhanceWithOpenAGI(relationships, concepts, text);
      } catch (error) {
        console.warn('Error en razonamiento OpenAGI:', error.message);
        // No es crítico si falla
      }
    }
    
    // 3. Modelado de conocimiento con GraphRAG si está habilitado
    if (this.isToolEnabled('graphRAG') && relationships.length > 0) {
      try {
        console.log('Aplicando modelado con GraphRAG');
        const enhancedData = await this._enhanceWithGraphRAG(relationships, concepts, text);
        
        // Solo actualizar si devuelve resultados válidos
        if (enhancedData && enhancedData.relationships && enhancedData.relationships.length > 0) {
          relationships = enhancedData.relationships;
        }
        
        // Actualizar conceptos si se enriquecieron en el proceso
        if (enhancedData && enhancedData.concepts && enhancedData.concepts.length > 0) {
          input.concepts = enhancedData.concepts;
        }
      } catch (error) {
        console.warn('Error en modelado GraphRAG:', error.message);
        // No es crítico si falla
      }
    }
    
    // 4. Calcular métricas semánticas sobre las relaciones
    const semanticMetrics = this._calculateSemanticMetrics(relationships, concepts);
    
    // Actualizar el resultado con las relaciones procesadas
    input.relationships = relationships;
    
    // Añadir metadatos específicos de esta etapa
    if (!input.metadata.stageResults) input.metadata.stageResults = {};
    input.metadata.stageResults.reasoning = {
      relationshipCount: relationships.length,
      semanticMetrics: semanticMetrics,
      tools: {
        deepSeekApi: useDeepSeekApi,
        aiSdk: useAiSdk,
        openAGI: this.isToolEnabled('openAGI'),
        graphRAG: this.isToolEnabled('graphRAG')
      }
    };
    
    return input;
  }
  
  /**
   * Analiza relaciones utilizando DeepSeek API
   * @param {string} text - Texto original
   * @param {Array} concepts - Conceptos a analizar
   * @returns {Promise<Array>} - Array de relaciones
   * @private
   */
  async _analyzeWithDeepSeek(text, concepts) {
    // Reutilizar la implementación existente del servicio
    try {
      return await this.conceptMapService._deepSeekSemanticAnalysis(text, concepts);
    } catch (error) {
      console.error('Error en DeepSeek API, utilizando fallback:', error);
      return this._fallbackAnalysis(text, concepts);
    }
  }
  
  /**
   * Analiza relaciones utilizando Vercel AI SDK
   * @param {string} text - Texto original
   * @param {Array} concepts - Conceptos a analizar
   * @param {string} language - Idioma del texto
   * @returns {Promise<Array>} - Array de relaciones
   * @private
   */
  async _analyzeWithAiSdk(text, concepts, language) {
    try {
      return await this.aiSdkService.analyzeRelationships(text, concepts, { language });
    } catch (error) {
      console.error('Error en AI SDK, utilizando fallback:', error);
      return this._fallbackAnalysis(text, concepts);
    }
  }
  
  /**
   * Método de análisis de fallback cuando otras APIs fallan
   * @param {string} text - Texto original
   * @param {Array} concepts - Conceptos a analizar
   * @returns {Promise<Array>} - Array de relaciones
   * @private
   */
  async _fallbackAnalysis(text, concepts) {
    // Implementación simplificada para crear relaciones básicas
    const relationships = [];
    const relationTypes = [
      'jerarquia', 'causa', 'efecto', 'parte', 
      'secuencia', 'caracteristica', 'ejemplo', 'dependencia'
    ];
    
    // Para conceptos principales (mayor importancia)
    const sortedConcepts = [...concepts].sort((a, b) => 
      (b.importance || 0.5) - (a.importance || 0.5)
    );
    
    const mainConcepts = sortedConcepts.slice(0, Math.min(3, sortedConcepts.length));
    const otherConcepts = sortedConcepts.slice(Math.min(3, sortedConcepts.length));
    
    // Crear relaciones desde conceptos principales hacia otros
    for (const mainConcept of mainConcepts) {
      const targetConcepts = otherConcepts.length > 0 ? otherConcepts : 
                            mainConcepts.filter(c => c.id !== mainConcept.id);
      
      // Crear 2-3 relaciones por concepto principal
      const relationCount = Math.min(
        targetConcepts.length,
        2 + Math.floor(Math.random() * 2)
      );
      
      for (let i = 0; i < relationCount; i++) {
        const targetConcept = targetConcepts[i];
        if (!targetConcept) continue;
        
        const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];
        
        relationships.push({
          id: `rel_${relationships.length + 1}`,
          source: mainConcept.id,
          target: targetConcept.id,
          type: relationType,
          label: this._getRelationLabel(relationType, mainConcept.name, targetConcept.name),
          weight: this._calculateWeight(relationType)
        });
      }
    }
    
    // Crear relaciones adicionales para conceptos que no tienen ninguna
    const connectedIds = new Set(
      relationships.flatMap(rel => [rel.source, rel.target])
    );
    
    const disconnectedConcepts = concepts.filter(c => !connectedIds.has(c.id));
    
    for (const concept of disconnectedConcepts) {
      if (concepts.length <= 1) continue;
      
      // Encontrar un concepto ya conectado
      const connectedConcept = concepts.find(c => 
        c.id !== concept.id && connectedIds.has(c.id)
      ) || concepts.find(c => c.id !== concept.id);
      
      if (connectedConcept) {
        const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];
        
        relationships.push({
          id: `rel_${relationships.length + 1}`,
          source: connectedConcept.id,
          target: concept.id,
          type: relationType,
          label: this._getRelationLabel(relationType, connectedConcept.name, concept.name),
          weight: this._calculateWeight(relationType)
        });
        
        // Añadir a conjunto de conectados
        connectedIds.add(concept.id);
      }
    }
    
    return relationships;
  }
  
  /**
   * Crea relaciones básicas entre conceptos
   * @param {Array} concepts - Conceptos a conectar
   * @returns {Array} - Array de relaciones básicas
   * @private
   */
  _createBasicRelationships(concepts) {
    const relationships = [];
    
    // Conectar secuencialmente para garantizar un mínimo de estructura
    for (let i = 0; i < concepts.length - 1; i++) {
      relationships.push({
        id: `rel_${i + 1}`,
        source: concepts[i].id,
        target: concepts[i + 1].id,
        type: 'relacionado',
        label: `${concepts[i].name} → ${concepts[i + 1].name}`,
        weight: 1
      });
    }
    
    // Conectar el último con el primero para cerrar el ciclo
    if (concepts.length > 2) {
      relationships.push({
        id: `rel_${concepts.length}`,
        source: concepts[concepts.length - 1].id,
        target: concepts[0].id,
        type: 'relacionado',
        label: `${concepts[concepts.length - 1].name} → ${concepts[0].name}`,
        weight: 1
      });
    }
    
    return relationships;
  }
  
  /**
   * Mejora las relaciones utilizando OpenAGI
   * @param {Array} relationships - Relaciones a mejorar
   * @param {Array} concepts - Conceptos analizados
   * @param {string} text - Texto original
   * @returns {Promise<Array>} - Relaciones mejoradas
   * @private
   */
  async _enhanceWithOpenAGI(relationships, concepts, text) {
    // En una implementación real, aquí se integraría con OpenAGI
    // Simulación del proceso
    
    // Mejorar las etiquetas de las relaciones con información contextual
    const enhancedRelationships = [...relationships];
    const conceptMap = new Map(concepts.map(c => [c.id, c]));
    
    for (const relation of enhancedRelationships) {
      const sourceConcept = conceptMap.get(relation.source);
      const targetConcept = conceptMap.get(relation.target);
      
      if (!sourceConcept || !targetConcept) continue;
      
      // Buscar evidencia textual para esta relación
      const evidence = this._findRelationshipEvidence(
        sourceConcept.name, 
        targetConcept.name, 
        relation.type,
        text
      );
      
      // Si se encontró evidencia, mejorar la etiqueta
      if (evidence) {
        relation.label = evidence.trim();
        relation.hasEvidence = true;
        relation.confidence = 0.8; // Mayor confianza por tener evidencia textual
      }
      
      // Añadir tipo de razonamiento basado en el tipo de relación
      relation.reasoningType = this._getReasoningType(relation.type);
    }
    
    // Añadir algunas relaciones transitivas
    const newRelationships = this._inferTransitiveRelations(enhancedRelationships, concepts);
    enhancedRelationships.push(...newRelationships);
    
    return enhancedRelationships;
  }
  
  /**
   * Infiere relaciones transitivas basadas en las existentes
   * @param {Array} relationships - Relaciones existentes
   * @param {Array} concepts - Conceptos analizados
   * @returns {Array} - Nuevas relaciones transitivas
   * @private
   */
  _inferTransitiveRelations(relationships, concepts) {
    const newRelations = [];
    const existingRelationPairs = new Set(
      relationships.map(rel => `${rel.source}-${rel.target}`)
    );
    
    // Revisar relaciones que pueden ser transitivas
    for (let i = 0; i < relationships.length; i++) {
      for (let j = 0; j < relationships.length; j++) {
        if (i === j) continue;
        
        const rel1 = relationships[i];
        const rel2 = relationships[j];
        
        // Verificar que el destino de rel1 es el origen de rel2
        if (rel1.target === rel2.source) {
          // Verificar que ya no existe una relación entre origen de rel1 y destino de rel2
          const newPair = `${rel1.source}-${rel2.target}`;
          
          if (!existingRelationPairs.has(newPair) && rel1.source !== rel2.target) {
            // Determinar tipo de relación transitiva
            let transitiveType = 'relacionado';
            let transitiveWeight = 1;
            
            // Si ambas son jerárquicas, la transitividad mantiene la jerarquía
            if (rel1.type === 'jerarquia' && rel2.type === 'jerarquia') {
              transitiveType = 'jerarquia';
              transitiveWeight = 4;
            }
            // Si ambas son causa-efecto, la transitividad es causa-efecto
            else if (rel1.type === 'causa' && rel2.type === 'efecto') {
              transitiveType = 'causa';
              transitiveWeight = 3;
            }
            
            // Encuentra los conceptos
            const sourceConcept = concepts.find(c => c.id === rel1.source);
            const targetConcept = concepts.find(c => c.id === rel2.target);
            
            if (sourceConcept && targetConcept) {
              // Crear relación transitiva
              newRelations.push({
                id: `rel_transitive_${newRelations.length + 1}`,
                source: rel1.source,
                target: rel2.target,
                type: transitiveType,
                label: this._getRelationLabel(transitiveType, sourceConcept.name, targetConcept.name),
                weight: transitiveWeight,
                isTransitive: true,
                reasoningType: 'transitive',
                confidence: 0.7 // Menor confianza por ser inferida
              });
              
              // Añadir a conjunto de pares existentes
              existingRelationPairs.add(newPair);
            }
          }
        }
      }
    }
    
    return newRelations;
  }
  
  /**
   * Mejora las relaciones y conceptos utilizando GraphRAG
   * @param {Array} relationships - Relaciones a mejorar
   * @param {Array} concepts - Conceptos analizados
   * @param {string} text - Texto original
   * @returns {Promise<Object>} - Objeto con relaciones y conceptos mejorados
   * @private
   */
  async _enhanceWithGraphRAG(relationships, concepts, text) {
    // Simulación de GraphRAG
    
    // Conceptos enriquecidos
    const enhancedConcepts = [...concepts];
    
    // Analizar la centralidad de cada concepto en el grafo
    const centralityMap = this._calculateConceptCentrality(relationships);
    
    // Actualizar importancia de conceptos basada en centralidad
    for (const concept of enhancedConcepts) {
      const centrality = centralityMap.get(concept.id) || 0;
      
      // Combinar importancia actual con centralidad
      const currentImportance = concept.importance || 0.5;
      concept.importance = (currentImportance * 0.7) + (centrality * 0.3);
      
      // Añadir información de centralidad
      concept.centrality = centrality;
    }
    
    // Relaciones enriquecidas
    const enhancedRelationships = [...relationships];
    
    // Añadir información adicional a las relaciones
    for (const relation of enhancedRelationships) {
      // Añadir indicador de bidireccionalidad si aplica
      const bidirectional = relationships.some(r => 
        r.source === relation.target && 
        r.target === relation.source
      );
      
      if (bidirectional) {
        relation.bidirectional = true;
      }
      
      // Añadir peso basado en la importancia de los conceptos
      const sourceConcept = enhancedConcepts.find(c => c.id === relation.source);
      const targetConcept = enhancedConcepts.find(c => c.id === relation.target);
      
      if (sourceConcept && targetConcept) {
        // Ajustar peso según la importancia de los conceptos conectados
        const importanceWeight = (sourceConcept.importance + targetConcept.importance) / 2;
        relation.weight = Math.max(1, Math.min(5, Math.round(relation.weight * 0.7 + importanceWeight * 10 * 0.3)));
      }
    }
    
    return {
      concepts: enhancedConcepts,
      relationships: enhancedRelationships
    };
  }
  
  /**
   * Calcula la centralidad de cada concepto en el grafo de relaciones
   * @param {Array} relationships - Relaciones entre conceptos
   * @returns {Map} - Mapa de id de concepto a valor de centralidad
   * @private
   */
  _calculateConceptCentrality(relationships) {
    const centralityMap = new Map();
    const conceptConnections = new Map();
    
    // Contar conexiones para cada concepto
    for (const relation of relationships) {
      // Contar conexiones de salida
      if (!conceptConnections.has(relation.source)) {
        conceptConnections.set(relation.source, { out: 0, in: 0, total: 0 });
      }
      conceptConnections.get(relation.source).out++;
      conceptConnections.get(relation.source).total++;
      
      // Contar conexiones de entrada
      if (!conceptConnections.has(relation.target)) {
        conceptConnections.set(relation.target, { out: 0, in: 0, total: 0 });
      }
      conceptConnections.get(relation.target).in++;
      conceptConnections.get(relation.target).total++;
    }
    
    // Calcular centralidad basada en conexiones
    // Fórmula simplificada: (total_connections + out_connections * 0.7 + in_connections * 0.3) / total_relationships
    const totalRelationships = relationships.length * 2; // Multiplicado por 2 para normalizar
    
    for (const [conceptId, connections] of conceptConnections.entries()) {
      const centrality = (
        connections.total + 
        connections.out * 0.7 + 
        connections.in * 0.3
      ) / totalRelationships;
      
      centralityMap.set(conceptId, Math.min(1, centrality));
    }
    
    return centralityMap;
  }
  
  /**
   * Calcula métricas semánticas sobre las relaciones
   * @param {Array} relationships - Relaciones analizadas
   * @param {Array} concepts - Conceptos analizados
   * @returns {Object} - Métricas semánticas
   * @private
   */
  _calculateSemanticMetrics(relationships, concepts) {
    // Calcular diversidad de tipos de relaciones
    const relationTypes = new Set(relationships.map(r => r.type));
    const typesDiversity = relationTypes.size / Math.min(8, relationships.length);
    
    // Calcular densidad del grafo (real vs. teórica)
    const totalPossibleRelations = concepts.length * (concepts.length - 1);
    const densidad = totalPossibleRelations > 0 ? 
                    relationships.length / totalPossibleRelations : 0;
    
    // Contar relaciones por tipo
    const typeCounts = {};
    for (const relation of relationships) {
      typeCounts[relation.type] = (typeCounts[relation.type] || 0) + 1;
    }
    
    // Detectar conceptos centrales (con más conexiones)
    const conceptConnections = new Map();
    for (const relation of relationships) {
      conceptConnections.set(
        relation.source, 
        (conceptConnections.get(relation.source) || 0) + 1
      );
      conceptConnections.set(
        relation.target, 
        (conceptConnections.get(relation.target) || 0) + 1
      );
    }
    
    // Ordenar conceptos por número de conexiones
    const centralitySorted = [...conceptConnections.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3
      .map(entry => {
        const concept = concepts.find(c => c.id === entry[0]) || { id: entry[0] };
        return {
          id: concept.id,
          name: concept.name,
          connections: entry[1]
        };
      });
    
    return {
      relationshipTypes: {
        diversity: typesDiversity,
        count: typeCounts
      },
      density: densidad,
      centralConcepts: centralitySorted
    };
  }
  
  /**
   * Encuentra evidencia textual de una relación en el texto
   * @param {string} sourceName - Nombre del concepto origen
   * @param {string} targetName - Nombre del concepto destino
   * @param {string} relationType - Tipo de relación
   * @param {string} text - Texto original
   * @returns {string|null} - Evidencia textual o null si no se encuentra
   * @private
   */
  _findRelationshipEvidence(sourceName, targetName, relationType, text) {
    // Buscar oraciones que contienen ambos conceptos
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (lowerSentence.includes(sourceName.toLowerCase()) && 
          lowerSentence.includes(targetName.toLowerCase())) {
        return sentence;
      }
    }
    
    // Buscar palabras clave relacionadas con el tipo de relación
    const relationKeywords = this._getRelationKeywords(relationType);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Verificar si contiene al menos un concepto y una palabra clave
      if ((lowerSentence.includes(sourceName.toLowerCase()) || 
           lowerSentence.includes(targetName.toLowerCase())) &&
          relationKeywords.some(keyword => lowerSentence.includes(keyword))) {
        return sentence;
      }
    }
    
    return null;
  }
  
  /**
   * Obtiene palabras clave relacionadas con un tipo de relación
   * @param {string} relationType - Tipo de relación
   * @returns {Array<string>} - Palabras clave
   * @private
   */
  _getRelationKeywords(relationType) {
    const keywordMap = {
      'jerarquia': ['incluye', 'contiene', 'abarca', 'engloba', 'comprende', 'tipo de', 'clase de'],
      'causa': ['causa', 'provoca', 'produce', 'genera', 'lleva a', 'induce', 'origina'],
      'efecto': ['resulta', 'deriva', 'consecuencia', 'efecto', 'resultado', 'producto de'],
      'parte': ['parte', 'componente', 'elemento', 'constituye', 'integra', 'forma parte'],
      'secuencia': ['sigue', 'precede', 'anterior', 'posterior', 'secuencia', 'después', 'antes'],
      'caracteristica': ['caracteriza', 'atributo', 'propiedad', 'rasgo', 'cualidad', 'característico'],
      'ejemplo': ['ejemplo', 'instancia', 'caso', 'ilustra', 'demuestra', 'muestra'],
      'dependencia': ['depende', 'requiere', 'necesita', 'condiciona', 'determina']
    };
    
    return keywordMap[relationType] || [];
  }
  
  /**
   * Determina el tipo de razonamiento basado en el tipo de relación
   * @param {string} relationType - Tipo de relación
   * @returns {string} - Tipo de razonamiento
   * @private
   */
  _getReasoningType(relationType) {
    const reasoningTypeMap = {
      'jerarquia': 'categorical',
      'causa': 'causal',
      'efecto': 'causal',
      'parte': 'compositional',
      'secuencia': 'temporal',
      'caracteristica': 'descriptive',
      'ejemplo': 'inductive',
      'dependencia': 'conditional'
    };
    
    return reasoningTypeMap[relationType] || 'associative';
  }
  
  /**
   * Genera una etiqueta descriptiva para una relación
   * @param {string} relationType - Tipo de relación
   * @param {string} sourceName - Nombre del concepto origen
   * @param {string} targetName - Nombre del concepto destino
   * @returns {string} - Etiqueta descriptiva
   * @private
   */
  _getRelationLabel(relationType, sourceName, targetName) {
    const templates = {
      'jerarquia': `${sourceName} incluye a ${targetName}`,
      'causa': `${sourceName} causa ${targetName}`,
      'efecto': `${sourceName} produce ${targetName}`,
      'parte': `${targetName} es parte de ${sourceName}`,
      'secuencia': `${sourceName} precede a ${targetName}`,
      'caracteristica': `${targetName} es característica de ${sourceName}`,
      'ejemplo': `${targetName} es un ejemplo de ${sourceName}`,
      'dependencia': `${targetName} depende de ${sourceName}`,
      'relacionado': `${sourceName} se relaciona con ${targetName}`
    };
    
    return templates[relationType] || `${sourceName} → ${targetName}`;
  }
  
  /**
   * Calcula el peso de una relación basado en su tipo
   * @param {string} relationType - Tipo de relación
   * @returns {number} - Peso (1-5)
   * @private
   */
  _calculateWeight(relationType) {
    const weights = {
      'jerarquia': 5,
      'causa': 4,
      'efecto': 4,
      'parte': 4,
      'secuencia': 3,
      'caracteristica': 3,
      'ejemplo': 2,
      'dependencia': 4,
      'relacionado': 1
    };
    
    return weights[relationType] || 1;
  }
}

module.exports = ReasoningModule; 