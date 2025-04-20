const express = require('express');
const path = require('path');
const fs = require('fs');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para procesar JSON y datos de formularios
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal para servir la aplicación React
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Importar controladores
const conceptMapController = require('./controllers/conceptMapController');

// Importar servicios
const conceptMapService = require('./services/fixed-conceptMapService');
const aiSdkService = require('./services/aiSdkService');

// Importar el gestor de pipeline y los módulos
const PipelineManager = require('./modules/PipelineManager');
const OrganizationModule = require('./modules/organization/OrganizationModule');
const ReasoningModule = require('./modules/reasoning/ReasoningModule');
const EnrichmentModule = require('./modules/enrichment/EnrichmentModule');
const ValidationModule = require('./modules/validation/ValidationModule');
const AestheticsModule = require('./modules/aesthetics/AestheticsModule');
const ConclusionModule = require('./modules/conclusion/ConclusionModule');

// Importar el nuevo sistema modular
const conceptMapModules = require('./modules');
const { processText, createPipeline } = conceptMapModules;

// Rutas de la API
app.post('/api/generate-map', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    // Validación robusta de entrada
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'El texto es requerido' 
      });
    }
    
    // Asegurar que text es string y tiene contenido válido
    const processText = typeof text === 'string' ? text : String(text);
    if (processText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El texto no puede estar vacío'
      });
    }
    
    console.log(`Procesando texto de ${processText.length} caracteres...`);
    
    // Configurar opciones para el servicio
    const serviceOptions = {
      maxConcepts: options.maxConcepts || 25,
      style: options.visualStyle || 'educational',
      stages: options.stages || {
        organization: true,
        reasoning: true,
        enrichment: true,
        validation: true,
        aesthetics: true
      }
    };
    
    console.log('Llamando al servicio con la configuración:', JSON.stringify(serviceOptions, null, 2));
    
    // Usar el conceptMapService para procesar el texto
    const conceptMapService = require('./services/fixed-conceptMapService');
    
    // Procesar el texto
    const result = await conceptMapService.processText(processText, serviceOptions);
    
    // Generar formatos de salida
    const outputFormats = conceptMapService.generateOutputFormats(result, 'interface');
    
    console.log('Procesamiento completado, devolviendo respuesta...');

    // Responder con el resultado
    res.json({
      success: true,
      result: outputFormats.content ? outputFormats : { content: result }
    });
  } catch (error) {
    console.error('Error en la generación del mapa conceptual:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el texto: ' + error.message
    });
  }
});

app.get('/api/configuration', conceptMapController.getConfiguration);

