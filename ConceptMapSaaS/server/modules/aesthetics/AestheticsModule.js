/**
 * AestheticsModule.js
 * Implementación del módulo para la etapa 5: Estética Adaptativa/UX Visual
 */

const BaseModule = require('../BaseModule');
const path = require('path');

/**
 * Módulo de Estética Adaptativa / UX Visual (Etapa 5)
 * Responsable de preparar la visualización adaptativa del mapa conceptual
 * Utiliza herramientas como Markmap, Shiki Twoslash, Open Props, Lottie, y Tippy.js
 */
class AestheticsModule extends BaseModule {
  /**
   * Constructor del módulo de estética
   * @param {Object} config - Configuración del módulo
   */
  constructor(config = {}) {
    super('aesthetics', 'Estética Adaptativa / UX Visual', config);
    
    // Cargar servicios necesarios para la estética
    try {
      // Intentar cargar servicios relevantes
      this.conceptMapService = require(path.join(process.cwd(), 'server/services/fixed-conceptMapService'));
    } catch (error) {
      console.warn(`Advertencia en AestheticsModule: No se pudieron cargar algunos servicios: ${error.message}`);
    }
    
    // Configuraciones por defecto para la visualización
    this.defaultTheme = config.theme || 'adaptive';
    this.defaultColorScheme = config.colorScheme || 'automatic';
    this.animationsEnabled = config.animationsEnabled !== false;
    this.interactiveFeatures = config.interactiveFeatures !== false;
    this.supportedViewModes = ['hierarchical', 'network', 'mindmap', 'radial'];
    this.defaultViewMode = config.viewMode || 'hierarchical';
  }
  
  /**
   * Validación específica para este módulo
   * @param {Object} input - Datos de entrada
   */
  validateInput(input) {
    super.validateInput(input);
    
    if (!input.concepts || !Array.isArray(input.concepts) || input.concepts.length === 0) {
      throw new Error('Se requieren conceptos para aplicar estética');
    }
    
    if (!input.relationships || !Array.isArray(input.relationships)) {
      throw new Error('Se requieren relaciones para aplicar estética');
    }
  }
  
