/**
 * aiSdkService.js
 * Servicio para integrar Vercel AI SDK en el procesamiento de mapas conceptuales
 */

const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
require('dotenv').config();

// Asegurar que la clave API está disponible
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-your-openai-key';
const MODEL = 'gpt-4o'; // Modelo recomendado para análisis semántico

class AiSdkService {
  /**
   * Analiza un texto y extrae conceptos clave con sus relaciones
   * @param {string} text - Texto para analizar
   * @param {Object} options - Opciones de procesamiento
   * @returns {Promise<Object>} - Objeto con conceptos y relaciones
   */
  async analyzeText(text, options = {}) {
    try {
      console.log(`Analizando texto de ${text.length} caracteres con Vercel AI SDK`);
      
      // Validar entrada
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Texto inválido para análisis');
      }

      // Preparar opciones
      const maxConcepts = options.maxConcepts || 25;
      const language = options.language || 'es';
      
      // 1. Extraer conceptos clave
      const concepts = await this.extractConcepts(text, { maxConcepts, language });
      
      // 2. Analizar relaciones entre conceptos
      const relationships = await this.analyzeRelationships(text, concepts, { language });
      
      // 3. Enriquecer con definiciones si se solicita
      if (options.includeDefinitions) {
        await this.enrichWithDefinitions(concepts, { language });
      }
      
      return {
        concepts,
        relationships,
        metadata: {
          processedAt: new Date().toISOString(),
          aiSdkVersion: '1.0.0',
          model: MODEL,
          language
        }
      };
      
    } catch (error) {
      console.error('Error en análisis con AI SDK:', error);
      // Retornar resultado mínimo en caso de error
      return {
        concepts: [],
        relationships: [],
        metadata: {
          error: error.message,
          processedAt: new Date().toISOString()
        }
      };
    }
  }
  
  /**
   * Extrae conceptos clave del texto utilizando Vercel AI SDK
   * @param {string} text - Texto para analizar
   * @param {Object} options - Opciones de extracción
   * @returns {Promise<Array>} - Array de conceptos
   */
  async extractConcepts(text, options = {}) {
    try {
      const maxConcepts = options.maxConcepts || 25;
      const language = options.language || 'es';
      
      // Determinar instrucciones según el idioma
      const instructions = language === 'es' 
        ? `Analiza el siguiente texto y extrae hasta ${maxConcepts} conceptos clave. Para cada concepto, proporciona:
           1. Nombre del concepto
           2. Descripción breve (1-2 oraciones)
           3. Nivel de importancia (0.0-1.0)`
        : `Analyze the following text and extract up to ${maxConcepts} key concepts. For each concept, provide:
           1. Concept name
           2. Brief description (1-2 sentences)
           3. Importance level (0.0-1.0)`;
      
      // Usar Vercel AI SDK para generar texto
      const { text: generatedText } = await generateText({
        model: openai(MODEL),
        system: instructions,
        prompt: text,
        temperature: 0.2,
        max_tokens: 2000,
      });
      
      // Procesar la respuesta
      try {
        // Transformar texto a formato JSON
        const conceptsText = generatedText.trim();
        // Extraer la parte JSON si está envuelta en ``` o texto adicional
        const jsonMatch = conceptsText.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                         conceptsText.match(/```\s*(\{[\s\S]*?\})\s*```/) ||
                         conceptsText.match(/(\[[\s\S]*?\])/);
                         
        let parsedData;
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Intentar parsear directamente si no se encuentra formato específico
          parsedData = JSON.parse(conceptsText);
        }
        
        // Normalizar la estructura según lo que devuelva el modelo
        let conceptsArray = [];
        
        if (Array.isArray(parsedData)) {
          conceptsArray = parsedData;
        } else if (parsedData.concepts && Array.isArray(parsedData.concepts)) {
          conceptsArray = parsedData.concepts;
        }
        
        // Formatear conceptos según el formato esperado por el sistema
        return conceptsArray.map((concept, index) => ({
          id: `concept_${index + 1}`,
          name: concept.name || concept.concept || '',
          description: concept.description || concept.definition || '',
          importance: parseFloat(concept.importance || concept.relevance || 0.5),
          level: this._calculateLevel(parseFloat(concept.importance || concept.relevance || 0.5))
        }));
      } catch (parseError) {
        console.error('Error al parsear conceptos:', parseError);
        
        // Fallback: análisis simple basado en líneas si el JSON falla
        return this._fallbackConceptExtraction(generatedText, maxConcepts);
      }
    } catch (error) {
      console.error('Error en extracción de conceptos:', error);
      return [];
    }
  }
  
  /**
   * Analiza las relaciones entre conceptos utilizando Vercel AI SDK
   * @param {string} text - Texto original
   * @param {Array} concepts - Conceptos extraídos
   * @param {Object} options - Opciones de análisis
   * @returns {Promise<Array>} - Array de relaciones
   */
  async analyzeRelationships(text, concepts, options = {}) {
    try {
      if (!concepts || !Array.isArray(concepts) || concepts.length < 2) {
        return [];
      }
      
      const language = options.language || 'es';
      
      // Extraer nombres de conceptos para el prompt
      const conceptNames = concepts.map(c => c.name).join(', ');
      
      // Determinar instrucciones según el idioma
      const instructions = language === 'es'
        ? `Analiza las relaciones entre los siguientes conceptos basándote en el texto proporcionado.
           Para cada relación, incluye:
           1. El concepto de origen
           2. El concepto de destino
           3. El tipo de relación (jerarquía, causa, efecto, parte, secuencia, característica, ejemplo, dependencia)
           4. Una descripción breve de la relación`
        : `Analyze the relationships between the following concepts based on the provided text.
           For each relationship, include:
           1. Source concept
           2. Target concept
           3. Relationship type (hierarchy, cause, effect, part, sequence, characteristic, example, dependency)
           4. A brief description of the relationship`;
      
      // Usar Vercel AI SDK para generar análisis de relaciones
      const { text: relationshipText } = await generateText({
        model: openai(MODEL),
        system: instructions,
        prompt: `Texto: "${text ? text.substring(0, 4000) : ''}"\n\nConceptos: ${conceptNames}`,
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      // Procesar la respuesta
      try {
        // Intentar extraer JSON de la respuesta
        const jsonMatch = relationshipText.match(/```json\s*([\s\S]*?)\s*```/) || 
                          relationshipText.match(/```\s*([\s\S]*?)\s*```/) ||
                          relationshipText.match(/(\[[\s\S]*?\])/) ||
                          relationshipText.match(/(\{[\s\S]*?\})/);
        
        let parsedData;
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          parsedData = JSON.parse(relationshipText);
        }
        
        // Normalizar la estructura según lo que devuelva el modelo
        let relationshipsArray = [];
        
        if (Array.isArray(parsedData)) {
          relationshipsArray = parsedData;
        } else if (parsedData.relationships && Array.isArray(parsedData.relationships)) {
          relationshipsArray = parsedData.relationships;
        } else if (parsedData.relations && Array.isArray(parsedData.relations)) {
          relationshipsArray = parsedData.relations;
        } else if (parsedData.relaciones && Array.isArray(parsedData.relaciones)) {
          relationshipsArray = parsedData.relaciones;
        }
        
        // Formatear relaciones según el formato esperado por el sistema
        return relationshipsArray.map((rel, index) => {
          const sourceNode = concepts.find(c => c.name.toLowerCase() === (rel.source || rel.origen || rel.from || '').toLowerCase());
          const targetNode = concepts.find(c => c.name.toLowerCase() === (rel.target || rel.destino || rel.to || '').toLowerCase());
          
          if (sourceNode && targetNode) {
            return {
              id: `rel_${index + 1}`,
              source: sourceNode.id,
              target: targetNode.id,
              type: rel.type || rel.tipo || 'related',
              label: rel.label || rel.description || rel.descripcion || `${sourceNode.name} → ${targetNode.name}`,
              weight: this._calculateWeight(rel.type || rel.tipo || 'related')
            };
          }
          return null;
        }).filter(Boolean); // Eliminar nulls
      } catch (parseError) {
        console.error('Error al parsear relaciones:', parseError);
        return this._fallbackRelationshipAnalysis(concepts);
      }
    } catch (error) {
      console.error('Error en análisis de relaciones:', error);
      return [];
    }
  }
  
  /**
   * Enriquece los conceptos con definiciones utilizando Vercel AI SDK
   * @param {Array} concepts - Conceptos a enriquecer
   * @param {Object} options - Opciones de enriquecimiento
   * @returns {Promise<void>}
   */
  async enrichWithDefinitions(concepts, options = {}) {
    try {
      if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
        return;
      }
      
      const language = options.language || 'es';
      const batchSize = 5; // Procesar conceptos en lotes para evitar tokens excesivos
      
      // Procesar en lotes
      for (let i = 0; i < concepts.length; i += batchSize) {
        const batch = concepts.slice(i, i + batchSize);
        const conceptNames = batch.map(c => c.name).join(', ');
        
        // Determinar instrucciones según el idioma
        const instructions = language === 'es'
          ? `Proporciona definiciones educativas precisas para los siguientes conceptos. 
             Para cada concepto, incluye:
             1. Definición formal (2-3 oraciones)
             2. Un ejemplo ilustrativo cuando sea posible`
          : `Provide precise educational definitions for the following concepts.
             For each concept, include:
             1. Formal definition (2-3 sentences)
             2. An illustrative example when possible`;
        
        // Usar Vercel AI SDK para generar definiciones
        const { text: definitionText } = await generateText({
          model: openai(MODEL),
          system: instructions,
          prompt: `Conceptos: ${conceptNames}`,
          temperature: 0.3,
          max_tokens: 1500,
        });
        
        // Procesar y asignar definiciones
        this._processDefinitions(definitionText, batch);
      }
    } catch (error) {
      console.error('Error en enriquecimiento con definiciones:', error);
    }
  }
  
  /**
   * Procesa el texto generado para extraer definiciones
   * @param {string} definitionText - Texto con definiciones
   * @param {Array} concepts - Conceptos a actualizar
   * @private
   */
  _processDefinitions(definitionText, concepts) {
    try {
      // Intentar primero extraer como JSON
      const jsonMatch = definitionText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        definitionText.match(/```\s*([\s\S]*?)\s*```/) ||
                        definitionText.match(/(\{[\s\S]*?\})/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          
          // Normalizar la estructura según lo que devuelva el modelo
          let definitionsObj = {};
          
          if (parsedData.definitions) {
            definitionsObj = parsedData.definitions;
          } else if (Array.isArray(parsedData)) {
            parsedData.forEach(item => {
              if (item.concept && item.definition) {
                definitionsObj[item.concept] = item.definition;
              }
            });
          } else {
            // Considerar la posibilidad de que las claves sean los nombres de los conceptos
            definitionsObj = parsedData;
          }
          
          // Asignar definiciones a conceptos
          for (const concept of concepts) {
            if (definitionsObj[concept.name]) {
              concept.definition = definitionsObj[concept.name];
            }
          }
          
          return;
        } catch (parseError) {
          console.warn('Error al parsear JSON de definiciones, usando extracción basada en texto');
        }
      }
      
      // Fallback: Extraer definiciones basadas en texto cuando el parsing JSON falla
      for (const concept of concepts) {
        const conceptRegex = new RegExp(`(?:\\*\\*|#)\\s*${concept.name}\\s*(?:\\*\\*|#)\\s*:?([\\s\\S]*?)(?=\\*\\*|#|$)`, 'i');
        const match = definitionText.match(conceptRegex);
        
        if (match && match[1]) {
          concept.definition = match[1].trim();
        }
      }
    } catch (error) {
      console.error('Error al procesar definiciones:', error);
    }
  }
  
  /**
   * Extracción de conceptos de fallback cuando el parsing JSON falla
   * @param {string} text - Texto generado por el modelo
   * @param {number} maxConcepts - Número máximo de conceptos a extraer
   * @returns {Array} - Array de conceptos
   * @private
   */
  _fallbackConceptExtraction(text, maxConcepts) {
    try {
      // Buscar patrones comunes para conceptos
      const conceptRegex = /(?:\d+\.\s+|\*\s+|-)?\s*(?:Concepto|Concept)?:\s*([^\n]+)(?:\n|$)(?:.*?(?:Descripción|Description):\s*([^\n]+))?(?:\n|$)(?:.*?(?:Importancia|Importance|Relevance):\s*([0-9.]+))?/gi;
      
      const concepts = [];
      let match;
      
      while ((match = conceptRegex.exec(text)) !== null && concepts.length < maxConcepts) {
        concepts.push({
          id: `concept_${concepts.length + 1}`,
          name: match[1]?.trim() || '',
          description: match[2]?.trim() || '',
          importance: parseFloat(match[3] || 0.5),
          level: this._calculateLevel(parseFloat(match[3] || 0.5))
        });
      }
      
      // Si no se encontraron conceptos con el regex, usar enfoque por líneas
      if (concepts.length === 0) {
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        for (let i = 0; i < lines.length && concepts.length < maxConcepts; i++) {
          const line = lines[i].trim();
          // Ignorar líneas que parecen ser cabeceras o metadatos
          if (line.length > 3 && !line.startsWith('```') && !line.startsWith('#')) {
            concepts.push({
              id: `concept_${concepts.length + 1}`,
              name: line.replace(/^\d+\.\s*/, '').split(':')[0].trim(),
              description: line.includes(':') ? line.split(':')[1].trim() : '',
              importance: 0.5,
              level: 'medium'
            });
          }
        }
      }
      
      return concepts;
    } catch (error) {
      console.error('Error en extracción de fallback:', error);
      return [];
    }
  }
  
  /**
   * Análisis de relaciones de fallback cuando el parsing JSON falla
   * @param {Array} concepts - Conceptos para los que crear relaciones
   * @returns {Array} - Array de relaciones
   * @private
   */
  _fallbackRelationshipAnalysis(concepts) {
    try {
      if (!concepts || concepts.length < 2) return [];
      
      const relationships = [];
      const relationTypes = ['jerarquia', 'parte', 'caracteristica', 'ejemplo', 'relacionado'];
      
      // Crear relaciones básicas entre conceptos
      // Para simplificar, conectamos cada concepto con el siguiente
      for (let i = 0; i < concepts.length - 1; i++) {
        const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];
        
        relationships.push({
          id: `rel_${relationships.length + 1}`,
          source: concepts[i].id,
          target: concepts[i + 1].id,
          type: relationType,
          label: this._getRelationLabel(relationType, concepts[i].name, concepts[i + 1].name),
          weight: this._calculateWeight(relationType)
        });
      }
      
      // Añadir algunas relaciones adicionales para mapas más interconectados
      if (concepts.length > 3) {
        // Conectar el primer y último concepto
        const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)];
        relationships.push({
          id: `rel_${relationships.length + 1}`,
          source: concepts[0].id,
          target: concepts[concepts.length - 1].id,
          type: relationType,
          label: this._getRelationLabel(relationType, concepts[0].name, concepts[concepts.length - 1].name),
          weight: this._calculateWeight(relationType)
        });
        
        // Conectar concepto medio con otro
        const midIndex = Math.floor(concepts.length / 2);
        const targetIndex = midIndex > 1 ? 0 : concepts.length - 1;
        const relationType2 = relationTypes[Math.floor(Math.random() * relationTypes.length)];
        
        relationships.push({
          id: `rel_${relationships.length + 1}`,
          source: concepts[midIndex].id,
          target: concepts[targetIndex].id,
          type: relationType2,
          label: this._getRelationLabel(relationType2, concepts[midIndex].name, concepts[targetIndex].name),
          weight: this._calculateWeight(relationType2)
        });
      }
      
      return relationships;
    } catch (error) {
      console.error('Error en análisis de relaciones de fallback:', error);
      return [];
    }
  }
  
  /**
   * Calcula el nivel de importancia de un concepto
   * @param {number} importance - Valor de importancia (0-1)
   * @returns {string} - Nivel (high, medium, low)
   * @private
   */
  _calculateLevel(importance) {
    if (importance >= 0.7) return 'high';
    if (importance >= 0.4) return 'medium';
    return 'low';
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
      'hierarchy': 5,
      'parte': 4,
      'part': 4,
      'causa': 4,
      'cause': 4,
      'efecto': 4,
      'effect': 4,
      'caracteristica': 3,
      'characteristic': 3,
      'ejemplo': 2,
      'example': 2,
      'relacionado': 1,
      'related': 1
    };
    
    return weights[relationType.toLowerCase()] || 1;
  }
  
  /**
   * Genera etiqueta descriptiva para una relación
   * @param {string} relationType - Tipo de relación
   * @param {string} sourceName - Nombre del concepto origen
   * @param {string} targetName - Nombre del concepto destino
   * @returns {string} - Etiqueta descriptiva
   * @private
   */
  _getRelationLabel(relationType, sourceName, targetName) {
    const templates = {
      'jerarquia': `${sourceName} incluye a ${targetName}`,
      'hierarchy': `${sourceName} includes ${targetName}`,
      'parte': `${targetName} es parte de ${sourceName}`,
      'part': `${targetName} is part of ${sourceName}`,
      'causa': `${sourceName} causa ${targetName}`,
      'cause': `${sourceName} causes ${targetName}`,
      'efecto': `${sourceName} produce ${targetName}`,
      'effect': `${sourceName} produces ${targetName}`,
      'caracteristica': `${targetName} es característica de ${sourceName}`,
      'characteristic': `${targetName} is a characteristic of ${sourceName}`,
      'ejemplo': `${targetName} es un ejemplo de ${sourceName}`,
      'example': `${targetName} is an example of ${sourceName}`,
      'relacionado': `${sourceName} se relaciona con ${targetName}`,
      'related': `${sourceName} relates to ${targetName}`
    };
    
    return templates[relationType.toLowerCase()] || `${sourceName} → ${targetName}`;
  }
}

module.exports = new AiSdkService(); 