// Añadir ruta de demostración para el pipeline de 6 etapas
app.get('/api/demo', async (req, res) => {
  try {
    // Texto de ejemplo para demostrar el pipeline completo de 6 etapas
    const demoText = `
      Los mapas conceptuales son herramientas cognitivo-visuales para organizar y representar el conocimiento. 
      Fueron creados por Joseph Novak en la década de 1970 como una manera de implementar las teorías de 
      aprendizaje significativo de David Ausubel.

      Los mapas conceptuales se componen de conceptos, generalmente encerrados en círculos o recuadros, 
      y de relaciones entre estos conceptos, indicadas por líneas que los unen. Las palabras sobre las 
      líneas, denominadas palabras de enlace, especifican la relación entre los conceptos.

      El proceso de elaboración de mapas conceptuales incluye varias etapas: primero, la identificación 
      de los conceptos clave del texto; segundo, la ordenación jerárquica de estos conceptos, desde los 
      más generales a los más específicos; tercero, la conexión de los conceptos mediante líneas y 
      palabras de enlace; y finalmente, la revisión del mapa para asegurar su coherencia y precisión.

      La estructura de un mapa conceptual puede ser jerárquica, con los conceptos más inclusivos en la 
      parte superior y los conceptos más específicos en la parte inferior. También existen mapas conceptuales 
      en red, donde las relaciones entre conceptos son más complejas y no siguen necesariamente una 
      jerarquía vertical.
    `;

    console.log('Procesando demo con el nuevo sistema modular...');

    // Configuración para la demostración
    const demoConfig = {
      modules: {
        organization: {
          tools: {
            haystack: false,
            spacy: true,
            langGraph: true,
            penrose: true
          }
        },
        reasoning: {
          tools: {
            deepSeek: true,
            openAGI: true,
            graphRAG: false,
            langGraph: true
          }
        },
        enrichment: {
          tools: {
            semanticKernel: true,
            semanticScholar: true,
            wikidataToolkit: true,
            conceptNet: true
          }
        },
        validation: {
          tools: {
            arguflow: true,
            trieve: true,
            dePlot: true,
            nemoGuardrails: true
          }
        },
        aesthetics: {
          tools: {
            markmap: true,
            shikiTwoslash: true,
            openProps: true,
            lottie: true,
            tippyJs: true
          }
        }
      }
    };

    // Opciones de procesamiento
    const options = {
      maxConcepts: 15,
      includeHierarchy: true,
      theme: 'academic'
    };

    // Procesar texto utilizando el pipeline modular completo
    const result = await conceptMapModules.processText(demoText, options, demoConfig);

    // Añadir información del procesamiento para la demostración
    result.demo = {
      processingInfo: generateProcessDiagram(),
      toolExplanations: generateToolExplanations()
    };

    res.json(result);
  } catch (error) {
    console.error('Error en endpoint de demostración:', error);
    res.status(500).json({
      error: 'Error al procesar la demostración',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Añadir ruta específica para visualizar el mapa conceptual en formato XML
app.get('/api/demo/xml', async (req, res) => {
  try {
    // Reutilizar la misma función de demostración pero con formato XML
    req.body = {
      text: `
        Los mapas conceptuales son herramientas cognitivo-visuales para organizar y representar el conocimiento.
        Fueron creados por Joseph Novak en la década de 1970 como una manera de implementar las teorías de
        aprendizaje significativo de David Ausubel.
      `,
      options: {
        outputFormat: 'xml',
        maxConcepts: 10
      }
    };
    
    // Guardar la respuesta JSON original
    const originalJson = res.json;
    
    // Sobrescribir temporalmente el método json para extraer el XML
    res.json = function(data) {
      if (data.success && data.result?.structuredRepresentation?.xml) {
        // Devolver solo el XML con el tipo de contenido adecuado
        res.setHeader('Content-Type', 'application/xml');
        return res.send(data.result.structuredRepresentation.xml);
      } else {
        // Restaurar el comportamiento original en caso de error
        res.json = originalJson;
        return res.json(data);
      }
    };
    
    // Procesar usando el controlador estándar
    await conceptMapController.generateMap(req, res);
  } catch (error) {
    console.error('Error en la demostración XML:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la demostración XML',
      details: error.message
    });
  }
});

// Ruta educativa que muestra el proceso de 6 etapas con explicaciones
app.get('/api/edu/process', async (req, res) => {
  try {
    // Texto educativo sobre el propio proceso de 6 etapas
    const educationalText = `
      El proceso de generación de mapas conceptuales consiste en 6 etapas críticas e interdependientes:
      
      1. Organización y Jerarquía: Esta primera etapa identifica los conceptos clave del texto y los
      organiza jerárquicamente, desde ideas generales hacia las más específicas, estableciendo una
      estructura semántica lógica.
      
      2. Razonamiento y Comprensión: En esta etapa se realiza un análisis profundo para entender la
      intención, el contexto y las relaciones internas del texto, estableciendo conexiones lógicas
      explícitas entre conceptos mediante inferencias justificadas.
      
      3. Enriquecimiento Semántico: Esta fase amplía cada nodo del mapa con definiciones breves,
      contexto relevante o asociaciones externas, como sinónimos, analogías o relaciones
      interdisciplinarias, sin romper la estructura interna del texto original.
      
      4. Validación y Verificación: Aquí se evalúa la coherencia, exactitud y ausencia de
      contradicciones en el mapa, aplicando mecanismos de autoverificación lógica para garantizar
      que la estructura, los datos y las inferencias sean sólidos y consistentes.
      
      5. Estética Adaptativa / UX Visual: Esta etapa mejora la legibilidad visual utilizando emojis
      representativos, negritas para conceptos principales, subrayados para categorías y resaltados
      para relaciones clave, con una distribución que facilita el aprendizaje.
      
      6. Conclusión Descriptiva: Finalmente, se resume el proceso y los resultados obtenidos,
      explicando cómo se aplicaron las etapas anteriores y justificando la utilidad del mapa
      final para facilitar el aprendizaje, la comprensión o la enseñanza.
    `;
    
    // Configuración especializada para este endpoint educativo
    const eduOptions = {
      maxConcepts: 15,
      style: 'educational',
      outputFormat: 'all',
      // Activar todas las etapas y herramientas
      stages: {
        organization: { enabled: true },
        reasoning: { enabled: true },
        enrichment: { enabled: true },
        validation: { enabled: true },
        aesthetics: { enabled: true },
        conclusion: { enabled: true }
      },
      // Habilitar funciones educativas adicionales
      includeExamples: true,
      includeDefinitions: true,
      // Metadatos educativos adicionales
      educational: {
        showStageExplanations: true,
        highlightTools: true,
        includeAnnotations: true
      }
    };
    
    // Procesar el texto siguiendo el pipeline completo
    req.body = {
      text: educationalText,
      options: eduOptions
    };
    
    // Obtener el resultado del procesamiento
    const originalJson = res.json;
    
    // Sobrescribir el método json para agregar elementos educativos
    res.json = function(data) {
      if (data.success) {
        // Añadir información educativa sobre cada etapa
        const stageInfo = {
          organization: {
            name: "Organización y Jerarquía",
            emoji: "📊",
            description: "Identifica y estructura conceptos jerárquicamente",
            tools: ["LangGraph", "Penrose", "spaCy", "Haystack"],
            color: "#4A86E8"
          },
          reasoning: {
            name: "Razonamiento y Comprensión",
            emoji: "🧠",
            description: "Analiza relaciones lógicas entre conceptos",
            tools: ["DeepSeek API", "OpenAGI", "GraphRAG"],
            color: "#6AA84F"
          },
          enrichment: {
            name: "Enriquecimiento Semántico",
            emoji: "🔍",
            description: "Añade contexto y definiciones a los conceptos",
            tools: ["Semantic Kernel", "Semantic Scholar API", "Wikidata Toolkit", "ConceptNet"],
            color: "#E69138"
          },
          validation: {
            name: "Validación y Verificación",
            emoji: "✅",
            description: "Evalúa coherencia y corrige contradicciones",
            tools: ["Arguflow", "Trieve", "DePlot", "NeMo Guardrails"],
            color: "#CC0000"
          },
          aesthetics: {
            name: "Estética Adaptativa / UX Visual",
            emoji: "🎨",
            description: "Optimiza la presentación visual del mapa conceptual",
            tools: ["Markmap", "Shiki Twoslash", "Open Props", "Lottie", "Tippy.js"],
            color: "#674EA7"
          },
          conclusion: {
            name: "Conclusión Descriptiva",
            emoji: "📝",
            description: "Resume y valida el mapa conceptual final",
            tools: [],
            color: "#990000"
          }
        };
        
        // Añadir elementos educativos al resultado
        data.result.educational = {
          stageInfo: stageInfo,
          processDiagram: generateProcessDiagram(),
          toolExplanations: generateToolExplanations()
        };
      }
      
      return originalJson.call(res, data);
    };
    
    // Procesar usando el controlador estándar
    await conceptMapController.generateMap(req, res);
  } catch (error) {
    console.error('Error en la demostración educativa:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la demostración educativa',
      details: error.message
    });
  }
});

// Ruta para procesar texto español con DeepSeek API para la etapa 2
app.post('/api/process-spanish', async (req, res) => {
  try {
    // Verificar que se proporcionó texto para procesar
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere texto en español para procesar'
      });
    }

    // Verificar que el idioma es español
    const language = detectLanguage(text);
    if (language !== 'es') {
      return res.status(400).json({
        success: false,
        error: 'El texto proporcionado no parece estar en español',
        detectedLanguage: language
      });
    }

    console.log(`Procesando texto en español de ${text.length} caracteres con DeepSeek API en etapa 2`);

    // Configuración especializada para usar DeepSeek API exclusivamente en la etapa 2
    const processConfig = {
      maxConcepts: 15,
      style: 'educational',
      outputFormat: 'xml', // Salida en formato XML
      stages: {
        // 1. Organización y Jerarquía (herramientas de código abierto)
        organization: {
          enabled: true,
          tools: {
            spacy: true,
            langGraph: true,
            penrose: true,
            haystack: true
          }
        },
        // 2. Razonamiento y Comprensión (exclusivamente DeepSeek API)
        reasoning: {
          enabled: true,
          tools: {
            deepSeekApi: true, // Habilitar sólo DeepSeek API
            openAGI: false,    // Deshabilitar otras herramientas
            graphRAG: false    // Deshabilitar otras herramientas
          },
          apiKey: 'sk-96a7994b00d646809acf5e17fc63ce74' // Clave API específica
        },
        // 3. Enriquecimiento Semántico (herramientas de código abierto)
        enrichment: {
          enabled: true,
          tools: {
            semanticKernel: true,
            semanticScholar: true,
            wikidataToolkit: true,
            conceptNet: true
          }
        },
        // 4. Validación y Verificación (herramientas de código abierto)
        validation: {
          enabled: true,
          tools: {
            arguflow: true,
            trieve: true,
            dePlot: true,
            nemoGuardrails: true
          }
        },
        // 5. Estética Adaptativa (herramientas de código abierto)
        aesthetics: {
          enabled: true,
          tools: {
            markmap: true,
            shikiTwoslash: true,
            openProps: true,
            lottie: true,
            tippy: true
          }
        },
        // 6. Conclusión Descriptiva
        conclusion: {
          enabled: true
        }
      },
      includeExamples: true,
      includeDefinitions: true,
      language: 'es' // Forzar idioma español
    };

    // Configurar la solicitud para el controlador
    req.body = {
      text: text,
      options: processConfig
    };

    // Modificar el comportamiento de la respuesta para formato XML directo
    const originalJson = res.json;
    res.json = function(data) {
      if (data.success && data.result?.structuredRepresentation?.xml) {
        // Devolver el XML con el tipo de contenido adecuado
        res.setHeader('Content-Type', 'application/xml');
        return res.send(data.result.structuredRepresentation.xml);
      } else {
        // Restaurar comportamiento original para otros casos
        res.json = originalJson;
        return res.json(data);
      }
    };

    // Procesar el texto con el controlador existente
    await conceptMapController.generateMap(req, res);
  } catch (error) {
    console.error('Error en el procesamiento de texto español:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el procesamiento',
      details: error.message
    });
  }
});