  /**
   * Implementación del procesamiento para la etapa de estética
   * @param {Object} input - Datos de entrada
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async _processImplementation(input, context) {
    console.log('ETAPA 5: Estética Adaptativa / UX Visual');
    
    const startTime = Date.now();
    const concepts = [...input.concepts];
    const relationships = [...input.relationships];
    const language = input.original?.language || 'es';
    
    // Preferencias visuales (podrían venir de la petición o usar valores predeterminados)
    const visualPreferences = input.visualPreferences || {
      theme: this.defaultTheme,
      colorScheme: this.defaultColorScheme,
      viewMode: this.defaultViewMode,
      animations: this.animationsEnabled,
      interactive: this.interactiveFeatures
    };
    
    try {
      // 1. Aplicar temas visuales usando Open Props (simulado)
      await this._applyTheme(concepts, relationships, visualPreferences);
      console.log(`Tema visual aplicado: ${visualPreferences.theme}`);
      
      // 2. Preparar formato para Markmap (simulado)
      const markmapData = await this._prepareMarkmap(concepts, relationships, visualPreferences);
      console.log('Datos para Markmap preparados');
      
      // 3. Generar resaltado de código con Shiki Twoslash (simulado)
      await this._applySyntaxHighlighting(concepts, language);
      console.log('Resaltado de sintaxis aplicado');
      
      // 4. Configurar animaciones con Lottie (simulado)
      const animationConfigs = await this._configureAnimations(concepts, relationships, visualPreferences);
      console.log('Animaciones configuradas');
      
      // 5. Configurar tooltips interactivos con Tippy.js (simulado)
      const tooltipConfigs = await this._configureTooltips(concepts, relationships, language);
      console.log('Tooltips interactivos configurados');
      
      // Actualizar los datos con información estética
      input.concepts = concepts;
      input.relationships = relationships;
      
      // Agregar configuraciones visuales al resultado
      input.visualization = {
        markmapData,
        visualPreferences,
        animationConfigs,
        tooltipConfigs
      };
      
      // Agregar metadatos sobre la adaptación estética
      input.metadata = input.metadata || {};
      input.metadata.aesthetics = {
        stage: 'aesthetics',
        theme: visualPreferences.theme,
        viewMode: visualPreferences.viewMode,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      return input;
    } catch (error) {
      console.error(`Error en la adaptación estética: ${error.message}`);
      // Agregar información sobre el error a los metadatos
      input.metadata = input.metadata || {};
      input.metadata.aesthetics = {
        stage: 'aesthetics',
        error: error.message,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      };
      
      // Devolver los datos originales sin cambios
      return input;
    }
  }
  
  /**
   * Aplicar tema visual a los conceptos y relaciones
   * @private
   */
  async _applyTheme(concepts, relationships, visualPreferences) {
    console.log('Aplicando tema visual con Open Props');
    
    const theme = visualPreferences.theme;
    const colorScheme = visualPreferences.colorScheme;
    
    // Definir paletas de colores según el tema
    const colorPalettes = {
      adaptive: {
        primary: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'],
        secondary: ['#4cc9f0', '#4895ef', '#560bad', '#b5179e'],
        neutral: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd']
      },
      classic: {
        primary: ['#003049', '#d62828', '#f77f00', '#fcbf49'],
        secondary: ['#eae2b7', '#94d2bd', '#0a9396', '#005f73'],
        neutral: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd']
      },
      modern: {
        primary: ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c'],
        secondary: ['#d90429', '#588157', '#3a5a40', '#344e41'],
        neutral: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd']
      }
    };
    
    // Seleccionar paleta según el tema, con fallback a adaptive
    const palette = colorPalettes[theme] || colorPalettes.adaptive;
    
    // Asignar colores a los conceptos según su importancia y jerarquía
    for (const concept of concepts) {
      const importance = concept.importance || 0.5;
      const hierarchyLevel = concept.hierarchyLevel || 0;
      
      // Asignar colores según la importancia y nivel jerárquico
      const colorIndex = Math.min(hierarchyLevel, palette.primary.length - 1);
      const primaryColor = palette.primary[colorIndex];
      const secondaryColor = palette.secondary[colorIndex];
      
      // Calcular tamaño según importancia (entre 1 y 2.5)
      const size = 1 + (importance * 1.5);
      
      // Asignar propiedades visuales
      concept.visualProperties = {
        primaryColor,
        secondaryColor,
        size,
        borderWidth: hierarchyLevel === 0 ? 3 : Math.max(1, 3 - hierarchyLevel * 0.5),
        fontWeight: hierarchyLevel === 0 ? 'bold' : 'normal',
        opacity: 0.7 + (importance * 0.3), // Entre 0.7 y 1.0 según importancia
        shape: this._getConceptShape(concept, hierarchyLevel)
      };
    }
    
    // Asignar estilos a las relaciones
    for (const relationship of relationships) {
      const sourceIdx = concepts.findIndex(c => c.id === relationship.source);
      const targetIdx = concepts.findIndex(c => c.id === relationship.target);
      
      // Obtener propiedades visuales de los conceptos conectados (si existen)
      const sourceColor = sourceIdx >= 0 ? concepts[sourceIdx].visualProperties?.primaryColor : palette.neutral[0];
      const targetColor = targetIdx >= 0 ? concepts[targetIdx].visualProperties?.primaryColor : palette.neutral[0];
      
      // Calcular color de línea (combinación de source y target)
      const lineColor = this._blendColors(sourceColor, targetColor, 0.5);
      
      // Asignar propiedades visuales a la relación
      relationship.visualProperties = {
        lineColor,
        lineWidth: 1 + (relationship.strength || 0.5),
        lineStyle: this._getRelationshipLineStyle(relationship.type),
        lineOpacity: 0.7 + (relationship.strength || 0) * 0.3,
        animated: this._shouldAnimateRelationship(relationship, visualPreferences)
      };
    }
  }
  