// Ruta de demostración de procesamiento de texto en español con DeepSeek API
app.get('/api/demo/spanish-deepseek', async (req, res) => {
  try {
    // Texto de ejemplo en español
    const exampleText = `
      La inteligencia artificial (IA) es un campo de la informática que se centra en la creación de sistemas
      capaces de realizar tareas que normalmente requieren inteligencia humana. Estas tareas incluyen el
      aprendizaje, el razonamiento, la resolución de problemas, la percepción y la comprensión del lenguaje.

      Los sistemas de IA pueden clasificarse en dos categorías principales: IA débil e IA fuerte. La IA débil,
      también conocida como IA estrecha, está diseñada para realizar tareas específicas, como reconocimiento
      facial o conducción autónoma. La IA fuerte, por otro lado, se refiere a sistemas que poseen inteligencia
      general comparable a la humana, capaz de aplicarse a cualquier problema.

      El aprendizaje automático es una rama fundamental de la IA que permite a los sistemas aprender patrones
      a partir de datos sin ser programados explícitamente. Dentro del aprendizaje automático, el aprendizaje
      profundo utiliza redes neuronales artificiales con múltiples capas para procesar información de manera
      similar al cerebro humano.

      Las aplicaciones de la IA son numerosas y abarcan diversos sectores. En la medicina, ayuda en el
      diagnóstico de enfermedades; en finanzas, detecta fraudes; en la industria, optimiza procesos de
      fabricación; y en los servicios al cliente, implementa chatbots y asistentes virtuales.

      Sin embargo, el desarrollo de la IA también plantea desafíos éticos importantes. Preocupaciones sobre
      la privacidad, la seguridad de los datos, el sesgo algorítmico y el impacto en el empleo son temas
      que requieren atención cuidadosa a medida que la tecnología avanza.
    `;

    // Crear la solicitud con el texto de ejemplo
    req.body = {
      text: exampleText
    };

    // Redirigir al endpoint que procesa texto en español
    console.log("Redirigiendo al endpoint de procesamiento de texto en español con ejemplo sobre IA");
    await app.handle({ 
      method: 'POST', 
      url: '/api/process-spanish', 
      headers: req.headers,
      body: req.body
    }, res);
  } catch (error) {
    console.error('Error en la demostración con texto español:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la demostración',
      details: error.message
    });
  }
});

/**
 * Detecta si un texto está en español
 * @param {string} text - Texto a analizar
 * @returns {string} - Código de idioma ('es' o 'en')
 */
function detectLanguage(text) {
  // Palabras comunes en español e inglés
  const spanishCommonWords = ['de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'una', 'su', 'al'];
  const englishCommonWords = ['the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with'];
  
  const words = text.toLowerCase().split(/\s+/);
  let spanishCount = 0;
  let englishCount = 0;
  
  words.forEach(word => {
    if (spanishCommonWords.includes(word)) spanishCount++;
    if (englishCommonWords.includes(word)) englishCount++;
  });
  
  return spanishCount >= englishCount ? 'es' : 'en';
}

/**
 * Genera un diagrama Mermaid del proceso de 6 etapas
 * @returns {string} Diagrama Mermaid
 */
function generateProcessDiagram() {
  return `
  graph TD
    Start([Texto de entrada]) --> Stage1
    Stage1[1. Organización y Jerarquía 📊] --> Stage2
    Stage2[2. Razonamiento y Comprensión 🧠] --> Stage3
    Stage3[3. Enriquecimiento Semántico 🔍] --> Stage4
    Stage4[4. Validación y Verificación ✅] --> Stage5
    Stage5[5. Estética Adaptativa 🎨] --> Stage6
    Stage6[6. Conclusión Descriptiva 📝] --> Final
    Final([Mapa Conceptual])
    
    classDef stage1 fill:#4A86E8,stroke:#333,stroke-width:2px;
    classDef stage2 fill:#6AA84F,stroke:#333,stroke-width:2px;
    classDef stage3 fill:#E69138,stroke:#333,stroke-width:2px;
    classDef stage4 fill:#CC0000,stroke:#333,stroke-width:2px;
    classDef stage5 fill:#674EA7,stroke:#333,stroke-width:2px;
    classDef stage6 fill:#990000,stroke:#333,stroke-width:2px;
    classDef endpoint fill:#f9f9f9,stroke:#333,stroke-width:1px;
    
    class Stage1 stage1;
    class Stage2 stage2;
    class Stage3 stage3;
    class Stage4 stage4;
    class Stage5 stage5;
    class Stage6 stage6;
    class Start,Final endpoint;
  `;
}

/**
 * Genera explicaciones sobre las herramientas utilizadas
 * @returns {Object} Explicaciones de herramientas
 */
function generateToolExplanations() {
  return {
    "LangGraph": "Framework para la creación de grafos de conocimiento a partir de texto",
    "Penrose": "Biblioteca para la optimización visual de diagramas jerárquicos",
    "spaCy": "Biblioteca de NLP para procesamiento y análisis lingüístico",
    "Haystack": "Framework para sistemas de búsqueda semántica y procesamiento de documentos",
    "DeepSeek API": "API para análisis semántico profundo de textos",
    "OpenAGI": "Framework para razonamiento mediante inteligencia artificial generativa",
    "GraphRAG": "Sistema de recuperación aumentada por grafos para mejorar relaciones conceptuales",
    "Semantic Kernel": "Framework para integración de inteligencia semántica en aplicaciones",
    "Semantic Scholar API": "API para acceso a información académica y científica",
    "Wikidata Toolkit": "Herramientas para acceder a datos estructurados de Wikidata",
    "ConceptNet": "Red semántica de conocimiento general para enriquecimiento conceptual",
    "Arguflow": "Sistema para validación de argumentos y coherencia lógica",
    "Trieve": "Herramienta para verificación de datos y exactitud de información",
    "DePlot": "Biblioteca para análisis y validación de estructuras de datos",
    "NeMo Guardrails": "Framework para establecer restricciones de validación en sistemas de IA",
    "Markmap": "Biblioteca para visualización de mapas mentales en formato Markdown",
    "Shiki Twoslash": "Herramienta para resaltado y formato de código y texto",
    "Open Props": "Sistema de diseño con propiedades CSS predefinidas",
    "Lottie": "Biblioteca para animaciones e interacciones visuales",
    "Tippy.js": "Biblioteca para crear tooltips y elementos interactivos"
  };
}

// Añadir ruta específica para el generador de mapas conceptuales con Vercel AI SDK
app.post('/api/generate-map/ai-sdk', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    // Validación robusta de entrada
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'El texto es requerido' 
      });
    }
    
    // Asegurar que text es string y tiene contenido válido
    const processText = typeof text === 'string' ? text : String(text);
    if (processText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El texto no puede estar vacío'
      });
    }
    
    console.log(`Procesando texto de ${processText.length} caracteres con Vercel AI SDK`);
    
    // Configurar opciones para AI SDK
    const aiSdkOptions = {
      maxConcepts: options.maxConcepts || 25,
      includeDefinitions: options.includeDefinitions !== false,
      language: options.language || 'es'
    };
    
    // Procesar el texto usando AI SDK
    const result = await aiSdkService.analyzeText(processText, aiSdkOptions);
    
    // Utilizar el servicio de mapas conceptuales para generar formatos de salida
    const conceptMapService = require('./services/fixed-conceptMapService');
    const outputFormats = conceptMapService.generateOutputFormats(result, options.outputFormat || 'all');
    
    // Asegurar que el XML está correctamente formateado si existe
    const { fixXmlNameTags } = require('./services/fix_tags_corrected');
    const xmlOutput = outputFormats.xml ? fixXmlNameTags(outputFormats.xml) : '';
    
    // Responder con el resultado completo
    res.json({
      success: true,
      result: {
        // Datos estructurados del mapa conceptual
        concepts: result.concepts,
        relationships: result.relationships,
        
        // Formatos de salida solicitados
        structuredRepresentation: {
          json: outputFormats.json || JSON.stringify({ concepts: [], relationships: [] }),
          xml: xmlOutput
        },
        mermaid: outputFormats.mermaid || '',
        reasoningLog: outputFormats.summary || '',
        
        // Metadatos del procesamiento
        metadata: {
          processedAt: result.metadata.processedAt || new Date().toISOString(),
          aiSdkVersion: result.metadata.aiSdkVersion || '1.0.0',
          model: result.metadata.model || 'gpt-4o',
          language: result.metadata.language || 'es',
          conceptCount: result.concepts.length,
          relationshipCount: result.relationships.length
        }
      },
      message: 'Mapa conceptual generado exitosamente con Vercel AI SDK'
    });
  } catch (error) {
    console.error('Error en la generación con AI SDK:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar el texto con AI SDK', 
      details: error.message,
      stackTrace: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Añadir endpoint de demostración con AI SDK y texto predefinido
app.get('/api/demo/ai-sdk', async (req, res) => {
  try {
    // Texto de ejemplo para demostrar el pipeline de AI SDK
    const demoText = `
      La inteligencia artificial (IA) es un campo de la informática que se centra en la creación de máquinas 
      inteligentes capaces de realizar tareas que típicamente requieren inteligencia humana. La IA abarca 
      desde sistemas simples de reglas hasta complejos modelos de aprendizaje profundo.

      El aprendizaje automático, una subcategoría de la IA, permite que las computadoras aprendan de los 
      datos sin ser explícitamente programadas. Los algoritmos mejoran automáticamente a través de la 
      experiencia y el uso de datos.

      El aprendizaje profundo utiliza redes neuronales artificiales con múltiples capas para modelar 
      abstracciones de alto nivel en los datos. Esta técnica ha revolucionado campos como la visión por 
      computadora y el procesamiento del lenguaje natural.

      El procesamiento del lenguaje natural permite a las máquinas entender, interpretar y generar lenguaje 
      humano. Aplicaciones como asistentes virtuales, traducción automática y análisis de sentimiento 
      utilizan esta tecnología.

      Los sistemas expertos son programas diseñados para emular el proceso de toma de decisiones de un 
      experto humano en un dominio específico, utilizando reglas y conocimiento codificado.

      La robótica cognitiva combina IA con robótica física para crear máquinas que pueden percibir su 
      entorno, razonar sobre él y actuar de manera autónoma.

      La ética en IA aborda cuestiones como privacidad, seguridad, transparencia, sesgo algorítmico y 
      el impacto socioeconómico de la automatización impulsada por IA.
    `;

    // Configurar la solicitud
    req.body = {
      text: demoText,
      options: {
        maxConcepts: 15,
        includeDefinitions: true,
        outputFormat: 'all'
      }
    };

    // Redirigir a la ruta de API con AI SDK
    await module.exports.handlers['/api/generate-map/ai-sdk'](req, res);
  } catch (error) {
    console.error('Error en demostración con AI SDK:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la demostración con AI SDK',
      details: error.message
    });
  }
});

// Configurar módulos y crear el pipeline
const setupConceptMapPipeline = () => {
  const pipelineManager = new PipelineManager();
  
  // Configurar y agregar los módulos en orden
  const organizationModule = new OrganizationModule();
  const reasoningModule = new ReasoningModule();
  const enrichmentModule = new EnrichmentModule();
  const validationModule = new ValidationModule();
  const aestheticsModule = new AestheticsModule({
    theme: 'adaptive',
    viewMode: 'hierarchical',
    animationsEnabled: true
  });
  const conclusionModule = new ConclusionModule();
  
  // Registrar todos los módulos en el pipeline
  pipelineManager.registerModule(organizationModule);
  pipelineManager.registerModule(reasoningModule);
  pipelineManager.registerModule(enrichmentModule);
  pipelineManager.registerModule(validationModule);
  pipelineManager.registerModule(aestheticsModule);
  pipelineManager.registerModule(conclusionModule);
  
  return pipelineManager;
};

// Crear el pipeline cuando inicie el servidor
const conceptMapPipeline = setupConceptMapPipeline();

// Endpoint para generar mapa conceptual usando el pipeline modular
app.post('/api/generate-map-modular', async (req, res) => {
  try {
    const { text, language = 'es', options = {} } = req.body;
    
    // Validación de entrada
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un texto no vacío para generar el mapa conceptual' 
      });
    }
    
    console.log(`Generando mapa conceptual modular para texto (${text.length} caracteres)...`);
    
    // Preparar los datos de entrada
    const inputData = {
      original: {
        text,
        language
      },
      metadata: {
        startTime: new Date().toISOString(),
        options
      }
    };
    
    // Procesar el texto usando el pipeline completo
    const result = await conceptMapPipeline.processPipeline(inputData);
    
    // Agregar metadata final
    result.metadata.endTime = new Date().toISOString();
    result.metadata.processingTimeMs = new Date() - new Date(result.metadata.startTime);
    
    res.json(result);
  } catch (error) {
    console.error('Error al generar mapa conceptual modular:', error);
    res.status(500).json({ 
      error: 'Error al generar el mapa conceptual',
      details: error.message
    });
  }
});