  /**
   * Prepara los datos para visualización con Markmap
   * @private
   */
  async _prepareMarkmap(concepts, relationships, preferences) {
    console.log('Preparando datos para Markmap');
    
    // Determinar el modo de visualización
    const viewMode = this.supportedViewModes.includes(preferences.viewMode) 
      ? preferences.viewMode 
      : this.defaultViewMode;
    
    // Crear estructura de datos para Markmap
    const markmapData = {
      viewMode,
      rendered: false,
      root: this._buildHierarchicalData(concepts, relationships)
    };
    
    // Agregar configuraciones según el modo de visualización
    switch (viewMode) {
      case 'hierarchical':
        markmapData.config = {
          duration: 400,
          autoFit: true,
          maxWidth: 500,
          paddingX: 20,
          lineHeight: 1.5
        };
        break;
      case 'network':
        markmapData.config = {
          linkShape: 'diagonal',
          spacingVertical: 100,
          paddingX: 40,
          autoFit: true
        };
        break;
      case 'mindmap':
        markmapData.config = {
          initialExpandLevel: 2,
          linkShape: 'curved',
          color: 'category10',
          paddingX: 20
        };
        break;
      case 'radial':
        markmapData.config = {
          linkShape: 'bracket',
          spacingVertical: 5,
          spacingHorizontal: 120,
          centerNode: true
        };
        break;
    }
    
    return markmapData;
  }
  
  /**
   * Aplica resaltado de sintaxis a los conceptos con código
   * @private
   */
  async _applySyntaxHighlighting(concepts, language) {
    console.log('Aplicando resaltado de sintaxis con Shiki Twoslash');
    
    // Encontrar conceptos que contienen código
    const conceptsWithCode = concepts.filter(concept => 
      concept.examples && concept.examples.some(ex => ex.isCode)
    );
    
    // Aplicar resaltado (simulado)
    for (const concept of conceptsWithCode) {
      if (concept.examples) {
        for (const example of concept.examples) {
          if (example.isCode) {
            // Simular resaltado de sintaxis
            example.highlightedCode = {
              html: `<pre class="shiki-twoslash"><code>${example.content}</code></pre>`,
              language: example.language || language,
              theme: 'github-dark'
            };
          }
        }
      }
    }
  }
  
  /**
   * Configura animaciones para los elementos del mapa conceptual
   * @private
   */
  async _configureAnimations(concepts, relationships, preferences) {
    console.log('Configurando animaciones con Lottie');
    
    // Solo configurar animaciones si están habilitadas
    if (!preferences.animations) {
      return { enabled: false };
    }
    
    // Configuraciones para animaciones
    const animations = {
      enabled: true,
      conceptExpand: {
        name: 'expandConcept',
        duration: 300,
        easing: 'easeOutQuart'
      },
      relationshipHighlight: {
        name: 'highlightRelation',
        duration: 500,
        easing: 'easeInOutCubic'
      },
      conceptFocus: {
        name: 'focusConcept',
        duration: 400,
        easing: 'easeOutBack'
      },
      pathTraversal: {
        name: 'traversePath',
        duration: 800,
        easing: 'linear'
      }
    };
    
    // Asignar animaciones específicas a conceptos principales
    for (const concept of concepts) {
      if (concept.importance > 0.7 || concept.hierarchyLevel === 0) {
        concept.animation = {
          type: 'conceptFocus',
          custom: {
            scale: 1.05,
            glowIntensity: 0.8
          }
        };
      }
    }
    
    // Asignar animaciones a relaciones clave
    for (const relationship of relationships) {
      if (relationship.strength > 0.8 || relationship.isKey) {
        relationship.animation = {
          type: 'relationshipHighlight',
          custom: {
            pulseIntensity: 0.7,
            pulseSpeed: 1.2
          }
        };
      }
    }
    
    return animations;
  }
  
  /**
   * Configura tooltips interactivos para conceptos y relaciones
   * @private
   */
  async _configureTooltips(concepts, relationships, language) {
    console.log('Configurando tooltips interactivos con Tippy.js');
    
    // Configuración por defecto para tooltips
    const tooltipConfig = {
      theme: 'conceptmap',
      arrow: true,
      animation: 'shift-away',
      placement: 'top',
      interactive: true,
      allowHTML: true
    };
    
    // Configurar tooltips para conceptos
    for (const concept of concepts) {
      // Generar contenido del tooltip basado en los datos del concepto
      const tooltipContent = this._generateConceptTooltip(concept, language);
      
      concept.tooltip = {
        content: tooltipContent,
        maxWidth: 300,
        showDelay: concept.importance > 0.7 ? 50 : 200
      };
    }
    
    // Configurar tooltips para relaciones
    for (const relationship of relationships) {
      // Generar contenido del tooltip basado en los datos de la relación
      const tooltipContent = this._generateRelationshipTooltip(relationship, concepts, language);
      
      relationship.tooltip = {
        content: tooltipContent,
        maxWidth: 250,
        showOnHover: true
      };
    }
    
    return tooltipConfig;
  }
  
  /**
   * Construye datos jerárquicos para la visualización
   * @private
   */
  _buildHierarchicalData(concepts, relationships) {
    // Encontrar el concepto raíz (nivel 0 o el más importante)
    const rootConcepts = concepts.filter(c => c.hierarchyLevel === 0);
    const rootConcept = rootConcepts.length > 0 
      ? rootConcepts[0] 
      : concepts.sort((a, b) => (b.importance || 0) - (a.importance || 0))[0];
    
    // Función recursiva para construir la jerarquía
    const buildHierarchy = (concept, visited = new Set()) => {
      // Evitar ciclos infinitos
      if (visited.has(concept.id)) {
        return {
          id: concept.id,
          name: concept.name,
          importance: concept.importance,
          cyclic: true
        };
      }
      
      visited.add(concept.id);
      
      // Encontrar conceptos hijos directos
      let children = [];
      
      // Si el concepto tiene childrenIds, usarlos
      if (concept.childrenIds && Array.isArray(concept.childrenIds)) {
        children = concept.childrenIds
          .map(id => concepts.find(c => c.id === id))
          .filter(Boolean)
          .map(child => buildHierarchy(child, new Set(visited)));
      } else {
        // Si no tiene childrenIds, inferir relaciones jerárquicas
        const childRelationships = relationships.filter(r => 
          r.source === concept.id && 
          ['jerarquia', 'parte', 'contiene', 'incluye'].includes(r.type?.toLowerCase())
        );
        
        children = childRelationships
          .map(rel => concepts.find(c => c.id === rel.target))
          .filter(Boolean)
          .map(child => buildHierarchy(child, new Set(visited)));
      }
      
      // Construir nodo jerárquico
      return {
        id: concept.id,
        name: concept.name,
        importance: concept.importance,
        visual: concept.visualProperties,
        tooltip: concept.tooltip,
        children: children.length > 0 ? children : undefined
      };
    };
    
    // Construir jerarquía completa a partir del concepto raíz
    return buildHierarchy(rootConcept);
  }
  
  /**
   * Genera el contenido HTML para el tooltip de un concepto
   * @private
   */
  _generateConceptTooltip(concept, language) {
    const description = concept.description || 'Sin descripción disponible';
    const category = concept.category ? `<div class="concept-category">${concept.category}</div>` : '';
    const exampleCount = concept.examples?.length || 0;
    const examplesText = exampleCount > 0 
      ? `<div class="concept-examples-count">${exampleCount} ejemplo${exampleCount !== 1 ? 's' : ''} disponible${exampleCount !== 1 ? 's' : ''}</div>` 
      : '';
    
    // Información de importancia visual
    const importanceText = concept.importance > 0.8 
      ? 'Concepto clave' 
      : concept.importance > 0.5 
        ? 'Concepto importante' 
        : 'Concepto secundario';
    
    return `
      <div class="concept-tooltip">
        <h3>${concept.name}</h3>
        ${category}
        <p>${description}</p>
        <div class="concept-meta">
          <span class="concept-importance">${importanceText}</span>
          ${examplesText}
        </div>
      </div>
    `;
  }
  
  /**
   * Genera el contenido HTML para el tooltip de una relación
   * @private
   */
  _generateRelationshipTooltip(relationship, concepts, language) {
    // Obtener conceptos origen y destino
    const sourceConcept = concepts.find(c => c.id === relationship.source);
    const targetConcept = concepts.find(c => c.id === relationship.target);
    
    // Nombres por defecto por si no se encuentran los conceptos
    const sourceName = sourceConcept?.name || 'Concepto origen';
    const targetName = targetConcept?.name || 'Concepto destino';
    
    // Tipo de relación formateado
    const relationshipType = relationship.type 
      ? this._formatRelationshipType(relationship.type) 
      : 'Relación';
    
    // Descripción de la relación
    const description = relationship.description || `${sourceName} ${relationshipType.toLowerCase()} ${targetName}`;
    
    // Texto de validación si está disponible
    const validationText = relationship.validation?.isValid 
      ? '<span class="validation-badge valid">Relación validada</span>' 
      : relationship.validation?.isValid === false 
        ? '<span class="validation-badge invalid">Requiere revisión</span>' 
        : '';
    
    return `
      <div class="relationship-tooltip">
        <div class="relationship-concepts">
          <span class="source-concept">${sourceName}</span>
          <span class="relationship-arrow">→</span>
          <span class="target-concept">${targetName}</span>
        </div>
        <div class="relationship-type">${relationshipType}</div>
        <p>${description}</p>
        ${validationText}
      </div>
    `;
  }
  