// Endpoint para generar mapa conceptual ejecutando solo ciertos módulos
app.post('/api/generate-map-custom', async (req, res) => {
  try {
    const { text, language = 'es', modules = [], options = {} } = req.body;
    
    // Validación de entrada
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un texto no vacío para generar el mapa conceptual'
      });
    }
    
    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({
        error: 'Se requiere especificar al menos un módulo a ejecutar',
        availableModules: ['organization', 'reasoning', 'enrichment', 'validation', 'aesthetics', 'conclusion']
      });
    }
    
    console.log(`Generando mapa conceptual personalizado usando módulos: ${modules.join(', ')}...`);
    
    // Preparar los datos de entrada
    const inputData = {
      original: {
        text,
        language
      },
      metadata: {
        startTime: new Date().toISOString(),
        options
      }
    };
    
    // Crear un pipeline temporal con solo los módulos especificados
    const tempPipeline = new PipelineManager();
    
    // Agregar solo los módulos seleccionados en el orden correcto
    const allModules = {
      organization: new OrganizationModule(),
      reasoning: new ReasoningModule(),
      enrichment: new EnrichmentModule(),
      validation: new ValidationModule(),
      aesthetics: new AestheticsModule(options.aesthetics || {}),
      conclusion: new ConclusionModule()
    };
    
    // Registrar los módulos seleccionados manteniendo el orden correcto
    for (const moduleId of modules) {
      const module = allModules[moduleId];
      if (module) {
        tempPipeline.registerModule(module);
      } else {
        console.warn(`Módulo no reconocido: ${moduleId}`);
      }
    }
    
    // Procesar con los módulos seleccionados
    const result = await tempPipeline.processPipeline(inputData);
    
    // Agregar metadata final
    result.metadata.endTime = new Date().toISOString();
    result.metadata.processingTimeMs = new Date() - new Date(result.metadata.startTime);
    result.metadata.executedModules = modules;
    
    res.json(result);
  } catch (error) {
    console.error('Error al generar mapa conceptual personalizado:', error);
    res.status(500).json({ 
      error: 'Error al generar el mapa conceptual personalizado',
      details: error.message
    });
  }
});