  /**
   * Determina la forma visual para un concepto
   * @private
   */
  _getConceptShape(concept, hierarchyLevel) {
    // Asignar formas según el nivel jerárquico y categoría
    if (hierarchyLevel === 0) {
      return 'rectangle'; // Nodo raíz
    }
    
    // Formas según la categoría
    switch (concept.category?.toLowerCase()) {
      case 'proceso':
      case 'acción':
        return 'rounded-rectangle';
      case 'objeto':
      case 'entidad':
        return 'ellipse';
      case 'propiedad':
      case 'atributo':
        return 'hexagon';
      case 'evento':
        return 'diamond';
      default:
        // Por defecto, según el nivel
        return hierarchyLevel === 1 ? 'rounded-rectangle' : 'ellipse';
    }
  }
  
  /**
   * Determina el estilo de línea para una relación
   * @private
   */
  _getRelationshipLineStyle(relationType) {
    // Estilos según el tipo de relación
    switch (relationType?.toLowerCase()) {
      case 'causa':
      case 'efecto':
        return 'dashed';
      case 'parte':
      case 'contiene':
        return 'dotted';
      case 'dependencia':
        return 'double';
      case 'oposición':
      case 'contrario':
        return 'zigzag';
      case 'secuencia':
        return 'arrow-sequence';
      default:
        return 'solid';
    }
  }
  
  /**
   * Determina si una relación debe tener animación
   * @private
   */
  _shouldAnimateRelationship(relationship, preferences) {
    // Solo animar si las animaciones están habilitadas globalmente
    if (!preferences.animations) {
      return false;
    }
    
    // Animar relaciones importantes o validadas
    return (
      relationship.strength > 0.7 ||
      relationship.isKey === true ||
      (relationship.validation && relationship.validation.isValid === true)
    );
  }
  
  /**
   * Mezcla dos colores con una proporción dada
   * @private
   */
  _blendColors(color1, color2, ratio) {
    // Función simple para mezclar dos colores hexadecimales
    // Esta implementación es simplificada y asume colores en formato hex
    
    // Si alguno de los colores no es válido, devolver el otro
    if (!color1) return color2;
    if (!color2) return color1;
    
    try {
      // Convertir de hex a rgb
      const parseColor = (hex) => {
        const hex2 = hex.startsWith('#') ? hex.slice(1) : hex;
        const r = parseInt(hex2.slice(0, 2), 16);
        const g = parseInt(hex2.slice(2, 4), 16);
        const b = parseInt(hex2.slice(4, 6), 16);
        return [r, g, b];
      };
      
      // Mezclar componentes
      const blend = (c1, c2, ratio) => {
        return Math.round(c1 * (1 - ratio) + c2 * ratio);
      };
      
      // Convertir a RGB
      const [r1, g1, b1] = parseColor(color1);
      const [r2, g2, b2] = parseColor(color2);
      
      // Mezclar
      const r = blend(r1, r2, ratio);
      const g = blend(g1, g2, ratio);
      const b = blend(b1, b2, ratio);
      
      // Convertir de nuevo a hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) {
      // En caso de error, devolver un color neutro
      return '#888888';
    }
  }
  
  /**
   * Formatea el tipo de relación para mostrar
   * @private
   */
  _formatRelationshipType(type) {
    // Mapeo de tipos de relación a textos más legibles
    const typeMapping = {
      'causa': 'Es causa de',
      'efecto': 'Es efecto de',
      'parte': 'Es parte de',
      'contiene': 'Contiene a',
      'caracteristica': 'Es característica de',
      'ejemplo': 'Es ejemplo de',
      'secuencia': 'Precede a',
      'jerarquia': 'Es superior a',
      'dependencia': 'Depende de',
      'oposicion': 'Se opone a',
      'similitud': 'Es similar a'
    };
    
    return typeMapping[type.toLowerCase()] || type;
  }
}

module.exports = AestheticsModule; 