// Añadir ruta para generar mapas conceptuales rápidos
app.post('/api/generate-map-fast', async (req, res) => {
  try {
    const { text, options } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'El texto es obligatorio y debe ser una cadena no vacía' 
      });
    }
    
    // Crear pipeline rápido
    const pipeline = conceptMapModules.createFastPipeline();
    
    // Procesar texto mediante el pipeline rápido
    const result = await pipeline.processText(text, options);
    
    // Enviar respuesta
    res.json(result);
  } catch (error) {
    console.error('Error al generar mapa conceptual rápido:', error);
    res.status(500).json({ 
      error: 'Error en el procesamiento', 
      message: error.message 
    });
  }
});

/**
 * Endpoint avanzado para generación de mapas conceptuales usando el sistema modular completo
 * con monitoreo de rendimiento, manejo de errores y soporte para personalización
 */
app.post('/api/generate-map/enhanced', async (req, res) => {
  console.log('POST /api/generate-map/enhanced - Solicitud recibida');
  const startTime = Date.now();
  
  try {
    // Validar entrada
    const { text, options } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un texto válido de al menos 10 caracteres'
      });
    }
    
    // Configuración del pipeline
    const pipelineConfig = {
      // Configuración global
      timeoutMs: options?.timeoutMs || 60000,
      maxTextLength: options?.maxTextLength || 10000,
      language: options?.language || 'es',
      
      // Configuración por módulo
      modules: {
        organization: {
          tools: {
            haystack: options?.useHaystack !== false,
            penrose: options?.usePenrose !== false,
            spacy: options?.useSpacy !== false
          },
          maxConcepts: options?.maxConcepts || 50,
          hierarchyLevels: options?.hierarchyLevels || 3
        },
        
        reasoning: {
          tools: {
            deepSeek: options?.useDeepSeek !== false,
            openAGI: options?.useOpenAGI !== false,
            graphRAG: options?.useGraphRAG !== false
          },
          confidenceThreshold: options?.confidenceThreshold || 0.5,
          maxRelationships: options?.maxRelationships || 200
        },
        
        enrichment: {
          tools: {
            semanticKernel: options?.useSemanticKernel !== false,
            semanticScholar: options?.useSemanticScholar !== false,
            wikidataToolkit: options?.useWikidata !== false,
            conceptNet: options?.useConceptNet !== false
          },
          maxDefinitionLength: options?.maxDefinitionLength || 250,
          maxPropertiesPerConcept: options?.maxPropertiesPerConcept || 5
        },
        
        validation: {
          tools: {
            arguflow: options?.useArguflow !== false,
            trieve: options?.useTrieve !== false,
            dePlot: options?.useDePlot !== false,
            nemoGuardrails: options?.useNemoGuardrails !== false
          },
          factCheckThreshold: options?.factCheckThreshold || 0.6,
          fixInconsistencies: options?.fixInconsistencies !== false
        },
        
        aesthetics: {
          tools: {
            markmap: options?.useMarkmap !== false,
            shikiTwoslash: options?.useShikiTwoslash !== false,
            openProps: options?.useOpenProps !== false,
            lottie: options?.useLottie !== false,
            tippyJs: options?.useTippyJs !== false
          },
          theme: options?.theme || 'default',
          colorScheme: options?.colorScheme || 'automatic',
          visualStyle: options?.visualStyle || 'modern'
        },
        
        conclusion: {
          includeVerification: options?.includeVerification !== false,
          includeRecommendations: options?.includeRecommendations !== false,
          maxSummaryLength: options?.maxSummaryLength || 500
        }
      }
    };
    
    // Determinar qué pipeline utilizar
    let pipeline;
    
    if (options?.fastProcessing) {
      console.log('Usando pipeline rápido');
      pipeline = conceptMapModules.createFastPipeline(pipelineConfig);
    } else if (options?.focusEnrichment) {
      console.log('Usando pipeline enfocado en enriquecimiento');
      pipeline = conceptMapModules.createEnrichmentPipeline(pipelineConfig);
    } else if (options?.focusValidation) {
      console.log('Usando pipeline enfocado en validación');
      pipeline = conceptMapModules.createValidationPipeline(pipelineConfig);
    } else if (options?.focusAesthetics) {
      console.log('Usando pipeline enfocado en estética');
      pipeline = conceptMapModules.createAestheticsPipeline(pipelineConfig);
    } else if (options?.customStages && Array.isArray(options.customStages)) {
      console.log(`Usando pipeline personalizado con etapas: ${options.customStages.join(', ')}`);
      pipeline = conceptMapModules.createCustomPipeline(options.customStages, pipelineConfig);
    } else {
      console.log('Usando pipeline completo');
      pipeline = conceptMapModules.createPipeline(pipelineConfig);
    }
    
    // Procesar el texto con timeout
    const processingPromise = pipeline.processText(text, {
      language: options?.language || 'es',
      ...options
    });
    
    // Agregar timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout al procesar el mapa conceptual')), pipelineConfig.timeoutMs);
    });
    
    // Esperar por el primer resultado (procesamiento o timeout)
    const result = await Promise.race([processingPromise, timeoutPromise]);
    
    // Preparar respuesta
    const processingTime = Date.now() - startTime;
    
    // Construir respuesta con encapsulación de datos
    const response = {
      success: true,
      processingTime,
      textLength: text.length,
      mapData: {
        concepts: result.concepts || [],
        relationships: result.relationships || []
      },
      meta: {
        processingSummary: {
          totalTime: processingTime,
          moduleTimings: result.metadata?.processingTime?.byModule || {},
          pipeline: result.metadata?.pipelineConfig || {}
        }
      }
    };
    
    // Incluir validación si está disponible
    if (result.metadata?.stageResults?.validation) {
      response.meta.validation = result.metadata.stageResults.validation;
    }
    
    // Incluir resultado visual si está disponible
    if (result.visualization) {
      response.visualization = result.visualization;
    }
    
    // Incluir conclusión si está disponible
    if (result.conclusion) {
      response.conclusion = result.conclusion;
    }
    
    console.log(`POST /api/generate-map/enhanced - Procesado en ${processingTime}ms, ${response.mapData.concepts.length} conceptos, ${response.mapData.relationships.length} relaciones`);
    res.json(response);
    
  } catch (error) {
    console.error('Error al generar mapa conceptual:', error);
    
    // Determinar código de error adecuado
    let statusCode = 500;
    if (error.message.includes('Timeout')) statusCode = 408;
    if (error.message.includes('Se requiere')) statusCode = 400;
    
    // Enviar respuesta de error
    res.status(statusCode).json({
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    });
  }
});

/**
 * Endpoint de monitoreo del sistema de mapas conceptuales
 */
app.get('/api/concept-map/health', (req, res) => {
  try {
    // Crear pipeline temporal para acceder a las métricas
    const pipeline = conceptMapModules.createPipeline();
    
    // Obtener estadísticas de rendimiento si es un PipelineManager mejorado
    let performanceStats = {};
    if (typeof pipeline.getPerformanceStats === 'function') {
      performanceStats = pipeline.getPerformanceStats();
    }
    
    // Información del sistema
    const systemInfo = {
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      endpoints: [
        { path: '/api/generate-map', method: 'POST', description: 'API estándar' },
        { path: '/api/generate-map/ai-sdk', method: 'POST', description: 'API con AI SDK' },
        { path: '/api/generate-map-modular', method: 'POST', description: 'API con módulos' },
        { path: '/api/generate-map/enhanced', method: 'POST', description: 'API mejorada' },
      ],
      modulesSummary: {
        pipeline: Object.keys(conceptMapModules).filter(k => k.startsWith('create')),
        modules: [
          'organization', 
          'reasoning', 
          'enrichment', 
          'validation', 
          'aesthetics', 
          'conclusion'
        ]
      }
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      performanceStats,
      system: systemInfo
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Listar endpoints disponibles en la raíz
app.get('/', (req, res) => {
  const routes = [
    { path: '/api/generate-map', method: 'POST', description: 'Genera un mapa conceptual (método original)' },
    { path: '/api/generate-map-with-aisdkv2', method: 'POST', description: 'Genera un mapa conceptual usando AI SDK v2' },
    { path: '/api/demo', method: 'GET', description: 'Endpoint de demostración con texto preconfigurado' },
    { path: '/api/generate-map-modular', method: 'POST', description: 'Genera un mapa conceptual usando sistema modular completo' },
    { path: '/api/generate-map-custom', method: 'POST', description: 'Genera un mapa conceptual con pipeline personalizado' },
    { path: '/api/generate-map-fast', method: 'POST', description: 'Genera un mapa conceptual con procesamiento rápido' }
  ];
  
  res.json({
    service: 'ConceptMapSaaS API',
    version: '2.0.0',
    routes
  });
});

// Iniciar el servidor con manejo de errores
app.listen(PORT, () => {
  console.log('=== Sistema de Generación de Mapas Conceptuales ===');
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`- Aplicación principal: http://localhost:${PORT}`);
  console.log(`- Demostración completa: http://localhost:${PORT}/api/demo`);
  console.log(`- Demostración XML: http://localhost:${PORT}/api/demo/xml`);
  console.log(`- Demostración educativa: http://localhost:${PORT}/api/edu/process`);
  console.log(`- Demostración con texto español: http://localhost:${PORT}/api/demo/spanish-deepseek`);
  console.log(`- Procesamiento de texto español (POST): http://localhost:${PORT}/api/process-spanish`);
  console.log(`- Configuración: http://localhost:${PORT}/api/configuration`);
  console.log('API para generación personalizada (POST):');
  console.log(`- http://localhost:${PORT}/api/generate-map`);
  console.log('API para sistema modular de 6 etapas (POST):');
  console.log(`- http://localhost:${PORT}/api/generate-map-modular`);
  console.log(`- http://localhost:${PORT}/api/generate-map-custom`);
  
  // Mostrar información del sistema
  console.log('Sistema de 6 etapas:');
  console.log('1. Organización y Jerarquía 📊 (open-source)');
  console.log('2. Razonamiento y Comprensión 🧠 (API: DeepSeek API)');
  console.log('3. Enriquecimiento Semántico 🔍 (open-source)');
  console.log('4. Validación y Verificación ✅ (open-source)');
  console.log('5. Estética Adaptativa / UX Visual 🎨 (open-source)');
  console.log('6. Conclusión Descriptiva 📝 (open-source)');
}).on('error', (error) => {
  console.error(`Error al iniciar el servidor: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} está en uso. Prueba con otro puerto.`);
  }
  process.exit(1);
});

// Configurar rutas para acceder fácilmente
module.exports = {
  app,
  handlers: {
    '/api/generate-map': conceptMapController.generateMap,
    '/api/configuration': conceptMapController.getConfiguration,
    '/api/generate-map/ai-sdk': async (req, res) => {
      // Código del controlador de la ruta '/api/generate-map/ai-sdk'
      try {
        const { text, options = {} } = req.body;
        
        if (!text) {
          return res.status(400).json({ success: false, error: 'El texto es requerido' });
        }
        
        const processText = typeof text === 'string' ? text : String(text);
        if (processText.trim().length === 0) {
          return res.status(400).json({ success: false, error: 'El texto no puede estar vacío' });
        }
        
        console.log(`Procesando texto de ${processText.length} caracteres con Vercel AI SDK`);
        
        const aiSdkOptions = {
          maxConcepts: options.maxConcepts || 25,
          includeDefinitions: options.includeDefinitions !== false,
          language: options.language || 'es'
        };
        
        const result = await aiSdkService.analyzeText(processText, aiSdkOptions);
        
        const conceptMapService = require('./services/fixed-conceptMapService');
        const outputFormats = conceptMapService.generateOutputFormats(result, options.outputFormat || 'all');
        
        const { fixXmlNameTags } = require('./services/fix_tags_corrected');
        const xmlOutput = outputFormats.xml ? fixXmlNameTags(outputFormats.xml) : '';
        
        res.json({
          success: true,
          result: {
            concepts: result.concepts,
            relationships: result.relationships,
            structuredRepresentation: {
              json: outputFormats.json || JSON.stringify({ concepts: [], relationships: [] }),
              xml: xmlOutput
            },
            mermaid: outputFormats.mermaid || '',
            reasoningLog: outputFormats.summary || '',
            metadata: {
              processedAt: result.metadata.processedAt || new Date().toISOString(),
              aiSdkVersion: result.metadata.aiSdkVersion || '1.0.0',
              model: result.metadata.model || 'gpt-4o',
              language: result.metadata.language || 'es',
              conceptCount: result.concepts.length,
              relationshipCount: result.relationships.length
            }
          },
          message: 'Mapa conceptual generado exitosamente con Vercel AI SDK'
        });
      } catch (error) {
        console.error('Error en la generación con AI SDK:', error);
        res.status(500).json({ 
          success: false,
          error: 'Error al procesar el texto con AI SDK', 
          details: error.message,
          stackTrace: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
  }
};
